
/*
 * GET home page.
 */

// exports.index = function(req, res){
//   res.render('test');
// };
var path = require('path');
// var mongo = require('mongodb');
// var monk = require('monk');
// var redis = require('redis');
var https = require('https');
var http = require('http');
var querystring = require('querystring');
var base64 = require('../base64')
var config = require('../config')
var utils = require('../utils')


exports.create_file = function(user){

  return function(req,res){
      var params = req.params;
      var path = params[0];
      var message = decodeURIComponent(params.message);
      var content = base64.encode(decodeURIComponent(params.content));

	  var options = contents_api_options(user,path,'PUT');
	  var msg = contents_api_message(user,message,content);

	  make_request(options, msg);
    }
}

exports.update_file = function(user){
  var options = contents_api_options(user,path,'GET');
  var req = https.request(options, function(res) {
    var body = "";
    res.on('data', function (chunk) {
      body += chunk;
    });

    req.on('error', function(e) {
      console.error(e);
    });

    res.on( 'end' , function() {
      var sha = ( JSON.parse(body).sha );
      var options = contents_api_options(user,path,'PUT');
      var msg = contents_api_message(user,message,content,{"sha":sha})
      make_request(options,msg)
    });
  });

  req.end();
}


function contents_api_options(user,path,method,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }

  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/bchartoff/jgit/contents/' + path,
    method: method,
    headers: {
      'User-Agent': user.username,
      'Authorization' : 'token ' + user.oauth
    }
  }; return utils.concat_objects(options, optional_args)
}

function contents_api_message(user,message,content,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }

  var msg = {
    "message": message,
    "committer": {
      "name": user.full_name,
      "email": user.email
    },
    "content": content
  }; return JSON.stringify(utils.concat_objects(msg, optional_args))
}


function make_request(options,msg){
  var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("status: ", res.headers.status);
    res.on('data', function(d) {
      process.stdout.write(d);
    });
  });

  req.on('error', function(e) {
    console.error(e);
  });

  if (typeof msg != 'undefined') {
    console.log("WRITING",msg)
    req.write(msg)
  }

  req.end();
}