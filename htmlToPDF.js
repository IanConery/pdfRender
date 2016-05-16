//This file contains phantomjs code and needs to run as such see the documentation at http://phantomjs.org/
//<--- USAGE ---> phantomjs htmlToPDF.js [url or file path] [destination file .pdf] [invoice number] [account name]

var page = require('webpage').create();
var system = require('system');
var invoiceNumber = system.args[3] || 'Invoice Number Not Available';
var buildingName = system.args[4] || 'Account Name Not Available';

//generate the page once it has finished loading
page.onLoadFinished = function(){
    page.render(system.args[2]);
    phantom.exit();
};

// change the paper size to A3 or Tabloid as Letter doesn't work or only works sometimes, add small margins otherwise the content is cut off
page.open(system.args[1], function (status) {
  if(status === 'success'){
    page.paperSize = {
      format: 'A3',
      orientation: 'portrait',
      margin: {left:'0.5cm', right:'0.5cm', top:'1.5cm', bottom:'1.0cm'},
      // add a footer callback showing page number, invoice number and account name
      footer: {
        height: '0.9cm',
        contents: phantom.callback(function(pageNum, numPages) {
            return "<div><div style='text-align:left; float:left; width:33%'><small>Invoice Number: " + invoiceNumber + "</small></div><div style='text-align:left; float:left; width:33%;'><small>Account Name: " + buildingName + "</small></div><div style='text-align:right; float:left; width:33%'><small>" + pageNum + "</small></div></div>";
          })
      }
    };

  }else{
    //otherwise exit to terminal with error code 1
    phantom.exit(1);
  }
});


