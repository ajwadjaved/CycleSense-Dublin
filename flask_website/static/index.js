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
//add markers to map at all station locations -- not working -------
function addMarkers(stations) {
//var markerBounds = new google.maps.LatLngBounds();
stations.forEach(station => {
    var OtherLatLng = {lat: station.latitude, lng: station.longitude};
    console.log(OtherLatLng); //this one works
    var LatLng = new google.maps.LatLng (station.latitude, station.longitude);
    console.log(LatLng); //this one does not work
    console.log(typeof LatLng);

        var marker = new google.maps.Marker({
            position: {LatLng},
            map,
            title: station.name,
            station_number: station.number,
            });
        console.log(marker.title); //name being read correctly
        console.log(marker.position); //position not being read correctly
        console.log(marker.station_number); //number being read correctly
   });

}

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
    zoom: 13, center: dublin,});

    //make array of station names and locations in corresponding order
    var testStationNames = ['Smithfield North', 'Wilton Terrace'];
    var testStationLoc = [{lat:53.349562, lng:-6.278198}, {lat:53.340714 , lng:-6.308191}];
    var testMarkerArray = [];
    var infoWindow = new google.maps.InfoWindow();
    console.log(testStationNames);
    console.log(testStationLoc);
    console.log(testMarkerArray);

    //make markers for each station, including info windows for each when clicked
    for (let i=0; i<testStationNames.length; i++) {
        var testContent =
            '<div id="content">'+
            '<div id="siteNotice">'+
            '<div>'+
            '<h2>Variable Location Name</h2>'+
            '<div id="popupContent">'+
            '<p>This is a window that shows up when you click on a Marker on the Map'+
            '<br>The values of this content should vary depending which marker is clicked.</p>'+
            '<p>click <a href="#">here</a> to show more info</p>'+
            '</div>'+
            '</div>';
        var marker = new google.maps.Marker({
            position: {lat: testStationLoc[i].lat, lng: testStationLoc[i].lng},
            map,
            title: testStationNames[i],
        });
        testMarkerArray.push(marker);

        google.maps.event.addListener(marker, 'click', (function(marker) {
            return function() {
                infoWindow.setContent(testStationNames[i]);
                infoWindow.open(map, marker);
            }
        })(marker, i));

        };

    console.log(testMarkerArray);


//    getStations();

    //initialise marker array for use
    const markerArray = [];
    //create directions service object
    const directionsService = new google.maps.DirectionService();
    //create a renderer for locations and bind it to the map
    const directionsRenderer = new google.maps.DirectionsRenderer({map:map});
    //create info window for makers when clicked during route for direction info
    const stepDisplay = new google.maps.InfoWindow();

    //call function to display route between initial start and end locations
    calcAndDisplayRoute (
        directionsRenderer,
        directionsService,
        markerArray,
        stepDisplay,
        map
    );

    //call function to check if start and end are changing and recalculate route accordingly
    const onChangeHandler = function() {
        calcAndDisplayRoute (
            directionsRenderer,
            directionsService,
            markerArray,
            stepDisplay,
            map
        );
    };

    //check for user input for start and end locations
    document.getElementById("start").addEventListener("change", onChangeHandler);
    document.getElementById("end").addEventListener("change", onChangeHandler);

}

function calcAndDisplayRoute(directionsRenderer,directionsService,markerArray,stepDisplay,map,) {
        //remove any existing markers from map
        for (let i=0; i < markerArray.length; i++) {
            markerArray[i].setMap(null);
            }
        //retrieve start and end locations and route the directions
        directionsService.route({
            origin: document.getElementById('start').value,
            destination: document.getElementById('end').value,
            travelMode: google.maps.TravelMode.WALKING,
            })
        .then ((result) => {
            document.getElementById('warningsPanel').innerHTML =
                '<br>'+ result.routes[0].warnings +'</br>';
            directionsRenderer.setDirections(result);
            showSteps(result, markerArray, stepDisplay, map);
            })
        .catch((e) => {
            window.alert('Directions request failed due to '+ e);
            });
    }

function showSteps(directionResult, markerArray, setDisplay, map) {
    const myRoute = directionResult.routes[0].legs[0];

    for (let i=0; i<myRoute.steps.length; i++) {
        //add a marker for each location in array
        const marker = (markerArray[i] = markerArray[i] || new google.maps.Marker());

        marker.setMap(map);
        marker.setPosition(myRoute.steps[i].start_location);
        //call function to add info window to each marker
        attachInstructionText(
            stepDisplay,
            marker,
            myRoute.steps[i].instructions,
            map);
    }

}

//add text to markers in route
function attachInstructionText(stepDisplay, marker, text, map) {
    google.maps.event.addListener(marker, 'click', () => {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}

var map = null;
window.initMap = initMap;
