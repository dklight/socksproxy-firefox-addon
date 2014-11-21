const enableState = {
	"label": "Enable",
	"checked": true,
	"icon": {
		"16": "./socks-black-16.png",
		"32": "./socks-black-32.png",
		"64": "./socks-black-64.png"
	}
}

const disableState = {
	"label": "Disable",
	"checked": false,
	"icon": {
		"16": "./socks-grey-16.png",
		"32": "./socks-grey-32.png",
		"64": "./socks-grey-64.png"
	}
}

const {Cc, Ci} = require("chrome");

var { ToggleButton } = require("sdk/ui/button/toggle");
var prefs = require("sdk/preferences/service");
var prefsMenu = require("sdk/simple-prefs").prefs;
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

if(prefs.has("extensions.socksproxy.enabled")) 
{
	if(prefs.get("extensions.socksproxy.enabled"))
	{
		prefs.set("extensions.socksproxy.enabled", true);
		button.state(button, enableState);
	}
	else
	{
		prefs.set("extensions.socksproxy.enabled", false);
		button.state(button, disableState);
	}
}
else //First launch
{
	prefs.set("extensions.socksproxy.enabled", false);
	button.state(button, disableState);
}

function setProxy(state)
{
	if (prefs.get("extensions.socksproxy.enabled"))
	{
		//Restore to default settings
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
		prefs.set("extensions.socksproxy.enabled", false);
	}
	else
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
		prefs.set("network.proxy.socks", prefsMenu.host);
		prefs.set("network.proxy.socks_port", prefsMenu.port);

		if (prefsMenu.socksversion == 5)
		{
			prefs.set("network.proxy.socks_version", 5);
			prefs.set("network.proxy.socks_remote_dns", false);
			if(prefsMenu.remotedns == true)
			{
				prefs.set("network.proxy.socks_remote_dns", true);
			}
		}
		else
		{
			prefs.set("network.proxy.socks_version", 4);
		}

		button.state(button, enableState);
		prefs.set("extensions.socksproxy.enabled", true);
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