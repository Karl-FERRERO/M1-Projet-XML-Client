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

var nav = '<nav class="navbar navbar-inverse">' +
    '<div class="container-fluid">' +
    '<div class="navbar-header"> ' +
    '<a class="navbar-brand" href="/">Projet XML - Monuments</a> ' +
    '</div> ' +
    '<ul class="nav navbar-nav"> ' +
    '<li><a href="/regions">Consultation par régions</a></li> ' +
    '</ul> ' +
    '<form class="navbar-form navbar-left"> ' +
    '<div class="form-group"> ' +
    '<input type="text" class="form-control" placeholder="TODO search"> ' +
    '</div> ' +
    '<img src="/img/search.png" height="25" width="25"> ' +
    '</form> ' +
    '</div> ' +
    '</nav>';
// <li class="active"><a href="#">Consultation par régions</a></li>

// Route initiale
app.get('/', function(req, res) {

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<!DOCTYPE html>' +
        '<html>' +
        '    <head>' +
        '      <link rel="stylesheet" type="text/css" href="/css/style_immeubles.css">' +
        '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
        '      <script type="text/javascript" src="/js/app.js"></script>' +
        '      <meta charset="utf-8" />' +
        '      <title>Accueil</title>' +
        '    </head>' +
        '    <body onload="initialiserFormRegions()">' +
        nav +
        '<div class="container">' +
        'Bienvenue' +
        '</div>' +
        '    </body>' +
        '</html>');
    res.end();

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
                        var formulaireSelectionRegion = '<form id="formregions"><div class="form-group"><select class="form-control" name="regions">';
                        for (var i=0 ; i<regions.length ; i++) {
                            formulaireSelectionRegion += '<option value="' + regions[i] + '">' + regions[i] + '</option>';
                        }
                        formulaireSelectionRegion += '</select></div><input class="btn btn-default, submitformregions" type="submit" value="Afficher les monuments"></form>';

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_immeubles.css">' +
                            '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>Monuments par région</title>' +
                            '    </head>' +
                            '    <body onload="initialiserFormRegions()">' +
                            nav +
                            '<div class="container">' +
                                     formulaireSelectionRegion +
                            '</div>' +
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

app.get('/regions/:nomregion', function(req, res) {

    var region = req.params.nomregion;
    // Première lettre majuscule
    region = region.charAt(0).toUpperCase() + region.substring(1).toLowerCase();

    request('http://localhost:8080/exist/rest/db/projet_xml_m1/monuments-by-region.qxy?region=' + region,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        // On ajoute un élément pour la map pour chaque fiche
                        window.$(".fiche").append('<div class="map"></div>');

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_immeubles.css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAg0Sg5Iahr2Ztad0aO88yaMJ6AGqN7FC0"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>' + region + '</title>' +
                            '    </head>' +
                            '    <body onload="initialisation()">' +
                            nav +
                            '<center>Immeubles de la région <strong>' + region + '</strong></center><br/>' +
                            window.$(".fiche").parent().html() +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )

});