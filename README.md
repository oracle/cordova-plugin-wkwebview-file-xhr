# cordova-plugin-wkwebview-file-xhr 1.0.0

## About the cordova-plugin-wkwebview-file-xhr

The plugin provides an XMLHttpRequest polyfill that allows loading resources from the "www" folder of the main resource bundle when using WKWebView.  The default behavior of WKWebView is to raise a cross origin exception when loading files from the main bundle using the file protocol - "file://".  This plugin works around this shortcoming by loading files via native code if the browsers current location has "file" protocol and the target URL passed to the open method of the XMLHttpRequest is relative. As a security measure, the plugin verifies that the standardized path of the target URL is within the "www" folder of the applications main bundle.

## Installation

Plugin installation requires Cordova 4+, iOS 9+ and the WKWebView plugin - "cordova-plugin-wkwebview-engine".

```
cordova plugin add cordova-plugin-wkwebview-file-xhr
```

Supported Platforms
------------------

* iOS

Quick Example
------------

```
var xhr = XMLHttpRequest();
xhr.addEventListener("loadend", function(evt) 
 {
   var data = this.responseText;
   document.getElementById("myregion").innerHtml = data; 
 });
xhr.open("GET", "js/views/customers.html");
xhr.send();
```

## Running Plugin Tests
Our plugin uses the [Cordova Plugin Test Framework](https://github.com/apache/cordova-plugin-test-framework/blob/master/README.md) for its test automation strategy.

###Steps to Run

+ Create a cordova project using the cordova CLI:

    cordova create test oj.test TestFileXhr
    cd test
    cordova platform add ios
  
+ Install the test harness:

    cordova plugin add http://git-wip-us.apache.org/repos/asf/cordova-plugin-test-framework.git

+ Change the start page in "`test/config.xml`" with `<content src="cdvtests/index.html"/>`.
+ Install "`cordova-plugin-wkwebview-file-xhr`" plugin and associated tests:

    cordova plugin add https://github.com/oracle/cordova-plugin-wkwebview-file-xhr.git
    cordova plugin add https://github.com/oracle/cordova-plugin-wkwebview-file-xhr.git#/tests

+ Open the Xcode project "`test/platforms/ios/TestFileXhr.xcodeproj`" in the Xcode IDE and run.  Alternatively, use the cordova CLI:

    cordova build
    cordova run ios
    
### Known Issues

### [Contributing](CONTRIBUTING.md)
This is an open source project maintained by Oracle Corp. Pull Requests are currently not being accepted. See [CONTRIBUTING](CONTRIBUTING.md) for details.

### [License](LICENSE.md)
Copyright (c) 2017 Oracle and/or its affiliates
The Universal Permissive License (UPL), Version 1.0

