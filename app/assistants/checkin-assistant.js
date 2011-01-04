function CheckinAssistant(venueId, title, lat, lng){
	this.venue = venueId;
	this.lat = lat;
	this.lng = lng;
}

	


CheckinAssistant.prototype.setup = function() {
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
    this.controller.setupWidget("chkFacebook",
         this.fbAttributes = {
             trueValue: true,
             falseValue: false
         },
         this.fbModel = {
             value: true,
             disabled: false
         }
     );		
    this.controller.setupWidget("chkTwitter",
         this.twAttributes = {
             trueValue: true,
             falseValue: false 
         },
         this.twModel = {
             value: true,
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
	this.controller.listen(this.controller.get("btnCheckIn"), Mojo.Event.tap, this.checkinButtonTapped.bind(this));
	this.controller.listen(this.controller.get("btnCancel"),Mojo.Event.tap, this.cancelTapped.bind(this));			 
};

CheckinAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

CheckinAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

CheckinAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
