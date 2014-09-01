kiva-extension
==============

Browser extension which predicts the outcome of Kiva loans based on BigML models. Two versions are available:

+   v1 uses a hard-coded actionable model
+   v2 uses the BigML API to grab predictions from a live model. To be used in conjunction with the Python script
    [kiva-update.py](https://github.com/cheesinglee/kiva-extension/blob/master/v2_api/kiva-update.py) for building and       updating models.

Installation and Usage
---------------------

Chrome: navigate to chrome://extensions, select "Developer Mode", click "Load Unpacked Extension" and select the folder which contains manifest.json

Firefox + Greasemonkey: Drag and drop `kivapredict.user.js` into your browser and install the user script.

To see the extension in action, navigate to www.kiva.org/lend

TODO
------------------
* Greasemonkey version: fetch latest model everytime once on browser startup, instead of every time script is fired
* Both versions: The list view on Kiva is paginated via AJAX, so the content script doesn't fire when a new page is selected.
