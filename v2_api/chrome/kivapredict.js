// check if a loan ID is at the end of the url
var re = /lend\/(\d+)/ ;
var result = re.exec(window.location.href) ;
var predict_url = "" ;
var model = ""
var global = null ;

// get stored bigml auth parameters and build prediction url
chrome.storage.sync.get(['model','username','apikey'],function(items){
  predict_url = "https://bigml.io/andromeda/prediction?username=" + items.username + ";api_key=" + items.apikey ;
  model = items.model ;
}) ;

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
  //makeStatusIndicator(loan_id,$("article.borrowerQuickLook")) ;
  $("article.borrowerQuickLook").each(function(idx,element){
    var result = re.exec($(this).find("a.borrowerName").attr("href")) ;
    var loan_id = result[1] ;
    var container = $("<div></div>")
      .addClass("prediction-container small-container") ;
    makeStatusIndicator(loan_id,container) ;
    $(this).find("div.fundAction").append(container)
  }) ;
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
  console.log(post_data) ;
  console.log(predict_url) ;
    
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
        // create the indicator. use chrome.extension.getURL to resolve path to image resource
        if (status == "paid"){
          img.attr("src",chrome.extension.getURL("images/green_light.png")) ;
        }else{
          img.attr("src",chrome.extension.getURL("images/red_light.png")) ;
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
  return 
}
