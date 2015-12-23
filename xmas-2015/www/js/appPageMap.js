var pageMap = {
	
	map : null,
    currentLocationImage : 'images/marker.png',
	clueImage : 'images/clue-marker.png',
    currentLocationMarker : null, 
	markerRecords : [],	
	setLat :51.5526001,
	setLon :-0.140957399,
	
	init : function() {
		if (pageMap.map === null) {
			console.log('map initialising...');
			pageMap.map = new google.maps.Map(document.getElementById('map'), {
				center: { lat: pageMap.setLat, lng: pageMap.setLon },
				zoom: 16,
				styles: pageMap.mapStyleGreys,
				mapTypeId: google.maps.MapTypeId.TERRAIN,
				mapTypeControlOptions: {
					mapTypeIds: [ /* google.maps.MapTypeId.TERRAIN */ ]
				},
			});
			
			try {
				pageMap.resizeMapToFit();
				
				if (app.coords.latitude !== null && app.coords.longitude !== null) {
					console.log('coordinates present during map setup -- initialising marker');
					pageMap.initCurrentLocationMarker(app.coords);
				}
			} catch (e) {
				console.log('error adjusting map', e);
			}
			
			// markers
			pageMap.addAllMarkers(app.gameData.team.events);
			
		} else {
			console.log('map already initialised');
		}
	},

	resizeMapToFit : function() {
		console.log('resizing map');
		var newWidth = $(window).width();
		var newHeight = $(window).height() - $('#page-map-header-div').height();
		console.log('window height: ' + $(window).height());
		console.log('header height: ' + $('#page-map-header-div').height());
		console.log('new height: ' + newHeight);
		$('#map').height(newHeight);
		$('#map').width(newWidth);
		google.maps.event.trigger(pageMap.map, 'resize');
	},

	addMarker : function(event) {
		var event_id = event.event_id;
		
		if (pageMap.map !== null &&
			event.event_pin.lat !== null && 
			event.event_pin.lon !== null) {
				
			console.log('map exists and event has pin data');

			// check for event id
			for (var i = 0; i < pageMap.markerRecords.length; i++) {
				var markerRecord = pageMap.markerRecords[i];
				if (markerRecord.event_id === event_id) { return; }
			}

			console.log('event is new to the map');
			
			// event id not found in marker records - so good to add
			var newRecord = {
				event_id : event.event_id,
				event_title : event.event_title,
				latitude : event.event_pin.lat,
				longitude : event.event_pin.lon,
				content_data : event.content_data,
				content_type : event.content_type
			};
			
			var latLng = { lat: event.event_pin.lat, lng: event.event_pin.lon };
			
			newRecord.marker = new google.maps.Marker({
				position: latLng,
				map: pageMap.map,
				title: newRecord.event_title,
				icon: pageMap.clueImage,
				optimized: false
			});
			
			pageMap.attachEventToMarker(newRecord.marker, event);

			console.log('marker added to map');
			
			pageMap.markerRecords.push(newRecord);
			
			console.log('marker added to page map record');
		}
	},

	markerCounter : 0,

	attachEventToMarker : function(marker, event) {
		/*
		var infoWindowButtonId = 'info-window-button-' + (pageMap.markerCounter++);
		var styledText = '<span class="infoWindowText">'+message+'</span>' +
			'<button id="' + infoWindowButtonId + '">show</button>';
			
		var infowindow = new google.maps.InfoWindow({
			content: styledText
		});
		*/
		
		marker.set('actual-event', event);
		marker.addListener('click', function() {
			var v = this.get('actual-event');
			pageContent.show(v);
		});
	},

	attachMessageToMarker : function(marker, message) {
		var styledText = '<span class="infoWindowText">'+message+'</span>';
		
		var infowindow = new google.maps.InfoWindow({
			content: styledText
		});
		
		marker.addListener('click', function() {
			infowindow.open(marker.get('map'), marker);
		});
	},
	
	addAllMarkers : function(events) {
		if (pageMap.map !== null) {
			console.log('checking ' + events.length + ' markers against the map');
			for (var e = 0; e < events.length; e++) {
				pageMap.addMarker(events[e]);
			}
		}
	},

    initCurrentLocationMarker : function(coords) {
        console.log('initialising current location marker...');
        if (pageMap.map !== null && pageMap.currentLocationMarker === null && coords) {
            var image = pageMap.currentLocationImage;
            pageMap.currentLocationMarker = new google.maps.Marker({
                position : { lat: coords.latitude, lng: coords.longitude },
                map: pageMap.map,
                icon: image,
                optimized: false
            });
			pageMap.currentLocationMarker.setPosition(new google.maps.LatLng(coords.latitude, coords.longitude));
			pageMap.currentLocationMarker.setTitle('lat: ' + coords.latitude + ', lng: ' + coords.longitude);
			pageMap.attachMessageToMarker(pageMap.currentLocationMarker, "You are here!");
        }
    },
    
    updateCurrentLocationMarker : function(coords) {
        console.log('updating current location marker...');
        if (pageMap.currentLocationMarker === null) {
			pageMap.initCurrentLocationMarker(coords);
		} else { 
            pageMap.currentLocationMarker.setPosition(new google.maps.LatLng(coords.latitude, coords.longitude));
        }
		if (pageMap.currentLocationMarker !== null) {
			pageMap.currentLocationMarker.setTitle('lat: ' + coords.latitude + ', lng: ' + coords.longitude);
		}
    },
	
	centre : function(lat, lon) {
		if (pageMap.map === null) {
			pageMap.setLat = lat;
			pageMap.setLon = lon;
		} else {
			pageMap.map.panTo(new google.maps.LatLng(lat, lon));
		}
	},
	
	mapStyleGreys : [{"featureType":"all","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"administrative","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"administrative.country","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.country","elementType":"geometry","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.country","elementType":"labels.text","stylers":[{"visibility":"simplified"}]},{"featureType":"administrative.province","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative.locality","elementType":"all","stylers":[{"visibility":"simplified"},{"saturation":"-100"},{"lightness":"30"}]},{"featureType":"administrative.neighborhood","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"all","stylers":[{"visibility":"simplified"},{"gamma":"0.00"},{"lightness":"74"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"landscape","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"landscape.man_made","elementType":"all","stylers":[{"lightness":"3"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels.text","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"geometry","stylers":[{"visibility":"simplified"},{"color":"#424242"},{"lightness":"-61"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"on"}]},{"featureType":"road","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#2a2727"},{"lightness":"-61"},{"saturation":"-100"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"on"}, {hue:"#060630"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels.text","stylers":[{"visibility":"off"}]}],
	

	visit : function() {
		$(":mobile-pagecontainer").pagecontainer(
			"change",
			"#page-map", 
			{ transition: "slide" });
	}	
};
