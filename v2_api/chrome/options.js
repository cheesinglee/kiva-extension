// Saves options to chrome.storage
function save_options() {
  var username = document.getElementById('username').value;
  var apikey = document.getElementById('apikey').value;
  chrome.storage.sync.set({
    username: username,
    apikey: apikey
  }, function() {
    // Update status to let user know options were saved.
    chrome.runtime.sendMessage({greeting:"fetchmodel"}) ;
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    username: 'BigML Username',
    apikey: 'BigML API Key'
  }, function(items) {
    document.getElementById('username').value = items.username;
    document.getElementById('apikey').value = items.apikey;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);