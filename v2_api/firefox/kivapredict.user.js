// ==UserScript==
// @name          	Kiva Predictor
// @version		0.2
// @description   	Predict Kiva loan status using a BigML actionable model
// @include       	http://www.kiva.org/lend*
// @require       	http://code.jquery.com/jquery-2.1.1.min.js
// @resource		kivapredict_style kivapredict.css
// @resource      	green_light http://png-2.findicons.com/files/icons/1933/symbols/24/green_light.png
// @resource      	red_light http://png-3.findicons.com/files/icons/1933/symbols/24/red_light.png
// @icon          	http://www.example.net/icon.png
// @grant	  	GM_getResourceURL
// @grant		GM_getResourceText
// @grant		GM_setValue
// @grant		GM_getValue
// @grant		GM_addStyle
// @grant		GM_xmlhttpRequest
// ==/UserScript==

GM_addStyle(GM_getResourceText("kivapredict_style"))

var predict_url = "" ;
var model = ""
var global = null ;

// get stored bigml auth parameters and build prediction url
var username = GM_getValue("bigml_username",null) ;
var apikey =  GM_getValue("bigml_apikey",null) ;
if (!username){
  username = prompt("Enter your BigML username") ;
  GM_setValue("bigml_username",username) ;
}
if (!apikey){
  apikey = prompt("Enter your BigML API key") ;
  GM_setValue("bigml_apikey",apikey) ;
}

// fetch the latest Kiva model from BigML
var model_good = false ;
do{
  var models_url = "https://bigml.io/andromeda/model?name=kiva-model;username=" + username + ";api_key=" + apikey ;
  var xhr = GM_xmlhttpRequest({
    url: models_url,
    method: "GET",
    synchronous: true
  })
  if (xhr.status == 200){
    var resp = JSON.parse(xhr.responseText) ;
    model = resp.objects[0].resource ;
    predict_url = "https://bigml.io/andromeda/prediction?username=" + username + ";api_key=" + apikey ;
    model_good = true ;
  }
  else{
    var ok = confirm("Could not list BigML models. Re-enter credentials?")
    if (ok){
      username = prompt("Enter your BigML username") ;
      GM_setValue("bigml_username",username) ;
      apikey = prompt("Enter your BigML API key") ;
      GM_setValue("bigml_apikey",apikey) ;
    }
    else{
      break ;
    }
  }
}while (!model_good) ;

if (model_good){
  // check if a loan ID is at the end of the url
  var re = /lend\/(\d+)/ ;
  var result = re.exec(window.location.href) ;
  if (result !== null){
    // individual loan page
    var loan_id = result[1] ;
    var container = $("<div></div>")
    container.addClass("prediction-container") ;
    makeStatusIndicator(loan_id,container) ;
    $("#lendFormWrapper").after(container) ;
  }else{
    // list of loans
    var ids = $("a.borrowerName").attr("href")
    $("article.borrowerQuickLook").each(function(idx,element){
      var result = re.exec($(this).find("a.borrowerName").attr("href")) ;
      var loan_id = result[1] ;
      var container = $("<div></div>")
	.addClass("prediction-container small-container") ;
      makeStatusIndicator(loan_id,container) ;
      $(this).find("div.fundAction").append(container)
    }) ;
  }
}

function makeStatusIndicator(loan_id,container){
  // this function executes the Kiva API query for a particular loan id, 
  // and passes the returned value to the BigML API for prediction
  
  container.append("<span class='placeholder'>Predicting loan status...</span>")
  
  // Kiva API call
  var url = "http://api.kivaws.org/v1/loans/" + loan_id + ".json" ;
  $.get(url,function(data){
    // pass response to BigML API
    var data = data.loans[0] ;
    predictStatus(data,container) ;
  })
}


function predictStatus(data,container){
  // construct input data structure
  var posted_date = new Date(data.posted_date) ;
  
  // Javascript days are 0-6 <=> Sun-Sat, but BigML days are 1-7 <=> Mon-Sun
  var day_of_week = posted_date.getDay()
  if (day_of_week == 0){
    day_of_week = 7 ;
  }
  
  var input_data = {
    "000000":data.sector,
    "000001":data.use,
    "000003":data.location.country,
    "000004":data.journal_totals.entries,
    "000005":data.activity,
    "000006":data.loan_amount,
    "000008":data.lender_count,
    "000006":data.loan_amount,
    "000002-0": posted_date.getFullYear(),
    "000002-1": posted_date.getMonth()+1,
    "000002-2": posted_date.getDate(),
    "000002-3": day_of_week,
    "000002-4": posted_date.getHours()
  }
  
  var post_data = JSON.stringify({
    input_data:input_data,
    model:model
  }) ;
    
  var req = new XMLHttpRequest ;
  req.open('post',predict_url) ;
  req.setRequestHeader('Content-Type','application/json') ;
  req.onload = function(evt){
    if (req.readyState === 4){
      if (req.status === 201){
	var resp = JSON.parse(req.responseText)
	var status = resp["prediction"]["000007"]
	container.children(".placeholder").remove()
        
        // create DOM object for icon
	var status_span = $('<span>Predicted Status: </span>')
        var img = $('<img class="indicator">') ;
        // create the indicator. use Greasemonkey API to resolve path to image resource
        if (status == "paid"){
          img.attr("src",GM_getResourceURL("green_light")) ;
        }else{
          img.attr("src",GM_getResourceURL("red_light")) ;
        }
        img.attr("title","The predicted status for this loan is: " + status.toUpperCase()) ;
        status_span.append(img) ;
	container.append(status_span) ;
	
	// create confidence meter
	meter_span = $('<span></span>')
	meter_span.addClass("label") ;
	var confidence = Math.floor(Number(resp["confidence"])*100) ;
	meter_span.text("Prediction Confidence: ")
	var meter = $('<div class="meter confidence-meter">')
	var bar = $('<div class="confidence-bar">') ;
	bar.css("width",confidence +"%")
	if (confidence > 66){
	  bar.addClass("confidence-high") ;
	} else if (confidence > 33 ) {
	  bar.addClass("confidence-mid") ;
	} else {
	  bar.addClass("confidence-low") ;
	}
	bar.attr("title",confidence+"%") ;
	meter.append(bar) ;
	container.append("<br>").append(meter_span) ;
	container.append(meter);
	
	// create link to BigML prediction page
	var resource = resp["resource"]
	var prediction_link = $('<a>Details</a>')
	prediction_link.attr("href","https://bigml.com/dashboard/"+resource)
	  .attr("target","_blank") ;
	container.append("<br>").append(prediction_link) ;
      }
    }
  }
  req.send(post_data) ;
  return "paid"
}
