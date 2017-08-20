/**
 * @file Proxy Auto-Configuration (PAC) file handling proxy functionality.
 * @author Anthony Sabathier <sabathiera@gmail.com>
 */

(function () {
    "use strict";
    const noProxy = "DIRECT";
    var socksProxy = "DIRECT";
    var noProxyHosts = [];

    /** Listen for updates to the blocked host list */
    browser.runtime.onMessage.addListener((data) => {
        if (data && data.enable) {
            socksProxy = "SOCKS " + data.host + ":" + data.port + ";DIRECT";
            // For some reason SOCKS version is not supported in Nightly 57 (2017-08-20)
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Proxy_servers_and_tunneling/Proxy_Auto-Configuration_(PAC)_file
            //socksProxy = "SOCKS" + data.version + " " + data.host + ":" + data.port + ";DIRECT";
            noProxyHosts = [];
            noProxyHosts = data.noproxy.slice();
            browser.runtime.sendMessage(`Successfully enabled SOCKS proxy: ${socksProxy} | No proxy for: ${noProxyHosts}`);
        }
    });

    /** Implement the SOCKS proxy using socksProxy/noProxyHosts settigns */
    function FindProxyForURL(url, host) {
        // Uncomment for debug
        // browser.runtime.sendMessage({RequestURL: url, NoProxyHosts: noProxyHosts, SOCKSProxy: socksProxy});
        if (noProxyHosts.indexOf(host) != -1) {
            return noProxy;
        }
        return socksProxy;
    }

    // PAC file initialized
    browser.runtime.sendMessage("PAC initialized successfully.");
})();