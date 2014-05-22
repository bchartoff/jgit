var util = require('util');
var user = require('./user')

var utils = exports;
utils.concat_objects = function () {
  //concatenates arbitrary number of js objects. {foo:bar} + {foo:bar2} -> {foo:[bar,bar2]}
  // {foo:{bar:x}} + {foo:{bar2:y}} -> {foo {bar:x, bar2:y}}
  var ret = {};
  var len = arguments.length;
  for (var i=0; i<len; i++) {
    for (p in arguments[i]) {
      var val = arguments[i][p]
      if (arguments[i].hasOwnProperty(p)) {
        if (ret.hasOwnProperty(p)){
          if (util.isArray(ret[p])){
            ret[p].push(val)
          }
          else if (Object.prototype.toString.call(ret[p]) == "[object Object]"){
            ret[p] = concat_objects(ret[p],val)
          }
          else{
            ret[p] = [ret[p]]
            ret[p].push(val)
          }
        }
        else{
          ret[p] = arguments[i][p];
        }
      }
    }
  }
  return ret;
}
