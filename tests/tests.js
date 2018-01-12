/*
 Copyright (c) 2014, 2016, Oracle and/or its affiliates.
 The Universal Permissive License (UPL), Version 1.0
 */

/* jshint jasmine: true */
/* global Connection */

exports.defineAutoTests = function ()
{
  var SECURE_TESTS_DOMAIN = "https://den01cxr.us.oracle.com:7102";
  var NONSECURE_TESTS_DOMAIN = "http://den01cxr.us.oracle.com:7101";

  var expects = {};

  window.xhrCallback = function (id, result)
  {
    expects[id](result);
    delete expects[id];
  };


  describe('FormData Polyfill:', function ()
  {
    it("basic API", function (done)
    {
      var fd = new FormData();
      
      // set & get
      fd.set("foo", "bar1");
      expect(fd.get("foo")).toBe("bar1");
      
      // append & get
      fd.append("foo", "bar2");
      expect(fd.get("foo")).toBe("bar1");
      
      // getAll
      var values = fd.getAll("foo");
      expect(values).toContain("bar1");
      expect(values).toContain("bar2");
      
      // values
      var vit = fd.values();
      var e = vit.next();
      expect(e.done).toBe(false);
      expect(e.value).toBe("bar1");
      var e = vit.next();
      expect(e.done).toBe(false);      
      expect(e.value).toBe("bar2");
      var e = vit.next();
      expect(e.done).toBe(true);      
      
      // entries
      var eit = fd.entries();
      e = eit.next();
      expect(e.done).toBe(false);      
      expect(e.value[0]).toBe("foo");
      expect(e.value[1]).toBe("bar1");
      e = eit.next();
      expect(e.done).toBe(false);      
      expect(e.value[0]).toBe("foo");
      expect(e.value[1]).toBe("bar2");
      e = eit.next();
      expect(e.done).toBe(true);
      
      // has, get && delete
      fd.set("bar", "foo");
      expect(fd.get("bar")).toBe("foo");
      expect(fd.has("bar")).toBe(true);
      fd.delete("bar");  
      expect(fd.get("bar")).toBe(undefined);
      expect(fd.has("bar")).toBe(false);
      
      // keys
      fd.set("bar", "foo");
      var kit = fd.keys();
      e = kit.next();
      expect(e.done).toBe(false);
      expect(e.value).toBe("foo");
      e = kit.next();
      expect(e.done).toBe(false);
      expect(e.value).toBe("bar");
      e = kit.next();
      expect(e.done).toBe(true);
      
      // forEach
      var i = 0;
      fd.forEach(function (value, key, fd) 
      {
        expect(["bar1", "bar2", "foo"]).toContain(value);
        expect(["foo", "bar"]).toContain(key);
        expect(fd).toBeDefined();
        expect(fd.set).toBeDefined();
        expect(fd.get).toBeDefined();
        i++;
      });

      expect(i).toBe(3);
      
      // angularJS uses the toString in the $http service for isFormData check
      expect(fd.toString()).toBe("[object FormData]");
      
      done();
      
    });
    
    it("HtmlFormElement constructor", function (done)
    {
      function createForm()
      {
        var node = document.createElement("form");
        return node;
      }
      
      function createInputText()
      {
        var node = document.createElement("input");
        node.id = "in1";
        node.name = "input1";
        node.value = "value1";
        return node;
      }
      
      function createSelectSingle()
      {
        var select = document.createElement("select");
        select.id = "select1";
        
        var option = document.createElement("option");
        option.value = "option1";
        select.appendChild(option);
        
        option = document.createElement("option");
        option.value = "option2";
        option.selected = true;
        select.appendChild(option);
        
        return select;
      }
      
      function createCheckbox()
      {
        var node = document.createElement("input");
        node.id = "checkbox1";
        node.type = "checkbox";
        node.value = "checked1";
        node.checked = true;
        return node;
      }
      
      var form = createForm();
      form.appendChild(createInputText());
      form.appendChild(createSelectSingle());
      form.appendChild(createCheckbox());
      document.body.appendChild(form);
      
      var fd = new FormData(form);
      expect(fd.get("input1")).toBe("value1");
      expect(fd.get("select1")).toBe("option2");
      expect(fd.get("checkbox1")).toBe("checked1");
      
      document.body.removeChild(form);
      done();
    });
    
    it("https:// mixed types document response", function (done)
    {

      var file3Content = btoa("Content of Blob 3");
      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.response instanceof Document).toEqual(true);
        expect(this.response.querySelector("#request-content-type").textContent)
              .toContain("multipart/form-data");
        expect(this.response.querySelector("#field1").textContent).toEqual("1");
        expect(this.response.querySelector("#field2").textContent).toEqual("2");
        expect(this.response.querySelector("#file1").textContent).toEqual("Content of Blob 1");
        expect(this.response.querySelector("#file1").getAttribute("filename")).toEqual("file1.txt");   
        expect(this.response.querySelector("#file2").textContent).toEqual("Content of Blob 2");
        expect(this.response.querySelector("#file2").getAttribute("filename")).toEqual("file2.txt");
        expect(this.response.querySelector("#file3").textContent).toEqual(file3Content);
        expect(this.response.querySelector("#file3").getAttribute("filename")).toEqual("file3.txt");

        done();
      }

      var fd = new FormData();
      fd.append("field1", "1");
      fd.append("field2", "2");
      
      var file1 = new Blob(["Content of Blob 1"], {type: "text/html"});
      fd.append("file1", file1, "file1.txt");

      var file2 = new Blob(["Content of Blob 2"], {type: "text/html"});
      fd.append("file2", file2, "file2.txt");

      var file3 = new Blob([file3Content]);
      fd.append("file3", file3, "file3.txt");

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/servletmultipart");
      xhr.responseType = "document";
      xhr.send(fd);

    });
    
    it("http:// mixed types document response", function (done)
    {
      // uses native FormData thru the Delegate to the native XMLHttpRequest
      
      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.response instanceof Document).toEqual(true);
        expect(this.response.querySelector("#request-content-type").textContent)
              .toContain("multipart/form-data");
        expect(this.response.querySelector("#field1").textContent).toEqual("1");
        expect(this.response.querySelector("#field2").textContent).toEqual("2");
        expect(this.response.querySelector("#file1").textContent).toEqual("Content of Blob 1");
        expect(this.response.querySelector("#file1").getAttribute("filename")).toEqual("file1.txt");   
        expect(this.response.querySelector("#file2").textContent).toEqual("Content of Blob 2");
        expect(this.response.querySelector("#file2").getAttribute("filename")).toEqual("file2.txt");
        done();
      }

      var fd = new FormData();
      fd.append("field1", "1");
      fd.append("field2", "2");
      
      var file1 = new Blob(["Content of Blob 1"], {type: "text/html"});
      fd.append("file1", file1, "file1.txt");

      var file2 = new Blob(["Content of Blob 2"], {type: "text/html"});
      fd.append("file2", file2, "file2.txt");

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.open("POST",
        NONSECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/servletmultipart");
      xhr.responseType = "document";
      xhr.send(fd);

    });
    
    it("download/upload/binary compare", function(done)
    {
      // 1) download an image as a blob
      // 2) add the blob to a form data and send it back to the server as a multipart form
      // 3) server performs a binary compare of the original file to the uploaded
      // 4) returns a document response with the results of the compare

      var downloadPromise = new Promise(function (resolve, reject)
      {
        var xhr = new XMLHttpRequest();
        xhr.onloadend = function (event)
        {          
          resolve(xhr.response);
        };
        xhr.onerror = function (event)
        {
          reject(xhr.response);
          
        };
        
        xhr.responseType = "blob";
        xhr.open("GET", SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/servletmultipartplayback");
        xhr.send();
      });
      
      downloadPromise.then(function (blob) 
      {
        expect(blob).toBeDefined();
        expect(blob instanceof Blob).toEqual(true);
        expect(blob.type).toEqual("image/png");
        
        var fd = new FormData();
        fd.append("simple-test", blob, "simple-test.html");
        
        var xhr = new XMLHttpRequest();
        xhr.onloadend = function ()
        {
          expect(this.readyState).toBe(this.DONE);
          expect(this.status).toBe(200);
          expect(this.response instanceof Document).toEqual(true);
          expect(this.response.querySelector("#are-same").textContent).toEqual("true");
          done();
        };
        xhr.responseType = "document";
        xhr.open("POST", SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/servletmultipartplayback");
        xhr.send(fd);
     
      });
      
      
    }, 120000);
    
    
  });

  describe('http:// GET remote:', function ()
  {
    it("responseType text, loadend addEventListener", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("Hello World");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.html");
      xhr.send();

    });

    it("responseType text, loadend onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("Hello World");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.html");
      xhr.send();
    });

    it("responseType text, loadend onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("Hello World");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.html");
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

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.png");
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

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.html");
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
        expect(this.response.querySelector("h1").textContent).toEqual("Hello World");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.html");
      xhr.responseType = "document";
      xhr.send();
    });

    it("responseType json, loaded onloadend", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.message).toEqual("Hello World");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/simple-test.json");
      xhr.responseType = "json";
      xhr.send();
    });
  });

  describe('http:// POST remote:', function ()
  {
    it("post HTML with responseType text, loadend addEventListener", function (done)
    {
      var html = "<html><body><h1>Hello World</h1></body></html>";

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response).toEqual(html);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "text";
      xhr.send(html);
    });

    it("post ArrayBuffer with responseType ArrayBuffer, onloadend listener", function (done)
    {
      var bin = [];
      bin.length = 1000;
      bin.fill(0, 0, 1000);

      var inBuff = new Int8Array(bin);

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response instanceof ArrayBuffer).toBeDefined();

        // compare content
        var outBuff = new Int8Array(this.response);
        var bout = outBuff['slice'] ? outBuff.slice() : outBuff;
        var isSame = true;
        for (var i = 0; i < bout.length; i++)
        {
          if (bout[i] !== bin[i])
          {
            isSame = false;
            break;
          }
        }

        expect(isSame).toEqual(true);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "arraybuffer";
      xhr.send(inBuff);
    });

    it("post ArrayBuffer with responseType Blob, onloadend listener", function (done)
    {
      function toArrayBuffer(blob)
      {
        var reader = new FileReader();
        var promise = new Promise(function (resolve, reject)
        {
          reader.onload = function ()
          {
            resolve(reader.result);
          };

        });

        reader.readAsArrayBuffer(blob);
        return promise;
      }


      var bin = [];
      bin.length = 1000;
      bin.fill(0, 0, 1000);
      var inBuff = new Int8Array(bin);

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response instanceof Blob).toBeDefined();

        toArrayBuffer(this.response).then(function (response)
        {
          // compare content
          var outBuff = new Int8Array(response);
          var bout = outBuff['slice'] ? outBuff.slice() : outBuff;
          var isSame = true;
          for (var i = 0; i < bout.length; i++)
          {
            if (bout[i] !== bin[i])
            {
              isSame = false;
              break;
            }
          }

          expect(isSame).toEqual(true);
          done();
        });
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "blob";
      xhr.send(inBuff);
    });

   
    it("post FormData with responseType text, onloadend listener", function (done)
    {
      var fd = new FormData();
      fd.append("param1", "1");
      fd.append("param2", "2");

      function loadend(event)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();        
        expect(this.response).toContain('content-disposition: form-data; name="param1"');
        expect(this.response).toContain('content-disposition: form-data; name="param2"');
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "text";
      var runit = false;
      xhr.send(fd);

    });

    it("post document with responseType document, onloadend listener", function (done)
    {

      function loadend(event)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.title).toEqual(document.title);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "document";
      xhr.send(document);

    });

    it("post HTML test upload events", function (done)
    {
      var html = "<html><body><h1>Hello World</h1></body></html>";

      var uploadEvents = [];
      function captureUploadEvents(event)
      {
        uploadEvents.push(event.type);
      }

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response).toEqual(html);
        expect(uploadEvents).toContain("loadstart");
        expect(uploadEvents).toContain("progress");
        expect(uploadEvents).toContain("load");
        expect(uploadEvents).toContain("loadend");
        done();
      }

      var xhr = new XMLHttpRequest();

      ["ontimeout", "onloadstart", "onprogress", "onabort", "onerror", "onload", "onloadend"
      ].forEach(function (propName)
      {
        xhr.upload[propName] = captureUploadEvents;
      });

      xhr.onloadend = loadend;
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "text";
      xhr.send(html);
    });

  });


  describe('file:// GET:', function ()
  {
    _resolveUri = function (uri)
    {
      var resolver = document.createElement("a");
      document.body.appendChild(resolver);
      resolver.href = uri;
      var absoluteUri = resolver.href;
      resolver.parentNode.removeChild(resolver);
      return absoluteUri;
    };


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

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.html");
      xhr.send();

    });

    it("responseType text, absolute URL, loadend addEventListener", function (done)
    {

      function loadend(evt)
      {
        expect(this.readyState).toBe(this.DONE);
        expect(this.status).toBe(200);
        expect(this.responseText).toBeDefined();
        expect(this.responseText).toContain("folder.");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      var uri = _resolveUri("../wkwebview-file-xhr-tests/customers.html");
      xhr.open("GET", uri);
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

      var xhr = new XMLHttpRequest();
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

      var xhr = new XMLHttpRequest();
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

      var xhr = new XMLHttpRequest();
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

      var xhr = new XMLHttpRequest();
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
        expect(this.response.getElementById("contentHeader").textContent).toEqual(
          "Customers Content Area");
        done();
      }

      var xhr = new XMLHttpRequest();
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

      var xhr = new XMLHttpRequest();
      xhr.onloadend = loadend;
      xhr.open("GET", "wkwebview-file-xhr-tests/customers.json");
      xhr.responseType = "json";
      xhr.send();
    });
  });

  describe('REST end-points:', function ()
  {
    it("GET Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        var products = this.response;
        expect(products.length).toEqual(100);
        expect(products[0].id).toEqual(0);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("GET",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/get");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.send();
    });

    it("POST Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.id).toEqual(99);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/post");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(JSON.stringify({id: 99, name: "Product 99"}));
    });

    it("PUT Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.id).toEqual(99);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("PUT",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/put");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(JSON.stringify({id: 99, name: "Product 99"}));
    });

    it("DELETE Request", function (done)
    {
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response.id).toEqual(99);
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("DELETE",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/delete");
      xhr.onloadend = loadend;
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(JSON.stringify({id: 99, name: "Product 99"}));
    });

    it("POST 500 server error", function (done)
    {
      var events = [];
      function logEvents(event)
      {
        events.push(event.type);
      }

      function loadend(evt)
      {
        expect(this.status).toBe(500);
        expect(this.response).toBeDefined();
        expect(events).toContain("loadstart");
        expect(events).toContain("progress");
        expect(events).not.toContain("error");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/exceptionservlet");
      xhr.onloadend = loadend;
      xhr.onloadstart = logEvents;
      xhr.onprogress = logEvents;
      xhr.onerror = logEvents;

      xhr.send(" ");
    });

    it("POST timeout", function (done)
    {
      var events = [];
      function logEvents(event)
      {
        events.push(event.type);
      }

      function loadend(evt)
      {
        expect(this.status).toBe(0);
        expect(this.response).not.toBeDefined();
        expect(events).toContain("loadstart");
        expect(events).toContain("progress");
        expect(events).toContain("timeout");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/postTimeout");
      xhr.onloadend = loadend;
      xhr.onloadstart = logEvents;
      xhr.onprogress = logEvents;
      xhr.ontimeout = logEvents;
      xhr.timeout = 1;
      xhr.responseType = "json";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "application/json");
      xhr.send(JSON.stringify({timeout: 5000}));
    });

    it("GET utf-16", function (done)
    {

      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toEqual(unescape("nice tunes \u000E\u000E"));
        expect(this.getResponseHeader("content-type")).toEqual("text/html;charset=utf-16");
        expect(this.getResponseHeader("Content-Type")).toEqual("text/html;charset=utf-16");
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.open("GET",
        SECURE_TESTS_DOMAIN +
        "/RestApp-ViewController-context-root/rest/products/getspecialenc");
      xhr.onloadend = loadend;
      xhr.responseType = "text";
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("Accept", "text/html");
      xhr.send();
    });

  }, 10000);

  describe('Cordova API:', function ()
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

    it("CDVWKWebViewFileXhr readAsText relative path security 404", function (done)
    {
      function success()
      {
        // should not be called
        expect(true).toEqual(false);
        done();
      }
      function error(msg)
      {
        expect(true).toEqual(true);
        done();
      }
      var exec = require('cordova/exec');
      // invoke readAsArrayBuffer with on arguments.  expected outcome is an error
      exec(success, error, "CDVWKWebViewFileXhr", "readAsText", ["../cordova/Api.js"]);
    });
  });

  describe('nativeXHR remote GET', function ()
  {
    it("nativeXHR GET Request", function (done)
    {
      expects["id1"] = function (result)
      {
        expect(result.response.statusCode).toBe(200);
        expect(result.response.mimeType).toBe("application/json");
        expect(result.response.localizedStatusCode).toBe("no error");
        expect(result.response.allHeaderFields).toBeDefined();
        expect(result.response.allHeaderFields["Content-Type"]).toBe("application/json");
        expect(result.response.allHeaderFields["Content-Length"]).toBe("3881");
        expect(result.response.mimeType).toBe("application/json");
        expect(result.error).not.toBeDefined();
        expect(result.data).toBeDefined();
        done();
      };

      var xhr = {};
      xhr.headers = {"Content-Type": "application/json", "Accept": "application/json"};
      xhr.url = SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/get";
      xhr.id = "id1";
      xhr.method = "GET";
      xhr.callback = "xhrCallback";
      window.webkit.messageHandlers.nativeXHR.postMessage(xhr);
    });

    it("nativeXHR GET Missing Resource Request", function (done)
    {
      expects["id2"] = function (result)
      {
        expect(result.response.statusCode).toBe(404);
        expect(result.error).not.toBeDefined();
        expect(result.data).toBeDefined();
        done();
      };

      var xhr = {};
      xhr.url = SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/does-not-exist";
      xhr.id = "id2";
      xhr.callback = "xhrCallback";
      window.webkit.messageHandlers.nativeXHR.postMessage(xhr);
    });

    it("nativeXHR GET Server Doesn't Exist", function (done)
    {
      expects["id3"] = function (result)
      {
        expect(result.response).not.toBeDefined();
        expect(result.error).toBeDefined();
        expect(result.data).not.toBeDefined();
        done();
      };

      var xhr = {};
      xhr.url = "http://i-am-not.a.validserver.us.oracle.com/";
      xhr.id = "id3";
      xhr.callback = "xhrCallback";
      window.webkit.messageHandlers.nativeXHR.postMessage(xhr);
    });

    it("nativeXHR getConfig", function (done)
    {

      function success(result)
      {
        // should not be called
        expect(result.InterceptRemoteRequests).toEqual("secureOnly");
        expect(["none", "full"]).toContain(result.NativeXHRLogging);
        done();
      }
      function error()
      {
        expect(false).toEqual(true);
        done();
      }
      var exec = require('cordova/exec');
      exec(success, error, "CDVWKWebViewFileXhr", "getConfig", []);

    });

    it("nativeXHR GET timeout", function (done)
    {
      expects["id4"] = function (result)
      {
        expect(result.response).not.toBeDefined();
        expect(result.error).toBeDefined();
        expect(result.error).toEqual("The request timed out.");
        expect(result.underlyingErrorCode).toBeDefined();
        expect(result.underlyingErrorCode).toEqual(-1001);
        expect(result.data).not.toBeDefined();
        done();
      };

      var xhr = {};
      xhr.headers = {"Content-Type": "application/json", "Accept": "application/json"};
      xhr.url = SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/rest/products/postTimeout";
      xhr.id = "id4";
      xhr.timeout = 1;
      xhr.callback = "xhrCallback";
      xhr.method = "POST"
      xhr.body = btoa(JSON.stringify({timeout: 5000}));
      window.webkit.messageHandlers.nativeXHR.postMessage(xhr);
    });

  describe('Custom Headers', function ()
  {
    it("normalize types", function (done)
    {
      var html = "<html><body><h1>Hello World</h1></body></html>";

      var now = new Date();
      
      function loadend(evt)
      {
        expect(this.status).toBe(200);
        expect(this.response).toBeDefined();
        expect(this.response).toEqual(html);
        expect(this.getResponseHeader("x-custom-1")).toEqual("42");
        expect(this.getResponseHeader("x-custom-2")).toEqual("1,2,3");
        expect(this.getResponseHeader("x-custom-3")).toEqual(now.toString());
        done();
      }

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("loadend", loadend);
      xhr.setRequestHeader("x-custom-1", 42);
      xhr.setRequestHeader("x-custom-2", [1, 2, 3]);
      xhr.setRequestHeader("x-custom-3", now);
      xhr.open("POST",
        SECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
      xhr.responseType = "text";
      xhr.send(html);
    });

  });
    /* 
     This test is disabled due to the endpoint.  The application's config.xml must be configured with
     the AllowUntrustedCerts = on preference to enable support for self signed certificates
     */
    /*
     it("nativeXHR testAllowUntrustedCerts", function (done)
     {
     expects["id5"] = function (result)
     {
     expect(result.response.statusCode).toEqual(200);
     done();
     };
     
     var xhr = {};
     xhr.url = "https://den02mkn.us.oracle.com:4443/serviceapi/entityModel/metadata/entityTypes?count=true";
     xhr.headers = {"authorization": "Basic ZW1hYXN0ZXN0dGVuYW50MS5lbWNzYWRtaW46V2VsY29tZTEh",
     "cache-control": "no-cache",
     "x-user-identity-domain-name": "emaastesttenant1"};
     xhr.id = "id5";
     xhr.callback = "xhrCallback";
     window.webkit.messageHandlers.nativeXHR.postMessage(xhr);
     }, 30000);
     */
  });

  /*
   // commented out the PSR tests as they take several minutes to run
   describe('PSR Remote:', function ()
   {
   function getMbBuffer(numMbs)
   {
   if (isNaN(numMbs))
   numMbs = 1;
   
   var fillArray = [];
   var bytes = numMbs * 1048576;
   fillArray.length = bytes;
   fillArray.fill(0, 0, bytes);
   
   return new Int8Array(fillArray);
   }
   
   function getMbString(numMbs)
   {
   if (isNaN(numMbs))
   numMbs = 1;
   
   var fillArray = [];
   var bytes = numMbs * 1048576;
   fillArray.length = bytes;
   fillArray.fill(0, 0, bytes);
   
   return fillArray.join("");
   }
   
   var logSummary = [];
   function logMeasure(test, buffsize, startTs)
   {
   var totalSecs = ((performance.now() - startTs) / 1000);
   var totalMb = buffsize / 1048576;
   var mbPerSecs = totalSecs / totalMb; 
   
   
   var msg = [test, "send/recieve", buffsize, "bytes in", + 
   totalSecs, 
   "sec(s)."].join(" ");
   
   var tokens = test.split(" ");
   logSummary.push(['"' + tokens[0] + '"',
   '"' + tokens[1] + '"',
   tokens[2],
   totalMb, 
   totalSecs,
   mbPerSecs].join(","));
   
   console.log(msg);
   }
   
   function dumpLogSummary()
   {
   var xhr = new XMLHttpRequest();
   xhr.open("POST",
   SECURE_TESTS_DOMAIN +
   "/RestApp-ViewController-context-root/rest/products/postPsrLog");
   xhr.responseType = "text";
   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.setRequestHeader("Accept", "text/html");
   xhr.send(logSummary.join("\n"));
   logSummary = [];
   }
   
   function psrTest(description, sizeInMb, resonseType, xhr, resolve)
   {
   var buff;
   if ("arraybuffer" === resonseType)
   buff = getMbBuffer(sizeInMb);
   else if ("text" === resonseType)
   buff = getMbString(sizeInMb);
   
   var startTs;
   
   function loadend(evt)
   {
   expect(this.status).toBe(200);
   expect(this.response).toBeDefined();
   
   var size = Number.NaN;
   if ("arraybuffer" === resonseType && this.response && !isNaN(this.response['byteLength']))
   size = this.response.byteLength;
   else if ("text" === resonseType && this.response && !isNaN(this.response['length']))
   size = this.response.length;
   
   logMeasure(description, size, startTs);
   resolve(true);
   }
   
   xhr.onloadend = loadend;
   xhr.open("POST",
   NONSECURE_TESTS_DOMAIN + "/RestApp-ViewController-context-root/playbackservlet");
   xhr.responseType = resonseType;
   
   startTs = performance.now();
   xhr.send(buff);
   }
   
   function sendXHR(description, sizeInMB, resonseType, xhr)
   {
   var execCallback = psrTest.bind(this, description, sizeInMB, resonseType, xhr);
   return new Promise(execCallback);
   }
   
   var MAX_RETRIES = 3;
   var MAX_MB = 5;
   
   function forEach(responseType, xhrType, retry, sizeInMb)
   {
   if (isNaN(retry))
   retry = 1;
   if (isNaN(sizeInMb))
   sizeInMb = 1;
   
   var description = [xhrType, responseType, retry].join(" ");
   
   var xhr;
   if (xhrType === "NativeJS")
   {
   xhr = new window._XMLHttpRequest();
   }
   else if (xhrType === "DelegateNativeJS")
   {
   xhr = new XMLHttpRequest();
   xhr.__setInterceptRemoteRequests("none");
   }
   else if (xhrType === "NativeIOS")
   {
   xhr = new XMLHttpRequest();
   xhr.__setInterceptRemoteRequests("all");
   }
   
   return sendXHR(description, sizeInMb, responseType, xhr).then(function ()
   {
   if (MAX_RETRIES < ++retry)
   {
   retry = 1;
   if (MAX_MB < ++sizeInMb)
   return Promise.resolve(true);
   }
   
   return forEach(responseType, xhrType, retry, sizeInMb);            
   });
   }
   
   it("Native JS arraybuffer send/recieve", function (done)
   {
   forEach("arraybuffer", "NativeJS").then(function ()
   {
   done();
   });
   }, 240000);
   
   it("Delegate Native JS arraybuffer send/recieve", function (done)
   {
   forEach("arraybuffer", "DelegateNativeJS").then(function ()
   {
   done();
   });
   }, 240000);
   
   it("Native IOS arraybuffer send/recieve", function (done)
   {
   forEach("arraybuffer", "NativeIOS").then(function ()
   {
   done();
   });
   }, 240000);
   
   
   it("Native JS text send/recieve", function (done)
   {
   forEach("text", "NativeJS").then(function ()
   {
   done();
   });
   }, 240000);
   
   it("Delegate Native JS text send/recieve", function (done)
   {
   forEach("text", "DelegateNativeJS").then(function ()
   {
   done();
   });
   }, 240000);
   
   it("Native IOS text send/recieve", function (done)
   {
   forEach("text", "NativeIOS").then(function ()
   {
   done();
   dumpLogSummary();
   });
   }, 240000);
   });
   
   */
};

