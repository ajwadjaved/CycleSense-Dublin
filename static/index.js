let markers = new Array();
let stations;
let UserLocation;
let ClosestStation;
let thisAvailability;
//get stations names and locations for marker placement - calls addMarkers()
function getStations() {
    fetch('/stations')
    .then((response) => response.json())
    .then(data => {console.log(data);return data;})
    .then((data) => {
        console.log("fetch response", typeof data);
        addMarkers(data);
        stations = data;
        listStations(data);
    });
}
// get availability for given station
function getAvailability(station_number){
    for (var i=0; i<markers.length; i++){
        if (markers[i].NUMBER == station_number){
            var marker = markers[i]
                fetch('/availability/'+marker)
                .then((response) => response.json())
                .then((data) => {console.log(data); return data;})
                .then(data =>{ thisAvailability = data;});
                console.log("this availability: ",thisAvailability);
        }
    }
}
// get current weather information
function getWeather(){
//    showWeather();
    fetch('/weather')
    .then((response) => response.json())
    .then(data => {return data})
    .then((data) => {
        showWeather(data);
    });
}
//function to add markers to map - adds unique infoWindow for each
function addMarkers(stations){
    console.log("addMarkers function called")
    //create infoWindow for marker onclick event
    var infoWindow = new google.maps.InfoWindow();
    var image = "/static/purple_marker.svg";

    //loop through data array of locations and create a marker at each one
    for (var i=0; i<stations.length; i++) {
        var marker = new google.maps.Marker({
            position: {lat:stations[i].position_lat, lng: stations[i].position_long},
            map,
            title: stations[i].address,
            station_number: stations[i].NUMBER,
            icon: image,
        });
        markers.push(marker);
        var availability = getAvailability(stations[i].NUMBER);
        console.log(availability);
        // add marker popup to each
        google.maps.event.addListener(marker, 'click', (function(marker) {
            var content = 'Name: '+stations[i].address+'<br>Number: '+stations[i].NUMBER;
//            content += '<br>'+availability;
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
    console.log("initMap function called");
//    test marker when not connected to server-------
    var image = "/static/purple_marker.svg";

    var m = new google.maps.Marker({
        map,
        position: dublin,
        icon: image,
    });
    markers.push(m);
    var infoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(m, 'click', (function(m){
        var content = 'sample marker content<hr><strong>...</strong>';
        return function(){
            infoWindow.setContent(content);
            infoWindow.open(map, m);
        }
    })(m, 0));

    // fill map with station markers through getStations when loading map
//    getStations();
}

// return closest marker from array - from https://stackoverflow.com/questions/45537011/google-map-api-get-closest-place-to-me-in-my-address
function rad(x) { return x * Math.PI / 180; }
function find_closest_marker(position) {
    var lat = position.lat;
    var lng = position.lng;
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            var mlat = markers[i].position.lat();
            var mlng = markers[i].position.lng();
            var dLat = rad(mlat - lat);
            var dLong = rad(mlng - lng);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(rad(lat)) * Math.cos(rad(lat)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            distances[i] = d;
            if (closest == -1 || d < distances[closest]) {
                closest = i;

            }
        }
    };
    console.log("closest marker: ",markers[closest].position[0]);
    return (markers[closest].position);
}

// center map on user location when looking for or returning a bike
function returnUserLocation(){
    var infoWindow = new google.maps.InfoWindow();
    // Try HTML5 geolocation
    if (navigator.geolocation){
        console.log("looking for your location.")
        navigator.geolocation.getCurrentPosition((position) =>{
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            UserLocation = pos;
            console.log("UserLocation from returnUserLocation():", UserLocation);
            var closestMarker = find_closest_marker(UserLocation);
            directions(UserLocation, closestMarker);
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

// set map for all markers - hide or show
function setMapOnAll(map){
    for (let i=0; i< markers.length; i++){
        markers[i].setMap(map);
    }
}
function hideMarkers(){setMapOnAll(null);}
function showMarkers(){
    setMapOnAll(map);
    directionRenderer.setMap(null);
}

// return path from location to location - walking only
function directions(start, end){
//    hideMarkers();
    var directionService = new google.maps.DirectionsService();
    var directionRenderer = new google.maps.DirectionsRenderer();
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

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function() {needBike(); returnUserLocation();}
document.getElementById("return_bike").onclick = function() {returnBike(); returnUserLocation();}
document.getElementById("plan_trip").onclick = function() {showTrip()}
document.getElementById("list_stations").onclick = function() {listStations(); openNav();}
//document.getElementById("get_weather").onclick = function() {getWeather();}
document.getElementById("get_weather").onclick = function() {showWeather();}

//functions for user input choice - need, return and plan
function needBike(){
    document.getElementById('mapHeader').innerHTML='Finding your closest Bike...';
}
function returnBike(){
    document.getElementById('mapHeader').innerHTML='Finding your closest Station...';
    returnUserLocation();
}
// show div containing information for trip planned by user - best stations and weather forcast
function showTrip(){
    document.getElementById('mapHeader').innerHTML = 'Plan your trip...';
    document.getElementById('trip_info').style.display = 'block';
    dragElement(document.getElementById('trip_info'));
    var content = '';
    document.getElementById('trip_data').innerHTML += content;
    document.getElementById('date_chosen').onclick = function() {getTripInfo()};
    function getTripInfo(){
    // --> TODO: get location finder API from google to read user input location as latLng for station finder <--
    // --> TODO: get information entered by user in form. Pass to directions() function to show path on map <--
        var d = document.getElementById("dayOfTrip").value;
        var day = d;
        document.getElementById('trip_day').innerHTML = day;
        var s = document.getElementById("startLocation").value;
        var e = document.getElementById("endLocation").value;
        document.getElementById("trip_start").innerHTML = s;
        document.getElementById("trip_end").innerHTML = e;
     }

//    use predictive model to display availability chances and weather forcast for chosen day as graphs
//    document.getElementById('trip_data').innerHTML = "variable to show:<br><ul><li>start station bike availability over hours of day</li><li>end station space available over hours of day</li><li>weather forcast</li></ul>";

}

// list stations from json into side panel - each calls getAvailability(station_number) onclick
function listStations(){
    for (var i=0; i<114; i++){
        var content = '<a href=# onclick="moreInfo(13)">Sample Station</a>'
//        var content = '<a href="javascript:void(0)" onclick="moreInfo('+stations[i].NUMBER+')">'+stations[i].address+'</a>';
        document.getElementById('stationsSidepanel').innerHTML+=content;
    }
}

// show current weather info - called from getWeather() fetch response
function showWeather(){
    document.getElementById('weather_info').style.display = 'block';
    var content = "variable: showing todays' weather";
//    var weather = data.weather;
//    var temp = data.temp;
//    var time = data.time;
//    document.getElementById('weather_data').innerHTML = "Weather: "+weather+" | Temp: "+temp+"℃ | Time: "+time;
    document.getElementById('weather_data').innerHTML = content;
    dragElement(document.getElementById('weather_info'));
}

// make div elements draggable - sourced from W3 Schools
dragElement(document.getElementById('more_station_info'));
function dragElement(elmnt){
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
    document.getElementById(elmnt.id+"header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e){
        e = e || window.event;
        e.preventDefault();
        // get cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    function elementDrag(e){
        e = e || window.event;
        e.preventDefault();
        // get new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set elements new position
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}
    function closeDragElement(){
        // stop moving when mouse released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// initialise map on browser window
var ClickStart = null;
var ClickEnd = null;
var map = null;
window.initMap = initMap;
