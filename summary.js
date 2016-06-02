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

var percisionRound = function(num, points){
  var result = 0;
  //num has the potential to be a falsey value in which case we return 0
  if(!num){
    return result;
  }
  //this makes the points argument optional, Leaving it off rounds to 0 decimal places
  points = points || 0;
  var precision = '1';
  for(var i = 0; i < points; i++){
    precision += '0';
  }
  //convert precision string to number
  precision = parseInt(precision,10);
  //this moves the decimal place so the number can be rounded correctly and then moves it back
  num = Math.round(num * precision) / precision;
  var str = num.toString().split('.');
  var wholeNum = str[0].split('').reverse().join('');
  var decimal = str[1];
  //the following sanity check shouldn't be neccessary, however I am leaving it because, shit happens
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
  points === 0 ? result = wholeNum : result = wholeNum + '.' + decimal;
  return result;
};


$(document).ready(function(){

  var invoice = data.responses[0].response.success.Invoice;
  var summaryData = data.responses;

  var currentTotalAll = 0;
  var serviceChargeAll = 0;
  var demandChargeAll = 0;
  var generationChargeAll = 0;
  var oldestStartDate = [];
  var newestEndDate = [];

  /*Account info variables*/
  var accountName = invoice.building.buildingDisplayName || 'Building name not available';
  var streetAddress = (invoice.building.addresss1 + invoice.building.addresss2)|| 'Address not available';
  var city = invoice.building.city || 'No city provided';
  var state = invoice.building.state || 'No state provided';

  //fill out account info
  $('#invoice-data').append('<div class="col-md-4"><table class="table"><tbody><tr><td>Account Name: </td><td>' + accountName + '</td></tr><tr><td>Address: </td><td>' + streetAddress + '<br>' + city + ', ' + state + '</td></tr></tbody></table></div>');
  //end account info


  /*Tenant summary variables*/
  var summaryCount = summaryData.length;

  //populate tenant summary
  $('#tenant-summary').append('<table class="table usage-table"><thead><tr><th class="text-center">Building Name</th><th class="text-center">Tenant Name</th><th class="text-center">Invoice Number</th><th class="text-center">Start Date</th><th class="text-center">End Date</th><th class="text-center">Billing Days</th><th class="text-center">kWh</th><th class="text-center">Estimated</th><th class="text-center">Amount</th></tr></thead>');

  for(var i = 0; i < summaryCount; i++){
    var current = summaryData[i].response.success;
    var name = current.Invoice.building.buildingDisplayName;
    var invoiceNumber = current.Invoice.invoiceNumber;
    var start = dateFormat(current.Invoice.start);
    var end = dateFormat(current.Invoice.end);
    var billingDays = current.Invoice.billingDays;
    var usage = percisionRound(current.Invoice.tenantEnergyUsage,2);
    var total = dollarFormat(current.Invoice.invoiceTotal);
    var startDateArray = current.Invoice.start.split('-');
    var endDateArray = current.Invoice.end.split('-');

    //while looping accumulate all needed data for the page
    currentTotalAll += current.Invoice.invoiceTotal;
    serviceChargeAll += current.Invoice.serviceCharge;
    demandChargeAll += current.Invoice.demandCharge;
    generationChargeAll += current.Invoice.generationCharge;

    //calculate the date range
    //the date is supplied as a string in 'year-month-day' format
    if(oldestStartDate.length === 0){
      oldestStartDate = startDateArray;
    }else{
      if(parseInt(oldestStartDate[0],10) > parseInt(startDateArray[0],10)){
        oldestStartDate = startDateArray;
      }else if(parseInt(oldestStartDate[0],10) === parseInt(startDateArray[0],10)){
        if(parseInt(oldestStartDate[1],10) > parseInt(startDateArray[1],10)){
          oldestStartDate = startDateArray;
        }
      }
    }

    if(newestEndDate.length === 0){
      newestEndDate = endDateArray;
    }else{
      if(parseInt(newestEndDate[0],10) < parseInt(endDateArray[0],10)){
        newestEndDate = endDateArray;
      }else if(parseInt(newestEndDate[0],10) === parseInt(endDateArray[0],10)){
        if(parseInt(newestEndDate[1],10) < parseInt(endDateArray[1],10)){
          newestEndDate = endDateArray;
        }
      }
    }

    $('#tenant-summary > table').append('<tr><td class="text-center">' + name + '</td><td class="text-center">Tenant Name Fix Me</td><td class="text-center">' + invoiceNumber + '</td><td class="text-center">' + start + '</td><td class="text-center">' + end + '</td><td class="text-center">' + billingDays + '</td><td class="text-right">' + usage + '</td><td class="text-center">Estimated Fix Me</td><td class="text-right">' + total + '</td></tr>');

  }

  currentTotalAll = dollarFormat(currentTotalAll);

  $('#tenant-summary > table').append('<tfoot><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><th class="text-center">Total</th><td class="text-right">' + currentTotalAll + '</td></tr></tfoot></table>');
  //end tenant summary


  /*Current charges variables*/
  var startDate = dateFormat(oldestStartDate.join('-'));
  var endDate = dateFormat(newestEndDate.join('-'));
  serviceChargeAll = dollarFormat(serviceChargeAll);
  demandChargeAll = dollarFormat(demandChargeAll);
  generationChargeAll = dollarFormat(generationChargeAll);

  //populate current charges
  $('#current-charges').append('<table class="table usage-table"><thead><tr><th>Current Charges</th><th class="text-center">Start Date</th><th class="text-center">End Date</th><th class="text-right">Total</th></tr></thead><tbody><tr><td>Service Charge</td><td class="text-center">' + startDate + '</td><td class="text-center">' + endDate + '</td><td class="text-right">' + serviceChargeAll + '</td></tr><tr><td>Demand Charge</td><td></td><td></td><td class="text-right">' + demandChargeAll + '</td></tr><tr><td>Generation Charge</td><td></td><td></td><td class="text-right">' + generationChargeAll + '</td></tr><tr><th>Total Current Charges</th><td></td><td></td><th class="text-right">' + currentTotalAll + '</th></tr></tbody></table>');
  //end current charges

});

