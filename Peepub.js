var _          = require('lodash');
var handlebars = require('handlebars');
var fs         = require("fs");
var jsdom      = require('jsdom');

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


function Peepub(){
  this.json = {};
  if(arguments[0]){
    this.json = arguments[0];
  }
  this.requiredFields = ['title', 'cover']; // we'll take care of publish date and uuid
  
  
}

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

Peepub.prototype._gatherAssets = function(callback){
  // images
  var json = this.getJson();
  var str = _.map(json.pages, function(page){ return page.body }).join('');
  this._getDom(str, function($, $dom){
    var imgs = [json.cover];
    callback(imgs.concat(_.map($dom.find('img'), function(i){ return $(i).attr('src'); })));
  });
  
}

Peepub.prototype._getDom = function(str, callback){
  var that = this;
  var uuid = guid();
  jsdom.env(
    "<div id='"+uuid+"'>" + str + '</div>',
    ["http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"],
    function(errors, window) {
      var $ = window.$;
      callback($, $('#' + uuid));
    }
  );
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
  
  // these tags need IDs, so we need to make them unique
  var needIs = ['creators', 'contributors'];
  _.each(needIs, function(field){
    if(that.json[field]){
      for(var i in that.json[field]){
        that.json[field][i]['i'] = parseInt(i)+1;
      }
    }
  });
  
  _.each(this.requiredFields, function(field){
    if(!that.json[field]) throw "Missing a required field: " + field;
  });
  
  
  return this.json;
}

Peepub.prototype.contentOpf = function(){
  var template = fs.readFileSync(templatesDir + "content.opf", "utf8");
  this._gatherAssets(function(imgs){
    console.log(imgs);
  });
  return handlebars.compile(template)(this.getJson());
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
