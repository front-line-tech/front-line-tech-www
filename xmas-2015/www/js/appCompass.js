var appCompass = {
	
	canvas : null,
	ctx : null,
	needle : null,
	img : null,

	interval : null,
	targetLat : null,
	targetLng : null,
	
	degrees : 0,
	targetDegrees : null,
	headingDegrees : 0,
	targetHeadingDegrees : null,
	targetDistance : null,

	compassWatch : null,
	orientationListener : null,
	
	setTarget : function(lat, lng) {
		appCompass.targetLat = lat;
		appCompass.targetLng = lng;
	},
	
	initPageContent : function(element) {
		var html = 
			'<canvas id="compass-canvas" width="200" height="200"></canvas>' +
			'<span id="compass-degrees-text"></span>';
			
		html += '<div class="go-outside-message" style="display: none;">No GPS signal. Please go outside.</div>';
		html += '<div class="move-and-hold-ahead-message" style="display: none;">Please move and hold the phone ahead of you.</div>';
		html += '<div class="no-compass-support-message" style="display: none;">Please determine North using an external compass!</div>';
		html += '<div class="compass-orientation-data">Retrieving orientation data...</div>';
		html += '<div class="target-description-text">Retrieving target data...</div>';
		element.html(html);
	},
	
	initHeadingCompass : function() {
		if (window.DeviceOrientationEvent) {
			// this is normal html5 -- there should be a device orientation event
			console.log('adding device orientation listener');
			appCompass.orientationListener = window.addEventListener('deviceorientation', function(event) {
				var alpha = event.alpha;
				var beta = event.beta;
				var gamma = event.gamma;
				var summary = 'alpha: ' + alpha + ', beta: ' + beta + ', gamma: ' + gamma;
				var summary_html = 
					'alpha: ' + alpha.toFixed(4) + 
					'<br/>beta: ' + beta.toFixed(4) + 
					'<br/>gamma: ' + gamma.toFixed(4);
				console.log(summary);
				$('.compass-orientation-data').html(summary_html);
				
				if(alpha !== null) {
					appCompass.targetHeadingDegrees = alpha;
				}
				
			}, false);
			
		} else {
			// fall back on compass.js!
			
			Compass.noSupport(function () {
				$('.no-compass-support-message').show();
			});
			
			Compass.needGPS(function () {
				$('.go-outside-message').show();          // Step 1: we need GPS signal
			}).needMove(function () {
				$('.go-outside-message').hide()
				$('.move-and-hold-ahead-message').show(); // Step 2: user must go forward
			}).init(function () {
				$('.move-and-hold-ahead-message').hide(); // GPS hack is enabled
			});
			
			appCompass.compassWatch = Compass.watch(function (heading) {
				console.log('heading: ' + heading);
				appCompass.targetHeadingDegrees = heading;
			});
		}
	},
	
	start : function() {
		appCompass.canvas = document.getElementById('compass-canvas');
		
		if (appCompass.canvas.getContext('2d')) {
			appCompass.ctx = appCompass.canvas.getContext('2d');
	
			// Load the needle image
			if (appCompass.needle === null) {
				appCompass.needle = new Image();
				appCompass.needle.src = 'images/needle.png';
			}
	
			// Load the compass image
			if (appCompass.img === null) {
				appCompass.img = new Image();
				appCompass.img.src = 'images/compass.png';
				appCompass.img.onload = appCompass.imgLoaded;
			} else {
				appCompass.imgLoaded();
			}
			
		} else {
			alert("Canvas not supported!");
		}
		
		appCompass.initHeadingCompass();
	},
	
	clearCanvas : function() {
		appCompass.ctx.clearRect(0, 0, 200, 200);	
	},
	
	imgLoaded : function() {
		if (appCompass.interval === null) {
			appCompass.interval = window.setInterval(appCompass.draw, 100);
			console.log('appCompass started');
			appCompass.draw();
		}
	},
	
	stop : function() {
		if (appCompass.interval !== null) {
			window.clearInterval(appCompass.interval);
			appCompass.interval = null;
			console.log('appCompass stopped');
		}
		
		if (appCompass.compassWatch !== null) {
			Compass.unwatch(appCompass.compassWatch);
			appCompass.compassWatch = null;
			console.log('heading compass stopped');
		}
		
		if (appCompass.orientationListener !== null) {
			window.removeEventListener('deviceorientation', appCompass.orientationListener);
			appCompass.orientationListener = null;
			console.log('orientation listener stopped');
		}
	},
	
	draw : function() {
		appCompass.clearCanvas();
		var ctx = appCompass.ctx;
		
		ctx.save();
		
		ctx.translate(100, 100);
		if (appCompass.targetHeadingDegrees !== null) {
			//if (appCompass.headingDegrees < appCompass.targetHeadingDegrees) { appCompass.headingDegrees += 5; }
			//if (appCompass.headingDegrees > appCompass.targetHeadingDegrees) { appCompass.headingDegrees -= 5; }
			appCompass.headingDegrees = appCompass.targetHeadingDegrees;
			
			//('#compass-canvas').css('transform', 'rotate(' + (-appCompass.headingDegrees) + 'deg)');
			ctx.rotate(appCompass.headingDegrees * (Math.PI / 180));
		}
		
		// Draw the compass onto the canvas
		ctx.drawImage(appCompass.img, -100, -100);
		
		if (appCompass.targetLat !== null && appCompass.targetLng !== null) {
			var p2 = { y: app.coords.latitude, x: app.coords.longitude }; 
			var p1 = { y: appCompass.targetLat, x: appCompass.targetLng };



			// var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
			//var angleDeg = 270 - (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI);
			//angleDeg = angleDeg % 360;
			
			var angleDeg = appCompass.getBearing(p2.y, p2.x, p1.y, p1.x);
			
			appCompass.targetDegrees = angleDeg;
			appCompass.targetDistance = appCompass.getDistanceFromLatLonInKm(p1.y, p1.x, p2.y, p2.x);
			var targetSummary = 
				'target alpha: ' + appCompass.targetDegrees.toFixed(4) + 
				'<br/>target distance: ' + appCompass.targetDistance.toFixed(2);
			$('.target-description-text').html(targetSummary);
			
			if (appCompass.degrees < angleDeg) { appCompass.degrees += 5; }
			if (appCompass.degrees > angleDeg) { appCompass.degrees -= 5; }
			
			//$('#compass-degrees-text').text(compass.degrees.toFixed(1));
		
			// Now move across and down half the 
			// ctx.translate(100, 100);
		
			// Rotate around this point
			ctx.rotate(appCompass.degrees * (Math.PI / 180));
		
			// Draw the image back and up
			ctx.drawImage(appCompass.needle, -100, -100);
		
		}
		
		// Restore the previous drawing state
		ctx.restore();
	},
	
	getDistanceFromLatLonInKm : function(lat1,lon1,lat2,lon2) {
		var R = 6371; // Radius of the earth in km
		var dLat = appCompass.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = appCompass.deg2rad(lon2-lon1); 
		var a = 
			Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.cos(appCompass.deg2rad(lat1)) * Math.cos(appCompass.deg2rad(lat2)) * 
			Math.sin(dLon/2) * Math.sin(dLon/2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in km
		return d;
	},

	deg2rad : function(deg) {
		return deg * (Math.PI/180)
	},
	
	getBearing : function(startLat,startLong,endLat,endLong){
		startLat = radians(startLat);
		startLong = radians(startLong);
		endLat = radians(endLat);
		endLong = radians(endLong);
		
		var dLong = endLong - startLong;
		
		var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
		if (Math.abs(dLong) > Math.PI){
			if (dLong > 0.0)
			dLong = -(2.0 * Math.PI - dLong);
			else
			dLong = (2.0 * Math.PI + dLong);
		}
		
		return (degrees(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
	}
};

function radians(n) {
	return n * (Math.PI / 180);
}
function degrees(n) {
	return n * (180 / Math.PI);
}
