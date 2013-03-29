var Peepub = require('../Peepub.js');
var _      = require('lodash');


xdescribe("Page Handling", function() {
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
  
  // pp = new Peepub(_.cloneDeep(epubJson));
  // pp._gatherAssets(function(ass){
  //   console.log(ass);
  // });
});

xdescribe("Async Page Handling", function(){
  var epubJson = require('../example.json');
  var minimumEpubJson = require('../minimum.json');
  var pp,min_pp;
  
  beforeEach(function(){
    pp = new Peepub(_.cloneDeep(epubJson));
    min_pp = new Peepub(_.cloneDeep(minimumEpubJson));
  });
  
  afterEach(function() {
    // pp.clean();
    // min_pp.clean();
  });
  
  it("can make a contentOpf Asynch", function(){
      var contentOpf = '';
      runs(function(){
        pp.contentOpf(function(copf){
          contentOpf = copf;
        })
      });
      
      waitsFor(function(){
        return contentOpf !== '';
      }, "it to fetch the assets");
      
      runs(function(){
        expect(contentOpf).not.toEqual('');
        console.log(contentOpf);
      })
      
    });
  
  
});