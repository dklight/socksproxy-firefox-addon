/**
 * @file Manages the configuration settings for the addon.
 * @author Anthony Sabathier <sabathiera@gmail.com>
 */

(function () {
    "use strict";

    const debug = false;

    // HTML elements for settings
    const formElements = {
        host: document.querySelector("#host"),
        port: document.querySelector("#port"),
        version: document.querySelector("#version"),
        noProxy: document.querySelector("#noproxy")
    };

    /** Store the currently selected settings using browser.storage.local. */
    function saveSettings() {
        debug && console.debug("Entering saveSettings.");
        let settings = {
            host: formElements.host.value,
            port: formElements.port.value,
            version: formElements.version.value,
            noproxy: formElements.noProxy.value.split(" ").join("").split(",")
        };
        browser.storage.local.set({settings});

        if (debug) {
            console.log("settingsVar", settings);
            browser.storage.local.get().then((stored) => {console.log("local storage", stored);});
        }
    }

    /** Load and check to display settings provided by browser.storage.local */
    function loadSettings(storage) {
        debug && console.debug("Entering loadSettings.", {localStorage: storage});
        let data = storage.settings;
        // Check if all values exist
        if (data && data.host && data.port && data.version && data.noproxy && Array.isArray(data.noproxy)) {
            formElements.host.value = data.host;
            formElements.port.value = data.port;
            formElements.version.value = data.version;
            formElements.noProxy.value = data.noproxy.join(", ");
        } else {
            console.error("Failed to load properties.");
        }
    }

    // On opening the options page, fetch stored settings and update the UI with them.
    browser.storage.local.get().then(loadSettings, console.error);

    // Whenever the contents of the textarea changes, save the new values
    document.querySelector("#save").addEventListener("click", saveSettings);
})();
