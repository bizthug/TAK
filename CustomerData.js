var response = null;

var map, infoWindow, geocoder, infowindow;
var markers = [];
var addressName = "";
var txtProvince = "";
var txtDistrict = "";
var txtSubDistrict = "";
var txtProvinceId = "";
var txtDistrictId = "";
var txtSubDistrictId = "";
var country = "";
var zipCode = "";
var firstLoad = true;
var lat;
var lng;
var oid = 0;
var sid = 0;

var first = null
function LoadMap() {
    //var main = document.getElementById('mainMap')
    //var data = { zoom: 11, center: { lat: 13.75582, lng: 100.567428 } }
    //first = new google.maps.Map(main, data)
    //new google.maps.Marker({ map: first, position: { lat: 13.755824, lng: 100.567428 } })
    console.log(lat);
    console.log(lng);
    initMap(lat, lng);
}
function initMap(locationLat, locationLng) {
    var getCurrent = false;
    if (locationLat == undefined || locationLat == 0) {
        locationLat = 13.756705;
        getCurrent = true;
    }
    if (locationLng == undefined || locationLng == 0) {
        locationLng = 100.5529023;
        getCurrent = true;
    }
    map = new google.maps.Map(document.getElementById('mainMap'), {
        zoom: 8,
        center: { lat: locationLat, lng: locationLng },
        mapTypeControl: false,
        streetViewControl: false,
        //                myLocationControl: true
    });
    infoWindow = new google.maps.InfoWindow();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: locationLat,
                lng: locationLng
            };
            if (getCurrent) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            }

            map.setCenter(pos);

            geocoder = new google.maps.Geocoder;
            infowindow = new google.maps.InfoWindow;
            geocodeLatLng(geocoder, map, infowindow, pos);

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    map.addListener('click', function (event) {
        addMarker(event.latLng);
    });

    var card = document.getElementById('floating-panel');
    var input = document.getElementById('address');

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);
    autocomplete.setFields(
        ['address_components', 'geometry', 'icon', 'name']);

    autocomplete.addListener('place_changed', function () {
        clearMarkers();
        //                geocodeAddress(geocoder, map);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        map.setCenter(place.geometry.location);
        var pos = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
        };

        map.setCenter(pos);

        geocoder = new google.maps.Geocoder;
        infowindow = new google.maps.InfoWindow;
        geocodeLatLng(geocoder, map, infowindow, pos);
    });

    var mapBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat, lng),
        new google.maps.LatLng(lat, lng));
    var mapMinZoom = 12;
    var mapMaxZoom = 18;
    var overlay = new klokantech.MapTilerMapType(map, function (x, y, z) {
        return "https://tileserver.maptiler.com/campus/{z}/{x}/{y}.png".replace('{z}', z).replace('{x}', x).replace('{y}', y);
    },
        mapBounds, mapMinZoom, mapMaxZoom);

    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    var opacitycontrol = new klokantech.OpacityControl(map, overlay);

    var geoloccontrol = new klokantech.GeolocationControl(map, mapMaxZoom);
    map.fitBounds(mapBounds);
}

function addMarker(location) {
    deleteMarkers();
    var marker = new google.maps.Marker({
        position: location,
        map: map
    });
    markers.push(marker);
    geocodeLatLng(geocoder, map, infowindow, location, 17);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}

function clearMarkers() {
    setMapOnAll(null);
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function geocodeLatLng(geocoder, map, infowindow, pos, zoom, setValue, address) {
    if (zoom == undefined) {
        zoom = 15;
    }
    geocoder.geocode({ 'location': pos }, function (results, status) {
        if (status === 'OK') {
            if (results[0]) {
                map.setZoom(zoom);
                var marker = new google.maps.Marker({
                    position: pos,
                    map: map
                });
                markers.push(marker);
                infowindow.setContent(results[0].formatted_address);
                infowindow.open(map, marker);
                console.log(results[0].address_components);

                lat = pos.lat;
                $("#Latitude").val(pos.lat)
                lng = pos.lng;
                $("#Longitude").val(pos.lng)

                addressName = "";
                txtProvince = "";
                txtDistrict = "";
                txtSubDistrict = "";
                country = "";
                zipCode = "";

                var address2 = "";

                for (var i = 0; i < results[0].address_components.length; i++) {
                    var row = results[0].address_components[i];
                    var type = row.types[0];
                    if (row.types.length == 3) {
                        type = row.types[2];
                    }

                    var adValue = row.long_name;

                    // street_number, premise, route ต้องเอามาต่อกัน
                    if (type == "street_number" || type == "premise" || type == "intersection") {
                        addressName = adValue;
                    } else if (type == "route") {
                        addressName += (" " + adValue);
                    } else if (adValue.indexOf("แขวง") != -1 || adValue.indexOf("ตำบล") != -1) {
                        txtSubDistrict = adValue.replace(" ", "").replace("แขวง", "").replace("ตำบล", "");
                        address2 += (" " + adValue);
                    } else if (adValue.indexOf("เขต") != -1 || adValue.indexOf("อำเภอ") != -1) {
                        txtDistrict = adValue.replace(" ", "").replace("เขต", "").replace("อำเภอ", "");
                        address2 += (" " + adValue);
                    } else if (type == "administrative_area_level_1") {
                        txtProvince = adValue;
                        address2 += (" " + adValue);
                    } else if (type == "country") {
                        country = adValue;
                        address2 += (" " + adValue);
                    } else if (type == "postal_code") {
                        zipCode = adValue;
                        address2 += (" " + adValue);
                    }

                }

                //setselect2Address(txtProvince, txtDistrict, txtSubDistrict);
                $("#currentAddress2").val(address2);

                if ($("#currentAddress").val().length == 0 || (!firstLoad)) {
                    $("#currentAddress").val(addressName);
                }
                firstLoad = false;
                if (setValue) {
                    $("#currentAddress").val(address);
                }

            } else {
                window.alert('No results found');
            }
        } else {
            window.alert('Geocoder failed due to: ' + status);
        }
    });
}

function geocodeAddress(geocoder, resultsMap) {
    clearMarkers();
    var address = document.getElementById('address').value;
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var pos = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };

            map.setCenter(pos);

            geocoder = new google.maps.Geocoder;
            infowindow = new google.maps.InfoWindow;
            geocodeLatLng(geocoder, map, infowindow, pos);
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}


