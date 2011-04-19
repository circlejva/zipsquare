function LoginAssistant() {}

LoginAssistant.prototype = {
	setup: function() {
		$$('body')[0].addClassName('clouds');
		this.controller.setupWidget("txtUser",
	        this.userAttributes = {
	            hintText: $L("Email address or phone"),
				textCase: Mojo.Widget.steModeLowerCase,
				autoFocus: true
	        },
	        this.userModel = {
	            value: ""
	        }
	    ); 
		this.controller.setupWidget("txtPassword",
	        this.passwordAttributes = {
				hintText: $L("Password")
	        },
	        this.passwordModel = {
	            value: ""
	        }
	    ); 
		this.controller.setupWidget("loginButton",
	         this.lbAttributes = {

	             },
	         this.lbModel = {
	             label : "Login",
	             disabled: false
	         }
	    );
		this.controller.listen(this.controller.get("loginButton"), Mojo.Event.tap, this.doLogin.bind(this));
	},
	
	doLogin: function(event){
		toggleLoading("on");
		var user = this.userModel.value;
		var password = this.passwordModel.value;
		var hash = Base64.encode(user + ":" + password);		
		var url = foursquare.apibase + 'user.json';
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			requestHeaders: {
				Authorization: "Basic " + hash
			},
			onSuccess: this.gotUser.bind(this),
			onFailure: function(transport){
				var r = transport.responseJSON;
				ex(r.unauthorized);
			}
		});
	},
	
	gotUser: function(transport){
		var u = transport.responseJSON.user;
		user.auth = true;
		user.id = u.id;
		user.name = u.firstname + " " + u.lastname;
		user.photo = u.photo;
		user.login = this.userModel.value;
		user.password = this.passwordModel.value;
		user.fb = u.settings.sendtofacebook;
		user.twitter = u.settings.sendtotwitter;
		this.cookie = new Mojo.Model.Cookie('zsqUser');
		this.cookie.put({
				auth: true,
				name: user.name,
				photo: user.photo,
				login: user.login,
				password: user.password,
				id: user.id,
				fb: user.fb,
				twitter: user.twitter
		});	
		Mojo.Controller.stageController.swapScene({
			'name': 'home',
			transition: Mojo.Transition.crossFade
		}); 
	}
};