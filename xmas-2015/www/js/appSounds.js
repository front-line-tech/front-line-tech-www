/*
 * SUPER RUSHED BOTCHED JOB see here for how to do it properly:
 * http://www.html5rocks.com/en/tutorials/webaudio/intro/
 */

var sounds = {
	
	context : null,
	soundBuffer : null,
	soundLoaded : false,
	decoding : false,
	
	init : function() {
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		sounds.context = new AudioContext();
		sounds.soundLoaded = false;
		sounds.decoding = false;
	},
	
	loadSound : function(url, thenPlay) {
		sounds.playAfterDecoding = thenPlay;
		
		if (!sounds.soundLoaded && !sounds.decoding) {
			sounds.decoding = true;
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			// Decode asynchronously
			request.onload = function() {
				console.log('loaded data -- decoding');
				sounds.context.decodeAudioData(request.response, 
				function(buffer) {
					console.log('decoded');
					sounds.soundBuffer = buffer;
					sounds.soundLoaded = true;
					sounds.decoding = false;
					
					if (sounds.playAfterDecoding) {
						console.log('play after decode');
						sounds.playAfterDecoding = false;
						sounds.play();
					}
				}, 
				function() {
					console.log('decode failed');
					sounds.decoding = false;
					sounds.soundLoaded = false;
					alert('An error occurred loading sound.');
				});
			};
			
			request.send();
		} else {
			if (thenPlay) {
				console.log('play immediately');
				sounds.play();
			}
		}
		
	},
	
	play : function() {
		console.log('play');

		if (sounds.soundLoaded) {
			console.log('sound loaded -- playing');
			var source = sounds.context.createBufferSource(); // creates a sound source
			source.buffer = sounds.soundBuffer; // tell the source which sound to play
			source.connect(sounds.context.destination); // the source to the context's destination (the speakers)
			source.start(0);
		}
	}
};