var dollarFormat = function(num){
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
  return dollars + '.' + cents;
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
  date = date.split('-');
  var year = date[0];
  var month = date[1];
  var day = date[2].substring(0,2);
  return day + ' ' + months[month] + ', ' + year;
};

var fourDeci = function(num){
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

  var summaryUtil = '';
  for(var i = 0; i < utility.length; i++){
    if(i === utility.length - 1){
      summaryUtil += utility[i].utilityMeterNumber;
    }else{
      summaryUtil += utility[i].utilityMeterNumber + ', ';
    }
  }

  var meterCount = meters.length;

  //fill out account info
  $('#invoice-data').append('<table class="table"><tbody><tr><td>Account Name: </td><td>' + invoice.building.buildingDisplayName + '</td><td>Invoice Date: </td><td>' + dateFormat(invoice.dateGenerated) + '</td></tr><tr><td>Address: </td><td>' + invoice.building.addresss1 + '<br>' + invoice.building.city + ', ' + invoice.building.state + '</td><td>Invoice Number: </td><td>' + invoice.invoiceNumber + '</td></tr><tr><td>Contract Plan Type: </td><td>Flat Rate</td></tr></tbody></table>');
  //end account info

  //populate utility details
  for(var i = 0; i < utility.length; i++){
    var cur = utility[i]
    $('#utility-details').append('<table class="table table-noborder inner-utility"><thead><th>Meter: ' + (i + 1) + '</th></thead><tbody><tr><td>Meter Name:</td><td>' + cur.utilityMeterName + '</td></tr><tr><td>Meter Number:</td><td>' + cur.utilityMeterNumber + '</td></tr><tr><td>Usage:</td><td>' + fourDeci(cur.utilityBillUsage) + ' kWh</td></tr><tr><td>Peak Demand:</td><td>' + fourDeci(cur.utilityBillDemandKw) + ' kWh</td></tr></tbody></table>');
  }
  //end utility details

  //populate current usage
  $('#current-usage').append('<table class="table usage-table"><thead><tr><th>Meter Count</th><th>Billing Days</th><th>Billing Period</th><th>Usage (kWh)</th><th>Peak Demand (kW)</th></tr></thead><td class="text-center">' + meters.length + '</td><td class="text-center">' + invoice.billingDays + '</td><td>' + dateFormat(invoice.end) + '</td><td>' + fourDeci(invoice.tenantEnergyUsage) + '</td><td>' + fourDeci(invoice.tenantPeakKw) + '</td></table>');
  //end current usage

  //populate current charges
  $('#current-charges').append('<table class="table usage-table"><thead><tr><th>Current Charges</th><th>Start Date</th><th>End Date</th><th>Total</th></tr></thead><tbody><tr><td>Service Charge</td><td>' + dateFormat(invoice.start) + '</td><td>' + dateFormat(invoice.end) + '</td><td>$' + dollarFormat(invoice.serviceCharge) + '</td></tr><tr><td>Demand Charge</td><td></td><td></td><td>$' + dollarFormat(invoice.demandCharge) + '</td></tr><tr><td>Generation Charge</td><td></td><td></td><td>$' + dollarFormat(invoice.generationCharge) + '</td></tr><tr><th>Total Current Charges</th><td></td><td></td><th>$' + dollarFormat(invoice.invoiceTotal) + '</th></tr></tbody></table>');
  //end current charges

  //populate summary information
  $('#summary-information').append('<div class="row inner-summary"><div class="col-md-7"></div><div class="col-md-5"><table class="table table-noborder inner-summary"><thead><tr><th>Bill Summary:</th></tr></thead><tbody><tr><td>Account Name: </td><td>' + invoice.building.buildingDisplayName + '</td></tr><tr><td>Invoice Number:</td><td>' + invoice.invoiceNumber + '</td></tr><tr></td><td>Utility Numbers:</td><td>' + summaryUtil + '</td></tr><tr><td>Current Charges:</td><td>$' + dollarFormat(invoice.invoiceTotal) + '</td></tr><tr><td>Invoice created using:</td><td class="tenant-eye"> tenant <span class="red-font">eye</span></td></tr></tbody></table></div></div>');
  //end summary information

  //populate meter details
  var divs = 1;
  var metersPerPage = 3;
  for(var i = 0; i < meterCount; i++){
    var  cur = meters[i];
    var total = cur.serviceCharge + cur.demandCharge + cur.generationCharge;

    if(i === 0){
      $('#meter-details').append('<div class="repeater img-rounded pagebreak"><div class="sub-heading gray-head special">Meter Details</div>');
    }

      $('#meter-details > div:nth-child(' + divs + ')').append('<div class="inner-meter"><table class="table table-noborder"><thead><th>Meter ' + (i + 1) + ' :</th></thead><tbody><tr><td class="col-one">Meter Name:</td><td class="col-two">' + cur.meterName + '</td><td class="col-three">Service Charge (' + cur.svcProvider + '):<br>' + fourDeci(cur.usage) + ' kWh @ $' + fourDeci(cur.serviceRate) + '</td><th class="col-four">$' + dollarFormat(cur.serviceCharge) + '</th></tr><tr><td>Description:</td><td class="long-name">' + cur.meterDescription + '</td><td></td></tr><tr><td>Peak Demand:</td><td>' + cur.peakDemand + 'kW</td><td>Demand Charge (' + cur.svcProvider + '):<br>' + fourDeci(cur.peakDemand) + ' kW @ $' + fourDeci(cur.demandRate) + '</td><th>$' + dollarFormat(cur.demandCharge) + '</th></tr><tr><td>Peak Time:</td><td>' + cur.peakTime + '</td></tr><tr><td>Start:</td><td>' + dateFormat(cur.startTime) + '<br>' + fourDeci(cur.startValue) + ' kWh</td><td>Generation Charge (' + cur.genProvider + '):<br>' + fourDeci(cur.usage) + ' kWh @ $' + fourDeci(cur.generationRate) + '</td><th>$' + dollarFormat(cur.generationCharge) + '</th></tr><tr><td>End:</td><td>' + dateFormat(cur.endTime) + '<br>' + fourDeci(cur.endValue) + ' kWh</td><th><br>Total:</th><th><br>$' + dollarFormat(total) + '</th></tr></tbody></table></div>');

    if((i + 1 ) % metersPerPage === 0 || i === meterCount - 1){
      var lastDiv = metersPerPage + 1;

      if(i === meterCount - 1){
        lastDiv = ((i + 1) % metersPerPage) + 1;
      }

      $('#meter-details > div:nth-child(' + divs + ') > div:nth-child(' + lastDiv + ')').addClass('last-row');
      $('#meter-details').append('</div>');

      if((i + 1) % metersPerPage === 0){
        $('#meter-details').append('<div class="repeater img-rounded pagebreak"><div class="sub-heading gray-head special">Meter Details</div>');
      }

      divs++;
    }//end if

  }
  //end meter details
});

