function VenuesAssistant(query) {
	this.currentVenue = '';
	this.limit = 20;
	this.index = 0; //panel index
	this.panel = "venues";
	if (typeof(query)!="undefined"){
		this.query = query;	
	}
	else{
		this.query = "";
	}
	this.dlgHidden = true;
	this.keepGoing = true;
	this.clicked = false;
	//command menu items
	this.navItems = [
			{icon: 'icoPin', command: 'cmdVenues'},
			{icon: 'icoFriends', command: 'cmdFriends'}
		];
	this.cmdVenueItems = [ 
        { icon: 'new', command: 'cmdAdd'},
		//{icon: 'search', command: 'cmdSearch'},
		//{ icon: 'icoFriends', command: 'cmdFriends'},
		//{ items: this.navItems, toggleCmd: 'cmdVenues'},
        { icon: 'refresh', command: 'cmdRefresh'}
	];
	this.cmdFriendItems = [
		{},
		//{icon: 'icoPin', command: 'cmdVenues'},
		//{items: this.navItems, toggleCmd: 'cmdFriends'},
		{icon: 'refresh', command: 'cmdRefreshFriends'}
	];
	$('left-nav').setStyle({
			"left": "-80px"
	});
}

VenuesAssistant.prototype.setup = function() {
	$('checkin-dialog').hide();
	//$$('body')[0].addClassName('clouds');
	this.controller.setupWidget("sideScroller", {
               mode: 'horizontal-snap'
           }, this.model = {
               snapElements: { x: $$('.panel') },
               snapIndex: 0
           }
    ); 
	this.controller.setupWidget("venues-scroller",
		this.vattributes = {mode: 'vertical'},
		this.vmodel = {}
	);
	this.controller.setupWidget("friends-scroller",
		this.fattributes = {mode: 'vertical'},
		this.fmodel = {}
	);	
	this.venuesModel = {items: []};   
	this.controller.setupWidget('venues-list', 
	      {dividerFunction: this.divideVenues, dividerTemplate: 'templates/listdivider', itemTemplate:'templates/venue-item', listTemplate:'templates/results-list'},
	      this.venuesModel);
	this.friendsModel = {items: []};
	this.tempFriends = [];	
	this.controller.setupWidget('friends-list', 
	      {dividerFunction: this.divideVenues, dividerTemplate: 'templates/listdivider', itemTemplate:'templates/friend-item', listTemplate:'templates/results-list'},
	      this.friendsModel); 
	this.controller.setupWidget("txtSearch",
        this.searchAttributes = {
            hintText: $L("Search..."),
            multiline: false,
            enterSubmits: true,
            focus: false,
			focusMode: Mojo.Widget.focusAppendMode
         },
         this.searchModel = {
             value: "",
             disabled: true
         }
    ); 
    this.controller.setupWidget("searchDrawer",
        this.attributes = {
            modelProperty: 'open',
            unstyled: true
        },
        this.model = {
            open: false
        }
    );
    this.controller.setupWidget("btnVenueSearch",
         this.attributes = {
             },
         this.model = {
             label : "Search Venues",
             disabled: false
         }
     );	
	this.controller.setupWidget("txtShout",
        this.shoutAttributes = {
            hintText: $L("Enter a shout-out \(optional\)"),
			focus: true
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
    this.controller.setupWidget("chkFacebook",
         this.fbAttributes = {
             trueValue: true,
             falseValue: false
         },
         this.fbModel = {
             value: user.fb,
             disabled: false
         }
     );		
    this.controller.setupWidget("chkTwitter",
         this.twAttributes = {
             trueValue: true,
             falseValue: false 
         },
         this.twModel = {
             value: user.twitter,
             disabled: false
         }
     );
    this.controller.setupWidget("chkShowFriends",
         this.publicAttributes = {
             trueValue: true,
             falseValue: false 
         },
         this.publicModel = {
             value: true,
             disabled: false
         }
     );						 
	this.controller.setupWidget(Mojo.Menu.commandMenu,
	    this.cmdAttributes = {
	        menuClass: 'no-fade'
	    },
	    this.cmdModel = {
	        visible: false,
	        items: this.cmdVenueItems
	    }
	);
	this.controller.listen(this.controller.sceneElement, Mojo.Event.keydown, this.keyPress.bindAsEventListener(this));
	this.controller.listen(this.controller.get("venues-list"), Mojo.Event.listTap,this.venueTapped.bind(this));
	this.controller.listen(this.controller.get("btnCheckIn"), Mojo.Event.tap, this.checkinButtonTapped.bind(this));
	this.controller.listen(this.controller.get("btnCancel"),Mojo.Event.tap, this.cancelTapped.bind(this));
	this.controller.listen(this.controller.get("sideScroller"), Mojo.Event.propertyChange, this.scrollerChanged.bind(this));
	this.controller.listen(this.controller.get("btnVenueSearch"), Mojo.Event.tap, this.searchButtonTapped.bind(this));
	this.controller.listen(this.controller.get("left-nav"), Mojo.Event.tap, this.leftNavTapped.bind(this));
	this.controller.listen(this.controller.get("right-nav"), Mojo.Event.tap, this.rightNavTapped.bind(this));
	this.controller.listen(this.controller.get("txtSearch"), Mojo.Event.propertyChange, this.txtSearchChanged.bind(this));
	that = this;
	setupAppMenu(this,false);
	this.initLoad();
	$('txtShout').mojo.focus();
};

VenuesAssistant.prototype.handleCommand = function(event){
	if (event.type === Mojo.Event.command) {
		switch (event.command){
			case 'cmdLogout': this.logout();
				break;
			case 'cmdRefresh': 
				this.query = '';
				this.getLocation();
				break;
			case 'cmdRefreshFriends':
				this.loadFriends();
				break;
			case 'cmdSearch': this.showSearch();
				break;
			case 'cmdAdd':
				Mojo.Controller.stageController.pushScene('new', this.lat, this.lng);
				break;
			case 'cmdVenues':
				this.slideTo(0);
				break;
			case 'cmdFriends':
				this.slideTo(1);
				break;
		}		
	}
	else if (event.type === Mojo.Event.back){
		if ($('searchDrawer').mojo.getOpenState() == true){
			$('searchDrawer').mojo.toggleState();
			this.searchModel.disabled = true;
			this.controller.modelChanged(this.searchModel);
			event.stop();
		}
	}
};
VenuesAssistant.prototype.logout = function(){
	this.userCookie = new Mojo.Model.Cookie('zsqUser');
	if (typeof(this.userCookie.get()) != 'undefined'){
		this.userCookie.remove();
		user.auth = false;
		user.photo = '';
		user.login = '';
		user.password = '';
		user.name = '';
		user.id = '';
	}
	Mojo.Controller.stageController.swapScene({
		'name': 'login',
		transition: Mojo.Transition.crossFade
	}); 
	
};
VenuesAssistant.prototype.keyPress = function(event){
	if (this.panel == "venues" && !Mojo.Char.isDeleteKey(event.originalEvent.keyCode) && this.controller.get("searchDrawer").mojo.getOpenState() == false && this.dlgHidden && Mojo.Char.isValidWrittenChar(event.originalEvent.keyCode)){
		this.searchModel.value = "";	
		this.searchModel.disabled = false;
		this.controller.modelChanged(this.searchModel);
		$('searchDrawer').mojo.setOpenState(true);
		$('txtSearch').mojo.focus();
	}
};
VenuesAssistant.prototype.searchButtonTapped = function(event){
	this.query = this.searchModel.value;
	this
	this.getVenues();
};
VenuesAssistant.prototype.divideVenues = function(data){
	return data.group;
};
VenuesAssistant.prototype.venueTapped = function(event){
	var venueName = event.item.name;
	this.currentVenue = event.item.id;
	$("checkin-title").update(venueName);
	$("txtShout").mojo.focus();
	this.toggleCheckIn();
	//Mojo.Controller.stageController.pushScene('checkin',event.item.id, event.item.name, this.lat, this.lng);
};
VenuesAssistant.prototype.checkinButtonTapped = function(event){
	if (this.shoutModel.value.length > 0){
		this.checkin(this.shoutModel.value);	
	}
	else{
		this.checkin();
	}
};
VenuesAssistant.prototype.slideTo = function(index){
	//this.clicked = true;
	$('sideScroller').mojo.setSnapIndex(index, true);
};
VenuesAssistant.prototype.cancelTapped = function(event){
	this.shoutModel.value = "";
	this.toggleCheckIn();
	this.controller.modelChanged(this.shoutModel);
};
VenuesAssistant.prototype.toggleCheckIn = function(){
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
		setTimeout(hideDiv,199);		
		this.dlgHidden = true;
	}
};
function hideDiv(){
	var dlg = $("checkin-dialog");
	dlg.hide()
};
VenuesAssistant.prototype.initLoad = function(){
	this.getLocation();
};
VenuesAssistant.prototype.scrollerChanged = function(event){
	//banner("panel " + event.value);
	this.switchPanel(event.value)
};
VenuesAssistant.prototype.txtSearchChanged = function(event){
	if (this.searchModel.value == ""){
		$('searchDrawer').mojo.toggleState();
	}
};
VenuesAssistant.prototype.switchPanel = function(panel){
	if (panel == 0){
		this.panel = "venues";
		this.updateHeader('places-header.png');
		this.cmdModel.items = this.cmdVenueItems;
		$('left-nav').setStyle({
			"left": "-80px"
		});
		$('right-nav').setStyle({
			"right": "-26px"
		});
	}
	else if(panel == 1){
		this.panel = "friends";
		this.updateHeader('friends-header.png');
		this.cmdModel.items = this.cmdFriendItems;
		if (!friends.loaded){
			this.loadFriends();
		}
		$('right-nav').setStyle({
			"right": "-80px"
		});
		$('left-nav').setStyle({
			"left": "-23px"
		});
	}
	this.controller.modelChanged(this.cmdModel);
};
VenuesAssistant.prototype.scrollToTop = function(animate){
	$('venues-list').mojo.revealItem(0,false);
	$('friends-list').mojo.revealItem(0,false);
};
VenuesAssistant.prototype.updateHeader = function(file){
	this.controller.get("fixed-header").update('<img src="images/' + file + '" />');
};
VenuesAssistant.prototype.getVenues = function(){
	toggleLoading("on");
	var hash = Base64.encode(user.login + ":" + user.password);
	var params = "geolat=" + this.lat + "&geolong=" + this.lng + "&l=" + this.limit + "&q=" + encodeURIComponent(this.query);	
	var url = foursquare.apibase + 'venues.json';
	var request = new Ajax.Request(url, {
		method: 'get',
		evalJSON: 'force',
		parameters: params,
		requestHeaders: {
				Authorization: "Basic " + hash
			},
		onComplete: this.gotVenues.bind(this),
		onFailure: function(transport){
			toggleLoading("off");
			var r = transport.responseJSON;
			ex(r.error);
		}
	});
};
VenuesAssistant.prototype.gotVenues = function(transport){
	if (typeof(transport.responseJSON.venues) == "undefined"){
		this.venuesModel.items = [];
		var g = $A(transport.responseJSON.groups);
		for (var z=0; z<g.length; z++) {
			var grp = g[z];
			for (var j=0; j<grp.venues.length; j++) {
				g[z].venues[j].group = grp.type;
				this.venuesModel.items.push(g[z].venues[j]);
			};				
		};
		this.controller.modelChanged(this.venuesModel);
		this.cmdModel.visible = true;
		this.controller.modelChanged(this.cmdModel);
		$('venues-list').mojo.revealItem(0,true);
		toggleLoading("off");
		for (var i=0; i<this.venuesModel.items.length; i++) {
			this.venuesModel.items[i].miles = toMiles(this.venuesModel.items[i].distance);
			if (this.venuesModel.items[i].address.length > 0){
				if (this.venuesModel.items[i].city.length > 0)
					this.venuesModel.items[i].address = this.venuesModel.items[i].address + ' - ' + this.venuesModel.items[i].city + ' <br />';
				else
					this.venuesModel.items[i].address = this.venuesModel.items[i].address + ' <br />';
			}
			if (typeof(this.venuesModel.items[i].primarycategory)!="undefined")
				this.venuesModel.items[i].pic = this.venuesModel.items[i].primarycategory.iconurl;
			else
				this.venuesModel.items[i].pic = "http://foursquare.com/img/categories/question.png";	
			if (this.venuesModel.items[i].stats.herenow == 1){
				this.venuesModel.items[i].people = "person";
			}else{
				this.venuesModel.items[i].people = "people";
			}	
		};
		this.controller.modelChanged(this.venuesModel);	
		$('searchDrawer').mojo.setOpenState(false);
	}else if (transport.responseJSON.venues.length == 0){
		toggleLoading("off");
		banner("No venues found");
		//this.venuesModel.items = tempVenues;
		//this.controller.modelChanged(this.venuesModel);
		this.cmdModel.visible = true;
		this.controller.modelChanged(this.cmdModel);		
	}
};
VenuesAssistant.prototype.getLocation = function(){
	toggleLoading("on");
	this.controller.serviceRequest('palm://com.palm.location', {
		method : 'getCurrentPosition',
        parameters: {
			accuracy: 3,
			responseTime: 1,
			maximumAge: 90
                },
        onSuccess: this.handleServiceResponse.bind(this),
        onFailure: this.handleServiceResponseError.bind(this)
    });
};
VenuesAssistant.prototype.handleServiceResponse = function(event){
	this.lat = event.latitude;
	this.lng = event.longitude;
	this.getVenues();
	this.getBackgroundImage();
};
VenuesAssistant.prototype.handleServiceResponseError = function(event){
	toggleLoading("off");
	ex("There was an error getting a GPS fix.");
};
VenuesAssistant.prototype.getBackgroundImage = function(){
	var center = this.lat + "," + this.lng;
	var url = "http://maps.google.com/maps/api/staticmap?center=" + encodeURIComponent(center) + "&size=320x480&zoom=15&sensor=false";
	$$('body')[0].setStyle({
		'background': 'url(' + url + ') no-repeat'
	});
};
VenuesAssistant.prototype.checkin = function(shout){
	toggleLoading("on");
	this.toggleCheckIn();
	var hash = Base64.encode(user.login + ":" + user.password);
	var params = "vid=" + this.currentVenue;
	if (typeof(shout) != "undefined"){
		params += "&shout=" + encodeURIComponent(shout);
	}	
	if (this.publicModel.value != true){
		params += "&private=1"
	}else{
		params += "&private=0"
	}
	if (this.fbModel.value == true){
		params += "&facebook=1"
	}else{
		params += "&facebook=0"
	}
	if (this.twModel.value == true){
		params += "&twitter=1"
	}else{
		params += "&twitter=0"
	}
	var url = foursquare.apibase + 'checkin.json';
	var request = new Ajax.Request(url, {
		method: 'POST',
		evalJSON: 'force',
		parameters: params,
		requestHeaders: {
				Authorization: "Basic " + hash
			},
		onSuccess: this.checkedIn.bind(this),
		onFailure: function(transport){
			toggleLoading("off");
			ex("Foursquare returned an error, but the check-in may have still gone through. Check your history at foursquare.com to make sure before you try to check in again.");
		}
	});	
};
VenuesAssistant.prototype.checkedIn = function(transport){
	toggleLoading("off");
	Mojo.Controller.stageController.pushScene('success',transport.responseJSON);
};
VenuesAssistant.prototype.loadFriends = function(){
	toggleLoading("on");
	var hash = Base64.encode(user.login + ":" + user.password);
		//ex(user.login + user.password + hash);
		var url = foursquare.apibase + 'checkins.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			requestHeaders: {
				Authorization: "Basic " + hash
			},
			onSuccess: this.gotCheckins.bind(this),
			onFailure: function(transport){
				var r = transport.responseText;
				ex(r);
			}
		});
};
VenuesAssistant.prototype.gotCheckins = function(transport){
	var c = transport.responseJSON.checkins;
	for (var i=0; i<c.length; i++) {
		c[i].status = "";
		if (typeof(c[i].shout) != "undefined"){
			c[i].status += '<span class="friend-shout">' + c[i].shout + '</span><br />';	
		}
		if (typeof(c[i].venue) != "undefined"){
			c[i].status += timeSince(c[i].created, false) + ' @ <span class="friend-venue">' + c[i].venue.name + '</span><br />';
		}else{
			c[i].status += timeSince(c[i].created, false);	
		}
		if (isToday(c[i].created)){
			c[i].group = "Checkins Today";
		}else{
			c[i].group = "Older Checkins";
		}
	};
	this.friendsModel.items = c;
	this.controller.modelChanged(this.friendsModel);
	toggleLoading("off");
	friends.loaded = true;
};

VenuesAssistant.prototype.showSearch = function(){
	//tempVenues = this.venuesModel.items;
	$('searchDrawer').mojo.toggleState();
	if ($('searchDrawer').mojo.getOpenState() == false){
		this.searchModel.value = "";
		this.controller.modelChanged(this.searchModel);
	}
};
VenuesAssistant.prototype.leftNavTapped = function(event){
//	this.index--;
//	this.slideTo(this.index);
};
VenuesAssistant.prototype.rightNavTapped = function(event){
//	this.index++;
//	this.slideTo(this.index);
};
VenuesAssistant.prototype.activate = function(event) {
	var height = this.controller.window.innerHeight - 60;
	$('venues-scroller').setStyle({"height": height + "px"});
	$('friends-scroller').setStyle({"height": height + "px"});
};

VenuesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

VenuesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
