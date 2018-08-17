/**
 * @file Main controller file for the addon
 * @author Anthony Sabathier <sabathiera@gmail.com>
 */

(function() {
    "use strict";
    
    const debug = true;
    
    var currentState = 'disabled';
    
    const states = {
        enabled: {
            title: 'SOCKS - Enabled',
            icon: 'icons/socks-enabled.svg',
            storageName: 'socksSettings'
        },
        disabled: {
            title: 'SOCKS - Disabled',
            icon: 'icons/socks-disabled.svg',
            storageName: 'originalProxySettings'
        }
    };
    
    /** Handler for a click on browser action button */
    function toggleSocksProxy() {
        debug && console.debug("Entering toggleSocksProxy.");
        currentState = (currentState != 'enabled') ? 'enabled' : 'disabled';
        setProxy(currentState);
    }

    /** Sets relevant browser proxy settings based on enablement */
    function setProxy(currentState) {
        browser.storage.local.get().then((storageData) => {
            debug && console.debug("local storage :", storageData);
            let proxySettings = storageData[states[currentState].storageName];
            debug && console.debug('proxySettings to be applied:', proxySettings);
            if (proxySettings && (currentState === 'disabled' || (proxySettings.socks && proxySettings.socksVersion))) {
                browser.proxy.settings.set({value: proxySettings}).then(() => { 
                    setStateView(currentState); 
                });                
            } else {
                console.warn("No socks settings stored or malformated data, please go & check preferences.", "//about:addons");
            }
        });
    }
    
    /** Set style for browser action button */
    function setStateView(newState) {
        browser.browserAction.setTitle({title: states[newState].title});
        browser.browserAction.setIcon({path: states[newState].icon});    
    }
    
    /** Init the browser action button & stores original proxy settings */
    function initAddon() {
        browser.browserAction.onClicked.addListener(toggleSocksProxy);
        browser.proxy.settings.get({}).then((proxySettings) => {
            browser.storage.local.set({originalProxySettings: proxySettings.value});
        });
        
        debug && console.debug('Add-on initialisation completed.');
    }
    
    // Run initialization
    initAddon();
})();
