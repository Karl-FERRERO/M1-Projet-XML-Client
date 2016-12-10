function initialisation() {

    // On charge la map pour tous les immeubles
    var elementsMap = document.getElementsByClassName("map");
    for (var i=0 ; i<elementsMap.length ; i++) {

        // Marqueur et lieu par défaut : Paris/Tour Eiffel
        var myLatlng = new google.maps.LatLng(48.858093, 2.294694);

        var map = new google.maps.Map(elementsMap.item(i), {
            center: myLatlng,
            zoom: 8
        });

        var marqueur = new google.maps.Marker({
            position: myLatlng,
            title: 'Test marqueur',
            map: map
        });
    }

    activerFonctionRecherche();
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

function initialiserFormZone(niveau) {

    document.getElementById("formzone").addEventListener("submit", function(e){

        e.preventDefault();
        var select = document.getElementsByName(niveau)[0];
        var lieu = select.options[select.selectedIndex].value; // ou text ?

        window.location = '/zone/' + niveau + '/' + lieu.toLowerCase() + '/1';

    });

    document.getElementById("switchzone").addEventListener("change", function() {

        var select = document.getElementsByName("zone")[0];
        var zone = select.options[select.selectedIndex].value;

        document.getElementsByClassName("submitformzone")[0].remove();
        document.getElementById("formzone").innerHTML += "<br/><center><div class='loadermaison'></div></center>";

        window.location = '/zone/' + zone;
    });

    activerFonctionRecherche();

}

function activerFonctionRecherche() {

    document.getElementById("formrecherche").addEventListener("submit", function(e){

        e.preventDefault();
        document.getElementById("search").click();

    });

    document.getElementById("search").addEventListener("click", function(e){
        var lieuCherche = document.getElementById("formrecherche").getElementsByTagName("input")[0].value;

        window.location = '/' + lieuCherche + '/1';

    });
}