# pe-epub

makes epubs better.  

Our goal is to make it as easy as possible to output a valid epub. 

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
	
## Install	
	npm install pe-pub
	
## Usage
	var Peepub   = require('pe-epub');
	var epubJson = require('your-epub.json'); // see examples/example.json for the specs
	var myPeepub = new Peepub(epubJson);
	
	myPeepub.create(function(err, base64epub){
		console.log(base64epub); // your epub file!
	});

or...

	myPeepub.create('/path/to/epub/and/fileName.epub', function(err, filePath){
		console.log(filePath); // the same path to your epub file!
	});

or...

	myPeepub.create('/path/to/epub/', function(err, filePath){
		console.log(filePath); // the same path but we made up a file name for u
	});

### TODO
* validate
* run in browser (one day)

### Testing
	npm install -g jasmine-node
	jasmine-node spec