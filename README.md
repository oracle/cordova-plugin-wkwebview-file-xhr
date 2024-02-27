# NOTICE FOR DEVELOPERS USING WKWebView AND MapBox GL JS

This fork fixes the issue that URLs are not correctly escaped. This is specifically an issue for programmers using WKWebView and MapBox GL JS in their Cordova apps.

If you are receiving the error "ERROR: {message: "Bad request"}" after switching to WKWebView, then this is the fix for you!

Unfortunately, Oracle (who developed this plugin originally) aren't accepting pull requests, so a fork is the only option.

See: https://github.com/oracle/cordova-plugin-wkwebview-file-xhr/issues/53

# cordova-plugin-wkwebview-file-xhr 2.1.4

## About the cordova-plugin-wkwebview-file-xhr

This plugin makes it possible to reap the performance benefits of using the WKWebView in your Cordova app by resolving the following issues:

* The default behavior of WKWebView is to raise a cross origin exception when loading files from the main bundle using the file protocol - "file://".  This plugin works around this shortcoming by loading files via native code if the web view's current location has "file" protocol and the target URL passed to the open method of the XMLHttpRequest is relative. As a security measure, the plugin verifies that the standardized path of the target URL is within the "www" folder of the application's main bundle or in the /Library path of the application data directory.

* Since the application's starting page is loaded from the device's file system, all XHR requests to remote endpoints are considered cross origin.  For such requests, WKWebView specifies "null" as the value of the Origin header, which will be rejected by endpoints that are configured to disallow requests from the null origin. This plugin works around that issue by handling all remote requests at the native layer where the origin header will be excluded.

## Installation

Plugin installation requires Cordova 4+ and iOS 9+. It will install the Apache Cordova WKWebView plugin `cordova-plugin-wkwebview-engine`.

```
cordova plugin add cordova-plugin-wkwebview-file-xhr
```

Note : If your cordova-ios version is less than 6.0.0. You need to add following dependency to plugin.xml
```
<dependency id="cordova-plugin-wkwebview-engine" />
```
Alternatively you can use this plugin's version 2.1.4

## Supported Platforms

* iOS

## Quick Example

```javascript
// read local resource
var xhr = new XMLHttpRequest();
xhr.addEventListener("loadend", function(evt)
 {
   var data = this.responseText;
   document.getElementById("myregion").innerHTML = data;
 });

xhr.open("GET", "js/views/customers.html");
xhr.send();

// post to remote endpoint
var xhr = new XMLHttpRequest();
xhr.addEventListener("loadend", function(evt)
 {
   var product = this.response;
   document.getElementById("productId").value = product.id;
   document.getElementById("productName").value = product.name;
 });

xhr.open("POST", "https://myremote/endpoint/product");
xhr.responseType = "json";
xhr.setRequestHeader("Content-Type", "application/json");
xhr.setRequestHeader("Accept", "application/json");
xhr.send(JSON.stringify({name: "Product 99"}));
```

## Configuration

The following configuration options modify the default behavior of the plugin.  The values are specified in
config.xml as preferences:

<ul>
 <li>AllowUntrustedCerts: on|off (default: off).  If "on", requests routed to the native implementation will accept self signed SSL certificates. This preference should only be enabled for testing purposes.</li>
 <li>InterceptRemoteRequests: all|secureOnly|none (default: secureOnly). Controls what types of remote XHR requests are intercepted and handled by the plugin. The plugin always intercepts requests with the file:// protocol. By default, the plugin will intercept only secure protocol requests ("https").</li>
 <li>NativeXHRLogging: none|full (default: none).  If "full" the javascript layer will produce logging of the XHR requests sent through the native to the javascript console.  Note:  natively routed XHR requests will not appear in the web inspector utility when "InterceptRemoteRequests" is "all" or "secureOnly".</li>
</ul>

### Known Issues
The plugin caches cookies at the native layer between requests but it does not attempt to sync cookies between the WKWebView and the native sessions. From the JavaScript context, this means "document.cookie" won't contain any cookies returned from XHR handled at the native layer and the native iOS XHR will not see any cookies returned from remote resources fetched by the browser context, such as images.

Whilst this plugin resolves the main issues preventing the use of the Apache Cordova WKWebView plugin, there are other [known issues](https://issues.apache.org/jira/browse/CB-12074?jql=project%20%3D%20CB%20AND%20status%20%3D%20Open%20AND%20labels%20%3D%20wkwebview-known-issues) with that plugin.

### [Changes](CHANGELOG.md)
See [CHANGELOG](CHANGELOG.md).

### Contributing
This project is not accepting external contributions at this time. For bugs or enhancement requests, please file a GitHub issue unless it’s security related. When filing a bug remember that the better written the bug is, the more likely it is to be fixed. If you think you’ve found a security vulnerability, do not raise a GitHub issue and follow the instructions in our [security policy](./SECURITY.md).

### Security
Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

### License
Copyright (c) 2018, 2023 Oracle and/or its affiliates
The Universal Permissive License (UPL), Version 1.0
