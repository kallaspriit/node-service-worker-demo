/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
if (!Cache.prototype.addAll) {
	// cache.addAll polyfill https://github.com/coonsta/cache-polyfill
	Cache.prototype.addAll = function addAll(requests) {
		var cache = this;

		// Since DOMExceptions are not constructable:
		function NetworkError(message) {
			this.name = 'NetworkError';
			this.code = 19;
			this.message = message;
		}

		NetworkError.prototype = Object.create(Error.prototype);

		return Promise.resolve().then(function () {
			if (arguments.length < 1) throw new TypeError();

			// Simulate sequence<(Request or USVString)> binding:
			var sequence = [];

			requests = requests.map(function (request) {
				if (request instanceof Request) {
					return request;
				}
				else {
					return String(request); // may throw TypeError
				}
			});

			return Promise.all(
				requests.map(function (request) {
					if (typeof request === 'string') {
						request = new Request(request);
					}

					var scheme = new URL(request.url).protocol;

					if (scheme !== 'http:' && scheme !== 'https:') {
						throw new NetworkError("Invalid scheme");
					}

					return fetch(request.clone());
				})
			);
		}).then(function (responses) {
			// TODO: check that requests don't overwrite one another
			// (don't think this is possible to polyfill due to opaque responses)
			return Promise.all(
				responses.map(function (response, i) {
					return cache.put(requests[i], response);
				})
			);
		}).then(function () {
			return undefined;
		});
	};
}

// configuration
var version = '1.0.0';
var cacheName = 'cache-' + version;
var cachedResources = [
	'/',
	'/app.css',
	'/app.js'
];
var expectedCaches = [
	cacheName
];


// installs the service worker, setting up caches
self.oninstall = function(event) {
	console.log('installing');

	// skip the waiting state and immediately activate even while service worker clients are using the registration
	// to ensure that updates to the underlying service worker take effect immediately for both the current client and
	// all other active clients
	self.skipWaiting();

	// install completes when we open the cache and cache all the requested resources
	event.waitUntil(
		caches.open(cacheName)
			.then(function(cache) {
				console.log('caching resources', cachedResources);

				return cache.addAll(cachedResources);
			}).then(function() {
				console.log('install complete');
			}).catch(function() {
				console.warn('install failed');
			})
	);
};

// called on activation, removes un-needed caches
self.onactivate = function(event) {
	console.log('activate');

	// set itself as the active worker for a client page when the worker and the page are in the same scope
	if (self.clients && clients.claim) {
		clients.claim();
	}

	// list available caches and remove ones we don't use
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			console.log('available caches', cacheNames);

			// remove caches not in the expected caches list
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (expectedCaches.indexOf(cacheName) == -1) {
						console.log('delete cache', cacheName);

						return caches.delete(cacheName);
					}
				})
			);
		})
	);
};

// intercepts fetch requests, possibly responding with cached data
self.onfetch = function (event) {
	// the request url could be used to pass some resources through without matching cache
	var requestURL = new URL(event.request.url);

	// try to match request to cache
	event.respondWith(
		caches.match(event.request, {
			ignoreVary: true
		}).then(function(response) {
			// we have a cache hit, return it
			if (response) {
				console.log('cache hit', requestURL.href);

				return response;
			}

			console.log('cache miss', requestURL.href);

			// didn't find it in the cache, pass request to fetch to try to load it from the internet
			return fetch(event.request);
		})
	);
};