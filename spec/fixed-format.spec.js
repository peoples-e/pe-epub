var Peepub  = require('../Peepub.js');
var _       = require('lodash');
var fs      = require('fs');
var cheerio = require('cheerio');
// var path    = require('path');
var epubJson        = require('../examples/fixed-format.json');
var pp,min_pp;

describe("Fixed Format EPUB", function(){
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
  });

  it("throws with required fixed format fields", function(){
    pp.set('fixedFormat', {});
    expect(pp.getJson).toThrow();
  });
  
it("puts a viewport tag in all the pages", function(){
  var epubPath = '';
  runs(function(){
    pp.create(function(err, file){
      epubPath = pp._epubPath();
    })
  });

  waitsFor(function(){
    return epubPath !== '';
  }, "it to assemble everything");

  runs(function(){
    var firstPage  = fs.readFileSync(epubPath + Peepub.EPUB_CONTENT_DIR + pp.json.pages[0].href, 'utf8');
    var $page      = cheerio.load(firstPage, { xmlMode : true });

    expect($page("meta[name=viewport]").length).toBe(1);
    pp.clean();
  });
});

  xit("creates apple display options file", function(){
    var epubPath = '';
    runs(function(){
      pp.create(function(err, file){
        epubPath = pp._epubPath();
      })
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){

      expect(fs.existsSync(epubPath + Peepub.EPUB_CONTENT_DIR + 'com.apple.ibooks.display-options.xml')).toBe(true);
      pp.clean();
    });
  });
  
});