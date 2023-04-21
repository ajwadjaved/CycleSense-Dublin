let markers = new Array();
let stations;
let UserLocation;
let ClosestStation;
let thisAvailability;

google.charts.load('current', {'packages': ['corechart']});

// limit the selectable date to next 5 days
const currentDate = new Date();
const maxDate = new Date(currentDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // Adding 5 days in milliseconds
const formattedMaxDate = maxDate.toISOString().slice(0, 10); // Converting to ISO date string

document.getElementById("dayOfTrip").max = formattedMaxDate;

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
            listStations(data);
        });
}

// get availability for given station
function getAvailability(station_number) {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i].NUMBER == station_number) {
            var marker = markers[i]
            fetch('/availability/' + marker)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    return data;
                })
                .then(data => {
                    thisAvailability = data;
                });
            console.log("this availability: ", thisAvailability);
        }
    }
}

// get current weather information
function getWeather() {
//    showWeather();
    fetch('/weather')
        .then((response) => response.json())
        .then(data => {
            return data
        })
        .then((data) => {
            showWeather(data);
        });
}

//function to add markers to map - adds unique infoWindow for each
function addMarkers(stations) {
    console.log("addMarkers function called")
    //create infoWindow for marker onclick event
    var infoWindow = new google.maps.InfoWindow();
    var image = "/static/purple_marker.svg";

    //loop through data array of locations and create a marker at each one
    for (var i = 0; i < stations.length; i++) {
        var marker = new google.maps.Marker({
            position: {lat: stations[i].position_lat, lng: stations[i].position_long},
            map,
            title: stations[i].address,
            station_number: stations[i].NUMBER,
            icon: image,
        });
        markers.push(marker);
        // add marker popup to each
        google.maps.event.addListener(marker, 'click', (function (marker) {
            var content = 'Name: ' + stations[i].address + '<br>Number: ' + stations[i].NUMBER;
//            content += '<br>'+availability;
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
    console.log("initMap function called");

    // fill map with station markers through getStations when loading map
    getStations();
}

// return closest marker from array - from https://stackoverflow.com/questions/45537011/google-map-api-get-closest-place-to-me-in-my-address
function rad(x) {
    return x * Math.PI / 180;
}

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

    return (markers[closest].position);
}

// center map on user location when looking for or returning a bike -- using sample location due to https requirement for geolocation --
function returnUserLocation(){
    var UserLocation = {lat:53.3044737, lng:-6.2197716,};
    var closestMarker = find_closest_marker(UserLocation);
    directions(UserLocation, closestMarker);
    // Try HTML5 geolocation
//    if (navigator.geolocation){
//        console.log("looking for your location.")
//        navigator.geolocation.getCurrentPosition((position) =>{
//            var pos = {
//                lat: position.coords.latitude,
//                lng: position.coords.longitude,
//            };
//            UserLocation = pos;
//            console.log("UserLocation from returnUserLocation():", UserLocation);
//            var closestMarker = find_closest_marker(UserLocation);
//            directions(UserLocation, closestMarker);
//        },
//        () => {
//            handleLocationError(true, marker, map.getCenter());
//        });
//    } else {
//        // Browser doesn't support geolocation
//        handleLocationError(false, marker, map.getCenter());
//    }

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
    var directionService = new google.maps.DirectionsService();
    var directionRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
//    hideMarkers();
    var image = "/static/small_cross.svg";
    var request = {
        origin: start,
        destination: end,
        travelMode: 'WALKING'
    };
    directionService.route(request, function (result, status) {
        if (status == 'OK') {
            directionRenderer.setMap(map);
            directionRenderer.setDirections(result);
        }
    });
}

//read user input and vary div output depending on choice
document.getElementById("need_bike").onclick = function () {
    needBike();
    returnUserLocation();
}
document.getElementById("return_bike").onclick = function () {
    returnBike();
    returnUserLocation();
}
document.getElementById("plan_trip").onclick = function () {
    showTrip()
}
document.getElementById("list_stations").onclick = function () {
    listStations();
    openNav();
}
document.getElementById("get_weather").onclick = function () {
    getWeather();
}

//functions for user input choice - need, return and plan
function needBike() {
    document.getElementById('mapHeader').innerHTML = 'Finding your closest Bike...';
}

function returnBike() {
    document.getElementById('mapHeader').innerHTML = 'Finding your closest Station...';
    returnUserLocation();
}

// show div containing information for trip planned by user - best stations and weather forcast
function showTrip() {
    document.getElementById('mapHeader').innerHTML = 'Plan your trip...';
    document.getElementById('trip_info').style.display = 'block';
    dragElement(document.getElementById('trip_info'));
    var content = '';
    document.getElementById('trip_data').innerHTML += content;
    document.getElementById('date_chosen').onclick = function () {
        getTripInfo()
    };
}

function getPrediction(start_station, day) {
    fetch('prediction/' + start_station + '/' + day) // Replace '117' with actual station numbers
        .then(response => response.json())
        .then(data => {
            drawPredictionChart(data)
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function getTripInfo() {
    var day = document.getElementById("dayOfTrip").value;
    var s = document.getElementById("startLocation").value;
    var e = document.getElementById("endLocation").value;
    var start_station;
    var end_station;

    markers.forEach(start => {
        if (start.title == s) {
            markers.forEach(end =>{
                if (end.title == e){
                    console.log(start);
                    start_station = start.NUMBER;
                    end_station = end.NUMBER;
                    directions(start.position, end.position);
                    // get prediction for station and day, display in chart
                    getPrediction(start.station_number, day);
                }
            });
        }
    });
    document.getElementById('trip_data').innerHTML = '<strong>Day: </strong>'+day+'<br><strong>From: </strong>'+s+' <strong>to</strong> '+e;

}

// list stations from json into side panel - each calls getAvailability(station_number) onclick
function listStations() {
    for (var i = 0; i < 114; i++) {
        var content = '<a href="javascript:void(0)" onclick="moreInfo(' + stations[i].NUMBER + ')">' + stations[i].address + '</a>';
        document.getElementById('stationsSidepanel').innerHTML += content;
        var station = '<option value="'+stations[i].address+'">'+stations[i].address+'</option>';
        document.getElementById('startLocation').innerHTML += station;
        document.getElementById('endLocation').innerHTML += station;
    }
}

// show current weather info - called from getWeather() fetch response
function showWeather(data) {
    document.getElementById('weather_info').style.display = 'block';
    var weather = data.weather;
    var temp = data.temp;
    var time = data.time;
    document.getElementById('weather_data').innerHTML = "<strong>Weather:</strong> " + weather + "<br><strong>Temp:</strong> " + temp + "℃<br><strong>Time:</strong> " + time;
    dragElement(document.getElementById('weather_info'));
}

// make div elements draggable - sourced from W3 Schools
dragElement(document.getElementById('more_station_info'));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get cursor position at startup
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
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

    function closeDragElement() {
        // stop moving when mouse released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// live tracking of user location ---- not used on server ----
//const successCallback = (position) => {
//  console.log(position);
//};
//
//const errorCallback = (error) => {
//  console.log(error);
//};
//navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
//const id = navigator.geolocation.watchPosition(successCallback, errorCallback);

function drawPredictionChart(prediction) {
    // convert prediction from array of objects to array of array
    var arrayContainer = [];
    // add the headers to array
    arrayContainer.push(['hour', 'available_bikes', 'available_bike_stands'])
    prediction.forEach(hourOfPred => arrayContainer.push([hourOfPred.hour.toString(), hourOfPred.available_bikes, hourOfPred.available_bike_stands]));
    var data = google.visualization.arrayToDataTable(arrayContainer);
    var options = {
        title: 'Availability Prediction',
        isStacked: 'percent',
        legend: {position: 'top',},
        hAxis: {minValue: 0,},
        height: 300,
    };

    var chart = new google.visualization.BarChart(document.getElementById('myChart'));
    chart.draw(data, options);
}

// initialise map on browser window
var ClickStart = null;
var ClickEnd = null;
var map = null;
window.initMap = initMap;
