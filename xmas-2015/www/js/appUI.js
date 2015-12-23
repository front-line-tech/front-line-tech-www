var appUI = {
	
	showLoader : function(msg) {
		$.mobile.loading("show", {
            text: msg,
            textVisible: true,
            textonly: false
    	});
	},
	
	hideLoader : function() {
		$.mobile.loading("hide");
	}
	
	
	
};