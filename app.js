var express = require('express');
var request = require('request');
var mongoose = require('mongoose');
var csv = require('csv-stream');

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
      var tstamp = data.datetime.split("-");
      tstamp = tstamp[0] * 100 + tstamp[1] * 1;
      
      if( tstamp < 201310 ){
        // before I entered the market - not interested
        return;
      }
      prices.data.push([ data.datetime.split(" ")[0], data.average * 1.0 ]);
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
    if(err){
      return res.json([ ]);
    }
    var prices;
    try{
      prices = JSON.parse( b );
    }
    catch(e){
      return res.json([ ]);
    }
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