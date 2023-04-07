
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
        var markers = new Array();

        //loop through data array of locations and create a marker at each one
        for (var i=0; i<stations.length; i++) {
            var marker = new google.maps.Marker({
                position: {lat:stations[i].latitude, lng: stations[i].longitude},
                map,
                title: stations[i].address,
                station_number: stations[i].number,
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
    zoom: 13.2, center: dublin,});
    console.log("initMap function called")

    getStations();
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function() {needBike()};
document.getElementById("return_bike").onclick = function() {returnBike()};
document.getElementById("plan_trip").onclick = function() {planTrip()};

//functions for user input choice - need, return and plan
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

// list stations from json into side panel - each calls getAvailability(station_number) onclick
function listStations(stations){
    for (var i=0; i<stations.length; i++){
        var content = '<a href="javascript:void(0)" onclick="getAvailability('+stations[i].number+')">'+stations[i].address+'</a>';
        document.getElementById('stationsSidepanel').innerHTML+=content;
    }
}
function test123(x){
    fetch('/availability/'+id)
    .then((response)=> response.json())
    .then(data => {console.log(data); return data});
}
// initialise map on browser window
var map = null;
window.initMap = initMap;
