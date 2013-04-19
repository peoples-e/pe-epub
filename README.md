# pe-epub

"peepub" makes epubs better.  Our goal is to make it as easy as possible to output a valid epub.  Peepub is for Node.js

## JSON > EPUB
Here's the bare minimum you need to make an epub

	{
		"title" : "The Peoples E-Book",
		"cover" : "http://placekitten.com/600/800",
		"pages" : [{
			"title" : "PE-EPUB",
			"body" : "Making ebooks better."
		}]
	}
	
## Usage
	var Peepub   = require('pe-epub');
	var epubJson = require('your-epub.json'); // see example.json for the specs
	var myPeepub = new Peepub(epubJson);
	
	myPeepub.create(function(err, epubPath){
		console.log(epubPath); // your epub file!
	});

### TODO
* remove file system dependencies
* run in browser
* handle audio tags
* validate

### Testing
	npm install -g jasmine-node
	jasmine-node spec