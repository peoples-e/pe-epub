var Peepub     = require('../Peepub.js');
var _          = require('lodash');
var fs         = require('fs');
var cheerio    = require('cheerio');
var path       = require('path');
var epubJson   = require('../examples/example.json');
var brokenJson = require('../examples/broken.json');
var pp,min_pp;

describe("Broken / Problematic Json", function(){
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(brokenJson), true);
  });
  
  it("won't freak out about bad assets", function(){
    var epubPath = '';
    var error = false;
    runs(function(){
      pp.create()
      .then(function(file){
        epubPath = pp._epubPath();
      })
      .fail(function(err){
        error = err;
      })
    });

    waitsFor(function(){
      return epubPath !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(error).toBe(false);
      pp.clean();
    });
  });
});