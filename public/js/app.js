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

}