var Peepub = require('../Peepub.js');
var _      = require('lodash');


describe("Page Handling", function() {
  var epubJson = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
  });
  
  // it("allows pages to be strings or html", function(){
  //     var pageBody = '';
  //     runs(function(){
  //       min_pp.getPage(0, function(page){
  //         pageBody = page;
  //       });
  //     });
  //     
  //     waitsFor(function(){
  //       return pageBody !== '';
  //     });
  //     
  //     runs(function(){
  //       expect(pageBody).toEqual(minimumEpubJson.pages[0].body);
  //     })
  //     
  //   });
  
  pp = new Peepub(_.cloneDeep(epubJson));
  pp._gatherAssets(function(ass){
    console.log(ass);
  });
});