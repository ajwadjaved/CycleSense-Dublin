//get stations names and locations === working fine ===
function getStations() {
    fetch('../static/locations.json')
    .then((response) => response.json())
    .then(data => {console.log(data); return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        addMarkers(data);
    });
}

//function to add markers to map using a for loop instead of forEach() --- also not working :( ---
function addMarkers(stations){
        var infoWindow = new google.maps.InfoWindow();

        for (var i=0; i<stations.length; i++) {
            var marker = new google.maps.Marker({
                position: {lat:stations[i].latitude, lng: stations[i].longitude},
                map,
                title: stations[i].address,
                station_number: stations[i].number,
            });
            google.maps.event.addListener(marker, 'click', (function(marker) {
                return function() {
                    infoWindow.setContent(marker.title+'<br><hr><a href=#>more info</a>');
                    infoWindow.open(map, marker);
                }
            })(marker, i));
            }
}

//initialize the map
function initMap() {
    //create map and center it on dublin
    var dublin = {lat: 53.350140, lng: -6.266155};
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13.2, center: dublin,});

    getStations();
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function() {needBike()};
document.getElementById("return_bike").onclick = function() {returnBike()};
document.getElementById("plan_trip").onclick = function() {planTrip()};

function needBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Bike:';
}
function returnBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Station:';
}
function planTrip(){
    document.getElementById('tripPlanner').style.display = 'block';
    document.getElementById('mapHeader').innerHTML='Stations for your trip:';
}

var map = null;
window.initMap = initMap;