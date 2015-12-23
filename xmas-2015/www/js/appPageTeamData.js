var pageTeamData = {
	
	refresh : function() {
		var gameData = app.gameData;
		
		// TODO: populate team data page with achievements so far
		console.log('refreshing team page for: ', gameData.team.team_id);
		
		$('#text-score').text(gameData.team.score);
		$('#text-total').text(gameData.max_points);
		
		if (gameData.team.score > 0) {
			var pct = (gameData.team.score / gameData.max_points) * 100;
			$('#text-score-percent').text(pct.toFixed(2));
		} else {
			$('#text-score-percent').text("0.00");
		}

		var events = gameData.team.events;

		$('#text-clues-total').text(events.length);
		
		var listItems = '';
		for (var e = 0; e < events.length; e++) {
			var event = events[e];
			var title = event.event_title;
			var event_id = event.event_id;
			var content_data = event.content_data;
			var content_type = event.content_type;
			var pin_lat = event.event_pin.lat;
			var pin_lon = event.event_pin.lon;
			
			if (pin_lat && pin_lon && pin_lat !== null && pin_lon !== null) {
				var complex = 
					'<a id="team-link-to-event-'+e+'">'
						+ '<h2>' 
						+ title
						+ '</h2>'
						+ '</a>'
						+ '<a onclick="pageMap.visit(); pageMap.centre('+pin_lat+','+pin_lon+'); return false;">' +
							// 'class="ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-left ui-icon-location">'
							// + '</button>'
						+ '</a>';						
				listItems += '<li>'+complex+'</li>';
				
			} else {
				var simple = '<a id="team-link-to-event-'+e+'"><h2>' + title + '</h2></a>';
				listItems += '<li>'+simple+'</li>';
			}
			
			
		}
		
		$('#team-events-list').html(listItems);
		$('#team-events-list').listview('refresh');
		
		for (var l = 0; l < events.length; l++) {
			console.log('setting up link to event: ' + events[l].event_title);
			$('#team-link-to-event-'+l).on('click', events[l], function(event) {
				pageContent.show(event.data);
			});
		}
		
		if (events.length === 0) {
			$('#no-events-text').show();
		} else {
			$('#no-events-text').hide();
		}
		
		// and cascade the update to the map
		pageMap.addAllMarkers(events);
	},
	
	notifyNewItems : function(text) {
		console.log('notification');
		$('#text-popup-new-events').text('');

		var windowWidth = $(window).width();
		var popupWidth = windowWidth * 0.8;
		console.log('window width: ' + windowWidth);
		console.log('popup width: ' + popupWidth);

		$('#popup-new-events-content-div').width(popupWidth);
		var left = (windowWidth - popupWidth) / 2;
		
		$("#popup-new-events").popup("open", { positionTo: "window", x: left });
		
		$('#text-popup-new-events').typewriting(text, {
			"typing_interval": 50,
			"blink_interval": "1s",
			"cursor_color": "#00fd55"
		}, function() {
			console.log("completed typing.");
		});
	}

};

