var _          = require('lodash');
var handlebars = require('handlebars');
var fs         = require("fs");

var templatesDir = __dirname + '/templates/';

function Peepub(){
  this.json = {};
  if(arguments[0]){
    this.json = arguments[0];
  }
  this.requiredFields = ['title','creators']; // we'll take care of publish date and uuid
  
  
  
}

Peepub.prototype._handleDefaults = function(){
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  };

  function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  }
  
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
  return handlebars.compile(template)(this.getJson());
}

Peepub.prototype.set = function(key, val){
  this.json[key] = val;
}


module.exports = Peepub;
