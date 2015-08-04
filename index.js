var config 		= require('config');
var amazon 		= require('amazon-product-api');
var express 	= require('express');
var mysql      	= require('mysql');
var connection 	= mysql.createConnection(config.get('mysql'));
var app 		= express();
var amazon_api	= amazon.createClient(config.get('amazon'));

connection.connect();

app.use(express.static(__dirname + '/public'));
app.get('/books', function(req, res){
	var results = [];
	var limit = parseInt(req.query.limit) || 20;
	var page = parseInt(req.query.page) || 1;
	var offset = (page - 1) * limit;
	connection
		.query('SELECT * from books limit ?, ?', [offset, limit])
		.on('result', function(row, index) {
			results.push(row);
		})
		.on('end', function() {
			res.send(results);
		});
});

app.get('/book/:id', function(req, res){
	var id = req.params.id;
	connection
		.query('SELECT * from books where id = ?', [id])
		.on('result', function(row, index) {
			res.send(row);
		});
});

app.get('/amazon/asin/:asin', function(req, res){
	var ASIN = req.params.asin;
	amazon_api.itemLookup({
	  idType: 'ASIN',
	  itemId: ASIN,
	  responseGroup: 'ItemAttributes,Offers,Images'
	}, function(err, results) {
	  if (err) {
	    console.log(err);
	  } else {
	    res.send(results);
	  }
	});
});
app.get('/amazon/isbn/:isbn', function(req, res){
	var ISBN = req.params.isbn;
	amazon_api.itemLookup({
	  idType: 'ISBN',
	  itemId: ISBN,
	  responseGroup: 'ItemAttributes,Offers,Images'
	}, function(err, results) {
	  if (err) {
	    console.log(err);
	  } else {
	    res.send(results);
	  }
	});
});

app.listen(config.get('port'), function(){
	console.log('listening on port '+config.get('port'));
});
