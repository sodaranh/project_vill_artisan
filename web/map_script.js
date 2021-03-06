var map;
var paris = { lat: 48.85816464940564, lng: 2.34283447265625 };
var markersFilter=[];
function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #8e3e3d';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = 'white';
    controlText.style.backgroundColor = '#8e3e3d';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.fontWeight = 'bold';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Centrer la carte';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Paris.
    controlUI.addEventListener('click', function () {
        map.setCenter(paris);
        map.setZoom(13);
    });
}

function VillageName(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #8e3e3d';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Name of the hovered village.';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.id = 'villageNameText';
    controlText.style.color = 'white';
    controlText.style.backgroundColor = '#8e3e3d';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '16px';
    controlText.style.fontWeight = 'bold';
    controlText.style.lineHeight = '38px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Paris';
    controlUI.appendChild(controlText);
}


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: paris,
        zoom: 13,
        scrollwheel: false,
        styles: /*#here copy your style*/[
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [
                    {
                        "visibility": "on"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            },
            {
                "featureType": "all",
                "elementType": "labels.icon",
                "stylers": [
                    {
                        "visibility": "off"
                    }
                ]
            }
        ]
    });

    //Create and open InfoWindow.
    var infoWindow = new google.maps.InfoWindow();

    for (var i = 0; i < markers.length; i++) {
        var data = markers[i];
        var myLatlng = new google.maps.LatLng(data.lat, data.lng);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon: 'web/assets/img/marker.png',
            opacity: 0.5,
            title: data.name
        });
        markersFilter.push(marker);
        //Attach click event to the marker.
        (function (marker, data) {
            google.maps.event.addListener(marker, "click", function (e) {
                //Wrap the content inside an HTML DIV in order to set height and width of InfoWindow.
                infoWindow.setContent("<div style = 'width:200px;min-height:40px'>" + data.description + "</div>");
                infoWindow.open(map, marker);
            });
        })(marker, data);
    }


    map.addListener('zoom_changed', function () {
        var current_zoom = map.getZoom();
        if (current_zoom >= 15) {
            marker.setOpacity(1);
        }
        else {
            marker.setOpacity(0.5);
        }
    });

    //Load Json file to draw polygons.
    map.data.loadGeoJson('web/coord.json');
    map.data.setStyle(function (feature) {
        return /** @type {google.maps.Data.StyleOptions} */({
            fillColor: 'transparent',
            strokeColor: feature.getProperty('strokeColor'),
            strokeWeight: 2,
            fillOpacity: feature.getProperty('fillOpacity')
        });
    });

    //Few event for UX.
    map.data.addListener('mouseover', function (event) {
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { strokeWeight: 5 });

        document.getElementById('villageNameText').textContent =
            event.feature.getProperty('name');
    });

    map.data.addListener('click', function (event) {
        var centerCoords = event.feature.getProperty('center');
        var latCoords = parseFloat(centerCoords.lat);
        var lngCoords = parseFloat(centerCoords.lng);
        map.setCenter({ lat: latCoords, lng: lngCoords });
        map.setZoom(15);
        map.data.revertStyle();
        map.data.overrideStyle(event.feature, { strokeWeight: 7, strokeColor: '#422c1f' });
    });

    /* MAP ADRESS IN HOME */
    var options = {
    };
    var input = document.getElementById('mapadress');

           $('#select_speciality').change(function () {
        console.log(markers);
        var res=[];
        // FILTER HERE
        var selectSpe = $('#select_speciality select option:selected').text();
        if (selectSpe == "Tous") {
            for (var i = 0; i < markers.length; i++) {
                markersFilter[i].setVisible(true);

            }
        } else {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].job != selectSpe) {
                    markersFilter[i].setVisible(false);
                } else {
                    markersFilter[i].setVisible(true);
                }
            }

        }
        google.maps.event.trigger(map, 'resize');
    });


    autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function () {
        var latElem = document.getElementById('adresslatitude');
        var lngElem = document.getElementById('adresslongitude');
        var place = autocomplete.getPlace();
        latElem.value = place.geometry.location.lat();
        lngElem.value = place.geometry.location.lng();
        var latCoords = parseFloat(latElem.value);
        var lngCoords = parseFloat(lngElem.value);
        map.setCenter({ lat: latCoords, lng: lngCoords });
        map.setZoom(15);
        var markerUser = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            icon: 'web/assets/img/markerGold.png',
            opacity: 0.5,
            title: data.name
        });
    });
    /*END  MAP ADRESS IN HOME */
    


    map.data.addListener('mouseout', function (event) {
        map.data.revertStyle();
    });

    // Create the DIV to hold the control and call the CenterControl() constructor
    // passing in this DIV.
    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv);

    var villageNameDiv = document.createElement('div');
    var villageName = new VillageName(villageNameDiv, map);

    villageNameDiv.index = 1;
    map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(villageNameDiv);



    /*var drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.MARKER,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        markerOptions: {
            icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png'
        },
        circleOptions: {
            fillColor: '#ffff00',
            fillOpacity: 1,
            strokeWeight: 5,
            clickable: false,
            editable: true,
            zIndex: 1
        }

    });
    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
        var str_input ='';
        var origin ='';
        if (event.type == google.maps.drawing.OverlayType.POLYGON) {
            $.each(event.overlay.getPath().getArray(), function(key, latlng){
                var lon = latlng.lng();
                var lat = latlng.lat();
                if(key == 0){
                    origin = '['+ lon +', '+ lat +']';
                }
                str_input += '['+ lon +', '+ lat +']'+ ',\n ';
            });
        }
        str_input = str_input + origin;
        console.log(str_input);

        // YOU CAN THEN USE THE str_inputs AS IN THIS EXAMPLE OF POSTGIS POLYGON INSERT
        // INSERT INTO your_table (the_geom, name) VALUES (ST_GeomFromText(str_input, 4326), 'Test')

    });

    */

}


