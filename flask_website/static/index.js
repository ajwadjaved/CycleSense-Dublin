  //initialize the map
  function initMap() {
                //function to call map from google maps API server -> set start location to dublin and appropriate zoom
                var dublin = {lat: 53.350140, lng: -6.266155};

                var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 13, center: dublin,});

                new google.maps.Marker({
                position: dublin,
                map,
                title: 'dublin',});

                getStations();
}
//get stations names and locations
function getStations() {
fetch('../static/locations.json')
.then((response) => response.json())
.then(data => {console.log(data); return data;})
.then((data) => {
    console.log("fetch response", typeof data);
    addMarkers(data);
    });
}
//add markers to map at all station locations
function addMarkers(stations) {
stations.forEach(station => {
    var LatLng = {lat: station.latitude, lng: station.longitude};
        var marker = new google.maps.Marker({
            position: LatLng,
            map,
            title: station.name,
            });
   });
}
var map = null;
window.initMap = initMap;
