var Peepub  = require('../Peepub.js');
var _       = require('lodash');
var fs      = require('fs');

// var cheerio = require('cheerio');
// var path    = require('path');
var epubJson        = require('../examples/example.json');
var minimumEpubJson = require('../examples/minimum.json');
var pp,min_pp;

describe("Outputting an EPUB", function(){
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
  });
  
  it("outputs an epub", function(){
    var epubFile = '';
    runs(function(){
      pp.create(function(err, file){
        epubFile = file;
      })
    });

    waitsFor(function(){
      return epubFile !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(epubFile)).toBe(true);
      // pp.clean();
    });
  });
  
});