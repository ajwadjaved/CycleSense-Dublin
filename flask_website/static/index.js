let markers = new Array();

//get stations names and locations for marker placement - calls addMarkers()
function getStations() {
    fetch('/stations')
    .then((response) => response.json())
    .then(data => {console.log(data); return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        addMarkers(data);
        listStations(data);
    });
}

//function to add markers to map - adds unique infoWindow for each
function addMarkers(stations){
    console.log("addMarkers function called")
    //create infoWindow for marker onclick event
    var infoWindow = new google.maps.InfoWindow();
    const image = "http://labs.google.com/ridefinder/images/mm_20_blue.png";

    //loop through data array of locations and create a marker at each one
    for (var i=0; i<stations.length; i++) {
        var marker = new google.maps.Marker({
            position: {lat:stations[i].latitude, lng: stations[i].longitude},
            map,
            title: stations[i].address,
            station_number: stations[i].number,
            icon: image,
        });
        markers.push(marker);
        // add marker popup to each
        google.maps.event.addListener(marker, 'click', (function(marker) {
            var content = 'Name: '+stations[i].address+'<br>Number: '+stations[i].number+'<br>Position: '+marker.position
            return function() {
                infoWindow.setContent(content+'<br><hr><button id="'+marker.station_number+'" class="markerButton" onclick="moreInfo('+marker.station_number+')"'+marker.station_number+'">more info</button>');
                infoWindow.open(map, marker);
            }
        })(marker, i));

    }
}
//initialize the map - calls getStations
function initMap() {
    //create map and center it on dublin
    var dublin = {lat: 53.350140, lng: -6.266155};
    map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13.6, center: dublin,});
    console.log("initMap function called")

    // fill map with station markers through getStations when loading map
    getStations();
}

// center map on user location when looking for or returning a bike
function returnUserLocation(){
    var infoWindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker();
    const image = "http://labs.google.com/ridefinder/images/mm_20_red.png";
    // Try HTML5 geolocation
    if (navigator.geolocation){
        console.log("looking for your location.")
        navigator.geolocation.getCurrentPosition((position) =>{
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            marker.setPosition(pos);
            marker.setIcon(image);
            marker.setMap(map);
            map.setCenter(pos);
        },
        () => {
            handleLocationError(true, marker, map.getCenter());
        });
    } else {
        // Browser doesn't support geolocation
        handleLocationError(false, marker, map.getCenter());
    }

}
// handle geolocation errors with infoWindow
function handleLocationError(browserHasGeolocation, marker, pos){
    var infoWindow = new google.maps.infoWindow();
    marker.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map, marker);
}

// return path from location to location - walking only
function directions(start, end){
    var directionService = new google.maps.DirectionsService();
    var directionRenderer = new google.maps.DirectionsRenderer();
    directionRenderer.setMap(null);
    directionRenderer.setMap(map);
    var request = {
        origin: start,
        destination: end,
        travelMode: 'WALKING'
    };
    directionService.route(request, function(result, status){
        if(status == 'OK'){
            directionRenderer.setDirections(result);
        }
    });
}

// read user click for start and end to path planner ------ not finished ------
// change to read and return two locations for path
function pathFinder(){
    while true{
    map.addListener("click",(mapsMouseEvent) =>{
            ClickStart = mapsMouseEvent.latLng;
    });}
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function() {needBike(); returnUserLocation()};
document.getElementById("return_bike").onclick = function() {returnBike(); returnUserLocation()};
document.getElementById("plan_trip").onclick = function() {planTrip()};

//functions for user input choice - need, return and plan
function needBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Finding your closest Bike...';
}
function returnBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Finding your closest Station...';
}
function planTrip(){
    document.getElementById('tripPlanner').style.display = 'block';
    document.getElementById('mapHeader').innerHTML='Stations for your trip:';
}

// list stations from json into side panel - each calls getAvailability(station_number) onclick
function listStations(stations){
    for (var i=0; i<stations.length; i++){
        var content = '<a href="javascript:void(0)" onclick="getAvailability('+stations[i].number+')">'+stations[i].address+'</a>';
        document.getElementById('stationsSidepanel').innerHTML+=content;
    }
}

// initialise map on browser window
var ClickStart = null;
var ClickEnd = null;
var map = null;
window.initMap = initMap;
