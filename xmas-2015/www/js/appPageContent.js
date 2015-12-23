var pageContent = {
	
	jiggering : false,
	jiggerInterval : null,
	
	currentEvent : null,
	
	show : function(v) {
		pageContent._setupEvent(v);
		pageContent._visit();
	},
	
	
	/*
	 * possible content_type values:
	 * image-url: content_data is the url
	 * clue-word: content_data is the (short) word
	 * clue-text: content_data is the text
	 * image-asset: content_data is the name of the asset
	 * puzzle-asset: content_data is asset,keyword (where keyword is sent on successful completion)
	 * video-youtube: content_data is the youtube video's embed hash
	 * compass: content_data is lat,lon
	 */
	
	_setupEvent : function(v) {
		pageContent.currentEvent = v;
		console.log('setting up event: ' + v.event_title);
		$('#page-content-title').text(v.event_title);
		
		console.log('content_type = ' + v.content_type);
		
		switch (v.content_type) {
			case 'image-url':
				var html = '<span id="resolving-text"></span>'+
					'<img id="content-img" src="'+ v.content_data +'" class="contentImage" />';
				$('#page-content-content').html(html);
				$('#resolving-text').typewriting("Please wait... Resolving...", {
					"typing_interval": 100,
					"blink_interval": "1s",
					"cursor_color": "#00fd55"
				}, function() {
					console.log("completed typing.");
					$('#content-img').fadeIn(10000);
				});

				break;

			case 'clue-word':
				var html = '<span id="resolving-text"></span><div id="glitch-wrapper" class="glitchWrapper">'+
								'<div class="glitch glitchContent" data-text="' + v.content_data +'">'+ '</div>' +
							"</div>";
				$('#page-content-content').html(html);
				$('#resolving-text').typewriting("Please wait... Resolving...", {
					"typing_interval": 100,
					"blink_interval": "1s",
					"cursor_color": "#00fd55"
				}, function() {
					console.log("completed typing.");
					$('#glitch-wrapper').fadeIn(10000);
				});
				break;

			case 'clue-link':
				var html = 
					'<div id="clue-text" class="clueText"></div>' +
					'<div id="link-div" style="display: none;">' +
						'<a class="ui-btn ui-corner-all ui-btn-icon-left ui-icon-action" ' +
						'href="' + v.content_link + '" target="_newtab">' + v.content_link_title + '</a>' +
					'</div>';
				$('#page-content-content').html(html);
				var text = v.content_data;

				pageContent.jiggering = true;
				pageContent.jiggerInterval = window.setInterval(function() {
					pageContent.doJigger('#clue-text');
				}, 100);
				
				$('#clue-text').typewriting(text, {
					"typing_interval": 50,
					"blink_interval": "1s",
					"cursor_color": "#00fd55"
				}, function() {
					console.log("completed typing.");
					window.setTimeout(function() {
						window.clearInterval(pageContent.jiggerInterval);
						pageContent.jiggering = false;
						window.setTimeout(function() {
							$('#clue-text').fadeOut(500, function() {
								$('#clue-text').css('padding-left', 0);
								$('#clue-text').css('padding-right', 0);
								$('#clue-text').css('padding-top', 0);
								$('#clue-text').css('opacity', 1.0);
								$('#clue-text').fadeIn(3000);
								$('#link-div').fadeIn(3000);
							});
						}, 1000);
					}, 2000);
				});
				break;

			case 'clue-text':
				var html = '<div id="clue-text" class="clueText"></div>';
				$('#page-content-content').html(html);
				var text = v.content_data;

				pageContent.jiggering = true;
				pageContent.jiggerInterval = window.setInterval(function() {
					pageContent.doJigger('#clue-text');
				}, 100);
				
				$('#clue-text').typewriting(text, {
					"typing_interval": 50,
					"blink_interval": "1s",
					"cursor_color": "#00fd55"
				}, function() {
					console.log("completed typing.");
					window.setTimeout(function() {
						window.clearInterval(pageContent.jiggerInterval);
						pageContent.jiggering = false;
						window.setTimeout(function() {
							$('#clue-text').fadeOut(500, function() {
								$('#clue-text').css('padding-left', 0);
								$('#clue-text').css('padding-right', 0);
								$('#clue-text').css('padding-top', 0);
								$('#clue-text').css('opacity', 1.0);
								$('#clue-text').fadeIn(3000);
							});
						}, 1000);
					}, 2000);
				});
				break;
				
			case 'image-asset':
				var parts = v.content_data.split(',');
				var asset = parts[0];
				
				var text = null;
				if (parts.length > 1) {
					text = parts[1];
				}
				
				var url = BaasBox.endPoint + '/asset/' + asset + '?X-BAASBOX-APPCODE=1234567890';
				
				var html = '<div id="resolving-text"></div>'+
					'<img id="content-img" src="'+ url +'" class="contentImage" />';
					
				if (text !== null) {
					html+= '<div id="subsequent-text" style="display: none;">' + text + '</div>';
				}
					
				$('#page-content-content').html(html);
				$('#resolving-text').typewriting("Please wait... Resolving...", {
					"typing_interval": 100,
					"blink_interval": "1s",
					"cursor_color": "#00fd55"
				}, function() {
					console.log("completed typing.");
					$('#content-img').fadeIn(7000);
					$('#subsequent-text').fadeIn(12000);
				});
				break;

			case 'video-youtube':
				var width = $(window).width() * .9;
				var height = width * 0.5625;
				
				console.log('video width: ' + width);
				console.log('video height: ' + height);
			
				var html = '<div style="text-align: center;">' + 
				'<iframe width="'+width+'" height="'+height+'" src="https://www.youtube.com/embed/' 
					+ v.content_data + '?autoplay=1" frameborder="0" allowfullscreen style="margin-left: auto; margin-right: auto;"></iframe>' +
					'</div>';
					
				$('#page-content-content').html(html);
				break;
				
			case 'puzzle-asset':
				var parts = v.content_data.split(',');
				var asset = parts[0];
				var successKeyword = parts[1];
				pageContent._setupPuzzle(asset, successKeyword);
				break;

			case 'compass':
				var targetParts = v.content_data.split(',');
				pageContent._setupCompass(targetParts[0], targetParts[1]);
				break;
		}
	},
	
	doJigger : function(elementLocator) {
		if (pageContent.jiggering) {
			var newLeftMargin = Math.floor((Math.random() * 25) + 0);
			var newRightMargin = Math.floor((Math.random() * 25) + 0);
			var newTopMargin = Math.floor((Math.random() * 25) + 0);
			var newOpacity = (Math.random() * 0.6) + 0.2;
			$(elementLocator).css('padding-left', newLeftMargin);
			$(elementLocator).css('padding-right', newRightMargin);
			$(elementLocator).css('padding-top', newTopMargin);
			$(elementLocator).css('opacity', newOpacity.toFixed(2));
		}
	},
	
	_setupCompass : function(targetLat, targetLng) {
		appCompass.initPageContent($('#page-content-content'));
		appCompass.setTarget(targetLat, targetLng);
		appCompass.start();
	},
	
	_puzzleCount : 0,
	
	_setupPuzzle : function(asset, successKeyword) {
		
		// reload puzzle js
		console.log('reloading puzzle js');
		var src = 'js/jquery.jqpuzzle.packed.js';
        $('script[src="'+src+'"]').remove();
		
		console.log('initialising puzzle');
		var url = BaasBox.endPoint + '/asset/' + asset + '?X-BAASBOX-APPCODE=1234567890';
		var img_id = 'content-img-' + (pageContent._puzzleCount++);
		console.log('img_id = ' + img_id);
		
		var html = '<div><span id="resolving-text"></span></div>'+
			'<div style="width: 100%; text-align: center;">' +
			'<img id="' + img_id + '" src="'+ url +'" />' +
			'</div>';
			
		$('#page-content-content').html(html);
		
		$('#resolving-text').typewriting("Please resolve...", {
			"typing_interval": 100,
			"blink_interval": "1s",
			"cursor_color": "#00fd55"
		}, function() {
			console.log("completed typing.");
		});
		
		// input puzzle
		var settings = {
			rows : 3,
			cols : 3,
			numbers : false,
			shuffle: true,
			control: { 
				toggleNumbers: true,
				toggleOriginal: false,
				shufflePieces : false,
				counter: true, 
				timer: true 
			},
			success : {
				callbackTimeout : 300,
				callback: function() {
					history.back();
					app._scheduleCheckin(5, successKeyword);
				}
			}
		};
		
		var texts = { 
			shuffleLabel:           'Mix!', 
			toggleOriginalLabel:    'Help!', 
			toggleNumbersLabel:     'Help!!!', 
			confirmShuffleMessage:  'Really mix?' 
		};
	
		// now load script and when loaded, invoke jqPuzzle	
        $.getScript( "js/jquery.jqpuzzle.packed.js" )
			.done(function( script, textStatus ) {
	
				$('#' + img_id).one("load", function() {
					$(this).jqPuzzle(settings, texts);
					console.log('jqPuzzle invoked');
				}).each(function() {
					if(this.complete) { $(this).load(); }
				});
				
			})
			.fail(function( jqxhr, settings, exception ) {
				alert('could not load script');
			});
		
		
		
	},

	_visit : function() {
		$(":mobile-pagecontainer").pagecontainer(
			"change",
			"#page-content", 
			{ transition: "pop" });
	},

	
};