/*
 * Copyright (c) 2016 Oracle and/or its affiliates. 
 *
 * The Universal Permissive License (UPL), Version 1.0
 *
 * Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this
 * software, associated documentation and/or data (collectively the "Software"), free of charge and under any and 
 * all copyright rights in the Software, and any and all patent rights owned or freely licensable by each 
 * licensor hereunder covering either (i) the unmodified Software as contributed to or provided by such licensor,
 * or (ii) the Larger Works (as defined below), to deal in both
 *
 *
 * (a) the Software, and
 *
 * (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software
 * (each a “Larger Work” to which the Software is contributed by such licensors),
 *
 * without restriction, including without limitation the rights to copy, create derivative works of, display, 
 * perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and
 * have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other 
 * terms.
 *
 * This license is subject to the following condition:
 *
 * The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL
 * must be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 */

var exec = require('cordova/exec');

/** @type {?} */
var _XMLHttpRequest = window.XMLHttpRequest;
window.XMLHttpRequest = function ()
{
  this._delegate = new _XMLHttpRequest(arguments);
};

// define readonly properties conditionally overridden with a local private.
// if the local private exists, it will be used; otherwise, the property of the delegate is used
["readyState", "response", "responseText", "responseURL", "responseXML",
  "status", "statusText", "upload", "DONE", "HEADERS_RECIEVED", "LOADING",
  "OPENED", "UNSENT"].forEach(function (propName)
{
  Object.defineProperty(window.XMLHttpRequest.prototype, propName,
    {
      "get": function ()
      {
        if (this["_" + propName])
          return this["_" + propName];
        else
          return this._delegate[propName];
      }
    });
});

// define read/write properties that are direct passthru to the delegate
["responseType", "timeout", "withCredentials"].forEach(function (propName)
{
  Object.defineProperty(window.XMLHttpRequest.prototype, propName,
    {
      "get": function ()
      {
        return this._delegate[propName];
      },
      "set": function (value)
      {
        this._delegate[propName] = value;
      }
    });
});

// define read/write event listener properties that are passthru to the delegate after binding to the wrapper.
// the bind makes sure the callback is called in context of the wraper versus the delegate.
["onreadystatechange", "ontimeout", "onloadstart", "onprogress", "onabort", "onerror",
  "onload", "onloadend"].forEach(function (propName)
{
  Object.defineProperty(window.XMLHttpRequest.prototype, propName,
    {
      "get": function ()
      {
        return this._delegate[propName];
      },
      "set": function (value)
      {
        this._delegate[propName] = (typeof value === "function") ? value.bind(this) : value;
      }
    });
});

// define functions that are passthru to the delegate
["setRequestHeader", "abort", "getResponseHeader", "getAllResponseHeaders", "overrideMimeType",
  "removeEventListener", "dispatchEvent"].forEach(function (methodName)
{
  window.XMLHttpRequest.prototype[methodName] = function ()
  {
    try
    {
      return this._delegate[methodName].apply(this._delegate, arguments);
    } catch (e)
    {
      console.log(e.toString());
    }
  };
});

// rebinds the listener callback function so that it is invoked in the context of the wrapper 
// versus the delegate. the callback will reference the overloaded read/write properties first.
window.XMLHttpRequest.prototype["addEventListener"] = function (type, listener)
{
  this._delegate["addEventListener"](type, listener.bind(this));
};

// creates an XHR event to be dispatched on the delegate
window.XMLHttpRequest.prototype._dispatchEvent = function (type, props)
{
  /** @type {?} */
  var event = document.createEvent("Event");
  event["initEvent"](type, false, false);
  ["total", "totalSize", "loaded", "lengthComputable", "position"].forEach(function (propName)
  {
    if (props && props[propName])
    {
      Object.defineProperty(event, propName, {value: props[propName]});
    }
  });
  this["dispatchEvent"](event);
};

// maps a handler to the response type
window.XMLHttpRequest.prototype._getHandlerForResponseType = function ()
{
  var that = this;
  var HANDLERS =
    {
      "": {
        "method": "readAsText",
        "properties": ["_response", "_responseText"],
        "convert": function (r)
        {
          this._size = r["length"];
          return r;
        },
        "responseSize": function ()
        {
          return isNaN(this._size) ? 0 : this._size;
        }
      },
      "text":
        {
          "method": "readAsText",
          "properties": ["_response", "_responseText"],
          "convert": function (r)
          {
            this._size = r["length"];
            return r;
          },
          "responseSize": function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "arraybuffer":
        {
          "method": "readAsArrayBuffer",
          "properties": ["_response"],
          "convert": function (r)
          {
            this._size = r["byteLength"];
            return r;
          },
          "responseSize": function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "json":
        {
          "method": "readAsText",
          "properties": ["_response"],
          "convert": function (r)
          {
            this._size = r["length"];
            return JSON.parse(r);
          },
          "responseSize": function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "document":
        {
          "method": "readAsText",
          "properties": ["_response", "_responseXML"],
          "convert": function (r)
          {
            this._size = r["length"];
            return new DOMParser().parseFromString(r, "text/xml");
          },
          "responseSize": function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        },
      "blob":
        {
          "method": "readAsArrayBuffer",
          "properties": ["_response"],
          "convert": function (r)
          {
            var EXTTOMIME = {
              ".img": "image/jpeg",
              ".png": "image/png",
              ".gif": "image/gif",
              ".xml": "application/xml",
              ".xsl": "application/xml",
              ".html": "text/html",
              ".htm": "text/html",
              ".svg": "image/svg+xml",
              ".svgz": "image/svg+xml",
              ".json": "application/json",
              ".js": "application/javascript"
            };
            var ext = that._uri["substr"](that._uri["lastIndexOf"]('.'));
            var type = EXTTOMIME[ext] ? EXTTOMIME[ext] : "";
            var blob = new Blob([r], {"type": type});
            this._size = blob.size;
            return blob;
          },
          "responseSize": function ()
          {
            return isNaN(this._size) ? 0 : this._size;
          }
        }
    };

  var responseType = this["responseType"];
  if (HANDLERS[responseType])
    return HANDLERS[responseType];
  else
    return HANDLERS[""];
};

// if the method is GET, save off the target URL. This indicates the send will read the target
// resource via the cordova file-xhr plugin
window.XMLHttpRequest.prototype["open"] = function ()
{
  var method = arguments[0];
  var uri = arguments[1];
  if (window["webkit"] && window["cordova"] && "GET" === method &&
    typeof uri === "string" && uri.indexOf("://") === -1 &&
    window.location.protocol === "file:")
    this._uri = uri;
  else
    this._delegate["open"]["apply"](this._delegate, arguments);
};

// if the open url was captured, use the native code to get the resource; otherwise, delegate to the original.
window.XMLHttpRequest.prototype["send"] = function ()
{
  if (!this._uri)
    return this._delegate["send"]["apply"](this._delegate, arguments);

  var rspTypeHandler = this._getHandlerForResponseType();
  var success = function (result)
  {
    //console.log("File Loaded: " + this._uri);
    var convertedResult = rspTypeHandler["convert"](result);
    var properties = rspTypeHandler["properties"];
    for (var i = 0; i < properties.length; i++)
      this[properties[i]] = convertedResult;
    this["_readyState"] = 4;
    this["_status"] = 200;
    this["_statusText"] = "OK";
    this["_responseURL"] = this._uri;
    this._dispatchEvent("loadstart", {"lengthComputable": false, "loaded": 0, "position": 0, "total": 0, "totalSize": 0});
    var respSize = rspTypeHandler["responseSize"]();
    var finalProps = {"lengthComputable": true, "loaded": respSize, "position": respSize, "total": respSize, "totalSize": respSize};
    this._dispatchEvent("readystatechange", finalProps);
    this._dispatchEvent("progress", finalProps);
    this._dispatchEvent("load", finalProps);
    this._dispatchEvent("loadend", finalProps);
  };
  var error = function (e)
  {
    console.log("xhr-polyfill.js - Unable to find file: " + this._uri);
    console.log(e.toString());
    this["_status"] = 404;
    this["_responseText"] = "";
    var errorProps = {"lengthComputable": false, "loaded": 0, "position": 0, "total": 0, "totalSize": 0};
    this._dispatchEvent("loadstart", errorProps);
    this._dispatchEvent("readystatechange", errorProps);
    this._dispatchEvent("progress", errorProps);
    this._dispatchEvent("error", errorProps);
    this._dispatchEvent("loadend", errorProps);
  };

  var method = rspTypeHandler["method"];
  exec(success.bind(this), error.bind(this), "CDVWKWebViewFileXhr", method, [this._uri]);
};
