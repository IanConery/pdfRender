var dollarFormat = function(num){
  if(!num){
    return 0;
  }
  num = Math.round(num * 100) / 100;
  var string = num.toString().split('.');
  var dollars = string[0].split('').reverse().join('');
  var cents = string[1];
  var arr = [];
  if(!cents || cents.length === 0){
    cents = '00'
  }
  if(cents.length === 1){
    cents += "0"
  }
  for(var i = 0; i < dollars.length; i++){
    arr.push(dollars[i]);
    if((i + 1) % 3 === 0 && i !== dollars.length - 1){
      arr.push(',');
    }
  }
  dollars = arr.reverse().join('');
  return '$' + dollars + '.' + cents;
};


var months = {
  '01' : 'Jan',
  '02' : 'Feb',
  '03' : 'Mar',
  '04' : 'Apr',
  '05' : 'May',
  '06' : 'Jun',
  '07' : 'Jul',
  '08' : 'Aug',
  '09' : 'Sep',
  '10' : 'Oct',
  '11' : 'Nov',
  '12' : 'Dec'
}

var dateFormat = function(date){
  if(!date){
    return 0;
  }
  date = date.split('-');
  var year = date[0];
  var month = date[1];
  var day = date[2].substring(0,2);
  return day + ' ' + months[month] + ', ' + year;
};

var fourDeci = function(num){
  if(!num){
    return 0;
  }
  num = Math.round(num * 10000) / 10000;
  var str = num.toString().split('.');
  var wholeNum = str[0].split('').reverse().join('');
  var decimal = str[1];
  if(!decimal || decimal.length === 0){
    decimal = '00'
  }
  var arr = [];
  for(var i = 0; i < wholeNum.length; i++){
    arr.push(wholeNum[i]);
      if((i + 1) % 3 === 0 && i !== wholeNum.length - 1){
        arr.push(',');
      }
  }
  wholeNum = arr.reverse().join('');
  return wholeNum + '.' + decimal;
};


$(document).ready(function(){

  var invoice = data.responses[0].response.success.Invoice;
  var utility = data.responses[0].response.success.UtilityBills;
  var meters = data.responses[0].response.success.Meters;


  /*Account info variables*/
  //need to replace buildingDisplayName with "No tenant provided" also need to add data.accountName to the json
  //Some of the variables are shared with the summary portion
  var accountName = data.accountName || invoice.building.buildingDisplayName;
  var invoiceDate = dateFormat(invoice.dateGenerated) || 'Date not available';
  //need to add the 2nd address field to this variable
  var streetAddress = (invoice.building.addresss1 + invoice.building.addresss2)|| 'Address not available';
  var city = invoice.building.city || 'No city provided';
  var state = invoice.building.state || 'No state provided';
  var invoiceNumber = invoice.invoiceNumber || 'No invoice number available';

  //fill out account info
  $('#invoice-data').append('<table class="table"><tbody><tr><td>Account Name: </td><td>' + accountName + '</td><td>Invoice Date: </td><td>' + invoiceDate + '</td></tr><tr><td>Address: </td><td>' + streetAddress + '<br>' + city + ', ' + state + '</td><td>Invoice Number: </td><td>' + invoiceNumber + '</td></tr><tr><td>Contract Plan Type: </td><td>Flat Rate</td></tr></tbody></table>');
  //end account info

  //populate utility details
  for(var i = 0; i < utility.length; i++){
    var cur = utility[i];
    var utilityName = cur.utilityMeterName || 'No name provided';
    var utilityNumber = cur.utilityMeterNumber || 'No number provided';
    var utilityUsage = fourDeci(cur.utilityBillUsage).split('.')[0];
    var utilityCost = dollarFormat(cur.utilityBillCost);
    $('#utility-details').append('<table class="table table-noborder inner-utility"><thead><th>Meter: ' + (i + 1) + '</th></thead><tbody><tr><td>Meter Name:</td><td>' + utilityName + '</td></tr><tr><td>Meter Number:</td><td>' + utilityNumber + '</td></tr><tr><td>Usage:</td><td>' + utilityUsage + ' gal</td></tr><tr><td>Cost:</td><td>' + utilityCost + '</td></tr></tbody></table>');
  }
  //end utility details


  /*Current usage variables*/
  var meterCount = meters.length;
  var billingDays = invoice.billingDays || 'Number of days not provided';
  var billingPeriod = dateFormat(invoice.start).substring(2) || 'No date provided';
  var tenantUsage = fourDeci(invoice.tenantUsage).split('.')[0] || 'Information not provided';

  //populate current usage
  $('#current-usage').append('<table class="table usage-table"><thead><tr><th>Meter Count</th><th>Billing Days</th><th>Billing Period</th><th>Usage (gallons)</th></tr></thead><td class="text-center">' + meterCount + '</td><td class="text-center">' + billingDays + '</td><td>' + billingPeriod + '</td><td>' + tenantUsage + '</td></table>');
  //end current usage

  /*Current charges variables*/
  var startDate = dateFormat(invoice.start) || 'Date not provided';
  var endDate = dateFormat(invoice.end) || 'No date provided';
  var currentCharges = dollarFormat(invoice.invoiceTotal) || 'No current charges';//shared with summary

  //populate current charges
  $('#current-charges').append('<table class="table usage-table"><thead><tr><th>Current Charges</th><th>Start Date</th><th>End Date</th><th>Total</th></tr></thead><tbody><tr><td>Service Charge</td><td>' + startDate + '</td><td>' + endDate + '</td><td>' + currentCharges + '</td></tr><th>Total Current Charges</th><td></td><td></td><th>' + currentCharges + '</th></tr></tbody></table>');
  //end current charges

  /*Summary information variables*/
  var summaryUtil = '';
  for(var i = 0; i < utility.length; i++){
    if(i === utility.length - 1){
      summaryUtil += utility[i].utilityMeterNumber;
    }else{
      summaryUtil += utility[i].utilityMeterNumber + ', ';
    }
  }
  if(!summaryUtil){
    return "No utilities at this location";
  }

  //populate summary information
  $('#summary-information').append('<div class="row inner-summary"><div class="col-md-7"></div><div class="col-md-5"><table class="table table-noborder inner-summary"><thead><tr><th>Bill Summary:</th></tr></thead><tbody><tr><td>Account Name: </td><td>' + accountName + '</td></tr><tr><td>Invoice Number:</td><td>' + invoiceNumber + '</td></tr><tr></td><td>Utility Numbers:</td><td>' + summaryUtil + '</td></tr><tr><td>Current Charges:</td><td>' + currentCharges + '</td></tr><tr><td>Invoice created using:</td><td class="tenant-eye"> tenant <span class="red-font">eye</span></td></tr></tbody></table></div></div>');
  //end summary information


  //populate meter details
  if(!meterCount){
    $('#meter-details').hide();
  }else{
    var divs = 1;
    var metersPerPage = 4;
    for(var i = 0; i < meterCount; i++){
      var  cur = meters[i];
      var meterName = cur.meterName || 'Name not provided';
      var svcUsage = fourDeci(cur.usage).split('.')[0];
      var svcAmt = dollarFormat(cur.invoiceTotal) || 'No current charges';
      var description = cur.meterDescription || 'No description provided';
      var meterStart = dateFormat(cur.startTime);
      var meterEnd = dateFormat(cur.endTime);
      var startValue = fourDeci(cur.startValue) ? fourDeci(cur.startValue).split('.')[0] + ' gallons' : 'No starting value provided';
      var endValue = fourDeci(cur.endValue) ? fourDeci(cur.endValue).split('.')[0] + ' gallons' : 'No ending value provided';
      var total = cur.invoiceTotal;
      if(total){
        total = dollarFormat(total);
      }else{
        total = '$0.00';
      }

      if(i === 0){
        $('#meter-details').append('<div class="repeater img-rounded pagebreak"><div class="sub-heading gray-head special">Meter Details</div>');
      }

        $('#meter-details > div:nth-child(' + divs + ')').append('<div class="inner-meter"><table class="table table-noborder"><thead><th>Meter ' + (i + 1) + ' :</th></thead><tbody><tr><td class="col-one">Meter Name:</td><td class="col-two">' + meterName + '</td><td class="col-three">Service Charge:<br>' + svcUsage + ' gallons</td><th class="col-four">' + svcAmt + '</th></tr><tr><td>Description:</td><td class="long-name">' + description + '</td><td></td></tr><tr><td>Start:</td><td>' + meterStart + '<br>' + startValue + ' </td><td></td><th></th></tr><tr><td>End:</td><td>' + meterEnd + '<br>' + endValue + ' </td><th><br>Total:</th><th><br>' + total + '</th></tr></tbody></table></div>');

      if((i + 1 ) % metersPerPage === 0 || i === meterCount - 1){
        var lastDiv = metersPerPage + 1;

        if(i === meterCount - 1 && (i + 1) % metersPerPage !== 0){
          lastDiv = ((i + 1) % metersPerPage) + 1;
        }

        $('#meter-details > div:nth-child(' + divs + ') > div:nth-child(' + lastDiv + ')').addClass('last-row');
        $('#meter-details').append('</div>');

        if((i + 1) % metersPerPage === 0 && i !== meterCount - 1){
          $('#meter-details').append('<div class="repeater img-rounded pagebreak"><div class="sub-heading gray-head special">Meter Details</div>');
        }

        divs++;
      }//end if

    }
  }
  //end meter details
});

