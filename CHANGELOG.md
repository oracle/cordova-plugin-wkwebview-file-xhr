# Change Log
## cordova-plugin-wkwebview-file-xhr v2.1.3 (11/22/2019)
* Rectifcation of Object.toString incorrect behavior with FormData polyfil (issue #39).
* Fix for double encoding of URL UTF-8 params (issue #41).

## cordova-plugin-wkwebovew-file-xhr v2.1.2 (10/22/2019)
* Support for xhr content served from application data directory in addition to the application package . (issue #45)
* Simulating file not found condition was firing the HEADERS_RECIEVED ready state change before setting the response status code (issue #33)

## cordova-plugin-wkwebview-file-xhr v2.1.1 (01/18/2018)
* XMLHttpRequest setRequestHeader normalizes the value pair to string types (issue #13).

## cordova-plugin-wkwebview-file-xhr v2.1.0 (12/1/2017)
* Added a FormData polyfill that works in tandem with the XMLHttpRequest polyfill (issue #4).
* Fixed compatibility issues with iOS 11 (issue #6).
* Rewired incorrect firing of the onerror event (issue #9).

## cordova-plugin-wkwebview-file-xhr v2.0.0 (9/20/2017)
* Introduced a new feature to intercept remote XHR requests bypassing wkwebivew's CORS handling.
* Bundled in the [whatwg-fetch](https://github.com/github/fetch) polyfill.
* Added several new configuration preferences - [README](README.md#configuration).

## cordova-plugin-wkwebview-file-xhr v1.0.0
* Bypassed wkwebview CORS handling of the XMLHttpRequest when loading file:// resources.
