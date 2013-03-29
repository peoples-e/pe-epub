# pe-epub

"peepub" makes epubs better.  Our goal is to make it as easy as possible to output a valid epub.

## JSON > EPUB
Here's the bare minimum you (will) need to make an epub

	{
		"title" : "The Peoples E-Book",
		"cover" : "http://placekitten.com/600/800",
		"pages" : [{
			"title" : "PE-EPUB",
			"body" : "Making ebooks better."
		}]
	}

### TODO
* Do TOC
* Zip everything
* validate

### Testing
	npm install -g jasmine-node
	jasmine-node spec