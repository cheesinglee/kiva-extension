function fetchModel(){
  chrome.storage.sync.get({
      username: "BigML Username",
      apikey: "BigML API Key"
  },
  function(items){
    var models_url = "https://bigml.io/andromeda/model?name=kiva-model;username=" + items.username + ";api_key=" + items.apikey ;
    var xmlHttp = new XMLHttpRequest() ;
    xmlHttp.open("GET",models_url,false) ;
    xmlHttp.send(null) ;
    if (xmlHttp.status == 200){
      var resp = JSON.parse(xmlHttp.responseText) ;
      var model = resp.objects[0].resource ;
      chrome.storage.sync.set({model:model})
    }
    else{
      alert("Could not list BigML models, your credentials may be incorrect.")
      chrome.tabs.query({title:"Kiva Predictor Options"},function(result){
	if (result.length == 0){
	  chrome.tabs.create({url:"options.html"})
	}
      }) ;
    }
  })
}

function firstRun(){
  chrome.tabs.create({url:"options.html"})
}

chrome.runtime.onInstalled.addListener(firstRun) ;

chrome.runtime.onStartup.addListener(fetchModel) ;

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
  if (request.greeting == "fetchmodel"){
    fetchModel() ;
  }
})


