var Peepub          = require('../Peepub.js');
var _               = require('lodash');
var cheerio         = require('cheerio');
var fs              = require('fs');
var epubJson        = require('../examples/example.json');
var minimumEpubJson = require('../examples/minimum.json');
var path            = require('path');
var pp,min_pp;


describe("TOC functionality", function(){
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson), true);
  });
  
  it("always creates a toc.html and toc.ncx", function(){
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
      expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'toc.html')).toBe(true);
      expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'toc.ncx')).toBe(true);
      pp.clean();
    });
  });
  
  it("puts the desired pages in the toc.html", function(){
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
      var toc = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'toc.html', 'utf8');
      var $   = cheerio.load(toc);
      _.each(pp.getTocPages(), function(page){
        expect($("nav li a[href='"+page.href+"']").length).toBe(1);
      });
      pp.clean();
    });
  });
  
  it("puts the desired pages in the toc.ncx", function(){
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
      var toc = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'toc.ncx', 'utf8');
      var $   = cheerio.load(toc);
      
      _.each(pp.getTocPages(), function(page){
        expect($("content[src='"+page.href+"']").length).toBe(1);
      });
      pp.clean();
    });
  });

  it("included the unique id in the toc.ncx", function(){
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
      var toc = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'toc.ncx', 'utf8');
      var $   = cheerio.load(toc, { xmlMode : true });
      
      expect($("meta[content='"+pp.json.url+"']").length).toBe(1);
      pp.clean();
    });
  });
  
  it("adds the tocs files to the manifest", function(){
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
      
      expect($("manifest item[href='toc.html']").length).toBe(1);
      expect($("manifest item[href='toc.ncx']").length).toBe(1);
      
      pp.clean();
    });
  });
});
