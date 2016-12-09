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
    '<li><a href="/zone/region/">Consultation par zone</a></li> ' +
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
        '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
        '      <link rel="stylesheet" ' +
        'href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
        '      <script type="text/javascript" src="/js/app.js"></script>' +
        '      <meta charset="utf-8" />' +
        '      <title>Accueil</title>' +
        '    </head>' +
        '    <body>' +
        nav +
        '<div class="container">' +
        'Bienvenue' +
        '</div>' +
        '    </body>' +
        '</html>');
    res.end();

});

// departement ou region
app.get('/zone/:niveau', function(req, res) {

    var niveau = req.params.niveau;
    if (niveau != "departement" && niveau != "region") {

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html>' +
            '<html>' +
            '    <head>' +
            '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
            '      <link rel="stylesheet" ' +
            'href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
            '      <script type="text/javascript" src="/js/app.js"></script>' +
            '      <meta charset="utf-8" />' +
            '      <title>Zone</title>' +
            '    </head>' +
            '    <body>' +
            nav +
            '<div class="container">Page non disponible</div>' +
            '    </body>' +
            '</html>');
        res.end();
    }
    else {
        request('http://localhost:8080/exist/rest/db/projet_xml_m1/liste_' + niveau + '.xqy', function (error, response, body) {
                if (!error && response.statusCode == 200) {

                    // Manipulation de la structure HTML réceptionnée du XQuery
                    jsdom.env(
                        body,
                        ["http://code.jquery.com/jquery.js"],
                        function (err, window) {

                            var niveauZoneTrouves = [];
                            window.$("." + niveau).each(function () {

                                var niveauZoneCourante = window.$(this).text();

                                var niveauZoneDecomposee = niveauZoneCourante.split(";");
                                if (niveauZoneDecomposee) {
                                    for (var i = 0; i < niveauZoneDecomposee.length; i++) {
                                        niveauZoneTrouves.push(traiterTexte(niveauZoneDecomposee[i].trim()));
                                        // On retire bien les potentiels espaces au début ou à la fin
                                    }
                                }
                                else {
                                    niveauZoneTrouves.push(traiterTexte(niveauZoneCourante));
                                }

                            });

                            // On supprime les doublons
                            niveauZoneTrouves = niveauZoneTrouves.filter(function (item, pos) {
                                return niveauZoneTrouves.indexOf(item) == pos;
                            });

                            // Création du formulaire
                            var formulaireSelectionZoneNiveau = '<form id="formzone"><div class="form-group">' +
                                '<select class="form-control" name="' + niveau + '">';

                            for (var i = 0; i < niveauZoneTrouves.length; i++) {
                                formulaireSelectionZoneNiveau += '<option value="' + niveauZoneTrouves[i] + '">'
                                    + niveauZoneTrouves[i] + '</option>';
                            }
                            formulaireSelectionZoneNiveau += '</select></div><input class="btn btn-default, submitformzone" ' +
                                'type="submit" value="Afficher les monuments"></form>';

                            // Formulaire pour switcher d'un niveau à un autre
                            var form = '<form id="switchzone"><div class="form-group"><select class="form-control" name="zone">';
                            form += '<option value="departement" ';
                            if (niveau == "departement") {
                                form += 'selected';
                            }
                            form += '>DEPARTEMENT</option>';

                            form += '<option value="region" ';
                            if (niveau == "region") {
                                form += 'selected';
                            }
                            form += '>REGION</option>';
                            form += '</select></div></form>';

                            res.writeHead(200, {'Content-Type': 'text/html'});
                            res.write('<!DOCTYPE html>' +
                                '<html>' +
                                '    <head>' +
                                '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
                                '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                                '      <script type="text/javascript" src="/js/app.js"></script>' +
                                '      <meta charset="utf-8" />' +
                                '      <title>Monuments par ' + niveau +'</title>' +
                                '    </head>' +
                                '    <body onload="initialiserFormZone(\'' + niveau + '\')">' +
                                nav +
                                '<div class="container">' +
                                form +
                                formulaireSelectionZoneNiveau +
                                '</div>' +
                                '    </body>' +
                                '</html>');

                            res.end();

                        });

                }
            }
        )
    }
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

app.get('/zone/:niveau/:nomlieu/:page', function(req, res) {

    var niveau = req.params.niveau;
    var lieu = req.params.nomlieu;
    var page = req.params.page;

    // On met la première lettre en majuscule et celles suivant un tiret
    var lieuCompo = lieu.split("-");
    var lieuMajFormat = "";
    for (var i = 0; i < lieuCompo.length; i++) {
        lieuMajFormat +=  lieuCompo[i].charAt(0).toUpperCase() + lieuCompo[i].substring(1).toLowerCase();
        if (i < lieuCompo.length-1) { lieuMajFormat += "-"; }
    }
    lieu = lieuMajFormat;

    var nbPages = 10;
    var pagination = '<ul class="pagination pagination-lg">';
    for (var i=1 ; i<nbPages ; i++) {
        pagination += '<li><a href="/zone/' + niveau + '/' + req.params.nomlieu + '/' + i + '">' + i + '</a></li>';
    }
    pagination += '</ul><br/>';

    request('http://localhost:8080/exist/rest/db/projet_xml_m1/monuments-by-' + niveau + '.xqy?' + niveau + '=' + lieu + "&page=" + page,
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
                            '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAg0Sg5Iahr2Ztad0aO88yaMJ6AGqN7FC0"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>' + lieu + '</title>' +
                            '    </head>' +
                            '    <body onload="initialisation()">' +
                            nav +
                            pagination +
                            window.$(".fiche").parent().html() +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )

});