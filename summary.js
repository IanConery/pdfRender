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
  var summaryData = data.responses;


  /*Account info variables*/
  //need to replace buildingDisplayName with "No tenant provided" also need to add data.accountName to the json
  //Some of the variables are shared with the summary portion
  var accountName = data.accountName || invoice.building.buildingDisplayName;
  //need to add the 2nd address field to this variable and check for a null val
  var streetAddress = (invoice.building.addresss1 + invoice.building.addresss2)|| 'Address not available';
  var city = invoice.building.city || 'No city provided';
  var state = invoice.building.state || 'No state provided';

  //fill out account info
  $('#invoice-data').append('<div class="col-md-4"><table class="table"><tbody><tr><td>Account Name: </td><td>' + accountName + '</td></tr><tr><td>Address: </td><td>' + streetAddress + '<br>' + city + ', ' + state + '</td></tr></tbody></table></div>');
  //end account info


  /*Tenant summary variables*/
  var summaryCount = summaryData.length;

  //populate tenant summary
  $('#tenant-summary').append('<table class="table usage-table"><thead><tr><th>Building Name</th><th>Tenant Name</th><th>Invoice Number</th><th>Start Date</th><th>End Date</th><th>Billing Days</th><th>kWh</th><th>Estimated</th><th>Amount</th></tr></thead>');

  for(var i = 0; i < summaryCount; i++){
    var current = summaryData[i].response.success;
    $('#tenant-summary > table').append('<tr><td>' + current.Invoice.building.buildingDisplayName + '</td><td>Tenant Name Fix Me</td><td>' + current.Invoice.invoiceNumber + '</td><td>' + current.Invoice.start + '</td><td>' + current.Invoice.end + '</td><td>' + current.Invoice.billingDays + '</td><td>' + current.Invoice.tenantEnergyUsage + '</td><td>Estimated Fix Me</td><td>' + current.Invoice.invoiceTotal + '</td></tr>')
  }
  $('#tenant-summary').append('</table>');
  //end tenant summary

















  /*Current charges variables*/
  var startDate = dateFormat(invoice.start) || 'Date not provided';
  var endDate = dateFormat(invoice.end) || 'No date provided';
  var serviceCharge = dollarFormat(invoice.serviceCharge) || 'No current charges';
  var demandCharge = dollarFormat(invoice.demandCharge) || 'No current charges';
  var generationCharge = dollarFormat(invoice.generationCharge) || 'No current charges';
  var currentCharges = dollarFormat(invoice.invoiceTotal) || 'No current charges';//shared with summary

  //populate current charges
  $('#current-charges').append('<table class="table usage-table"><thead><tr><th>Current Charges</th><th>Start Date</th><th>End Date</th><th>Total</th></tr></thead><tbody><tr><td>Service Charge</td><td>' + startDate + '</td><td>' + endDate + '</td><td>' + serviceCharge + '</td></tr><tr><td>Demand Charge</td><td></td><td></td><td>' + demandCharge + '</td></tr><tr><td>Generation Charge</td><td></td><td></td><td>' + generationCharge + '</td></tr><tr><th>Total Current Charges</th><td></td><td></td><th>' + currentCharges + '</th></tr></tbody></table>');
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
    var metersPerPage = 3;
    for(var i = 0; i < meterCount; i++){
      var  cur = meters[i];
      var meterName = cur.meterName || 'Name not provided';
      var svcProvider = cur.svcProvider || 'Not provided';
      var svcCharge = fourDeci(cur.usage);
      var svcRate = fourDeci(cur.serviceRate) ? ('$' + fourDeci(cur.serviceRate)) : 'Rate not available';
      var svcAmt = dollarFormat(cur.serviceCharge) || 'No current charges';
      var description = cur.meterDescription || 'No description provided';
      var peakDemand = cur.peakDemand ? cur.peakDemand + ' kW' : 'Unavailable';
      var demandRate = fourDeci(cur.demandRate) ? ('$' + fourDeci(cur.demandRate)) : 'Rate not available';
      var demandCharge = dollarFormat(cur.demandCharge) || 'No current charges';
      var peakTime = cur.peakTime || 'No date provided';
      var meterStart = dateFormat(cur.startTime);
      var meterEnd = dateFormat(cur.endTime);
      var startValue = fourDeci(cur.startValue) ? fourDeci(cur.startValue) + ' kWh' : 'No starting value provided';
      var endValue = fourDeci(cur.endValue) ? fourDeci(cur.endValue) + ' kWh' : 'No ending value provided';
      var genProvider = cur.genProvider || 'Not provided';
      var genRate = fourDeci(cur.generationRate) ? ('$' + fourDeci(cur.generationRate)) : 'Rate not available';
      var genCharge = dollarFormat(cur.generationCharge) || 'No current charges';
      var total = cur.serviceCharge + cur.demandCharge + cur.generationCharge;
      if(total){
        total = dollarFormat(total);
      }else{
        total = '$0.00';
      }

      if(i === 0){
        $('#meter-details').append('<div class="repeater img-rounded pagebreak"><div class="sub-heading gray-head special">Meter Details</div>');
      }

        $('#meter-details > div:nth-child(' + divs + ')').append('<div class="inner-meter"><table class="table table-noborder"><thead><th>Meter ' + (i + 1) + ' :</th></thead><tbody><tr><td class="col-one">Meter Name:</td><td class="col-two">' + meterName + '</td><td class="col-three">Service Charge (' + svcProvider + '):<br>' + svcCharge + ' kWh @ ' + svcRate + '</td><th class="col-four">' + svcAmt + '</th></tr><tr><td>Description:</td><td class="long-name">' + description + '</td><td></td></tr><tr><td>Peak Demand:</td><td>' + peakDemand + '</td><td>Demand Charge (' + svcProvider + '):<br>' + fourDeci(cur.peakDemand) + ' kW @ ' + demandRate + '</td><th>' + demandCharge + '</th></tr><tr><td>Peak Time:</td><td>' + peakTime + '</td></tr><tr><td>Start:</td><td>' + meterStart + '<br>' + startValue + ' </td><td>Generation Charge (' + genProvider + '):<br>' + svcCharge + ' kWh @ ' + genRate + '</td><th>' + genCharge + '</th></tr><tr><td>End:</td><td>' + meterEnd + '<br>' + endValue + ' </td><th><br>Total:</th><th><br>' + total + '</th></tr></tbody></table></div>');

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

