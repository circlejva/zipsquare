//Various global junk
foursquare = {
	apibase : 'http://api.foursquare.com/v1/',
}
user = {
	auth: false,
	id: '',
	login: '',
	password: '',
	name: '',
	photo: ''
}
//this was used way back in the day when 
//checkins were retrieved differently
friends = {
	items : [],
	expiration : null,
	expired: function(exDate){
		var now = new Date();
		var diff = exDate - now;
		//$("venues-debug").update(diff)
		if ((exDate - now) > 0){
			return false;
		}else{
			return true;	
		}
	},
	loaded: false
}
loc = {
}
