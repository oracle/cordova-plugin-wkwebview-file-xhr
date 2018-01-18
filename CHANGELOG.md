# Change Log

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
