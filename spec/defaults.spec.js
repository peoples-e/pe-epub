var Peepub  = require('../Peepub.js');
var _       = require('lodash');
var fs      = require('fs');
var cheerio = require('cheerio');
var path    = require('path');

describe("Pepub Defaults ", function() {
  
  var epubJson        = require('../examples/example.json');
  var minimumEpubJson = require('../examples/minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson), true);
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson), true);
  });

  it("throw if there it's missing required fields", function(){
    pp.set('title', null);
    expect(pp.getJson).toThrow();
  });

  function properDate(dateStr){
    var d    = new Date(dateStr);
    var m    = d.getMonth() + 1;
    var day  = d.getDate();
    if (m.toString().length === 1) {
      m = '0' + m;
    }
    if (day.toString().length === 1) {
      day = '0' + day;
    }
    return d.getFullYear() + '-' + m + '-' + day;
  }

  it("handle the date for you if you dont have one", function(){
    pp.json.date = null;
    var opf = pp._contentOpf({ fetchAssets : false });
    var $   = cheerio.load(opf, { xmlMode : true });
    var matches = opf.match(/<dc:date>([^<]+)<\/dc:date>/);
    expect(matches[1]).not.toBeNull();
    expect(matches[1]).toBe(properDate(Date.now()));
  });

  it("handle bad dates 1", function(){
    pp.json.date = '3-4-2011';
    var opf = pp._contentOpf({ fetchAssets : false });
    var $   = cheerio.load(opf, { xmlMode : true });
    var matches = opf.match(/<dc:date>([^<]+)<\/dc:date>/);
    expect(matches[1]).not.toBeNull();
    expect(matches[1]).toBe('2011-03-04');
  });

  it("handle bad dates 2", function(){
    pp.json.date = '3/4/2011';
    var opf = pp._contentOpf({ fetchAssets : false });
    var $   = cheerio.load(opf, { xmlMode : true });
    var matches = opf.match(/<dc:date>([^<]+)<\/dc:date>/);
    expect(matches[1]).not.toBeNull();
    expect(matches[1]).toBe('2011-03-04');
  });

  it("unintelligable dates", function(){
    pp.json.date = 'abc';
    var opf = pp._contentOpf({ fetchAssets : false });
    var $   = cheerio.load(opf, { xmlMode : true });
    var matches = opf.match(/<dc:date>([^<]+)<\/dc:date>/);
    expect(matches[1]).not.toBeNull();
    expect(matches[1]).toBe(properDate(Date.now()));
  });

});