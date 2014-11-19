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
//var prefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("network.proxy.");
//var extensionPrefs = Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService).getBranch("extensions.socksproxy.");
var { ToggleButton } = require("sdk/ui/button/toggle");
var prefs = require("sdk/preferences/service");
var addonName = require('sdk/self').name;
var backupElements = ["ssl", "ftp", "http", "socks", "no_proxies_on", "autoconfig_url", "type", "ssl_port",
	"socks_version", "socks_port", "http_port", "ftp_port", "socks_remote_dns", "share_proxy_settings"];

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

//Force creation of "extensions.socksproxy"
var versionPrefName = "extensions.socksproxy.version";
if (!prefs.has(versionPrefName)) {
	prefs.set(versionPrefName, "0.2");
}

// Read prefs
var extensionIsEnabled = null; 

if(!prefs.has("extensions.socksproxy.enabled"))
{
	prefs.set("extensions.socksproxy.enabled", false);
	extensionIsEnabled = false;
	button.state(button, disableState);
}
else
{
	extensionIsEnabled = prefs.get("extensions.socksproxy.enabled");

	if(extensionIsEnabled)
	{
		button.state(button, enableState);
	}
	else
	{
		button.state(button, disableState);
	}
}

function setProxy(state)
{
	//Always set to true remote DNS
	prefs.set("network.proxy.socks_remote_dns", true);

	if (!extensionIsEnabled)
	{
		backupPreferences();

		//Custom proxy settings
		prefs.set("network.proxy.type", 1);
		
		//Clean other settings
		prefs.set("network.proxy.share_proxy_settings", false);
		prefs.set("network.proxy.http", "");
		prefs.set("network.proxy.http_port", 0);
		prefs.set("network.proxy.ssl", "");
		prefs.set("network.proxy.ssl_port", 0);
		prefs.set("network.proxy.ftp", "");
		prefs.set("network.proxy.ftp_port", 0);

		//Setup tunnel
		prefs.set("network.proxy.socks", "127.0.0.1");
		prefs.set("network.proxy.socks_port", 1337);
		prefs.set("network.proxy.socks_version", 5);
		prefs.set("network.proxy.socks_remote_dns", true);

		button.state(button, enableState);
		extensionIsEnabled = true;
	}
	else
	{
		prefs.set("network.proxy.socks", "");
		prefs.set("network.proxy.socks_port", 0);
		prefs.set("network.proxy.socks_version", 5);
		prefs.set("network.proxy.socks_remote_dns", true);
		restorePreferences();
		if(!prefs.isSet("extensions.socksproxy.type"))
		{
			//Back to default setting
			// 5 -> default proxy conf
			prefs.set("network.proxy.type", 5) 
		}
		button.state(button, disableState);
		extensionIsEnabled = false;
	}
}

function backupPreferences()
{
	//Do a backup
	for (var key in backupElements)
	{
		if(prefs.isSet("network.proxy." + backupElements[key]))
		{
			console.log("network.proxy." + backupElements[key] + " => " + prefs.get("network.proxy." + backupElements[key]));
			prefs.set("extensions.socksproxy." + backupElements[key], prefs.get("network.proxy." + backupElements[key]));
		}
	}
}

function restorePreferences()
{
	//Restore settings
	for (var key in backupElements)
	{
		if(prefs.isSet("extensions.socksproxy." + backupElements[key]))
		{
			console.log("extensions.socksproxy." + backupElements[key] + " => " + prefs.get("extensions.socksproxy." + backupElements[key]));
			prefs.set("network.proxy." + backupElements[key], prefs.get("extensions.socksproxy." + backupElements[key]));
		}
	}
}