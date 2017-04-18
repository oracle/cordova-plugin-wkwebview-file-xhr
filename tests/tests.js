/*
 Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 The Universal Permissive License (UPL), Version 1.0
 */

/* jshint jasmine: true */
/* global Connection */

exports.defineAutoTests = function ()
{

  function createXhr()
  {
    var xhr = new XMLHttpRequest();
    return xhr;
  }
  ;

  describe('XHR file:// GET', function ()
  {
    it("responseType text, loadend addEventListener", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("folder.");
        done();
      }

      var xhr = createXhr();
      xhr.addEventListener("loadend", loadend);
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.send();

    });

    it("responseType text, loadend onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("folder.");
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.send();
    });

    it("responseType text, loadend onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("folder.");
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.send();
    });


    it("responseType arraybuffer, loaded onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response instanceof ArrayBuffer).toEqual(true);
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.responseType = "arraybuffer";
      xhr.send();
    });

    it("responseType blob, loaded onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response instanceof Blob).toEqual(true);
        expect(this.response.type).toEqual("text/html");
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.responseType = "blob";
      xhr.send();
    });

    it("responseType document, loaded onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response instanceof Document).toEqual(true);
        expect(this.response.getElementById("contentHeader").textContent).toEqual("Customers Content Area");
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.responseType = "document";
      xhr.send();
    });

    it("responseType json, loaded onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.name).toEqual("anonymous");
        expect(this.response.comment).toContain("Copyright (c) 2014, 2016");
        done();
      }

      var xhr = createXhr();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.json");
      xhr.responseType = "json";
      xhr.send();
    });
  });

  describe('XHR remote http://jsonplaceholder.typicode.com', function ()
  {
    it("Remote XHR GET Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.userId).toEqual(1);
        expect(this.response.id).toEqual(1);
        done();
      }

      var xhr = createXhr();
      xhr.open("GET", "http://jsonplaceholder.typicode.com/posts/1");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.send();
    });

    it("Remote XHR POST Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(201);
        expect(this.response).toBeDefined();
        expect(this.response.userId).toEqual(1);
        expect(this.response.title).toEqual("foo");
        expect(this.response.body).toEqual("bar");
        done();
      }

      var xhr = createXhr();
      xhr.open("POST", "http://jsonplaceholder.typicode.com/posts");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(JSON.stringify({"title": "foo", "body": "bar", "userId": 1}));
    });
  });
  
  describe('Cordova API', function ()
  {
    it("CDVWKWebViewFileXhr readAsText no args", function (done)
    {
      function success()
      {
        // should not be called
        expect(true).toEqual(false);
        done();
      }
      function error()
      {
        expect(true).toEqual(true);
        done();
      }
      var exec = require('cordova/exec');
      // invoke readAsText with on arguments.  expected outcome is an error
      exec(success, error, "CDVWKWebViewFileXhr", "readAsText", []);
    });
    
    it("CDVWKWebViewFileXhr readAsArrayBuffer no args", function (done)
    {
      function success()
      {
        // should not be called
        expect(true).toEqual(false);
        done();
      }
      function error()
      {
        expect(true).toEqual(true);
        done();
      }
      var exec = require('cordova/exec');
      // invoke readAsArrayBuffer with on arguments.  expected outcome is an error
      exec(success, error, "CDVWKWebViewFileXhr", "readAsArrayBuffer", []);
    });    
  });
};
