var Peepub = require('../Peepub.js');
var _      = require('lodash');

xdescribe("Peepub Basics", function() {
  
  it("is a function", function() {
    expect(typeof Peepub).toBe('function');
  });
  
  var epubJson = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
  });
  
  it("can template", function(){
    expect(pp.contentOpf().match(epubJson.title)).not.toBeNull();
  });
  
  it("has multiple subjects", function(){
    for(var i in epubJson.subjects){
      expect(pp.contentOpf().match(epubJson.subjects[i])).not.toBeNull();
    }
    // console.log(pp.contentOpf());
  });
  
  it("creates uuids by default", function(){
    pp.set('uuid', null);
    pp.set('isbn', null);
    pp.set('url', null);
    expect(pp.contentOpf().match('>urn:uuid:')).not.toBeNull();
    expect(pp.contentOpf().match('>urn:isbn:')).toBeNull();
    expect(pp.contentOpf().match('>url:')).toBeNull();
  });
  
  it("only ever has one identifier", function(){
    pp.set('uuid', null);
    pp.set('isbn', 'abc');
    pp.set('url', 'http://thepeoplesebook.net');
    expect(pp.contentOpf().match('>urn:uuid:')).toBeNull();
    expect(pp.contentOpf().match('>urn:isbn:')).not.toBeNull();
    expect(pp.contentOpf().match('>url:')).toBeNull();
  });
  
  it("throws if there it's missing required fields", function(){
    pp.set('title', null);
    expect(pp.getJson).toThrow();
  });
  
  it("will be nice and handle plurals for you", function(){
    pp.set('subject', epubJson.subjects[0]);
    pp.set('subjects', null);
    expect(pp.contentOpf().match(epubJson.subjects[0])).not.toBeNull();
    expect(pp.contentOpf().match(epubJson.subjects[1])).toBeNull();
  });

  
  
  
});
