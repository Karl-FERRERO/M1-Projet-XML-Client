var express = require('express');
var app = express();
var server = require('http').Server(app);
var request = require('request');

//var port = process.env.PORT || 8888;
var port = 8888;

server.listen(port);

//app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/consultation_immeubles.xqy', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        }
    })
});