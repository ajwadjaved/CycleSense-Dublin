let markers = new Array();
let stations;
let UserLocation;
let ClosestStation;

//get stations names and locations for marker placement - calls addMarkers()
function getStations() {
    fetch('/stations')
        .then((response) => response.json())
        .then(data => {
            console.log(data);
            return data;
        })
        .then((data) => {
            console.log("fetch response", typeof data);
            addMarkers(data);
            stations = data;
            console.log("Stations: ", stations);
            listStations();
        });
}

// get availability for given station
function getAvailability() {
    for (var i = 0; i < markers.length; i++) {
        fetch('/availability/' + markers[i])
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                return data;
            });
    }
}

// get current weather information
function getWeather() {
    fetch('/weather')
        .then((response) => response.json())
        .then(data => {
            return data
        })
        .then((data) => {
            console.log("Current Weather: ", data);
            showWeather(data);
        });
}

//function to add markers to map - adds unique infoWindow for each
function addMarkers(stations) {
    console.log("addMarkers function called")
    //create infoWindow for marker onclick event
    var infoWindow = new google.maps.InfoWindow();

    //loop through data array of locations and create a marker at each one
    for (var i = 0; i < stations.length; i++) {
        var marker = new google.maps.Marker({
            position: {lat: stations[i].position_lat, lng: stations[i].position_long},
            map,
            title: stations[i].address,
            station_number: stations[i].NUMBER,
        });
        markers.push(marker);
        // add marker popup to each
        google.maps.event.addListener(marker, 'click', (function (marker) {
            var content = 'Name: ' + stations[i].address + '<br>Number: ' + stations[i].number + '<br>Position: ' + marker.position
            return function () {
                infoWindow.setContent(content + '<br><hr><button id="' + marker.station_number + '" class="markerButton" onclick="moreInfo(' + marker.station_number + ')"' + marker.station_number + '">more info</button>');
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
        zoom: 13.6, center: dublin,
    });
    console.log("initMap function called")

    // fill map with station markers through getStations when loading map
    getStations();
}

// return closest marker from array - from https://stackoverflow.com/questions/45537011/google-map-api-get-closest-place-to-me-in-my-address
function rad(x) {
    return x * Math.PI / 180;
}

async function hasAvailableBikeOrBikeStands(i, lookingForBike) {
    var isOpen = false;
    var hasBikesOrStands = false;
    let isConsidered = false;
    await fetch('availability/' + markers[i].station_number)
        .then((response) => response.json())
        .then((dataJSON) => {
            isOpen = dataJSON.open === 1
            hasBikesOrStands = lookingForBike ? dataJSON.available_bikes > 0 : dataJSON.available_bike_stands > 0;
            isConsidered = isOpen && hasBikesOrStands;
            console.log(dataJSON)
            const str = isConsidered ? 'considered' : "skipped"
            console.log(dataJSON.NUMBER + ' is ' + str)
        })
    return isConsidered
}

// made function async to wait for the fetch response to come back
async function find_closest_marker(position, lookingForBike) {
    var lat = position.lat;
    var lng = position.lng;
    var R = 6371; // radius of earth in km
    var distances = [];
    var closest = -1;
    for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
            // wait for the response
            if (!await hasAvailableBikeOrBikeStands(i, lookingForBike)) {
                continue
            }

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
    }
    // console.log("closest marker: ", markers[closest].position[0]);
    return (markers[closest].position);
}

// center map on user location when looking for or returning a bike
function returnUserLocation(lookingForBike) {
    var infoWindow = new google.maps.InfoWindow();
    // Try HTML5 geolocation
    if (navigator.geolocation) {
        console.log("looking for your location.")
        navigator.geolocation.getCurrentPosition(async (position) => {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                UserLocation = pos;
                console.log("UserLocation from returnUserLocation():", UserLocation);
                var closestMarker = await find_closest_marker(pos, lookingForBike);
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
function handleLocationError(browserHasGeolocation, marker, pos) {
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
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function hideMarkers() {
    setMapOnAll(null);
}

function showMarkers() {
    setMapOnAll(map);
    directionRenderer.setMap(null);
}

// return path from location to location - walking only
function directions(start, end) {
    hideMarkers();
    var directionService = new google.maps.DirectionsService();
    var directionRenderer = new google.maps.DirectionsRenderer();
    directionRenderer.setMap(map);
    var request = {
        origin: start,
        destination: end,
        travelMode: 'WALKING'
    };
    directionService.route(request, function (result, status) {
        if (status == 'OK') {
            directionRenderer.setDirections(result);
        }
    });
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function () {
    needBike();
    returnUserLocation(true);
}
document.getElementById("return_bike").onclick = function () {
    returnBike();
    returnUserLocation(false);
}
document.getElementById("plan_trip").onclick = function () {
    planTrip()
}
document.getElementById("list_stations").onclick = function () {
    listStations();
}
document.getElementById("get_weather").onclick = function () {
    getWeather();
}

//functions for user input choice - need, return and plan
function needBike() {
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML = 'Finding your closest Bike...';
}

function returnBike() {
    document.getElementById('tripPlanner').style.display = 'none';
    document.getElementById('mapHeader').innerHTML = 'Finding your closest Station...';
}

function planTrip() {
    document.getElementById('tripPlanner').style.display = 'block';
    document.getElementById('mapHeader').innerHTML = 'Stations for your trip:';
    showMarkers();
}

// list stations from json into side panel - each calls getAvailability(station_number) onclick
function listStations() {
    for (var i = 0; i < stations.length; i++) {
        var content = '<a href="javascript:void(0)" onclick="getAvailability(' + stations[i].NUMBER + ')">' + stations[i].address + '</a>';
        document.getElementById('stationsSidepanel').innerHTML += content;
    }
}

function showWeather(weather) {
    document.getElementById("weather_info").style.display = 'block';
    document.getElementById('weather_info').innerHTML = weather;
}

// initialise map on browser window
var ClickStart = null;
var ClickEnd = null;
var map = null;
window.initMap = initMap;
