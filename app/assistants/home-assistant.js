function HomeAssistant() {}

HomeAssistant.prototype.setup = function() {
	try {
		$('checkin-dialog').hide();
		log("starting");
		this.dlgHidden = true;
		this.keepGoing = true; //flag to keep recursively getting friend info
		//var me = this;
		$$('body')[0].addClassName('bgcolor'); //load the default background color
		this.controller.setupWidget("sideScroller", {
	               mode: 'horizontal-snap'
	           }, this.model = {
	               snapElements: { x: $$('.panel') },
	               snapIndex: 0
	           }
	    );
		this.controller.setupWidget("venues-scroller",
			this.attributes = {
				mode: 'vertical'
			},
			this.model = {	
			});
		this.resultsModel = {items: []};   
		this.friendsModel = {items: []};
		this.tempFriends = [];
		this.controller.setupWidget('venues-list', 
		      {itemTemplate:'templates/venue-item', listTemplate:'templates/results-list'},
		      this.resultsModel);
			  
		this.controller.setupWidget('friends-list', 
		      {itemTemplate:'templates/friend-item', listTemplate:'templates/results-list'},
		      this.friendsModel);
			  			  
		this.controller.setupWidget("txtShout",
	        this.shoutAttributes = {
	            hintText: $L("Enter a shout-out \(optional\)"),
				autoFocus: true
	        },
	        this.shoutModel = {
	            value: ""
	        }
	    ); 
		this.controller.setupWidget("btnCheckIn",
	         this.checkinAttributes = {
			 	
	             },
	         this.checkinModel = {
	             label : "Check In",
	             disabled: false
	         }
	    );
		this.controller.setupWidget("btnCancel",
	         this.cancelAttributes = {
			 	
	             },
	         this.cancelModel = {
	             label : "Cancel",
	             disabled: false
	         }
	    );

		//use window.innerHeight to set the height of the vertical scrollers
		//this.controller.listen("sideScroller", Mojo.Event.scrollStarting, this.handleUpdate.bindAsEventListener(this));
		log("widgets are setup");
		this.controller.listen(this.controller.get("venues-list"), Mojo.Event.listTap,this.venueTapped.bind(this));
		this.controller.listen(this.controller.get("btnCancel"),Mojo.Event.tap, this.cancelTapped.bind(this));
		log("done");
		setupAppMenu(this,true);
		this.initLoad();
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command){
			case 'cmdLogout': this.logout();
				break;	
		}		
	}
}
HomeAssistant.prototype.logout = function(){
	this.userCookie = new Mojo.Model.Cookie('zipUser');
	if (typeof(this.userCookie.get()) != 'undefined'){
		this.userCookie.remove();
		user.auth = false;
		user.photo = '';
		user.login = '';
		user.password = '';
		user.name = '';
		user.id = '';
	}
	this.rmFriendsCookie = new Mojo.Model.Cookie('zipFriends');
	if (typeof(this.rmFriendsCookie.get()) != 'undefined'){
		this.rmFriendsCookie.remove();
		friends.items = [];
	}
	Mojo.Controller.stageController.swapScene({
		'name': 'login',
		transition: Mojo.Transition.crossFade
	}); 
	
}
HomeAssistant.prototype.venueTapped = function(event){
	var venueName = event.item.name;
	$("checkin-title").update(venueName);
	$("txtShout").mojo.focus();
	this.toggleCheckIn();
};
HomeAssistant.prototype.cancelTapped = function(event){
	this.shoutModel.value = "";
	this.toggleCheckIn();
	this.controller.modelChanged(this.shoutModel);
};
HomeAssistant.prototype.toggleCheckIn = function(){
	var dlg = $("checkin-dialog");
	if (this.dlgHidden){
		dlg.addClassName("showDiv");
		dlg.removeClassName("hideDiv");
		dlg.toggle();
		this.dlgHidden = false;
	}
	else{
		dlg.removeClassName("showDiv");
		dlg.addClassName("hideDiv");
		setTimeout(hideDiv,299);		
		this.dlgHidden = true;
	}
};
function hideDiv(){
	var dlg = $("checkin-dialog");
	dlg.hide()
};
function log(text){
	try {
		//$('venues-debug').update(text);
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.initLoad = function(){
	try {
		this.friendsCookie = new Mojo.Model.Cookie('zipFriends');
		try {
			friends.items = $A(this.friendsCookie.get().items);
		} catch (e) {
			
		}		
		log("in init");
		this.getLocation();
	} catch (e) {
		log(e);
		ex(e);
	}
};
HomeAssistant.prototype.gotVenues = function(transport){
	try {
		log("in venues");
		this.resultsModel.items = $A(transport.responseJSON.groups[0].venues);
		this.controller.modelChanged(this.resultsModel);
		for (var i=0; i<this.resultsModel.items.length; i++) {
			try {
				this.resultsModel.items[i].pic = this.resultsModel.items[i].primarycategory.iconurl;
			} catch (e) {
				this.resultsModel.items[i].pic = "http://foursquare.com/img/categories/question.png";
			}
		};
		this.controller.modelChanged(this.resultsModel);
		if (friends.items.length == 0){
			this.loadFriends();	
		}else{
			this.friendsModel.items = friends.items;
			this.controller.modelChanged(this.friendsModel);
		}
		
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.loadFriends = function(){
	try {
		banner("Loading friends");
		var hash = Base64.encode(user.login + ":" + user.password);
		//ex(user.login + user.password + hash);
		var url = foursquare.apibase + 'friends.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			requestHeaders: {
				Authorization: "Basic " + hash
			},
			onSuccess: this.gotFriends.bind(this),
			onFailure: function(transport){
				var r = transport.responseText;
				ex(r);
			}
		});
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.gotFriends = function(transport){
	try {
		var f = transport.responseJSON.friends;
		friends.items = []; //clear the array
		this.tempFriends = f;
		this.getFriendDetails(); //start the recursion
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.getFriendDetails = function(){
	try {
		if (this.tempFriends.length > 0){
			var that = this;		
			var hash = Base64.encode(user.login + ":" + user.password);
			var currentUser = this.tempFriends[this.tempFriends.length - 1];
			var uid = currentUser.id;
			var url = foursquare.apibase + "user.json?uid=" + uid;
			var request = new Ajax.Request(url, {
				method: 'get',
				evalJSON: 'force',
				requestHeaders: {
					Authorization: "Basic " + hash
				},
				onSuccess: function(transport){		
					var u = transport.responseJSON.user;
					friends.items.push(u);
					that.tempFriends.pop();
					that.getFriendDetails();	
					
				},
				onFailure: function(transport){
					var r = transport.responseText;
					ex(r);
				}
			});	
		}else{
			friends.items.reverse();
			this.friendsModel.items = friends.items;
			this.controller.modelChanged(this.friendsModel);
			var expiration = new Date();
			expiration.setMinutes(expiration.getMinutes() + 30)
			//$("friends-debug").update(expiration.toTimeString());
			friends.expiration = expiration;
			
			this.friendsCookie = new Mojo.Model.Cookie('zipFriends');
			this.friendsCookie.put(friends);	
		}
	} catch (e) {
		ex(e);
	}
}
HomeAssistant.prototype.getLocation = function(){
	log("getting location");
	this.controller.serviceRequest('palm://com.palm.location', {
		method : 'getCurrentPosition',
        parameters: {
			accuracy: 2
                },
        onSuccess: this.handleServiceResponse.bind(this),
        onFailure: this.handleServiceResponseError.bind(this)
    });
};
HomeAssistant.prototype.handleServiceResponse = function(event){
	try {
		this.lat = event.latitude;
		this.lng = event.longitude;
		var that = this;
		var params = "geolat=" + this.lat + "&geolong=" + this.lng + "&limit=10";
		var url = foursquare.apibase + 'venues.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			parameters: params,
			onSuccess: this.gotVenues.bind(this),
			onFailure: function(transport){
				var r = transport.responseText;
				ex(r);
			}
		});
	} catch (e) {
		ex(e);
	}
};
HomeAssistant.prototype.handleServiceResponseError = function(event){
	log(event.error);
};
HomeAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

HomeAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

HomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
