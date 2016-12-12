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
    '<li><a href="/stats/camembert">Statistiques</a></li> ' +
    '</ul> ' +
    '<form class="navbar-form navbar-left" id="formrecherche"> ' +
    '<div class="form-group"> ' +
    '<input type="text" class="form-control" placeholder="Nom d\'un monument..."> ' +
    '</div> ' +
    '<img src="/img/search.png" id="search" height="25"> ' +
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
        '    <body onload="activerFonctionRecherche()">' +
        nav +
        '<div class="container" style="text-align: center;">' +
        '<h4>Bienvenue sur votre outil de consultation de monuments</h4>' +
        '<p>Projet XML proposé par M.Poulard, année master 1 MIAGE, participants :</p>' +
        '<ul class="list-group">' +
        '   <li class="list-group-item">Laeticia PIERRE</li>' +
        '   <li class="list-group-item">Karl Ferrero</li> ' +
        '   <li class="list-group-item">Florian Muller</li> ' +
        '</ul>' +
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
                                for (var i = 0; i < niveauZoneDecomposee.length; i++) {
                                    // On retire bien les potentiels espaces au début ou à la fin
                                    niveauZoneTrouves.push(traiterTexte(niveauZoneDecomposee[i].trim()));
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

    if (niveau == "departement") {
        lieu = lieu.toUpperCase();
    }

    request('http://localhost:8080/exist/rest/db/projet_xml_m1/preview-by-' + niveau + '.xqy?' + niveau + '=' + encodeURIComponent(lieu) + "&page=" + page,
        function (error, response, body) {
			if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        var nbPages = window.$("#conteneur-fiches").data("totalpages");
                        var pagination = genererPagination(nbPages, 'zone/' + niveau + '/' + req.params.nomlieu);

                        window.$("#conteneur-fiches").addClass("row");

                        window.$(".fiche").addClass("col-xs-6");

                        // Titre
                        window.$(".fiche div:nth-child(1)").addClass("fiche-titre");

                        // Ajout petit icône devant l'adresse
                        window.$(".fiche div:nth-child(2)").each(function () {
                            var adresse = window.$(this).text();
                            var iconeAdresse = '<img src="/img/location-pointer.png" height="20" style="margin-right: 2%;"/>';
                            window.$(this).html(iconeAdresse + adresse);
                        });

                        // Acces grâce à la ref
                        window.$(".fiche div:nth-child(3)").each(function () {
                            var ref = window.$(this).text();
                            var acces = '<button type="button" class="btn btn-secondary" onclick="window.location=\'/fiche/' + ref + '\'" style="margin-top: 2%;">Accéder à la fiche complète</button>';
                            window.$(this).html(acces);
                        });

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
                            '    <body onload="fonctionsCommunes()">' +
                            nav +
                            pagination +
                            window.$("#conteneur-fiches").parent().html() +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )

});

function genererPagination(nbPages, chemin) {

    var pagination = '<div><ul class="pagination pagination-lg">';
    for (var i=1 ; i<nbPages+1 ; i++) {
        pagination += '<li><a href="/' + chemin + '/' + i + '">' + i + '</a></li>';
    }
    pagination += '</ul></div>';

    return pagination;
}

// Affichage des statistiques (Camembert, Histogramme, Tableau)
app.get('/stats/:type', function(req, res) {
	
	var type = req.params.type;
	
	// Traitement des différents affichages de statistiques :
	requete = '';
	
	
	if(type === 'camembert'){
		requete = 'http://localhost:8080/exist/rest/db/projet_xml_m1/getMonumentsParRegion.xqy';
	}
	else if(type === 'histogramme'){
		requete = 'http://localhost:8080/exist/rest/db/projet_xml_m1/stats_regions.xqy';
	}
	else if(type === 'tableau'){
		requete = 'http://localhost:8080/exist/rest/db/projet_xml_m1/stats_region.xqy';
	}

    request(requete,
        function (error, response, body) {
            if (!error) {
				
				bodyOnload = '    <body onload="activerFonctionRecherche()">';
				bodyAffichage = body;
				
				if(type === 'camembert'){
					requete = 'http://localhost:8080/exist/rest/db/projet_xml_m1/getMonumentsParRegion.xqy';
					
					// Traitement du body pour le camembert
					stat = body;
					stat = stat.replaceAll("'","\\\'");
					stat = stat.replaceAll(";","-");
					stat = stat.replaceAll("\n","");
					stat = stat.replaceAll("\t","");
					stat = stat.replaceAll("\r","");
					stat = stat.replaceAll("&nbsp","");

					stat = stat.replaceAll("<STAT>","");
					stat = stat.replaceAll("</STAT>",";");
					
					stat = stat.replaceAll("<REG>","");
					stat = stat.replaceAll("</REG>",",");
					stat = stat.replaceAll("<COUNT>","");
					stat = stat.replaceAll("</COUNT>","");
					
					stat = stat.substring(0, stat.length - 1);
					
					bodyOnload = '<body onload= "drawGraphCam(\'' + stat + '\'); '+ 	
						'	activerFonctionRecherche();" '+
						'> ';
					
					// On n'affiche pas le body
					bodyAffichage = '';
				}
				
				res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('<!DOCTYPE html>' +
                    '<html>' +
                    '    <head>' +
                    '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                    '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
                    '      <meta charset="utf-8" />' +
                    '      <script type="text/javascript" src="/js/app.js"></script>' +
					'	   <script type="text/javascript" src="/js/drawGraphCVG.js"> </script> '+
                    '      <title>Statistiques</title>' +
                    '    </head>' +
					bodyOnload +
                    nav +
					'<div> <button type="button" class="btn btn-secondary" onclick="window.location=\'/stats/camembert\'" style="margin-bottom: 10px; margin-top: 10px; margin-left: 10px; margin-right: 10px;">Camembert</button> '+
					'<button type="button" class="btn btn-secondary" onclick="window.location=\'/stats/histogramme\'" style="margin-bottom: 10px; margin-top: 10px; margin-left: 10px; margin-right: 10px;">Histogramme</button> '+
					'<button type="button" class="btn btn-secondary" onclick="window.location=\'/stats/tableau\'" style="margin-bottom: 10px; margin-top: 10px; margin-left: 10px; margin-right: 10px;">Tableau</button></div> '+
                    '<div id="a" class="container">' +
                    bodyAffichage +
                    '</div>' +
                    '    </body>' +
                    '</html>');
                res.end();

            }
        }
    )

});

app.get('/recherche/:nom/:page', function(req, res) {

    var nom = req.params.nom;
    var page = req.params.page;

    // Côté serveur : peu importe les majuscules/minuscules
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/preview-by-nom.xqy?nom=' + encodeURIComponent(nom) + "&page=" + page,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        var contenu = "";

                        if (window.$(".fiche").length == 0) {
                            contenu += '<div class="alert alert-info" role="alert">Aucune fiche trouvée pour votre recherche : <strong>' + nom + '</strong></div>';
                        }
                        else {
                            contenu += '<div class="alert alert-info" role="alert">Résultats pour votre recherche : <strong>' + nom + '</strong></div>';

                            var nbPages = window.$("#conteneur-fiches").data("totalpages");
                            contenu += genererPagination(nbPages, "recherche/" + nom);

                            window.$("#conteneur-fiches").addClass("row");

                            window.$(".fiche").addClass("col-xs-6");

                            // Titre
                            window.$(".fiche div:nth-child(1)").addClass("fiche-titre");

                            // Ajout petit icône devant l'adresse
                            window.$(".fiche div:nth-child(2)").each(function () {
                                var adresse = window.$(this).text();
                                var iconeAdresse = '<img src="/img/location-pointer.png" height="20" style="margin-right: 2%;"/>';
                                window.$(this).html(iconeAdresse + adresse);
                            });

                            // Acces grâce à la ref
                            window.$(".fiche div:nth-child(3)").each(function () {
                                var ref = window.$(this).text();
                                var acces = '<button type="button" class="btn btn-secondary" onclick="window.location=\'/fiche/' + ref + '\'" style="margin-top: 2%;">Accéder à la fiche complète</button>';
                                window.$(this).html(acces);
                            });

                            contenu += window.$("#conteneur-fiches").parent().html();
                        }

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAg0Sg5Iahr2Ztad0aO88yaMJ6AGqN7FC0"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>Recherche ' + nom + '</title>' +
                            '    </head>' +
                            '    <body onload="fonctionsCommunes()">' +
                            nav +
                            '<div class="container">' +
                            contenu +
                            '</div>' +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )

});

app.get('/fiche/:ref', function(req, res) {

    var ref = req.params.ref;

    // Côté serveur : peu importe les majuscules/minuscules
    request('http://localhost:8080/exist/rest/db/projet_xml_m1/fiche-by-ref.xqy?ref=' + ref,
        function (error, response, body) {
            if (!error && response.statusCode == 200) {

                // Manipulation de la structure HTML réceptionnée du XQuery
                jsdom.env(
                    body,
                    ["http://code.jquery.com/jquery.js"],
                    function (err, window) {

                        // On ajoute une élément image, qui contiendra une photo du monument
                        window.$(".fiche-complete").prepend('<img id="photomonument" height="100" alt="monument" />');

                        // On ajoute un élément pour la map, qui montrera l'emplacement du monyment
                        window.$(".fiche-complete").append('<div class="map"></div>');

                        res.writeHead(200, {'Content-Type': 'text/html'});
                        res.write('<!DOCTYPE html>' +
                            '<html>' +
                            '    <head>' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_monument.css">' +
                            '      <link rel="stylesheet" type="text/css" href="/css/style_fiche_complete.css">' +
                            '      <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAg0Sg5Iahr2Ztad0aO88yaMJ6AGqN7FC0"></script>' +
                            '      <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/css/bootstrap.min.css" type="text/css">' +
                            '      <script type="text/javascript" src="/js/app.js"></script>' +
                            '      <meta charset="utf-8" />' +
                            '      <title>Fiche ' + ref +'</title>' +
                            '    </head>' +
                            '    <body onload="initialisationFicheMonument(\'' + ref + '\')">' +
                            nav +
                            '<div class="container">' +
                            '<div class="titre">Fiche du monument</div> <hr/>' +
                            window.$(".fiche-complete").parent().html() +
                            '</div>' +
                            '    </body>' +
                            '</html>');
                        res.end();

                    });

            }
        }
    )

});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

