// check if a loan id is at the end of the url
var re = /lend\/(\d+)/ ;
var result = re.exec(window.location.href) ;

if (result !== null){
  // individual loan page
  var loan_id = result[1] ;
  img = makeStatusIndicator(loan_id) ;
  $("#lendFormWrapper").append(img) ;
}else{
  // list of loans
  $("article.borrowerQuickLook").each(function(idx,element){
    var result = re.exec($(this).find("a.borrowerName").attr("href")) ;
    var loan_id = result[1] ;
    img = makeStatusIndicator(loan_id) ;
    $(this).find("div.fundAction").append(img) ;
  }) ;
}

function makeStatusIndicator(loan_id){
  // this function executes the Kiva API query for a particular loan id, feeds the result through
  // the actionable model, and returns a green light or red light icon depending on the result.
  
  // create DOM object for icon
  var img = $('<img class="indicator">') ;
  
  // Kiva API call
  var url = "http://api.kivaws.org/v1/loans/" + loan_id + ".json" ;
  $.get(url,function(data){
    // pass response to actionable model
    var data = data.loans[0] ;
    var status = predictStatus(data.funded_amount,data.location.country,data.loan_amount,data.sector) ;
    
    // create the indicator
    if (status == "paid"){
      img.attr("src",chrome.extension.getURL("images/green_light.png")) ;
    }else{
      img.attr("src",chrome.extension.getURL("images/red_light.png")) ;
    }
    img.attr("title","The predicted status for this loan is: " + status.toUpperCase()) ;
  })
  return img ;
}

/**
*  Predictor for Status from model/522a3814035d0729c10069f9
*  Kiva is a non-profit organization with a mission to connect people through lending to alleviate poverty.
 *  This model works with a data from build.kiva.org to identify the very small percentage of Kiva loan recipients (<2%) who are most likely to default. 
 *  Learn more in this blog post[*].
 *  Source:
 *  Loans from a snapshot[*] at build.kiva.org[*]
 *  [*]blog post: http://wp.me/p234d6-1h1
 *  [*]snapshot: http://build.kiva.org/docs/data/snapshots
 *  [*]build.kiva.org: http://build.kiva.org
*/
function predictStatus(fundedAmount, country, loanAmount, sector, fundedDateDayOfWeek, fundedDateDayOfMonth, fundedDateMonth, fundedDateYear) {
    if (fundedDateYear == null) {
        return "paid";
    }
    else if (fundedDateYear <= 2011) {
        if (fundedAmount == null) {
            return "paid";
        }
        else if (fundedAmount <= 67) {
            if (fundedAmount <= 12) {
                if (country == null) {
                    return "refunded";
                }
                else if (country=="India") {
                    return "deleted";
                }
                else if (country!="India") {
                    return "refunded";
                }
            }
            else if (fundedAmount > 12) {
                if (country == null) {
                    return "paid";
                }
                else if (country=="Togo") {
                    return "defaulted";
                }
                else if (country!="Togo") {
                    return "paid";
                }
            }
        }
        else if (fundedAmount > 67) {
            if (country == null) {
                return "paid";
            }
            else if (country=="Togo") {
                if (fundedDateYear <= 2008) {
                    return "paid";
                }
                else if (fundedDateYear > 2008) {
                    if (sector == null) {
                        return "paid";
                    }
                    else if (sector=="Agriculture") {
                        if (loanAmount == null) {
                            return "defaulted";
                        }
                        else if (loanAmount <= 712) {
                            if (loanAmount <= 412) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 412) {
                                return "paid";
                            }
                        }
                        else if (loanAmount > 712) {
                            return "defaulted";
                        }
                    }
                    else if (sector!="Agriculture") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 287) {
                            return "in_repayment";
                        }
                        else if (loanAmount > 287) {
                            return "paid";
                        }
                    }
                }
            }
            else if (country!="Togo") {
                if (country=="Kenya") {
                    if (fundedDateYear <= 2008) {
                        if (fundedDateYear <= 2006) {
                            if (fundedDateMonth == null) {
                                return "defaulted";
                            }
                            else if (fundedDateMonth <= 10) {
                                return "paid";
                            }
                            else if (fundedDateMonth > 10) {
                                return "defaulted";
                            }
                        }
                        else if (fundedDateYear > 2006) {
                            if (fundedDateYear <= 2007) {
                                return "defaulted";
                            }
                            else if (fundedDateYear > 2007) {
                                return "paid";
                            }
                        }
                    }
                    else if (fundedDateYear > 2008) {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Agriculture") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 337) {
                                return "paid";
                            }
                            else if (loanAmount > 337) {
                                return "paid";
                            }
                        }
                        else if (sector!="Agriculture") {
                            if (fundedDateYear <= 2010) {
                                return "paid";
                            }
                            else if (fundedDateYear > 2010) {
                                return "paid";
                            }
                        }
                    }
                }
                else if (country!="Kenya") {
                    if (fundedDateYear <= 2010) {
                        if (country=="Liberia") {
                            return "paid";
                        }
                        else if (country!="Liberia") {
                            if (country=="Ecuador") {
                                return "paid";
                            }
                            else if (country!="Ecuador") {
                                return "paid";
                            }
                        }
                    }
                    else if (fundedDateYear > 2010) {
                        if (country=="Afghanistan") {
                            return "defaulted";
                        }
                        else if (country!="Afghanistan") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 754) {
                                return "paid";
                            }
                            else if (loanAmount > 754) {
                                return "paid";
                            }
                        }
                    }
                }
            }
        }
    }
    else if (fundedDateYear > 2011) {
        if (fundedDateYear <= 2012) {
            if (fundedDateMonth == null) {
                return "paid";
            }
            else if (fundedDateMonth <= 7) {
                if (fundedDateMonth <= 5) {
                    if (fundedAmount == null) {
                        return "paid";
                    }
                    else if (fundedAmount <= 784) {
                        if (country == null) {
                            return "paid";
                        }
                        else if (country=="Cambodia") {
                            if (fundedAmount <= 50) {
                                return "refunded";
                            }
                            else if (fundedAmount > 50) {
                                return "paid";
                            }
                        }
                        else if (country=="Philippines") {
                            if (fundedDateMonth <= 4) {
                                return "paid";
                            }
                            else if (fundedDateMonth > 4) {
                                return "paid";
                            }
                        }
                        else if (country=="Costa Rica") {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 27) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth > 27) {
                                return "paid";
                            }
                        }
                        else if (country=="Togo") {
                            if (fundedAmount <= 100) {
                                return "refunded";
                            }
                            else if (fundedAmount > 100) {
                                return "paid";
                            }
                        }
                        else if (country=="Jordan") {
                            return "paid";
                        }
                        else if (country=="Bolivia") {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Health") {
                                return "in_repayment";
                            }
                            else if (sector!="Health") {
                                return "paid";
                            }
                        }
                        else if (country=="Indonesia") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 537) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 537) {
                                return "paid";
                            }
                        }
                        else if (country=="The Democratic Republic of the Congo") {
                            return "paid";
                        }
                        else if (country=="Nepal") {
                            return "paid";
                        }
                        else if (country=="Paraguay") {
                            return "paid";
                        }
                        else if (country=="Burkina Faso") {
                            return "paid";
                        }
                        else if (country=="Senegal") {
                            if (fundedAmount <= 37) {
                                return "refunded";
                            }
                            else if (fundedAmount > 37) {
                                return "paid";
                            }
                        }
                        else if (country=="Congo") {
                            return "paid";
                        }
                        else if (country=="Liberia") {
                            if (fundedAmount <= 50) {
                                return "refunded";
                            }
                            else if (fundedAmount > 50) {
                                return "paid";
                            }
                        }
                        else if (country=="Yemen") {
                            return "paid";
                        }
                        else if (country=="Nicaragua") {
                            return "paid";
                        }
                        else if (country=="Honduras") {
                            if (fundedAmount <= 37) {
                                return "refunded";
                            }
                            else if (fundedAmount > 37) {
                                return "paid";
                            }
                        }
                        else if (country=="Guatemala") {
                            return "paid";
                        }
                        else if (country=="Dominican Republic") {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Food") {
                                return "in_repayment";
                            }
                            else if (sector!="Food") {
                                return "paid";
                            }
                        }
                        else if (country=="Rwanda") {
                            if (fundedAmount <= 125) {
                                return "refunded";
                            }
                            else if (fundedAmount > 125) {
                                return "paid";
                            }
                        }
                        else if (country=="Mongolia") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 1125) {
                                return "paid";
                            }
                            else if (loanAmount > 1125) {
                                return "refunded";
                            }
                        }
                        else if (country=="Benin") {
                            return "paid";
                        }
                        else if (country=="Samoa") {
                            if (fundedAmount <= 112) {
                                return "refunded";
                            }
                            else if (fundedAmount > 112) {
                                return "paid";
                            }
                        }
                        else if (country=="Mali") {
                            return "paid";
                        }
                        else if (country=="Cameroon") {
                            return "in_repayment";
                        }
                        else if (country=="Kyrgyzstan") {
                            return "paid";
                        }
                        else if (country=="Azerbaijan") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 1025) {
                                return "paid";
                            }
                            else if (loanAmount > 1025) {
                                return "refunded";
                            }
                        }
                        else if (country=="Ghana") {
                            return "paid";
                        }
                        else if (country=="Zimbabwe") {
                            if (fundedDateDayOfMonth == null) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth <= 5) {
                                return "defaulted";
                            }
                            else if (fundedDateDayOfMonth > 5) {
                                return "paid";
                            }
                        }
                        else if (country=="Zambia") {
                            return "refunded";
                        }
                        else if (country=="Lebanon") {
                            return "paid";
                        }
                        else if (country=="Palestine") {
                            if (fundedDateMonth <= 3) {
                                return "paid";
                            }
                            else if (fundedDateMonth > 3) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Mexico") {
                            return "paid";
                        }
                        else if (country=="Mozambique") {
                            return "paid";
                        }
                        else if (country=="El Salvador") {
                            return "paid";
                        }
                        else if (country=="Tajikistan") {
                            if (fundedAmount <= 25) {
                                return "refunded";
                            }
                            else if (fundedAmount > 25) {
                                return "paid";
                            }
                        }
                        else if (country=="Peru") {
                            if (fundedAmount <= 25) {
                                return "refunded";
                            }
                            else if (fundedAmount > 25) {
                                return "paid";
                            }
                        }
                        else if (country=="Vietnam") {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Education") {
                                return "in_repayment";
                            }
                            else if (sector!="Education") {
                                return "paid";
                            }
                        }
                        else if (country=="Timor-Leste") {
                            return "paid";
                        }
                        else if (country=="Iraq") {
                            return "refunded";
                        }
                        else if (country=="Ukraine") {
                            if (fundedDateDayOfMonth == null) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth <= 23) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 23) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Kenya") {
                            if (fundedAmount <= 25) {
                                return "refunded";
                            }
                            else if (fundedAmount > 25) {
                                return "paid";
                            }
                        }
                        else if (country=="Colombia") {
                            return "paid";
                        }
                        else if (country=="South Sudan") {
                            return "paid";
                        }
                        else if (country=="Uganda") {
                            if (fundedAmount <= 25) {
                                return "refunded";
                            }
                            else if (fundedAmount > 25) {
                                return "paid";
                            }
                        }
                        else if (country=="Albania") {
                            return "paid";
                        }
                        else if (country=="Chile") {
                            return "paid";
                        }
                        else if (country=="Ecuador") {
                            if (fundedAmount <= 75) {
                                return "refunded";
                            }
                            else if (fundedAmount > 75) {
                                return "paid";
                            }
                        }
                        else if (country=="Pakistan") {
                            return "paid";
                        }
                        else if (country=="Armenia") {
                            return "paid";
                        }
                        else if (country=="Burundi") {
                            return "refunded";
                        }
                        else if (country=="Georgia") {
                            return "paid";
                        }
                        else if (country=="Sierra Leone") {
                            return "paid";
                        }
                    }
                    else if (fundedAmount > 784) {
                        if (country == null) {
                            return "paid";
                        }
                        else if (country=="Palestine") {
                            return "in_repayment";
                        }
                        else if (country!="Palestine") {
                            if (country=="Armenia") {
                                return "in_repayment";
                            }
                            else if (country!="Armenia") {
                                return "paid";
                            }
                        }
                    }
                }
                else if (fundedDateMonth > 5) {
                    if (country == null) {
                        return "paid";
                    }
                    else if (country=="Cambodia") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 11) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 11) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Israel") {
                        return "in_repayment";
                    }
                    else if (country=="Philippines") {
                        return "paid";
                    }
                    else if (country=="Costa Rica") {
                        return "in_repayment";
                    }
                    else if (country=="Togo") {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Agriculture") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 800) {
                                return "paid";
                            }
                            else if (loanAmount > 800) {
                                return "in_repayment";
                            }
                        }
                        else if (sector!="Agriculture") {
                            return "paid";
                        }
                    }
                    else if (country=="Jordan") {
                        if (loanAmount == null) {
                            return "in_repayment";
                        }
                        else if (loanAmount <= 1112) {
                            if (fundedDateMonth <= 6) {
                                return "paid";
                            }
                            else if (fundedDateMonth > 6) {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 1112) {
                            if (sector == null) {
                                return "in_repayment";
                            }
                            else if (sector=="Construction") {
                                return "defaulted";
                            }
                            else if (sector!="Construction") {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Bolivia") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1675) {
                            if (loanAmount <= 712) {
                                return "paid";
                            }
                            else if (loanAmount > 712) {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 1675) {
                            return "paid";
                        }
                    }
                    else if (country=="Indonesia") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1362) {
                            return "in_repayment";
                        }
                        else if (loanAmount > 1362) {
                            return "paid";
                        }
                    }
                    else if (country=="The Democratic Republic of the Congo") {
                        return "paid";
                    }
                    else if (country=="Nepal") {
                        if (fundedDateDayOfMonth == null) {
                            return "in_repayment";
                        }
                        else if (fundedDateDayOfMonth <= 28) {
                            return "paid";
                        }
                        else if (fundedDateDayOfMonth > 28) {
                            return "in_repayment";
                        }
                    }
                    else if (country=="Haiti") {
                        return "paid";
                    }
                    else if (country=="Paraguay") {
                        return "paid";
                    }
                    else if (country=="Burkina Faso") {
                        return "paid";
                    }
                    else if (country=="Senegal") {
                        if (fundedAmount == null) {
                            return "paid";
                        }
                        else if (fundedAmount <= 62) {
                            if (sector == null) {
                                return "refunded";
                            }
                            else if (sector=="Food") {
                                return "paid";
                            }
                            else if (sector!="Food") {
                                return "refunded";
                            }
                        }
                        else if (fundedAmount > 62) {
                            return "paid";
                        }
                    }
                    else if (country=="Congo") {
                        return "paid";
                    }
                    else if (country=="Liberia") {
                        return "paid";
                    }
                    else if (country=="Yemen") {
                        return "paid";
                    }
                    else if (country=="Nicaragua") {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Housing") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 612) {
                                return "paid";
                            }
                            else if (loanAmount > 612) {
                                return "in_repayment";
                            }
                        }
                        else if (sector!="Housing") {
                            if (sector=="Education") {
                                return "in_repayment";
                            }
                            else if (sector!="Education") {
                                return "paid";
                            }
                        }
                    }
                    else if (country=="Honduras") {
                        return "paid";
                    }
                    else if (country=="South Africa") {
                        return "in_repayment";
                    }
                    else if (country=="Guatemala") {
                        return "paid";
                    }
                    else if (country=="Dominican Republic") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1337) {
                            if (loanAmount <= 250) {
                                return "paid";
                            }
                            else if (loanAmount > 250) {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 1337) {
                            return "paid";
                        }
                    }
                    else if (country=="Rwanda") {
                        return "paid";
                    }
                    else if (country=="Mongolia") {
                        if (loanAmount == null) {
                            return "in_repayment";
                        }
                        else if (loanAmount <= 1462) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Retail") {
                                return "in_repayment";
                            }
                            else if (sector!="Retail") {
                                return "paid";
                            }
                        }
                        else if (loanAmount > 1462) {
                            if (fundedDateDayOfWeek == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek <= 1) {
                                return "paid";
                            }
                            else if (fundedDateDayOfWeek > 1) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Benin") {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Services") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 1075) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 1075) {
                                return "paid";
                            }
                        }
                        else if (sector!="Services") {
                            return "paid";
                        }
                    }
                    else if (country=="Samoa") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 12) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 12) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Mali") {
                        return "paid";
                    }
                    else if (country=="Cameroon") {
                        if (fundedDateDayOfMonth == null) {
                            return "in_repayment";
                        }
                        else if (fundedDateDayOfMonth <= 30) {
                            return "in_repayment";
                        }
                        else if (fundedDateDayOfMonth > 30) {
                            return "paid";
                        }
                    }
                    else if (country=="Kyrgyzstan") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1125) {
                            return "paid";
                        }
                        else if (loanAmount > 1125) {
                            return "in_repayment";
                        }
                    }
                    else if (country=="Azerbaijan") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1412) {
                            return "paid";
                        }
                        else if (loanAmount > 1412) {
                            if (sector == null) {
                                return "in_repayment";
                            }
                            else if (sector=="Transportation") {
                                return "paid";
                            }
                            else if (sector!="Transportation") {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Ghana") {
                        return "paid";
                    }
                    else if (country=="Zambia") {
                        return "in_repayment";
                    }
                    else if (country=="Lebanon") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            return "in_repayment";
                        }
                    }
                    else if (country=="Palestine") {
                        return "in_repayment";
                    }
                    else if (country=="Mexico") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 1527) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Agriculture") {
                                return "paid";
                            }
                            else if (sector!="Agriculture") {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 1527) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Housing") {
                                return "in_repayment";
                            }
                            else if (sector!="Housing") {
                                return "paid";
                            }
                        }
                    }
                    else if (country=="Mozambique") {
                        return "in_repayment";
                    }
                    else if (country=="El Salvador") {
                        return "paid";
                    }
                    else if (country=="Tajikistan") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Services") {
                                return "in_repayment";
                            }
                            else if (sector!="Services") {
                                return "paid";
                            }
                        }
                    }
                    else if (country=="Peru") {
                        return "paid";
                    }
                    else if (country=="Vietnam") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 762) {
                            return "paid";
                        }
                        else if (loanAmount > 762) {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 20) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 20) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Kosovo") {
                        if (loanAmount == null) {
                            return "in_repayment";
                        }
                        else if (loanAmount <= 700) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Services") {
                                return "paid";
                            }
                            else if (sector!="Services") {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 700) {
                            return "in_repayment";
                        }
                    }
                    else if (country=="Timor-Leste") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 7) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 7) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Iraq") {
                        if (fundedDateMonth <= 6) {
                            if (fundedDateDayOfWeek == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek <= 2) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek > 2) {
                                return "paid";
                            }
                        }
                        else if (fundedDateMonth > 6) {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 1550) {
                                return "paid";
                            }
                            else if (fundedAmount > 1550) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Ukraine") {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Agriculture") {
                            return "in_repayment";
                        }
                        else if (sector!="Agriculture") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 2675) {
                                return "paid";
                            }
                            else if (loanAmount > 2675) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Kenya") {
                        if (fundedDateMonth <= 6) {
                            if (fundedAmount == null) {
                                return "paid";
                            }
                            else if (fundedAmount <= 37) {
                                return "refunded";
                            }
                            else if (fundedAmount > 37) {
                                return "paid";
                            }
                        }
                        else if (fundedDateMonth > 6) {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 387) {
                                return "paid";
                            }
                            else if (loanAmount > 387) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Colombia") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 637) {
                            if (fundedAmount == null) {
                                return "paid";
                            }
                            else if (fundedAmount <= 87) {
                                return "refunded";
                            }
                            else if (fundedAmount > 87) {
                                return "paid";
                            }
                        }
                        else if (loanAmount > 637) {
                            if (sector == null) {
                                return "in_repayment";
                            }
                            else if (sector=="Wholesale") {
                                return "defaulted";
                            }
                            else if (sector!="Wholesale") {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="South Sudan") {
                        return "paid";
                    }
                    else if (country=="Uganda") {
                        return "paid";
                    }
                    else if (country=="Albania") {
                        return "in_repayment";
                    }
                    else if (country=="Chile") {
                        return "paid";
                    }
                    else if (country=="Ecuador") {
                        return "paid";
                    }
                    else if (country=="Pakistan") {
                        if (fundedDateMonth <= 6) {
                            return "paid";
                        }
                        else if (fundedDateMonth > 6) {
                            if (fundedDateDayOfMonth == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth <= 19) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 19) {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (country=="Armenia") {
                        return "in_repayment";
                    }
                    else if (country=="Burundi") {
                        return "paid";
                    }
                    else if (country=="Georgia") {
                        if (fundedDateDayOfMonth == null) {
                            return "paid";
                        }
                        else if (fundedDateDayOfMonth <= 22) {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 412) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 412) {
                                return "paid";
                            }
                        }
                        else if (fundedDateDayOfMonth > 22) {
                            if (fundedDateDayOfWeek == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek <= 4) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek > 4) {
                                return "paid";
                            }
                        }
                    }
                    else if (country=="Tanzania") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 8050) {
                            return "paid";
                        }
                        else if (loanAmount > 8050) {
                            return "in_repayment";
                        }
                    }
                    else if (country=="Sierra Leone") {
                        return "paid";
                    }
                    else if (country=="United States") {
                        return "in_repayment";
                    }
                }
            }
            else if (fundedDateMonth > 7) {
                if (country == null) {
                    return "in_repayment";
                }
                else if (country=="Philippines") {
                    if (fundedDateMonth <= 9) {
                        return "paid";
                    }
                    else if (fundedDateMonth > 9) {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Agriculture") {
                            return "paid";
                        }
                        else if (sector!="Agriculture") {
                            return "paid";
                        }
                    }
                }
                else if (country!="Philippines") {
                    if (country=="Peru") {
                        if (fundedDateMonth <= 10) {
                            if (sector == null) {
                                return "paid";
                            }
                            else if (sector=="Housing") {
                                return "in_repayment";
                            }
                            else if (sector!="Housing") {
                                return "paid";
                            }
                        }
                        else if (fundedDateMonth > 10) {
                            return "paid";
                        }
                    }
                    else if (country!="Peru") {
                        if (fundedDateMonth <= 10) {
                            if (country=="Ghana") {
                                return "paid";
                            }
                            else if (country!="Ghana") {
                                return "in_repayment";
                            }
                        }
                        else if (fundedDateMonth > 10) {
                            if (country=="Ghana") {
                                return "paid";
                            }
                            else if (country!="Ghana") {
                                return "in_repayment";
                            }
                        }
                    }
                }
            }
        }
        else if (fundedDateYear > 2012) {
            if (fundedDateMonth == null) {
                return "in_repayment";
            }
            else if (fundedDateMonth <= 2) {
                if (fundedDateDayOfMonth == null) {
                    return "in_repayment";
                }
                else if (fundedDateDayOfMonth <= 4) {
                    if (country == null) {
                        return "in_repayment";
                    }
                    else if (country=="Peru") {
                        if (loanAmount == null) {
                            return "paid";
                        }
                        else if (loanAmount <= 950) {
                            if (fundedDateDayOfMonth <= 3) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 3) {
                                return "in_repayment";
                            }
                        }
                        else if (loanAmount > 950) {
                            return "paid";
                        }
                    }
                    else if (country!="Peru") {
                        return "in_repayment";
                    }
                }
                else if (fundedDateDayOfMonth > 4) {
                    if (country == null) {
                        return "in_repayment";
                    }
                    else if (country=="Rwanda") {
                        if (sector == null) {
                            return "paid";
                        }
                        else if (sector=="Agriculture") {
                            return "in_repayment";
                        }
                        else if (sector!="Agriculture") {
                            if (fundedDateDayOfMonth <= 8) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth > 8) {
                                return "paid";
                            }
                        }
                    }
                    else if (country!="Rwanda") {
                        if (country=="Cambodia") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 12) {
                                return "refunded";
                            }
                            else if (fundedAmount > 12) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Israel") {
                            return "in_repayment";
                        }
                        else if (country=="Philippines") {
                            return "in_repayment";
                        }
                        else if (country=="Costa Rica") {
                            return "in_repayment";
                        }
                        else if (country=="Togo") {
                            return "in_repayment";
                        }
                        else if (country=="Jordan") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 187) {
                                return "refunded";
                            }
                            else if (fundedAmount > 187) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Bolivia") {
                            return "in_repayment";
                        }
                        else if (country=="Indonesia") {
                            return "in_repayment";
                        }
                        else if (country=="The Democratic Republic of the Congo") {
                            if (fundedAmount == null) {
                                return "paid";
                            }
                            else if (fundedAmount <= 912) {
                                return "refunded";
                            }
                            else if (fundedAmount > 912) {
                                return "paid";
                            }
                        }
                        else if (country=="Nepal") {
                            return "in_repayment";
                        }
                        else if (country=="Haiti") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 2275) {
                                return "paid";
                            }
                            else if (loanAmount > 2275) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Paraguay") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 2090) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 2090) {
                                return "paid";
                            }
                        }
                        else if (country=="Burkina Faso") {
                            if (fundedDateDayOfMonth <= 20) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 20) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Thailand") {
                            return "in_repayment";
                        }
                        else if (country=="Senegal") {
                            return "in_repayment";
                        }
                        else if (country=="Botswana") {
                            return "in_repayment";
                        }
                        else if (country=="Congo") {
                            if (fundedDateDayOfMonth <= 16) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 16) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Liberia") {
                            return "in_repayment";
                        }
                        else if (country=="Yemen") {
                            return "in_repayment";
                        }
                        else if (country=="Belize") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 62) {
                                return "refunded";
                            }
                            else if (fundedAmount > 62) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Nicaragua") {
                            return "in_repayment";
                        }
                        else if (country=="Honduras") {
                            return "in_repayment";
                        }
                        else if (country=="Guatemala") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 187) {
                                return "paid";
                            }
                            else if (loanAmount > 187) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Dominican Republic") {
                            return "in_repayment";
                        }
                        else if (country=="Mongolia") {
                            return "in_repayment";
                        }
                        else if (country=="Benin") {
                            return "in_repayment";
                        }
                        else if (country=="Samoa") {
                            if (sector == null) {
                                return "in_repayment";
                            }
                            else if (sector=="Clothing") {
                                return "paid";
                            }
                            else if (sector!="Clothing") {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Mali") {
                            return "in_repayment";
                        }
                        else if (country=="Nigeria") {
                            return "in_repayment";
                        }
                        else if (country=="Cameroon") {
                            if (fundedDateDayOfMonth <= 5) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 5) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Kyrgyzstan") {
                            if (fundedDateDayOfMonth <= 29) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfMonth > 29) {
                                return "paid";
                            }
                        }
                        else if (country=="Azerbaijan") {
                            return "in_repayment";
                        }
                        else if (country=="Ghana") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 337) {
                                return "paid";
                            }
                            else if (loanAmount > 337) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Zimbabwe") {
                            if (fundedDateDayOfWeek == null) {
                                return "in_repayment";
                            }
                            else if (fundedDateDayOfWeek <= 1) {
                                return "refunded";
                            }
                            else if (fundedDateDayOfWeek > 1) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Zambia") {
                            return "in_repayment";
                        }
                        else if (country=="Lebanon") {
                            return "in_repayment";
                        }
                        else if (country=="Palestine") {
                            return "in_repayment";
                        }
                        else if (country=="Mexico") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 1231) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 1231) {
                                return "paid";
                            }
                        }
                        else if (country=="Mozambique") {
                            if (sector == null) {
                                return "in_repayment";
                            }
                            else if (sector=="Agriculture") {
                                return "paid";
                            }
                            else if (sector!="Agriculture") {
                                return "in_repayment";
                            }
                        }
                        else if (country=="El Salvador") {
                            return "in_repayment";
                        }
                        else if (country=="India") {
                            return "in_repayment";
                        }
                        else if (country=="Tajikistan") {
                            return "in_repayment";
                        }
                        else if (country=="Peru") {
                            return "in_repayment";
                        }
                        else if (country=="Vietnam") {
                            return "in_repayment";
                        }
                        else if (country=="Kosovo") {
                            return "in_repayment";
                        }
                        else if (country=="Timor-Leste") {
                            return "in_repayment";
                        }
                        else if (country=="Iraq") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 600) {
                                return "refunded";
                            }
                            else if (fundedAmount > 600) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Ukraine") {
                            return "in_repayment";
                        }
                        else if (country=="Kenya") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 37) {
                                return "refunded";
                            }
                            else if (fundedAmount > 37) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Colombia") {
                            return "in_repayment";
                        }
                        else if (country=="South Sudan") {
                            if (fundedDateDayOfMonth <= 11) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 11) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Uganda") {
                            return "in_repayment";
                        }
                        else if (country=="Albania") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 237) {
                                return "refunded";
                            }
                            else if (fundedAmount > 237) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Chile") {
                            if (loanAmount == null) {
                                return "paid";
                            }
                            else if (loanAmount <= 2025) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 2025) {
                                return "paid";
                            }
                        }
                        else if (country=="Ecuador") {
                            return "in_repayment";
                        }
                        else if (country=="Pakistan") {
                            return "in_repayment";
                        }
                        else if (country=="Armenia") {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 150) {
                                return "refunded";
                            }
                            else if (fundedAmount > 150) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Burundi") {
                            return "in_repayment";
                        }
                        else if (country=="Georgia") {
                            return "in_repayment";
                        }
                        else if (country=="Tanzania") {
                            if (fundedDateDayOfMonth <= 16) {
                                return "paid";
                            }
                            else if (fundedDateDayOfMonth > 16) {
                                return "in_repayment";
                            }
                        }
                        else if (country=="Sierra Leone") {
                            if (loanAmount == null) {
                                return "in_repayment";
                            }
                            else if (loanAmount <= 5175) {
                                return "in_repayment";
                            }
                            else if (loanAmount > 5175) {
                                return "paid";
                            }
                        }
                        else if (country=="United States") {
                            return "in_repayment";
                        }
                    }
                }
            }
            else if (fundedDateMonth > 2) {
                if (country == null) {
                    return "in_repayment";
                }
                else if (country=="South Africa") {
                    return "funded";
                }
                else if (country!="South Africa") {
                    if (fundedDateMonth <= 3) {
                        if (fundedDateDayOfMonth == null) {
                            return "in_repayment";
                        }
                        else if (fundedDateDayOfMonth <= 8) {
                            return "in_repayment";
                        }
                        else if (fundedDateDayOfMonth > 8) {
                            if (country=="Nigeria") {
                                return "in_repayment";
                            }
                            else if (country!="Nigeria") {
                                return "in_repayment";
                            }
                        }
                    }
                    else if (fundedDateMonth > 3) {
                        if (fundedDateMonth <= 4) {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 93) {
                                return "in_repayment";
                            }
                            else if (fundedAmount > 93) {
                                return "in_repayment";
                            }
                        }
                        else if (fundedDateMonth > 4) {
                            if (fundedAmount == null) {
                                return "in_repayment";
                            }
                            else if (fundedAmount <= 104) {
                                return "in_repayment";
                            }
                            else if (fundedAmount > 104) {
                                return "in_repayment";
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}