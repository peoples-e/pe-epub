var Peepub  = require('../Peepub.js');
var _       = require('lodash');
var cheerio = require('cheerio');
var fs      = require('fs');


describe("Page Handling", function(){
  var epubJson        = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
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
      pp.create(function(pth){
        epubPath = pth;
      })
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
      pp.create(function(pth){
        epubPath = pth;
      })
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
  
  
});
