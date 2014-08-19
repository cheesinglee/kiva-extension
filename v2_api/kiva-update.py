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
import sys
from time import sleep
from zipfile import ZipFile
from tempfile import NamedTemporaryFile,mkdtemp 
from urllib import urlopen,urlencode,urlretrieve
from bigml.api import BigML

KIVA_SNAPSHOT_URL = 'http://s3.kiva.org/snapshots/kiva_ds_json.zip'
PRUNE_FIELDS = ['terms','payments','basket_amount','description','name',
                'borrowers','translator','video','image',
                'funded_date','paid_date','paid_amount','funded_amount',
                'planned_expiration_date','bonus_credit_eligibility','partner_id']
                
KEYS = ['sector', 'use', 'posted_date','location.country',
        'journal_totals.entries', 'activity', 
        'loan_amount', 'status', 'lender_count']
                
INPUT_FIELD_IDS = ['000000', #sector
                '000001', #use
                '000003', #location.country      
                '000004', #journal_totals.entries
                '000005', #activity
                '000006', #loan_amount
                '000008', #lender_count
                '000002-0',
                '000002-1',
                '000002-2',
                '000002-3',
                '000002-4', #posted-date.{year,month,day-of-month,day-of-week,'hour'}
                ]
EXCLUDED_FIELD_IDS = ['000002','000002-5','000002-6']
OBJECTIVE_FIELD_ID = '000007' #status

class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
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
        for row in rows:
            self.writerow(row)

def flatten(d, parent_key=''):
    items = []
    for k, v in d.items():
        new_key = parent_key + '.' + k if parent_key else k
        if isinstance(v, collections.MutableMapping):
            items.extend(flatten(v, new_key).items())
        else:
            items.append((new_key, v))
    return dict(items)

def prune_fields(row):
    flattened = flatten(row)
    for k in flattened.keys():
        if k not in KEYS:
            del(flattened[k])
    return flattened
#    for field in PRUNE_FIELDS:
#        try:
#            del(row[field])
#        except: 
#            pass
#    return flatten(row)


api = BigML()

datasets = api.list_datasets("name=kiva-data;order_by=created")['objects']
#if True:
if len(datasets) == 0:
    # no pre-existing data, create from Kiva snapshot
    # download kiva snapshot to tmp file
#    print('downloading snapshot file')
#    (filename,headers) = urlretrieve(KIVA_SNAPSHOT_URL,'snapshot.zip')
    filename = '../data/kiva_ds_json.zip'
    z = ZipFile(filename)
    members = filter(lambda x : x[:6] == 'loans/', z.namelist())
    n = len(members)
    start = 0
    end = 100
    tmpdir = mkdtemp()
    keys = []
    with NamedTemporaryFile(suffix='.csv',delete=False) as outfile:
        writer = UnicodeWriter(outfile)
        while end < n:
            print('extracting %s...%s to %s' % (members[start],members[end],tmpdir))
            z.extractall(tmpdir,members[start:end])
            loans_dir = os.path.join(tmpdir,'loans')
            for fname in os.listdir(loans_dir):        
                print('parsing %s' % fname)
                data = []
                with open(os.path.join(loans_dir,fname)) as fid:
                    loans = simplejson.load(fid)['loans']
                    for l in loans:
                        if l['status'] == 'paid' or l['status'] == 'defaulted':
                            l = prune_fields(l)
                            data.append(l)
                os.remove(os.path.join(loans_dir,fname))
                if outfile.tell() == 0:
                    writer.writerow(KEYS)
                for row in data:
                    values = [row[k] for k in KEYS]
                    writer.writerow(values)
            start = end
            end = min(start+100,n)
    print('create source')
    src = api.create_source(outfile.name)
    api.ok(src)
    api.update_source(src,{'fields':{'000004':{'optype':'numeric'}}})
    print('\ncreate dataset')
    ds = api.create_dataset(src,{'name':'kiva-data'})
    api.ok(ds)
#    os.remove(outfile.name)
else:
    # use kiva api to grab new loan data

    # find date of most recent BigML dataset
#    last_date = dateutil.parser.parse(datasets[0]['created']).replace(tzinfo=dateutil.tz.tzutc())
    last_date = dateutil.parser.parse('2014-07-22').replace(tzinfo=dateutil.tz.tzutc())
    print('grabbing Kiva loan data from %s and later' % last_date)    
    
    
    # get all kiva loans which have ended since that date
    url = 'http://api.kivaws.org/v1/loans/search.json?%s'
    url_details = 'http://api.kivaws.org/v1/loans/%d.json'
    params = {'status':'ended_with_loss,paid','sort_by':'newest','page':1}
    done = False
    data = []
    while not done:
        done = True
        resp = simplejson.load(urlopen(url % urlencode(params)))
        loans = resp['loans']
        for entry in loans:
            # avoid kiva api throttling
            sleep(1.1)
            resp = urlopen(url_details % entry['id'])
            l = simplejson.load(resp)['loans'][0]
            if 'paid_date' not in l:
                # defaulted loan
                data.append(prune_fields(l))
            else:
                d = dateutil.parser.parse(l['paid_date'])
                if d > last_date:
                    data.append(prune_fields(l))
                    done = False
        params['page'] += 1
                 
    tmpfile = NamedTemporaryFile(suffix='.csv',delete=False) 
    with tmpfile as outfile:
        writer = UnicodeWriter(outfile)
        if outfile.tell() == 0:
            writer.writerow(KEYS)
        for row in data:
            values = [row[k] for k in KEYS]
            writer.writerow(values)    
    print('creating source')
    src = api.create_source(tmpfile.name)
    api.ok(src)
    print('creating dataset')
    ds = api.create_dataset(src,{'name':'kiva-data'})
    api.ok(ds)
    os.remove(tmpfile.name)
    

print('building model')
datasets = api.list_datasets("name=kiva-data;order_by=created")['objects']
model = api.create_model([obj['resource'] for obj in datasets],
                         {'name':'kiva-model',
                          'objective_field':OBJECTIVE_FIELD_ID,
                          'input_fields':INPUT_FIELD_IDS,
                          'excluded_fields':EXCLUDED_FIELD_IDS,
                          'balance_objective':True})
         

