//get stations names and locations === working fine ===
function getStations() {
fetch('../static/locations.json')
.then((response) => response.json())
.then(data => {console.log(data); return data;})
.then((data) => {
    console.log("fetch response", typeof data);
    addMarkers(data);
//    test123(data)
    });
}

//function to add markers to map using a for loop instead of forEach() --- also not working :( ---
function test123(data){
//        console.log(data.length)
        for(var i = 0; i < data.length; i++ ) {
//            console.log(data[i].latitude,data[i].longitude)
            var myLatlng = new google.maps.LatLng(data[i].latitude,data[i].longitude);
            var marker = new google.maps.Marker({
                  position: myLatlng,
                  title: 'Hello World!',
                  map: map,
              });
             console.log("arrays:",marker)
        }
}

//add markers to map at all station locations using forEach() --- not working ---
function addMarkers(stations) {
stations.forEach(station => {
    var OtherLatLng = {lat: parseFloat(station.latitude), lng: parseFloat(station.longitude)};
        var marker = new google.maps.Marker({
            position: OtherLatLng,
            map,
            title: station.name,
            station_number: station.number,
            });
            console.log("addMarker marker", marker);
   });

}

// what is this??? --------- double check ---------
const eqfeed_callback = function (results) {
    for (let i=0; i<results.features.length; i++) {
        const coords = results.features[i].geometry.coordinates;
        const latLng = new google.maps.LatLng
    }
}

//initialize the map
function initMap() {
    //create map and center it on dublin
    var dublin = {lat: 53.350140, lng: -6.266155};
    var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13.2, center: dublin,});

    //fetch json data to place markers on map
    fetch('../static/locations.json')
    .then((response) => response.json())
    .then(data => {console.log(data); return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        var stations = data;
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
    });
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function() {needBike()};
document.getElementById("return_bike").onclick = function() {returnBike()};
document.getElementById("plan_trip").onclick = function() {planTrip()};

function needBike(){
    document.getElementById('userChoice').innerHTML='Looking for a bike near you...';
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('floating_panel').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Bike:';
}
function returnBike(){
    document.getElementById('userChoice').innerHTML='Finding a station for you...';
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('floating_panel').style.display = 'none';
    document.getElementById('mapHeader').innerHTML='Your closest Station:';
}
function planTrip(){
    document.getElementById('userChoice').innerHTML='Provide information about your trip:';
    document.getElementById('tripPlanner').style.display = 'block';
    document.getElementById('floating_panel').style.display = 'block';
    document.getElementById('mapHeader').innerHTML='Stations for your trip:';
}
//initialise map function when script is called === working fine ===
var map = null;
window.initMap = initMap;