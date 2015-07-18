
var map;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var marker;
var validLocation = false;

var lon;
var lat;

$(document).ready(function(){

  var url = window.location.href;
  var urlVars = url.split('/');

  console.log(url);
  console.log(urlVars);

  lat = urlVars[urlVars.length-2];
  lon = urlVars[urlVars.length-1];

  $('#bars').on('click', function(){
    if ($('#links-div').css('display') === 'none'){
      $('#links-div').css('display', 'block');
    } else {
      $('#links-div').css('display', 'none');
    }
  })

  init();

    $('#dist-range').on('change', function() {
      $('#dist-range-input').val($('#dist-range').val());
    });

    $('#cost-range').on('change', function(){
      $('#cost-range-input').val($('#cost-range').val());
    });

    $('#dist-range-input').keyup(function(){
      $('#dist-range').val($('#dist-range-input').val());
    });

    $('#cost-range-input').keyup(function(){
      $('#cost-range').val($('#cost-range-input').val());
    });
})

function init() {

  console.log("LET'S GO BOYZ");

  var latlng = new google.maps.LatLng(-19.646398, 46.500427);
  var myOptions = {
    zoom: 4,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    disableDefaultUI: false
  }

  if (document.getElementById('map-canvas')) {
    map = new google.maps.Map(document.getElementById('map-canvas'), myOptions);
    prepareGeolocation();
    doGeolocation();
  } else {
    prepareGeolocation();
  }
}

function doGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(positionSuccess, positionError);
  } else {
    positionError(-1);
  }
}

function positionError(err) {
  var msg;
  switch(err.code) {
    case err.UNKNOWN_ERROR:
      msg = "I CAN'T FIND YOU";
      break;
    case err.PERMISSION_DENINED:
      msg = "GIVE ME PERMISSION";
      break;
    case err.POSITION_UNAVAILABLE:
      msg = "NO ONE KNOWS WHERE YOU ARE";
      break;
    case err.BREAK:
      msg = "THIS IS TAKING FOREVER I'M GIVING UP";
      break;
    default:
      msg = "YOUR BROWSER SUCKS";
  }
  console.log(msg);
}

function positionSuccess(position) {
  // Centre the map on the new location
  var coords = position.coords || position.coordinate || position;
  var latLng = new google.maps.LatLng(coords.latitude, coords.longitude);

  console.log(coords.latitude);
  console.log(coords.longitude);

  map.setCenter(latLng);
  map.setZoom(12);
  marker = new google.maps.Marker({
    clickable: true,
    map: map,
    position: latLng,
    title: "WHERE'S MAH BOY"
  });

  console.log("LOOKIN' FOR MAH BOY");

  // And reverse geocode.
  mark = (new google.maps.Geocoder()).geocode({latLng: latLng}, function(resp) {
	  var place = "SOMEWHERE AROUND HERE";
	  if (resp[0]) {
		  var bits = [];
		  for (var i = 0, I = resp[0].address_components.length; i < I; ++i) {
			  var component = resp[0].address_components[i];
			  if (contains(component.types, 'political')) {
				  bits.push(component.long_name);
				}
			}
			if (bits.length) {
				place = bits.join(' , ');
			}
		}
		console.log("BOOOOOM GOTCHA");
    marker.setTitle(place);

    google.maps.event.addListener(marker, 'click', function() {
      console.log(marker.getTitle());
    });

    validLocation = true;

    console.log(lat);
    console.log(lon);

    route(marker.getPosition(), new google.maps.LatLng(lat, lon));
  });
}

function contains(array, item) {
  for (var i = 0, I = array.length; i < I; ++i) {
	  if (array[i] == item) {
      return true;
    }
	}
	return false;
}

function route(start, end){
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    var request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    }

  (new google.maps.Geocoder()).geocode({latLng: end}, function(resp) {
    var place = "SOMEWHERE AROUND HERE";
    if (resp[0]) {
      var bits = [];
      for (var i = 0, I = resp[0].address_components.length; i < I; ++i) {
        var component = resp[0].address_components[i];
        if (contains(component.types, 'political')) {
          bits.push(component.long_name);
        }
      }
      if (bits.length) {
        place = bits.join(' , ');
      }
    }
    console.log("BOOOOOM GOTCHA");
    $('#meetup-location').html(place);
  });
  });
}
