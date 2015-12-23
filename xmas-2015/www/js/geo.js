var geo = {
    
    /** seeks the current location of the device */
    seek: function(call_back) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(call_back);
        } else {
            alert("Please allow location or the game won't work.");
            console.log('Unable to geolocate.');
        }
    },
    
    /** activates recurring watch of the device location */
    watch: function(call_back) {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(call_back, geo.error, {
                enableHighAccuracy : true
            });
        } else {
            alert("This browser does not support geolocation.");
            console.warn('Unable to geolocate -- unsupported in browser.');
        }
    },
    
    error : function(err) {
        console.warn('position error code: ' + err.code);
        console.warn('position error msg:  ' + err.message);
    },
    
    /** clears recurring watch of the device location */
    clearWatch : function(watch_id) {
        if (navigator.geolocation) {
            navigator.geolocation.clearWatch(watch_id);
        }
    },
    
    /** rubbish old distance calculator */
    calcDist: function(lat1, lon1, lat2, lon2) {
        var diffLAT = (lat2 - lat1);
        var diffLON = (lon2 - lon1);
        var dist = Math.sqrt(Math.pow(diffLAT,2) + Math.pow(diffLON,2));
        return dist;
    }
    
};
