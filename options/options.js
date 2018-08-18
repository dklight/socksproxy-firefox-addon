/**
 * @file Manages the configuration settings for the addon.
 * @author Anthony Sabathier <sabathiera@gmail.com>
 */

(function () {
    "use strict";

    const debug = true;

    // HTML elements for settings
    let formElements = {
        host: document.querySelector("#host"),
        port: document.querySelector("#port"),
        version: document.querySelector("#version"),
        proxyDNS: document.querySelector("#proxydns"),
        passthrough: document.querySelector("#passthrough")
    };

    /** Store the currently selected settings using browser.storage.local. */
    function saveSettings() {
        debug && console.debug("Entering saveSettings.");
        
        let socksSettings = {
            proxyType: 'manual',
            socks: formElements.host.value + ':' + formElements.port.value,
            socksVersion: parseInt(formElements.version.value),
            proxyDNS: formElements.proxyDNS.checked,
            passthrough: formElements.passthrough.value
        };
        debug && console.debug('settings to be stored:', socksSettings);
        
        browser.storage.local.set({socksSettings});

        debug && browser.storage.local.get().then((stored) => {console.debug('local storage: ', stored);});
    }

    
    /** Load and check to display settings provided by browser.storage.local */
    function loadSettings(storage) {
        debug && console.debug("Entering loadSettings.", {localStorage: storage});
        let data = storage.socksSettings;
        // Check if all values exist
        if (data && data.socks && data.socks.split(':').length == 2 && data.socksVersion) {
            formElements.host.value = data.socks.split(':')[0];
            formElements.port.value = data.socks.split(':')[1];
            formElements.version.value = data.socksVersion;
            formElements.proxyDNS.checked = data.proxyDNS || false;
            formElements.passthrough.value = data.passthrough || '';
        } else {
            console.error("Failed to load properties.");
        }
    }

	/** Load i18n for options UI */
	function loadOptionsI18n() {
		let capitalizedEltName = '';
		// Matching names for formElements keys and i18n messages does help
		for (var eltName in formElements) {
			capitalizedEltName = eltName.charAt(0).toUpperCase() + eltName.slice(1);
			formElements[eltName].previousSibling.data = browser.i18n.getMessage("options" + capitalizedEltName + "Label");
		}
		document.querySelector("#title").innerHTML = browser.i18n.getMessage("optionsTitle");
	}
	
	/** JS initialization for options UI */
	function initOptions() {
		// Update UI on options page opening (language + values)
		loadOptionsI18n();
		browser.storage.local.get().then(loadSettings, console.error);
		// Save button will actually save or dump error to console
		document.querySelector("#save").addEventListener("click", saveSettings);
		// Let debug guy know we initialized options
		debug && console.debug('Options script initialized.');
	}
	
	// Run initialization
	initOptions();
})();
