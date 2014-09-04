# -*- coding: utf-8 -*-
"""
Created on Tue Jul 22 11:14:18 2014

@author: cheesinglee
"""

import dateutil
import simplejson
import collections
import cStringIO
import codecs
import csv
import os
from time import sleep
from zipfile import ZipFile
from tempfile import NamedTemporaryFile, mkdtemp
from urllib import urlopen, urlencode, urlretrieve
from bigml.api import BigML

KIVA_SNAPSHOT_URL = 'http://s3.kiva.org/snapshots/kiva_ds_json.zip'
PRUNE_FIELDS = ['terms', 'payments', 'basket_amount', 'description', 'name',
                'borrowers', 'translator', 'video', 'image',
                'funded_date', 'paid_date', 'paid_amount', 'funded_amount',
                'planned_expiration_date', 'bonus_credit_eligibility',
                'partner_id']

KEYS = ['sector', 'use', 'posted_date', 'location.country',
        'journal_totals.entries', 'activity',
        'loan_amount', 'status', 'lender_count']

INPUT_FIELD_IDS = ['000000',  # sector
                   '000001',  # use
                   '000003',  # location.country
                   '000004',  # journal_totals.entries
                   '000005',  # activity
                   '000006',  # loan_amount
                   '000008',  # lender_count
                   '000002-0',
                   '000002-1',
                   '000002-2',
                   '000002-3',
                   # posted-date.{year,month,day-of-month,day-of-week,'hour'}
                   '000002-4']
EXCLUDED_FIELD_IDS = ['000002', '000002-5', '000002-6']
OBJECTIVE_FIELD_ID = '000007'  # status


class UnicodeWriter(object):

    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, fs, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = fs
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        '''
        writes a single row to the CSV file
        '''
        self.writer.writerow([unicode(s).encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        '''
        write multiple rows
        '''
        for row in rows:
            self.writerow(row)


def flatten(nested_dict, parent_key=''):
    '''
    flatten a nested dictionary, using a "." to denote nested keys
    '''
    items = []
    for key, val in nested_dict.items():
        new_key = parent_key + '.' + key if parent_key else key
        if isinstance(val, collections.MutableMapping):
            items.extend(flatten(val, new_key).items())
        else:
            items.append((new_key, val))
    return dict(items)


def prune_fields(row):
    '''
    remove unused fields from data row
    '''
    flattened = flatten(row)
    for k in flattened.keys():
        if k not in KEYS:
            del flattened[k]
    return flattened


def make_ds(filename):
    '''
    Create a BigML dataset from a CSV file
    '''
    print 'create source'
    src = api.create_source(filename)
    api.ok(src)
    api.update_source(src, {'fields': {'000004': {'optype': 'numeric'}}})
    print '\ncreate dataset'
    dataset = api.create_dataset(src, {'name': 'kiva-data'})
    api.ok(dataset)
    os.remove(filename)


def make_ds_from_snapshot():
    '''
    Download a snapshot of the Kiva database and create a dataset
    '''
    print 'downloading snapshot file'
    (filename, _) = urlretrieve(KIVA_SNAPSHOT_URL, 'snapshot.zip')
    zipfile = ZipFile(filename)
#    members = filter(lambda x: x[:6] == 'loans/', z.namelist())
    members = [name for name in zipfile.namelist() if name[:6] == 'loans/']
    n_members = len(members)
    start = 0
    end = 100
    tmpdir = mkdtemp()
    with NamedTemporaryFile(suffix='.csv', delete=False) as outfile:
        writer = UnicodeWriter(outfile)
        while end < n_members:
            print('extracting %s...%s to %s' %
                  (members[start], members[end], tmpdir))
            zipfile.extractall(tmpdir, members[start:end])
            loans_dir = os.path.join(tmpdir, 'loans')
            for fname in os.listdir(loans_dir):
                print 'parsing %s' % fname
                data = []
                with open(os.path.join(loans_dir, fname)) as fid:
                    loans = simplejson.load(fid)['loans']
                    for loan in loans:
                        if (loan['status'] == 'paid' or
                                loan['status'] == 'defaulted'):
                            loan = prune_fields(loan)
                            data.append(loan)
                os.remove(os.path.join(loans_dir, fname))
                if outfile.tell() == 0:
                    writer.writerow(KEYS)
                for row in data:
                    values = [row[k] for k in KEYS]
                    writer.writerow(values)
            start = end
            end = min(start + 100, n_members)
    make_ds(outfile.name)


def make_ds_from_api(start_date):
    '''
    Use the Kiva API to find all loans which have ended since start_date, and
    create a dataset.
    '''
    print 'grabbing Kiva loan data from %s and later' % start_date

    # get all kiva loans which have ended since that date
    url = 'http://api.kivaws.org/v1/loans/search.json?%s'
    url_details = 'http://api.kivaws.org/v1/loans/%d.json'
    params = {'status': 'ended_with_loss,paid', 'sort_by': 'newest', 'page': 1}
    done = False
    data = []
    while not done:
        done = True
        loans = simplejson.load(urlopen(url % urlencode(params)))['loans']
        for entry in loans:
            # avoid kiva api throttling
            sleep(1.1)
            resp = urlopen(url_details % entry['id'])
            loan = simplejson.load(resp)['loans'][0]
            if 'paid_date' not in loan:
                # defaulted loan
                data.append(prune_fields(loan))
            else:
                paid_date = dateutil.parser.parse(loan['paid_date'])
                if paid_date > last_date:
                    data.append(prune_fields(loan))
                    done = False
        params['page'] += 1

    tmpfile = NamedTemporaryFile(suffix='.csv', delete=False)
    with tmpfile as outfile:
        writer = UnicodeWriter(outfile)
        if outfile.tell() == 0:
            writer.writerow(KEYS)
        for row in data:
            values = [row[k] for k in KEYS]
            writer.writerow(values)
    make_ds(tmpfile.name)

if __name__ == '__main__':
    api = BigML()

    datasets = api.list_datasets("name=kiva-data;order_by=created")['objects']
    if len(datasets) == 0:
        # no pre-existing data, create from Kiva snapshot
        # download kiva snapshot to tmp file
        make_ds_from_snapshot()
    else:
        # find date of most recent BigML dataset
        last_date = dateutil.parser.parse(
            datasets[0]['created']).replace(tzinfo=dateutil.tz.tzutc())

        # use kiva api to grab new loan data
        make_ds_from_api(last_date)

    print 'building model'
    datasets = api.list_datasets("name=kiva-data;order_by=created")['objects']
    model = api.create_model([obj['resource'] for obj in datasets],
                             {'name': 'kiva-model',
                              'objective_field': OBJECTIVE_FIELD_ID,
                              'input_fields': INPUT_FIELD_IDS,
                              'excluded_fields': EXCLUDED_FIELD_IDS,
                              'balance_objective': True})

    print 'Done!'
