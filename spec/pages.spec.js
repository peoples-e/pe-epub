var Peepub          = require('../Peepub.js');
var _               = require('lodash');
var cheerio         = require('cheerio');
var fs              = require('fs');
var path            = require('path');
var epubJson        = require('../examples/example.json');
var minimumEpubJson = require('../examples/minimum.json');
var pp,min_pp;


describe("Page Handling", function(){
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson), true);
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson), true);
  });
  
  it("templates the titles page", function(){
    for(var i in epubJson.pages){
      var reg = new RegExp('<title>\s*'+epubJson.pages[i].title+'\s*</title>');
      expect(pp._getPage(i).match(reg)).not.toBeNull();
    }
  });
  
  it("creates pages", function(){
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
      expect(fs.existsSync(pp.getJson().pages[0].path)).not.toBeNull();
      expect(fs.existsSync(pp.getJson().pages[0].path)).toBe(true);
      pp.clean();
    });
    
  });
  
  it("adds pages to the manifest", function(){
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
      _.each(pp.getJson().pages, function(page){
        var itemPage = $('item#' + page.id);
        expect(itemPage.length).toBe(1);
        expect(itemPage.attr('href').match(page.id)).not.toBeNull();
      });
      
      pp.clean();
    });
  });
  
  it("adds pages to the spine", function(){
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
      _.each(pp.getJson().pages, function(page){
        var itemPage = $('spine itemref[idref='+page.id+']');
        expect(itemPage.length).toBe(1);
      });
      
      pp.clean();
    });
  });
  
  it("puts a css/link tag in every page", function(){
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
      var $          = cheerio.load(contentopf);
      var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + pp.json.pages[0].href, 'utf8');
      var $page      = cheerio.load(firstPage);
      
      _.each(pp.assets.css, function(css){
        var itemCss = $('manifest item[id='+css.id+']');
        expect($page("link[href='"+$(itemCss).attr('href')+"']").length).toBe(1);
      });
      
      pp.clean();
    });
  });
  
  it("puts a js/script tag in every page", function(){
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
      var $          = cheerio.load(contentopf);
      var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + pp.json.pages[0].href, 'utf8');
      var $page      = cheerio.load(firstPage);
      
      _.each(pp.assets.js, function(js){
        var itemJs = $('manifest item[id='+js.id+']');
        expect($page("script[src='"+$(itemJs).attr('href')+"']").length).toBe(1);
      });
      
      pp.clean();
    });
  });
  
  it("removes problem webkit chars", function(){
    var epubPath = '';
    runs(function(){
      pp.json.pages[0].body += '&nbsp;&shy;&nbsp;&shy;';
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + pp.json.pages[0].href, 'utf8');
      var $page      = cheerio.load(firstPage);
      
      expect($page.html().match(/&nbsp;/)).toBe(null);
      expect($page.html().match(/&shy;/)).toBe(null);
      
      // pp.clean();
    });
  });

  it("can pull in local pages", function(){
    var epubPath = '';
    var localTestFile = __dirname + "/assets/test.html";

    fs.writeFileSync(localTestFile, "<!DOCTYPE html>\n<body>\n" + min_pp.json.pages[0].body + "\n</body>\n</html>");
    var ogPageBody = min_pp.json.pages[0].body;
    min_pp.json.pages[0].body = 'file://' + localTestFile;

    runs(function(){
      min_pp.create(function(err, file){
        epubPath = min_pp._epubPath();
      });
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + min_pp.json.pages[0].href, 'utf8');
      var $page      = cheerio.load(firstPage);

      expect($page('body').html().replace(/(\n|\t)/g, '')).toBe(ogPageBody.replace(/(\n|\t)/g, ''));

      fs.unlinkSync(localTestFile);
      min_pp.clean();
    });
  });

});
