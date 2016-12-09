/** MODULES **/

var express = require('express');
var app = express();
var server = require('http').Server(app);
var request = require('request');
var fs = require('fs');
// Documentation : https://github.com/tmpvar/jsdom
var jsdom = require("jsdom");

/** ------- **/

// Dossier public
app.use(express.static(__dirname + '/public'));

//var port = process.env.PORT || 8888;
var port = 8888;

server.listen(port);

// Route initiale
app.get('/', function(req, res) {
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/consultation_immeubles3.xqy', function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        // Exemple de récupération
                        // var ref = window.$("h1 span:nth-child(1)").text();

                        // On ajoute un élément pour la map pour chaque fiche
                        window.$(".fiche").append('<div class="map"></div>');

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_immeubles.css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAg0Sg5Iahr2Ztad0aO88yaMJ6AGqN7FC0"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>Consultation</title>' +
                            '    </head>' +
                            '    <body onload="initialisation()">' +
                            window.$(".fiche").parent().html() +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )
});

app.get('/regions', function(req, res) {
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/liste_regions.xqy', function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        var regions = [];
                        window.$(".region").each( function(){

                            var regionCourante = window.$(this).text();

                            // Couper si ";" (cas RHÔNE-ALPES-;-BOURGOGNE)
                            var regionDecomposee = regionCourante.split(";");
                            if (regionDecomposee) {
                                for (var i=0 ; i<regionDecomposee.length ; i++) {
                                    regions.push(traiterTexte(regionDecomposee[i].trim()));
                                    // On retire bien les potentiels espaces au début ou à la fin
                                }
                            }
                            else {
                                regions.push(traiterTexte(regionCourante));
                            }

                        } );

                        // On supprime les doublons
                        regions = regions.filter(function(item, pos) {
                            return regions.indexOf(item) == pos;
                        });

                        // Création du formulaire
                        var formulaireSelectionRegion = '<select name="regions" form="regionsform">';
                        for (var i=0 ; i<regions.length ; i++) {
                            formulaireSelectionRegion += '<option value="' + regions[i] + '">' + regions[i] + '</option>';
                        }
                        formulaireSelectionRegion += '</select>';
                        console.log(formulaireSelectionRegion);

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>Consultation</title>' +
                            '    </head>' +
                            '    <body>' +
                                     formulaireSelectionRegion +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )
});

function traiterTexte(texte) {

    // On remplace les espaces par des tirets
    texte = texte.replace(/\s+/g, "-");
    // ... en traitant le cas où des tirets se suivent à cause d'espaces mal placés initialement
    texte =  texte.replace(/-+/g, "-");
    // On met tout en majuscule
    texte = texte.toUpperCase();

    return texte;

}