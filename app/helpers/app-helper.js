/* Global Variables */
var currentChar = ''; //holds the first character that is pressed on the venues scene
var tempVenues = []; //holds previous venues when performing a search
function banner(message){
	Mojo.Controller.getAppController().showBanner(message, {source: 'notification'});
}
function ex(error){
	toggleLoading("off");
	Mojo.Controller.errorDialog(error);
}
function pushScene(sceneName){
	try {
		Mojo.Controller.stageController.pushScene(sceneName);
	} catch (e) {
		ex(e);
	}
}
function emailSupport(sceneAssistant){
	sceneAssistant.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
			id: 'com.palm.app.email',
			params: {
				summary: "zipSquare Support",
				recipients: [{
						value : 'support@rmxapps.com',
						contactDisplay : 'RMX Apps Support'
					}]												
			}				
		}
	});
}
function openBrowser(url, sceneAssistant){
	sceneAssistant.controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: 'com.palm.app.browser',
			params: {
				scene: 'page',
				target: url
			}
		}
	});
}
function ajaxGet(url, params, successCallback){
	try {
		var request = new Ajax.Request(url, {
			method: 'get',
			evalJSON: 'force',
			parameters: params,
			onSuccess: successCallback,
			onFailure: function(transport){
				var r = transport.responseText;
				ex(r);
			}
		});
	} catch (e) {
		ex(e);
	}
}
function setupAppMenu(sceneAssistant, includePrefs){
	var menuItems = [
                Mojo.Menu.editItem,
				//{label: "Preferences", command: 'cmdPrefs' },
				//{label: "About zipSquare", command: 'cmdAbout'},
                //{label: "Contact Support", command: 'cmdSupport' },
				{label: "Logout", command: 'cmdLogout'}
            ];
	if (typeof(includePrefs) != 'undefined' && includePrefs == false){
		//menuItems.splice(1,1);
	}
	sceneAssistant.controller.setupWidget(Mojo.Menu.appMenu,
        sceneAssistant.attributes = {
            omitDefaultItems: true
        },
        sceneAssistant.model = {
            visible: true,
            items: menuItems
        }
     );
}
function setupEmptyAppMenu(sceneAssistant){
	var menuItems = [
                Mojo.Menu.editItem
            ];
	sceneAssistant.controller.setupWidget(Mojo.Menu.appMenu,
        sceneAssistant.attributes = {
            omitDefaultItems: true
        },
        sceneAssistant.model = {
            visible: true,
            items: menuItems
        }
     );
}
function toggleLoading(onOff){
	if (onOff == "on"){
		$('loading').show();
	}else{
		$('loading').hide();
	}
}
function toMiles(meters){
	var miles = roundNumber(meters * 0.000621371192,2);
	return miles;
}
function roundNumber(num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
}
function thisWillCrash(){
	var itemsModel = {items: []};
	var g = [["some","nested"],["array","from"],["an HTTP","request"]];
	var x = 0; //overall incrementor
	for (var i=0; i<g.length; i++) {
		var grp = g[i];
		for (var j=0; j<grp.length; j++) {
			itemsModel.items[x] = grp[j];
			x++;
		};
	};
	
	//further down in the method
	for (var i=0; i<10; i++) {
		//another For loop with an index variable named i
	};
}