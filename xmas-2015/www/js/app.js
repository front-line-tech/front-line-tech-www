var app = {
	geo_running : false,
	geo_watch : null,
	coords : { latitude: null, longitude: null, altitude: null },
	checkin_running : false,
	checkin_timer : null,
	
	team : null, // is user
	game_id : null,
	gameData : { game_id : null, teams : [], team : null },
	
	init : function() {
		console.log('initialising app...');
		
		sounds.init();
		sounds.loadSound('audio/whistle.wav', true);
		console.log('sound load initialised');
		
		// page on-show events
		$(":mobile-pagecontainer").on("pagecontainershow", function(event, ui) {
			var pageId = ui.toPage[0].id; 
			console.log('detected page: ' + pageId);
			
			// return to front page if no game_id (and not going to front page already)
			if (app.game_id === null && pageId !== 'page-login') {
				console.log('returning to login page');
				$(":mobile-pagecontainer").pagecontainer("change",
					"#page-login", 
					{ transition: "fade" });
					return;
			}

			// switch pages
			try {
				switch(pageId) {
				case 'page-login':
					app.stopGeo();
					app.stopCheckins();
					break;
					
				case 'page-team-summary':
					console.log(pageId + ' loading data...');
					app.refreshGameData(pageTeamData.refresh);
					$('#page-content-content').html(''); // special - wipe the content display
					appCompass.stop(); // special - stop the compass if running
					break;
					
				case 'page-map':
					console.log(pageId + ' initialising...');
					pageMap.init();
					$('#page-content-content').html(''); // special - wipe the content display
					pageMap.resizeMapToFit();
					break;
				}
				
			} catch (e) {
				appUI.hideLoader();
				console.warn(e);
			}
		});
		
		console.log('app initialised.');
	},

	refreshGameData : function(call_back, showLoader) {
		if (showLoader) { appUI.showLoader('refreshing team data...'); }
		var url = BaasBox.endPoint + '/plugin/team.data/' + app.game_id;
	    var req = $.get(url)
	      .done(function (res) {
	      	console.log("game data refreshed: ", res.data);
			app.gameData = res.data;
			if (showLoader) { appUI.hideLoader(); }
			if (call_back !== null) { call_back(); }
	      })
	      .fail(function (error) {
	        console.log(error.responseText, error);
			app.gameData = null;
			if (showLoader) { appUI.hideLoader(); }
	      });
	},
	
	login : function(user, password, game) {
		if (user === null || password === null || game === null) {
			console.log('1 or more of user/password/game were null');
			return;
		}
		
		var u = user.toLowerCase().trim();
		var p = password.toLowerCase().trim();
		var g = game.toLowerCase().trim();
		
		app.game_id = g;
		appUI.showLoader('signing in...');
		
		BaasBox.login(u, p)
			.done(function (user) {
				console.log("Logged in ", user);
				appUI.hideLoader();
				app.team = user;
				$(":mobile-pagecontainer").pagecontainer("change",
					"#page-team-summary", 
					{ transition: "flow" });
					
				app.startGeo();
				app.startCheckins();
			})
			.fail(function (err) {
				console.warn("error ", err);
				appUI.hideLoader();
				alert('Failed to sign in. Please try again.');
				app.team = null;
				app.gameData = null;
				app.game_id = null;
			});
	},

	startGeo : function() {
		if (!app.geo_running || app.geo_watch === null) {
			app.geo_watch = geo.watch(app.processGeo);
			app.geo_running = true;
			console.log('watching location');
		}
	},
	
	stopGeo : function() {
		if (app.geo_running || app.geo_watch !== null) {
			geo.clearWatch(app.geo_watch);
			app.geo_watch = null;
			app.geo_running = false;
			console.log('stopped location watch');
		}
	},
	
	startCheckins : function() {
		if (!app.checkins_running) {
			app.checkin_timer = window.setInterval(app._doCheckin, 30000);
			console.log('started checkin intervals');
		}
	},
	
	stopCheckins : function() {
		if (app.checkins_running) {
			window.clearInterval(app.checkin_timer);
			console.log('stopped checkins');
		}
	},

	/** performs a checkin with the current location, shows an indicator to the user that this is happening */
	doCheckin : function() {
		try {
			app.checkin(app.coords.latitude, app.coords.longitude, app.coords.altitude, '', pageTeamData.refresh, true);
		} catch (e) {
			console.warn(e);
		}
	},
	
	/** like doCheckin, but 'quiet' -- without user notification */
	_doCheckin : function() {
		try {
			app.checkin(app.coords.latitude, app.coords.longitude, app.coords.altitude, '', pageTeamData.refresh, false);
		} catch (e) {
			console.warn(e);
		}
	},
	
	processGeo : function(position) {
		try {
			console.log("processing geo:",position.coords);
			app.coords = position.coords;
			pageMap.updateCurrentLocationMarker(app.coords);
		} catch (e) {
			console.warn('error processing geo', e);
		}
	},

	checkin : function(lat, lon, alt, keyword, call_back, showLoader) {
		var url = BaasBox.endPoint + '/plugin/team.checkin/' + app.game_id;
		
		var lowerKeyword = null;
		if (keyword !== null) {
			lowerKeyword = keyword.toLowerCase().trim();
		}
		
		var checkin = {
			game_id : app.game_id,
			team_id : app.team.username,
			lat : lat,
			lon : lon,
			alt : alt,
			keyword : lowerKeyword
		};
		console.log('checkin submission:', checkin);
		
		if (showLoader) { appUI.showLoader('transmitting checkin data...'); }
		var req = $.post(url, checkin)
	      .done(function (res) {
	      	console.log("checkin completed, events received: ", res.data);
			if (showLoader) { appUI.hideLoader(); }
			
			// res.data is an array of NEW events -- notify the user of new items
			if (res.data.length > 0) {
				
				//document.getElementById('game-whistle').currentTime = 0;
				//document.getElementById('game-whistle').play();
				
				sounds.loadSound('audio/whistle.wav', true);
				
				var events = res.data;
				app._displayNewItems(events);
				
				// check for items to show later
				for (var i = 0; i < events.length; i++) {
					var event = events[i];
					for (var j = 0; j < event.additional_unlocks.length; j++) {
						app._scheduleCheckin(
							event.additional_unlocks[j].delay_ms, 
							event.additional_unlocks[j].keyword);
					}
				}
			} // if there's anything received
			
			if (showLoader && res.data.length === 0) {
				pageTeamData.notifyNewItems('No new items received.');
			}
			
			// always refresh game data -- could be some new events from other players
			if (call_back !== null) {
				app.refreshGameData(call_back, showLoader); 
			} else {
				app.refreshGameData(null, showLoader);
			}
	      })
	      .fail(function (error) {
	        console.warn(error.responseText, error);
			if (showLoader) { appUI.hideLoader(); }
			app._scheduleCheckin(5000, lowerKeyword);
	      });
	},

	_scheduleCheckin : function(delay, keyword) {
		var localDelay = delay;
		window.setTimeout(function() {
			console.log('scheduled checkin occurring, keyword: ' + keyword);
			app.checkin(app.coords.latitude, app.coords.longitude, app.coords.altitude, keyword, pageTeamData.refresh, false);	
		}, localDelay);
		console.log('checkin scheduled with keyword: ' + keyword + ' in: ' + localDelay + ' ms.');
	},
		
	_displayNewItems : function(events) {
		var wait = Array(32).join(" ");
		var lines = new Array();
		lines.push('<b>' + events.length + ' new items received...' + '</b>');
		lines.push(wait);
		for (var i = 0; i < events.length; i++) {
			lines.push((i+1) + '. ' + wait + events[i].event_title);
		}
		
		var typetext = lines.join('<br/>');
		pageTeamData.notifyNewItems(typetext);
	}
	
};
