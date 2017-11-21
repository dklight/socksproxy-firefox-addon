/**
 * @file Main controller file for the addon
 * @author Anthony Sabathier <sabathiera@gmail.com>
 */

(function() {
    "use strict";
    const debug = false;
    const proxyScriptURL = "proxy/socksproxy-pac.js";
    const state = {
        enabled: {
            title: "SOCKS - Enabled",
            icon: "icons/socks-enabled.svg"
        },
        disabled: {
            title: "SOCKS - Disabled",
            icon: "icons/socks-disabled.svg"
        }
    };

    /** Handler for a click on browser action button */
    function toggleSocksProxy() {
        debug && console.debug("Entering toggleSocksProxy.");
        browser.browserAction.getTitle({}).then( (title) => {
            debug && console.debug("Title:", title);
            (title == state.disabled.title) ? startProxy() : stopProxy();
        });
    }

    /** Register PAC file with current settings */
    function startProxy() {
        debug && console.debug("Entering startProxy.");
        // On opening the options page, fetch stored settings and update the UI with them.
        browser.storage.local.get().then((storage) => {
            debug && console.debug("local storage :", storage);
            let data = storage.settings;
            if (data && data.host && data.port && data.version && data.noproxy && Array.isArray(data.noproxy)) {
                data.enable = true;
                browser.proxy.register(proxyScriptURL)
                    .then(() => { browser.runtime.sendMessage(data, {toProxyScript: true});})
                    .catch((message) => { console.error("PAC file not registered: ", message);});
            } else {
                console.log("No socks settings stored or malformated data, please go to the preferences.", "//about:addons");
            }
        });
    }

    /** Unregister PAC file */
    function stopProxy() {
        debug && console.debug("Entering stopProxy.");
        browser.proxy.unregister().then(() => { setStateView("disabled"); });
    }

    /** Handle messaging - handle PAC init success */
    function handleMessages(message, sender) {
        debug && console.debug("Entering socksproxy.js onMessage handler.");
        if (sender.url != browser.extension.getURL(proxyScriptURL)) {
            console.error("Message from unsupported source", {source: sender, message: message});
        } else {
            console.log("Message from PAC", {message: message});
            (message === "PAC initialized successfully.") && setStateView("enabled");
        }
    }

    /** Set style for browser action */
    function setStateView(newState) {
        browser.browserAction.setTitle({title: state[newState].title});
        browser.browserAction.setIcon({path: state[newState].icon});    
    }

    // Init the browser action button
    browser.browserAction.onClicked.addListener(toggleSocksProxy);
    browser.runtime.onMessage.addListener(handleMessages);
})();
