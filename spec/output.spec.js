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
  
  it("create() by default outputs an epub in base64", function(){
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
      expect(epubFile.length > 1000).toBe(true);
    });
  });
  
  it("if you give create() a file name and path it will put the epub there", function(){
    var epubFile = '';
    var whereToPutIt = __dirname + '/assets/test.epub';
    runs(function(){
      pp.create(whereToPutIt, function(err, file){
        epubFile = file;
      })
    });

    waitsFor(function(){
      return epubFile !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(whereToPutIt)).toBe(true);
      pp.clean();
    });
  });

  it("if you give create() a path it will make name and put the epub there", function(){
    var epubFile = '';
    var whereToPutIt = __dirname + '/assets/';
    runs(function(){
      pp.create(whereToPutIt, function(err, file){
        epubFile = file;
      })
    });

    waitsFor(function(){
      return epubFile !== '';
    }, "it to assemble everything");

    runs(function(){
      expect(fs.existsSync(epubFile)).toBe(true);
      pp.clean();
    });
  });

  it("create() returns a promise", function(){
    var epubFile = '';
    var whereToPutIt = __dirname + '/assets/';
    runs(function(){
      pp.create(whereToPutIt)
      .then(function(file){
        epubFile = file;
      });
    });

    waitsFor(function(){
      return epubFile !== '';
    }, "it to assemble everything", 10000);

    runs(function(){
      expect(fs.existsSync(epubFile)).toBe(true);
      pp.clean();
    });
  });

});