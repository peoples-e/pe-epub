var _          = require('lodash');
var handlebars = require('handlebars');
var fs         = require("fs");
var cheerio    = require('cheerio');
var http       = require('http');
var path       = require('path');

var templatesDir = __dirname + '/templates/';

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};


function Peepub(){
  this.json = {};
  if(arguments[0]){
    this.json = arguments[0];
  }
  this.id = guid();
  this.requiredFields = ['title', 'cover']; // we'll take care of publish date and uuid
  this.assets = {
    css     : [],
    js      : [],
    assets  : []
  }
  
}
Peepub.EPUB_DIR = __dirname + '/epubs/';

Peepub.prototype._handleDefaults = function(){
  
  var d = new Date;
  var m = d.getMonth() + 1 + '';
  if(m.length == 1) m = '0' + m;
  this.json.date = this.json.date || d.getFullYear() + '-' + m + '-' + d.getDate();
  this.json.language = this.json.language || 'en-US';

  // identifiers - can be isbn,url,uuid in that order of preference
  if(!this.json.isbn && !this.json.url && !this.json.uuid){
    this.json.uuid = guid();

  } else if(this.json.isbn) {
    this.json.url = null;
    this.json.uuid = null;

  } else if(this.json.url) {
    this.json.uuid = null;
  }
  
  // creators
}

Peepub.prototype._epubPath = function(add){
  var dir = Peepub.EPUB_DIR + this.id + '/';
  if(add){ 
    this._epubPath();
    dir += add + '/';
  }
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  } 
  return dir;
}

Peepub.prototype.clean = function(){
  deleteFolderRecursive(this._epubPath());
}


Peepub.prototype._gatherAssets = function(callback){
  // images
  var that      = this;
  var json      = this.getJson();
  var all_pages = _.map(json.pages, function(page){ return page.body }).join('');
  var $         = this._getDom(all_pages);
  var images    = ([json.cover]).concat(_.map($('img'), function(i){ return $(i).attr('src'); })); 
  
  function _check_all_good(){
    if(that.assets.assets.length === images.length){
      callback(that.assets.assets);
    }
  }
  
  _.each(images, function(img){
    http.get(img, function(res){
      var filePath = that._epubPath('assets') + path.basename(img);
      res.pipe(fs.createWriteStream(filePath));
      res.on('end', function(){
        that.assets.assets.push({
                   src : img,
          'media-type' : res.headers['content-type'],
                  href : 'assets/' + path.basename(filePath),
                    id : guid(),
            properties : (img === json.cover ? 'cover-image' : null)
        });
        _check_all_good();
      });
    });
  });
    
  
}

Peepub.prototype._getDom = function(str){
  var that = this;
  var uuid = guid();
  return cheerio.load("<div id='"+uuid+"'>" + str + '</div>');
  
  // jsdom.env(
  //   ,
  //   ["http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"],
  //   function(errors, window) {
  //     var $ = window.$;
  //     callback($, $('#' + uuid));
  //   }
  // );
}

Peepub.prototype.getJson = function(){
  var that = this;
  this._handleDefaults();
  
  // we want these to be arrays, but we'll be nice to people
  var oneToMany = ['subject', 'publisher', 'creator', 'contributor'];
  _.each(oneToMany, function _oneToMany(field){
    if(that.json[field] && !that.json[field + 's']){
      that.json[field + 's'] = [that.json[field]];
    }
  });
  

  
  _.each(this.requiredFields, function(field){
    if(!that.json[field]) throw "Missing a required field: " + field;
  });
  
  
  return this.json;
}

Peepub.prototype.contentOpf = function(callback){
  var that     = this;
  var template = fs.readFileSync(templatesDir + "content.opf", "utf8");
  var json     = this.getJson();
  this._gatherAssets(function(assets){
    json.items = assets;
    
    // these tags need IDs, so we need to make them unique
    var needIs = ['creators', 'contributors', 'items'];
    _.each(needIs, function(field){
      if(that.json[field]){
        for(var i in that.json[field]){
          that.json[field][i]['i'] = parseInt(i)+1;
        }
      }
    });
    
    callback(handlebars.compile(template)(json));
  });
  // return handlebars.compile(template)(json);
}

Peepub.prototype.getPage = function(i, callback){
  var that = this;
  var uuid = guid();
  jsdom.env(
    "<div id='"+uuid+"'>" + that.getJson().pages[i].body + '</div>',
    ["http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"],
    function(errors, window) {
      var $ = window.$;
      callback($('#' + uuid).html());
    }
  );
}

Peepub.prototype.set = function(key, val){
  this.json[key] = val;
}



module.exports = Peepub;
