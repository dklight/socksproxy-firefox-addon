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

    // Update UI on options page opening
    browser.storage.local.get().then(loadSettings, console.error);

    // Whenever the contents of the textarea changes, save the new values
    document.querySelector("#save").addEventListener("click", saveSettings);
    debug && console.debug('Options script initialized.');
})();
