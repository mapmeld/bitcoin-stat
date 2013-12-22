var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var csv = require('fast-csv');

var uristring = process.env.MONGOLAB_URI;
var priceSchema = new mongoose.Schema({
  price: Number,
  time: Number
});
var priceModel = mongoose.model('PriceData', priceSchema);
try{
  mongoose.connect(uristring);
}
catch(e){}

var app = express();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/coin', function(req, res) {
  var requestOptions = {
    'uri': 'https://api.bitcoinaverage.com/history/USD/per_day_all_time_history.csv'
  };
  var csvStream = csv.createStream();
  var prices = {
    data: [ ]
  };
  request(requestOptions).pipe(csvStream)
    .on('data',function(data){
      if( data.datetime.indexOf("2013-09") > -1 || data.datetime.indexOf("2013-10-0") > -1 ){
        // before I entered the market - not interested
        return;
      }
      prices.data.push([ data.datetime.split(" ")[0], data.average ]);
    })
    .on('end',function(){
      res.json( prices );
    });
});

app.get('/current', function(req, res) {
  var requestOptions = {
    'uri': 'https://coinbase.com/api/v1/prices/spot_rate'
  };
  request(requestOptions, function (err, response, b) {
    res.json( JSON.parse( b ) );
  });
});

app.get('/doge', function(req, res) {
  var requestOptions = {
    'uri': 'https://www.coins-e.com/api/v2/market/DOGE_BTC/trades/'
  };
  request(requestOptions, function (err, response, b) {
    var prices = JSON.parse( b );
    var latestPrice = prices.trades[0].rate * 1.0;
    var dt = prices.trades[0].created * 1000;
    priceModel.find({}).sort('-date').exec(function(err, results) {
      results.push({ price: latestPrice, time: dt });
      res.json( results );
    });
  });
});

var port = process.env.PORT || 3000;
app.configure(function() {
    app.use(express.compress());
    app.use('/static', express.static(__dirname + '/static'));
}).listen(port);