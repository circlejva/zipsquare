function SuccessAssistant(responseJSON) {
	this.checkin = responseJSON.checkin
}

SuccessAssistant.prototype.setup = function() {
	this.badgesModel = {items: []};   
	this.controller.setupWidget('badges-list', 
	      {itemTemplate:'templates/badge-item', listTemplate:'templates/results-list'},
	      this.badgesModel);
	this.scoresModel = {items: []};   
	this.controller.setupWidget('scores-list', 
	      {itemTemplate:'templates/score-item', listTemplate:'templates/results-list'},
	      this.scoresModel);
	this.updateText();
};
SuccessAssistant.prototype.updateText = function(){
	$('message').update(this.checkin.message);
	$('mayor').update(this.checkin.mayor.message);
	this.fillLists();
};
SuccessAssistant.prototype.fillLists = function(){
	if (typeof(this.checkin.badges) != "undefined"){
		if (this.checkin.badges.length > 0){
			this.badgesModel.items = this.checkin.badges;
			this.controller.modelChanged(this.badgesModel);
		}else{
			$('badges').hide();
		}
	}else{
		$('badges').hide();
	}
	if (this.checkin.scores.length > 0){
		this.scoresModel.items = this.checkin.scores;
		this.controller.modelChanged(this.scoresModel);
	}
};
SuccessAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

SuccessAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SuccessAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
