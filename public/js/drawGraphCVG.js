
function degres2radians(centreX, centreY, rayon, degres) {
	 var radians = (degres-90) * Math.PI / 180.0;
	 return {
	 x: centreX + (rayon * Math.cos(radians)),
	 y: centreY + (rayon * Math.sin(radians))
	 };
}
 
function monArc(x, y, rayon, angleDepart, angleFin){
	var depart = degres2radians(x, y, rayon, angleFin);
	var fin = degres2radians(x, y, rayon, angleDepart);
	var arc180 = angleFin - angleDepart <= 180 ? "0" : "1";
	var d = [
	"M", depart.x, depart.y,
	"A", rayon, rayon, 0, arc180, 0, fin.x, fin.y,
	"L", x,y,
	"L", depart.x, depart.y
	].join(" ");
	return d;
}
 
function addElements(i){
	var svg = document.getElementsByTagName('svg')[0]; //Get le svg
	angleDepart=angleDepart;
	angleFin=(angleDepart+tabDonnees[i]);

	// dessin des arcs de cercle
	var path = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
	path.setAttribute('fill',tabCouleur[i]);
	path.setAttribute('d',monArc(120 , 120, rayon, angleDepart*3.6,angleFin*3.6));
	path.setAttribute('id','arc'+i);
	path.setAttribute('p',i);
	path.setAttribute('class',"arc");

	// dessin des carres de legende
	var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); //Create a path in SVG's namespace
	rect.setAttribute('width','16');
	rect.setAttribute('height','16');
	rect.setAttribute('x',260);
	rect.setAttribute('y',30*i+70);
	rect.setAttribute('fill',tabCouleur[i]);
	rect.setAttribute('id','rect'+i);

	// dessin des textes de legende
	var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.setAttribute('x', 280);
	text.setAttribute('y', 30*i+70+12);
	text.setAttribute('fill', '#999');
	text.setAttribute('font-size','12');
	text.setAttribute('font-family','sans-serif');
	text.setAttribute('font-weight','normal');
	text.setAttribute('id','text'+i);
	text.textContent = tabLabel[i]+' ('+tabDonnees[i]+'%)';

	// ajout des elements au svg
	svg.appendChild(path);
	svg.appendChild(rect);
	svg.appendChild(text);
	var el = document.getElementById('arc'+i); 
    el.addEventListener("click", clickArc, false); 
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

String.prototype.replaceAll = function(search, replacement) {
     var target = this;
     return target.replace(new RegExp(search, 'g'), replacement);
};
 
function drawGraphCam(tab){
	// Traitement du xml :
	// <STAT>
    //        <REG></REG>
    //        <COUNT></COUNT>
    // </STAT>
	angleDepart=0;
	angleFin=0;
	rayon=100;
	
	tab = tab.replaceAll("\n","");
	arr = tab.split(";");
	
    tabLabel = [];
	tabDonnees= [];
	
	// Remplissage des tabLabel et tabDonnees :
	for (i = 0; i < arr.length-1; i++) { 
		//arr[i] = test.replaceAll("<REG>","");
		
		stat = arr[i].split(",");
		
		// Nom de la Région
		tabLabel.push(stat[0]);
		
		// Nombre de monuments dans la Région
	    tabDonnees.push(parseFloat(stat[1]));
	}
	
	
	
	tabCouleur = [];
	
	// Couleur aléatoire
	for (i = 0; i < tabLabel.length; i++) { 
	    tabCouleur.push(getRandomColor());
	}
	
	cible='a';
	// creation du SVG
	document.getElementById(cible).innerHTML='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width=600 height=1500></svg>';
	// pour chaque entree des tableaux on dessine les arc , carres et textes
	for (i=0; i<tabDonnees.length;i++){
		addElements(i);
		angleDepart=angleFin;
	}
}
var clickArc = function(){
    alert(tabLabel[this.getAttribute("p")]+" : "+tabDonnees[this.getAttribute("p")]+"%");
}
