// add to Heroku Scheduler
// node cache_doge -- daily

var request = require('request')
 , mongoose = require('mongoose');

var uristring = process.env.MONGOLAB_URI;

var priceSchema = new mongoose.Schema({
  price: Number,
  time: Number
});
var priceModel = mongoose.model('PriceData', priceSchema);

var requestOptions = {
  'uri': 'https://www.coins-e.com/api/v2/market/DOGE_BTC/trades/'
};
request(requestOptions, function (err, response, b) {
  var prices = JSON.parse( b );
  var latestPrice = prices.trades[0].rate * 1.0;
  var dt = prices.trades[0].created * 1000;
  mongoose.connect(uristring, function (err, res) {
    var reportPrice = new priceModel({
      price: latestPrice,
      time: dt
    }).save();
  });
});