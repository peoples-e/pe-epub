var _          = require('lodash');
var handlebars = require('handlebars');
var fs         = require("fs");
var cheerio    = require('cheerio');
var http       = require('http');
var path       = require('path');

var templatesDir = __dirname + '/templates/';

// utils
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

/**
 *
 */
function Peepub(){
  this.json = {};
  if(arguments[0]){
    this.json = arguments[0];
  }
  this.id = guid();
  this.requiredFields = ['title', 'cover']; // we'll take care of publish date and uuid
  
  this.json.css = this.json.css || [];
  if(this.json.css && typeof this.json.css === 'string') {
    this.json.css = [this.json.css];
  }
  this.json.js = this.json.js || [];
  if(this.json.js && typeof this.json.js === 'string') {
    this.json.js = [this.json.js];
  }
  
  this.assets = {
    css     : [],
    js      : [],
    assets  : []
  }
  
}
Peepub.EPUB_DIR = __dirname + '/epubs/';
Peepub.EPUB_CONTENT_DIR = 'OEBPS/'; // this is hard coded in templates/content.opf - use handlebars if this will ever change

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
    
    // all additions go in the content dir
    dir += Peepub.EPUB_CONTENT_DIR + add + '/';
  } 
  if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
    
    // set up the whole structure
    if(!add){
      fs.mkdirSync(dir + 'META-INF/');
      fs.writeFileSync(dir + 'META-INF/' + 'container.xml', fs.readFileSync(templatesDir + "container.xml", "utf8"));
      fs.mkdirSync(dir + Peepub.EPUB_CONTENT_DIR);
      fs.writeFileSync(dir + 'mimetype', 'application/epub+zip');
    }
  } 
  return dir;
}



Peepub.prototype._fetchAssets = function(callback){
  this._fetchAssetsCalled = true;
  var that      = this;
  var json      = this.getJson();
  var all_pages = _.map(json.pages, function(page){ return page.body }).join('');
  var $         = this._getDom(all_pages);
  var images    = ([json.cover]).concat(_.map($('img'), function(i){ return $(i).attr('src'); })); 
  
  function _check_all_good(){
    if( that.assets.assets.length === images.length && 
        that.assets.css.length === json.css.length &&
        that.assets.js.length === json.js.length
      ){
      callback(that.assets.assets.concat(that.assets.css).concat(that.assets.js));
    }
  }
  
  _.each(images, function(img){
    var filePath = that._epubPath('assets') + path.basename(img);
    that._createFile(filePath, img, function(err, res){
      var asset = {
                 src : img,
        'media-type' : res.headers['content-type'],
                href : 'assets/' + path.basename(filePath),
                 _id : guid()
      };
      if(img === json.cover){
        asset.properties = 'cover-image';
        asset.id = 'cover-image';
      }
      
      that.assets.assets.push(asset);
      _check_all_good();
    });
  });
  
  _.each(json.css, function(css, i){
    var filePath = that._epubPath('styles') + 'css_' + i + '.css';
    that._createFile(filePath, css, function(err, res){
      var asset = {
                 src : css,
        'media-type' : 'text/css',
                href : 'styles/' + path.basename(filePath),
                 _id : guid(),
                 id  : 'css_' + i
      };
      
      that.assets.css.push(asset);
      _check_all_good();
    });
  });
  
  _.each(json.js, function(js, i){
    var filePath = that._epubPath('scripts') + 'js_' + i + '.js';
    that._createFile(filePath, js, function(err, res){
      var asset = {
                 src : js,
        'media-type' : 'text/javascript',
                href : 'scripts/' + path.basename(filePath),
                 _id : guid(),
                 id  : 'js_' + i
      };
      
      that.assets.js.push(asset);
      _check_all_good();
    });
  });
}

Peepub.prototype._getDom = function(str){
  var that = this;
  var uuid = guid();
  return cheerio.load("<div id='"+uuid+"'>" + str + '</div>');
}


Peepub.prototype._contentOpf = function(options, callback){
  var that     = this;
  var template = fs.readFileSync(templatesDir + "content.opf", "utf8");
  var json     = this.getJson();
  
  if(typeof options === 'function'){
    var callback = options;
    options = null;
  }
  
  var opts = _.extend({
    fetchAssets : true
  }, options);
  
  if(opts.fetchAssets){
    this._fetchAssets(function(assets){
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
      
      that._createPages(function(){
        
        json.items = json.items.concat(that.json.pages); // add them to the manifest
        json.itemrefs = that.json.pages;
        
        var contentOpf = handlebars.compile(template)(json);
        fs.writeFile(that.contentOpfPath(), contentOpf, function(err){
          if(err) throw 'content.opf didnt save';
          callback(contentOpf);
        });
      })

    });
    
  // this is used for testing
  // synchronously returns basic contentOpf
  } else {
    return handlebars.compile(template)(json);
  }
}

Peepub.prototype._getPage = function(i){
  var that = this;
  var template = fs.readFileSync(templatesDir + "page.html", "utf8");
  var json     = this.getJson().pages[i];
  
  // add links/script tags
  json.css = this.assets.css;
  json.js = this.assets.js;
  
  return handlebars.compile(template)(json);
  
}

// will pull it from the internet (or not) and write it
Peepub.prototype._createFile = function(dest, source, callback){
  if((/^https?:\/\//).test(source)){
    http.get(source, function(res){
      res.pipe(fs.createWriteStream(dest));
      res.on('end', function(err){
        callback(err, res);
      });
    });
    
  } else {
    fs.writeFile(dest, source, function(err){
      callback(err);
    });
  }
}

Peepub.prototype._createPage = function(i, callback){
  var pad      = "00000";
  var name     = 'e' + (pad+i.toString()).slice(-pad.length);
  var fullpath = this._epubPath() + Peepub.EPUB_CONTENT_DIR + name + '.html';
  var that     = this;
  this._createFile(fullpath, this._getPage(i), function(err){
    if(err) throw filename + ' didnt save';
    
    // prep page for manifest + addtn'l info
    that.json.pages[i].path          = fullpath;
    that.json.pages[i].id            = name;
    that.json.pages[i].href          = name + '.html';
    that.json.pages[i]['media-type'] = 'application/xhtml+xml';
    that.json.pages[i]['properties'] = 'scripted';
    
    callback(fullpath);
  });
}

Peepub.prototype._createPages = function(callback){
  if(!this._fetchAssetsCalled) throw "_fetchAssets needs to be called before _createPages";
  
  var that = this;
  _.each(this.getJson().pages, function(page, i){
    that._createPage(i, function(){
      if(_.filter(that.json.pages, function(p){ return(!!p.id); }).length === that.json.pages.length){
        callback();
      }
    });
  })
}


// PUBLIC //

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

Peepub.prototype.set = function(key, val){
  this.json[key] = val;
}

Peepub.prototype.clean = function(){
  deleteFolderRecursive(this._epubPath());
}

Peepub.prototype.create = function(callback){
  var that = this;
  this._contentOpf(function(){
    callback(that._epubPath());
  });
}

Peepub.prototype.contentOpfPath = function(){
  if(!this.id) throw "This epub has not been created yet";
  return this._epubPath() + Peepub.EPUB_CONTENT_DIR + 'content.opf';
}



module.exports = Peepub;
