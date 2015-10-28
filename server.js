import https from 'https';
import fs from 'fs';
import express from 'express';
import marked from 'marked';

// https credentials
const httpsCredentials = {
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem'),
	passphrase: '1234'
};

// create express server
const app = express();

// replace the guide in index file with readme contents
app.get('/', (req, res) => {
	const markdown = fs.readFileSync('README.md', 'utf8');
	let html = fs.readFileSync('index.html', 'utf8');

	// replace {guide} with HTML version of the markdown document
	html = html.replace('{guide}', marked(markdown));

	res.send(html);
});

// serve static files
app.use(express.static('./'));

// create server for https
https.createServer(httpsCredentials, app).listen(443);

console.log('https server running on https://localhost');