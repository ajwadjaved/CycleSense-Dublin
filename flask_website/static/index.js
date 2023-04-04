//get stations names and locations for marker placement
function getStations() {
    fetch('../static/locations.json')
    .then((response) => response.json())
    .then(data => {console.log(data); return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        addMarkers(data);
        listStations(data);
    });
}

//function to add markers to map using a for loop instead of forEach()
function addMarkers(stations){
        //create infoWindow for marker onclick event
        var infoWindow = new google.maps.InfoWindow();

        //loop through data array of locations and create a marker at each one
        for (var i=0; i<stations.length; i++) {
            var marker = new google.maps.Marker({
                position: {lat:stations[i].latitude, lng: stations[i].longitude},
                map,
                title: stations[i].address,
                station_number: stations[i].number,
            });
            //add onclick event listener to each marker
            google.maps.event.addListener(marker, 'click', (function(marker) {
                return function() {
                    infoWindow.setContent(marker.title+'<br><hr><button id="markerInfo" class="markerButton" onclick="moreInfo()">more info</button>');
                    infoWindow.open(map, marker);
                }
            })(marker, i));
            }
            test123();
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
document.getElementById("list_stations").onclick = function(){listStations()};

function needBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('stations_list').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Bike:';
}
function returnBike(){
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('stations_list').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Station:';
}
function planTrip(){
    document.getElementById('tripPlanner').style.display = 'block';
    document.getElementById('stations_list').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Stations for your trip:';
}
function listStations(stations){
    document.getElementById('stations_list').style.display = 'block';
    var content = '<ul>';
    for (var i=0; i<stations.length; i++){
        content += '<li><a>'+stations[i].address+'</a></li>';
    }
    content += '</ul';
    document.getElementById('stations_list').innerHTML=content;
}

var map = null;
window.initMap = initMap;

document.getElementById("markerInfo").onclick = function() {planTrip(); console.log("more info clicked")};
function moreInfo(){
    document.getElementById("stationInfo").innerHTML = "more info panel";
}

function test123(){
    fetch("../../bike_station_data/locationsCopy.json")
    .then((response) => response.json)
    .then(data => {console.log(data); return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        });
}