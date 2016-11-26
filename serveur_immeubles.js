var express = require('express');
var app = express();
var server = require('http').Server(app);
var request = require('request');
var fs = require('fs');
// Documentation : https://github.com/moshen/node-googlemaps
var GoogleMapsAPI = require('googlemaps');

//var port = process.env.PORT || 8888;
var port = 8888;

server.listen(port);

// Dossier public
app.use(express.static(__dirname + '/public'));

// Config Google Maps
var publicConfig = {
    key: 'AIzaSyBCDTcN2i-5_Vkk4B8MKVjYws-6trwKQWE',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true // use https
    //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};
var gmAPI = new GoogleMapsAPI(publicConfig);

var params = {
    center: 'Chapelle Saint-Avit Aix-en-Othe', // L'adresse devra être récupérée dynamiquement grâce au XQuery/SPARQL
    zoom: 15,
    size: '500x400',
    maptype: 'roadmap'
};

gmAPI.staticMap(params); // return static map URL
gmAPI.staticMap(params, function(err, binaryImage) {
    // fetch asynchronously the binary image

    // On enregistre la nouvelle image générée avec Google Maps
    fs.writeFileSync('./public/test_map.png', binaryImage, 'binary');
});

// Route initiale
app.get('/', function(req, res) {
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/consultation_immeubles2.xqy', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //res.send(body);
            res.writeHead(200, {'Content-Type': 'text/html'});
            buildHtml(res, body);
        }
    })
});

function buildHtml(res, content) {

    // Avec lecture de l'image générée par Google Maps
    fs.readFile('./public/test_map.png', function(err, data) {
        if (err) {
            throw err; // Fail if the file can't be read.
        }

        //data.toString()
        res.write('<!DOCTYPE html>'+
            '<html>'+
            '    <head>'+
            '        <meta charset="utf-8" />'+
            '        <title>Test</title>'+
            '    </head>'+
            '    <body>'+
            content +
            '    <br/>' +
            '    <img src="data:image/png;base64,' + new Buffer(data).toString('base64') + '" />'+
            '    </body>'+
            '</html>');
        res.end();
    });

}