const enableState = {
  "label": "Enable",
  "icon": {
      		"16": "./socks-black-16.png",
      		"32": "./socks-black-32.png",
      		"64": "./socks-black-64.png"
      	}
}

const disableState = {
  "label": "Disable",
  "icon": {
      		"16": "./socks-grey-16.png",
      		"32": "./socks-grey-32.png",
      		"64": "./socks-grey-64.png"
      	}
}

const {components, Cc, Ci} = require("chrome");
var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("network.proxy.");
var { ToggleButton } = require("sdk/ui/button/toggle");

var button = ToggleButton({
      id: "socks-link",
      label: "socksproxy",
      icon: {
      		"16": "./socks-black-16.png",
      		"32": "./socks-black-32.png",
      		"64": "./socks-black-64.png"
      	},
      onClick: setProxy
});

if(prefs.getIntPref("type") == 1)
{
	button.state(button, enableState);
}
else
{
	button.state(button, disableState);
}

function setProxy(state) {

	//Always set to true remote DNS
	prefs.setBoolPref("socks_remote_dns", true);

	/*
	 * prefs.getIntPref("type") == 1 -> socks proxy
	 * prefs.getIntPref("type") == 5 -> system proxy
	 */
	if (prefs.getIntPref("type") != 1)
	{
		var socksHost = "127.0.0.1";
		var socksPort = 1337;
		
		prefs.setIntPref("socks_port", socksPort);
		prefs.setCharPref("socks", socksHost);
		prefs.setIntPref("type", 1);
		button.state(button, enableState);
	}
	else
	{
		prefs.setIntPref("type", 5);
		button.state(button, disableState);
	}
}
