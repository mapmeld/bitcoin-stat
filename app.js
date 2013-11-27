var express = require('express');
var request = require('request');

var app = express();

app.get('/', function(req, res) {
    res.sendfile(__dirname + '/index.html');
});

app.get('/coin', function(req, res) {
  var requestOptions = {
    'uri': 'http://www.quandl.com/api/v1/datasets/BITCOIN/MTGOXUSD.json?&trim_start=2013-10-14'
  };
  request(requestOptions, function (err, response, b) {
    res.json( JSON.parse( b ) );
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

var port = process.env.PORT || 3000;
app.configure(function() {
    app.use(express.compress());
    app.use('/static', express.static(__dirname + '/static'));
}).listen(port);