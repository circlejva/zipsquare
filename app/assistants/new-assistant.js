function NewAssistant(lat, lng) {
	this.lat = lat;
	this.lng = lng;
}

NewAssistant.prototype = {
	setup: function() {
		this.resultsModel = {items: []};   
		this.controller.setupWidget('results-list', 
		      {itemTemplate:'templates/google-item', listTemplate:'templates/results-list'},
		      this.resultsModel);
	    this.controller.setupWidget("txtSearch",
	        this.searchAttributes = {
	            hintText: $L("Venue name..."),
	            multiline: false,
	            enterSubmits: false,
	            focus: true
	         },
	         this.searchModel = {
	             value: "",
	             disabled: false
	         }
	    ); 
	    this.controller.setupWidget("btnSearch",
	         this.attributes = {
	             },
	         this.model = {
	             label : "Search Google",
	             disabled: false
	         }
	     );	
	},
	btnSearchTapped: function(event){
		if (this.searchModel.value.length > 0){
			this.searchGoogle();	
		}
	},
	searchGoogle: function(){
		toggleLoading("on");
		var coords = this.lat + "," + this.lng;
		var url = 'http://ajax.googleapis.com/ajax/services/search/local?v=1.0&q='+ encodeURIComponent(this.searchModel.value) +'&rsz=small&near=' + encodeURIComponent(coords);
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			onSuccess: this.gotResults.bind(this),
			onFailure: function(){
				ex("Error getting Google results");
			}
		});	
	},
	gotResults: function(transport){
		toggleLoading("off");
		var r = transport.responseJSON.responseData;
		this.resultsModel.items = r.results;
		this.controller.modelChanged(this.resultsModel);
	},
	listTapped: function(event){
		var m = "Add " + event.item.titleNoFormatting + " to Foursquare?";
		this.controller.showAlertDialog({
		    onChoose: function(value) {
				if(value == 'ok'){
					this.addVenue(event.item);
				}else if(value =='cancel'){
					//close the dialog
				}
			},
			title: $L("Add Venue?"),
			message: m,
			choices:[
				{label: $L('Add Venue'), value:'ok', type:'affirmative'},
				{label: $L('Cancel'), value:'cancel', type:'color'}    
			]
		});	 	
	},
	addVenue: function(item){
		banner("Adding " + item.titleNoFormatting + "...");
		toggleLoading("on");
		var hash = Base64.encode(user.login + ":" + user.password);
		var params = "name=" + encodeURIComponent(item.titleNoFormatting) + "&address=" + encodeURIComponent(item.streetAddress) + "&city=" + encodeURIComponent(item.city) + "&state=" + encodeURIComponent(item.region) + "&geolat=" + encodeURIComponent(item.lat) + "&geolong=" + encodeURIComponent(item.lng);
		var url = foursquare.apibase + 'addvenue.json';
		var request = new Ajax.Request(url, {
			method: 'POST',
			evalJSON: 'force',
			parameters: params,
			requestHeaders: {
					Authorization: "Basic " + hash
				},
			onSuccess: this.addedVenue.bind(this),
			onFailure: function(transport){
				toggleLoading("off");
				ex(transport.responseJSON.error);
			}
		});	
	},
	addedVenue: function(transport){
		toggleLoading("off");
		banner("Venue " + transport.responseJSON.venue.name + " added!");
		Mojo.Controller.stageController.popScene();
	},
	activate: function(event) {
		toggleLoading("off");
		 this.controller.listen("btnSearch", Mojo.Event.tap, this.btnSearchTapped.bind(this));
		 this.controller.listen("results-list", Mojo.Event.listTap, this.listTapped.bind(this));
	},

	deactivate: function(event) {
		 this.controller.stopListening("btnSearch", Mojo.Event.tap, this.btnSearchTapped());
		 this.controller.stopListening("results-list", Mojo.Event.listTap, this.listTapped());
	}
};