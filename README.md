# Node Service Worker Demo
**Service workers caching demo using node.js express HTTPS server.**

This minimal example demonstrates how to setup service worker to cache web application resources using a service worker.
It also shows how to setup local HTTPS node.js server to test this and configure your browser to accept self-signed
certificates (google chrome). The server is written in ES2015 and uses babel.

Setting up the server
=====================
- install node.js dependencies
  - `npm install`
- generate certicate for https
  - `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365`
  - make sure to use either "localhost" as the common name or your ip address if you want to test on mobile etc
- install global babel for running the server written in ES2015
  - `npm install --global babel`
- start the server
  - `babel-node server`
- open your browser
  - [https://localhost](https://localhost)

Unfortunately your'le likely to get the following error:

`DOMException: Failed to register a ServiceWorker: An SSL certificate error occurred when fetching the script.`

As the certificate you created is self-signed, the browser won't be happy to load the service worker from our server,
even though it is https. To get around this, we can add our own certificate to the trusted root authorities.

Make the browser happy
======================
For reasons exaplained above, we should register our self-generated certificate. The following applies for Google
Chrome.
- Click on lock icon https in URL
- Choose "certificate information"
- Choose "Details" tab
- Click on "Copy to File..."
- Dialog appears, choose "Next"
- Leave first option "DER encoded binary X.509 (.CER)
- Choose file name anywhere > Next > Finish > Ok > Ok
- Open chrome settings, choose "Show advanced settings..."
- Under HTTPS/SSL, choose "Manage certificates"
- Choose "Trusted Root Certification Authoroties" > "Import..."
- Choose exported file and import > Next > Finish
- Restart chrome and re-open [https://localhost](https://localhost)

Testing
=======
- After restarting your browser, load the site again and now the log should say something like
```
installing
app.js:4 ServiceWorker registered with scope:  https://localhost/
service-worker.js:23 cache opened, adding files ["/", "/app.css", "/app.js"]
service-worker.js:29 installed in 24ms
service-worker.js:43 available caches ["cache-1.0.0"]
```
- You can now play around with the service worker code in `service-worker.js` and toy with the ideas given in links
below.
- You can invalidate the cache by changing the version number in the service worker.
- For testing installing service worker repeatedly, open the demo in a new incognito window, this clears all caches.

Extra info
==========
- [HTML5rocks - Introduction to Service Worker](http://www.html5rocks.com/en/tutorials/service-worker/introduction/) by Matt Gaunt
- [Github - Service Workers Demos](https://github.com/w3c-webmob/ServiceWorkersDemos) by Web and Mobile Interest Group
- [YouTube - Using the service worker](https://www.youtube.com/watch?v=SdMxGNkZqnU) by Jake Archibald
- [Github - Service workers demo for talk above](https://github.com/jakearchibald/trained-to-thrill) by Jake Archibald