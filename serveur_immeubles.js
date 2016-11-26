/** MODULES **/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var request = require('request');
var fs = require('fs');
// Documentation : https://github.com/moshen/node-googlemaps
var GoogleMapsAPI = require('googlemaps');
// Documentation : https://github.com/tmpvar/jsdom
var jsdom = require("jsdom");

/** ------- **/

var publicConfig = {
    key: 'AIzaSyBCDTcN2i-5_Vkk4B8MKVjYws-6trwKQWE',
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true // use https
    //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};
var gmAPI = new GoogleMapsAPI(publicConfig);

// Dossier public
app.use(express.static(__dirname + '/public'));

//var port = process.env.PORT || 8888;
var port = 8888;

server.listen(port);

// Route initiale
app.get('/', function(req, res) {
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/consultation_immeubles3.xqy', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //res.send(body);
            console.log(body);

            jsdom.env(
                body,
                ["http://code.jquery.com/jquery.js"],
                function (err, window) {

                    var ref =  window.$("h1 span:nth-child(1)").text();
                    console.log(ref);

                    // TODO : pas précis, lieux manquants, à alimenter autrement (voir SPARQL ?)
                    var adresse = window.$("h1 span:nth-child(2)").text() + " " + window.$("h1 span:nth-child(3)").text();
                    console.log("Google maps : " + adresse);

                    var params = {
                        center: adresse,
                        zoom: 15,
                        size: '500x400',
                        maptype: 'roadmap',
                        markers: [
                            {
                                location: adresse,
                                label   : 'HERE',
                                color   : 'green',
                                shadow  : true
                                //icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=cafe%7C996600'
                            }
                        ]
                    };

                    gmAPI.staticMap(params); // return static map URL
                    gmAPI.staticMap(params, function(err, binaryImage) {
                        // fetch asynchronously the binary image

                        // On enregistre la nouvelle image générée avec Google Maps
                        fs.writeFileSync('./public/img/img-' + ref + '.png', binaryImage, 'binary');
                        console.log("Nouvelle image enregistrée");

                        // Une fois que la nouvelle image est enregistrée, on affiche au client
                        buildHtml(res, body, ref);

                    });

                }
            );
        }
    })
});

function buildHtml(res, content, ref) {

    // On charge le css
    fs.readFile('./public/css/style_immeubles.css', function(err, data) {
        if (err) {
            throw err; // Fail if the file can't be read.
        }

        var css = data.toString();
        console.log("CSS chargé : " + css);

        // Avec lecture de l'image générée par Google Maps
        fs.readFile('./public/img/img-' + ref + '.png', function(err, data) {
            if (err) {
                throw err; // Fail if the file can't be read.
            }

            var dataImg = new Buffer(data).toString('base64');
            content = content.replace('img-' + ref, dataImg);
            console.log(content);

            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<!DOCTYPE html>'+
                '<html>'+
                '    <head>'+
                '        <style>' + css + '</style' +
                '        <meta charset="utf-8" />'+
                '        <title>Consultation</title>'+
                '    </head>'+
                '    <body>'+
                content +
                '    </body>'+
                '</html>');
        });

    });

}