// register service worker
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/service-worker.js').then((registration) => {
		console.log('ServiceWorker registered with scope: ', registration.scope);
	}).catch((err) => {
		console.log('ServiceWorker registration failed: ', err);
	});
}

// modify document
document.getElementById('message').innerHTML = 'Hello from JavaScript!';