var Peepub  = require('../Peepub.js');
var _       = require('lodash');
var fs      = require('fs');
var cheerio = require('cheerio');
var path    = require('path');

describe("Peepub Basics", function() {
  it("is a function", function() {
    expect(typeof Peepub).toBe('function');
  });
  
  var epubJson        = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
  });
  
  
  it("made a contentopf alright", function(){
    
    var contentOpf = '';
    runs(function(){
      pp._contentOpf(function(copf){
        contentOpf = copf;
      })
    });

    waitsFor(function(){
      return contentOpf !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(contentOpf).not.toEqual('');
      pp.clean();
    });
  });
  
  it("cretaes a meta tag for the cover image and adds it to the manifest", function(){
    
    var contentOpf = '';
    runs(function(){
      pp._contentOpf(function(copf){
        contentOpf = copf;
      })
    });

    waitsFor(function(){
      return contentOpf !== '';
    }, "it to assemble everything");

    runs(function(){
      var $ = cheerio.load(contentOpf);
      expect($("item[id='cover-image']").length).not.toBe(0);
      expect($("meta[content='cover-image']").length).not.toBe(0);
      pp.clean();
    });
  });
  
  it("creates a proper file structure with necessaries", function(){
    var epubPath = '';
    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(epubPath)).toBe(true);
      expect(fs.existsSync(epubPath + 'mimetype')).toBe(true);
      expect(fs.readFileSync(epubPath + 'mimetype', 'utf8')).toEqual('application/epub+zip');
      expect(fs.existsSync(epubPath + 'META-INF/')).toBe(true);
      expect(fs.existsSync(epubPath + 'META-INF/container.xml')).toBe(true);
      pp.clean();
    });
  });
  
});



describe("Content OPFs", function() {
  
  var epubJson = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp, pp_opf;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
    pp_opf = pp._contentOpf({ fetchAssets : false });
    
  });
  
  it("can template", function(){
    expect(pp_opf.match(epubJson.title)).not.toBeNull();
  });
  
  it("has multiple subjects", function(){
    for(var i in epubJson.subjects){
      expect(pp_opf.match(epubJson.subjects[i])).not.toBeNull();
    }
  });
  
  it("creates uuids by default", function(){
    pp.set('uuid', null);
    pp.set('isbn', null);
    pp.set('url', null);
    var opf = pp._contentOpf({ fetchAssets : false });
    expect(opf.match('>urn:uuid:')).not.toBeNull();
    expect(opf.match('>urn:isbn:')).toBeNull();
    expect(opf.match('>url:')).toBeNull();
  });
  
  it("only ever has one identifier", function(){
    pp.set('uuid', null);
    pp.set('isbn', 'abc');
    pp.set('url', 'http://thepeoplesebook.net');
    var opf = pp._contentOpf({ fetchAssets : false });
    expect(opf.match('>urn:uuid:')).toBeNull();
    expect(opf.match('>urn:isbn:')).not.toBeNull();
    expect(opf.match('>url:')).toBeNull();
  });
  
  it("throws if there it's missing required fields", function(){
    pp.set('title', null);
    expect(pp.getJson).toThrow();
  });
  
  it("will be nice and handle plurals for you", function(){
    pp.set('subject', epubJson.subjects[0]);
    pp.set('subjects', null);
    var opf = pp._contentOpf({ fetchAssets : false });
    expect(opf.match(epubJson.subjects[0])).not.toBeNull();
    expect(opf.match(epubJson.subjects[1])).toBeNull();
  });
  
  it("will make css files for you", function(){
    var epubPath = '';
    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'styles')).toBe(true);
      pp.clean();
    });
  });
  
  it("puts the css in the manifest", function(){
    var epubPath = '';
    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      var contentopf = fs.readFileSync(pp.contentOpfPath(), 'utf8');
      var $ = cheerio.load(contentopf);
      
      _.each(pp.assets.css, function(css){
        var itemCss = $('manifest item[id='+css.id+']');
        expect(itemCss.length).toBe(1);
        expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + css.href)).toBe(true);
      });
      
      pp.clean();
    });
  });
  
  
  it("puts the js in the manifest", function(){
    var epubPath = '';
    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      var contentopf = fs.readFileSync(pp.contentOpfPath(), 'utf8');
      var $ = cheerio.load(contentopf);
      
      _.each(pp.assets.js, function(js){
        var itemJs = $('manifest item[id='+js.id+']');
        expect(itemJs.length).toBe(1);
        expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + js.href)).toBe(true);
      });
      
      pp.clean();
    });
  });

});
