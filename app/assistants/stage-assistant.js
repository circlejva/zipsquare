function StageAssistant() {}

StageAssistant.prototype.setup = function() {
	toggleLoading("off");
	this.userCookie = new Mojo.Model.Cookie('zsqUser');
	if (typeof(this.userCookie.get()) != "undefined") {
		var auth = this.userCookie.get().auth;
		if (auth) {
			user.id = this.userCookie.get().id;
			user.login = this.userCookie.get().login;
			user.password = this.userCookie.get().password;
			user.name = this.userCookie.get().name;
			user.photo = this.userCookie.get().photo;
			user.auth = true;
			user.fb = this.userCookie.get().fb;
			user.twitter = this.userCookie.get().twitter;
		}
	}
	if (user.auth){
		this.controller.pushScene('venues');	
	}else{
		this.controller.pushScene('login');
	}
};