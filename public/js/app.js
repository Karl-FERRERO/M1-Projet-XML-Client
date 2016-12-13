/**
 * On termine d'alimenter une fiche avec des données externes via SPARQL
 * On ajoute l'image et on géolocalise sur la map
 * @param ref référence unique du monument (ex : PA00104806)
 */
function initialisationFicheMonument(ref) {

    var elementMap = document.getElementsByClassName("map")[0];
    var details = getMonumentDetailByRef(ref.toUpperCase());

    if (details.longlat) {
        var position = details.longlat;
        var myLatlng = new google.maps.LatLng(position[1], position[0]);

        var map = new google.maps.Map(elementMap, {
            center: myLatlng,
            zoom: 17
        });

        new google.maps.Marker({
            position: myLatlng,
            map: map
        });
    }
    else {
        // Ne pas avoir l'espace attribué par la classe map
        elementMap.classList.remove("map");
    }

    if (details.image) {
        var conteneurImage = document.getElementById("photomonument");
        var url = details.image;
        conteneurImage.innerHTML = '<img id="photomonument" src="' + url + '" height="100" alt="monument" />';
    }

    fonctionsCommunes();
}

function initialiserFormZone(niveau) {

    document.getElementById("formzone").addEventListener("submit", function (e) {

        e.preventDefault();
        var select = document.getElementsByName(niveau)[0];
        var lieu = select.options[select.selectedIndex].value;

        window.location = '/zone/' + niveau + '/' + lieu.toLowerCase() + '/1';

    });

    document.getElementById("switchzone").addEventListener("change", function () {

        var select = document.getElementsByName("zone")[0];
        var zone = select.options[select.selectedIndex].value;

        document.getElementsByClassName("submitformzone")[0].remove();
        document.getElementById("formzone").innerHTML += "<br/><center><div class='loadermaison'></div></center>";

        window.location = '/zone/' + zone;
    });

    fonctionsCommunes();

}

function fonctionsCommunes() {
    activerFonctionRecherche();
}

function activerFonctionRecherche() {

    document.getElementById("formrecherche").addEventListener("submit", function (e) {
        e.preventDefault();
        document.getElementById("search").click();

    });

    document.getElementById("search").addEventListener("click", function (e) {
        var lieuCherche = document.getElementById("formrecherche").getElementsByTagName("input")[0].value;

        window.location = '/recherche/' + lieuCherche + '/1';
    });
}

function getMonumentDetailByRefXml(ref) {

    var query = "SELECT ?image ?longlat WHERE { ?subject wdt:P380 '"
        + ref + "'. ?subject wdt:P18 ?image . ?subject wdt:P625 ?longlat}";

    var url = "https://query.wikidata.org/bigdata/namespace/wdq/sparql";

    var concat = url + "?query=" + query;

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", concat, false);
    xmlHttp.send(null);
    return xmlHttp.responseXML;
}

/**
 * Retourne un oobjet qui contient l'url de l'image et un tableau qui contient la localisation de ref
 * objet retourné avec : image: url de l'image, longlat: [0:longitude,1:latitude]
 *
 * @param ref
 */
function getMonumentDetailByRef(ref) {
    var test = getMonumentDetailByRefXml(ref);
    var imageUrl;
    if (test.getElementsByTagName("uri")[0]) {
        imageUrl = test.getElementsByTagName("uri")[0].firstChild.data;
    }
    var location;
    if (test.getElementsByTagName("literal")[0]) {
        location = test.getElementsByTagName("literal")[0].firstChild.data.slice(6, -1).split(" ");
    }

    return {'image': imageUrl, 'longlat': location};
}

/**
 * Envoie un svg au server qui le renvoie en pdf
 */
function getPdfFromSVG(){
    var svg = document.getElementsByTagName("svg")[0];
    var s = new XMLSerializer();
    var url = 'http://localhost:4567/stats';
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type","application/xml");
    xhr.onload = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var blob = new Blob([this.response], {type: 'application/pdf'});
            var a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            var url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'stats.pdf';
            a.click();
            window.URL.revokeObjectURL(url);
        }
    };
    xhr.send(s.serializeToString(svg));
}


/* FONCTIONS GLOBALES */

Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};