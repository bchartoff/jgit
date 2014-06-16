//get request to commits/sha
//post request to commits/sha (puts)

//



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
    var body = req.body;
    var cms = body.cms;
    var post_path = params[0];
    var message = body.message;
    var branch = body.branch;
    var content = base64.encode(body.content);

    var full_path = path.join('content',cms, post_path);

    var options = contents_api_options(user,full_path,'PUT');
    var msg = contents_api_POST_body(user,message,content,branch);

    make_request(options, msg);
  }
}

exports.update_file = function(user){
  return function(outer_req,outer_res){
    var params = outer_req.params;
    var body = outer_req.body;
    var post_path = params[0];
    var cms = body.cms;
    var message = body.message;
    var branch = body.branch;
    var get_options = reference_api_options(user, 'heads/' + branch, 'GET');
    branch_exists(user, branch, get_options);
    var content = base64.encode(body.content);

    var full_path = path.join('content',cms, post_path);

    var options = contents_api_options(user,full_path,'GET');
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
        var options = contents_api_options(user,full_path,'PUT');
        var msg = contents_api_POST_body(user,message,content,branch,{"sha":sha})
        make_request(options,msg)
      });
    });

    req.end();
  }
  outer_req.end();
}

function branch_exists(user, branch, get_options){
  var req = https.request(get_options, function(res) {
    if( res.statusCode != 200){
      console.log("foo")
      create_branch(user, branch);
    }
  });
  req.end();

}

function create_branch(user, branch){
  var get_options = reference_api_options(user, 'heads' , 'GET');
  var req = https.request(get_options, function(res) {

    var body = "";

      res.on('data', function (chunk) {
        body += chunk;
      });

     res.on( 'end' , function() {
        console.log("bar");
        console.log("body",JSON.parse(body)[0].object.sha)
        var sha = ( JSON.parse(body)[0].object.sha );

        var post_options = reference_api_options(user, '', 'POST');

        var msg = new_branch_POST_body(branch, sha);
        console.log(msg);
        console.log(post_options);

        make_request(post_options,msg);
    });
  });
  req.end();

}

function github_api_options(user,method,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }

  var options = {
    hostname: "api.github.com",
    port: 443,
    method: method,
    headers: {
        "User-Agent": user.username,
        "Authorization" : user.OAuth_master
      }
  }; return utils.concat_objects(options, optional_args)
}




function repos_api_options(user,path,method,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }
  var path_options = {
    path: '/repos/bchartoff/jgit/' + path
  };

  var new_options = utils.concat_objects(path_options, optional_args);
  return github_api_options(user,method,new_options);

}

function contents_api_options(user,path,method,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }
  return repos_api_options(user,'contents/' + path, method, optional_args);
}

function reference_api_options(user,path,method,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }
  return repos_api_options(user, 'git/refs/' + path, method, optional_args);
}


function contents_api_POST_body(user,message,content,branch,optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }

  var msg = {
    "message": message,
    "committer": {
      "name": user.full_name,
      "email": user.email
    },
    "content": content,
    "branch": branch
  }; return JSON.stringify(utils.concat_objects(msg, optional_args))
}


function new_branch_POST_body(branch,sha, optional_args){
  if (typeof optional_args === 'undefined') {
    optional_args = {}
  }

  var msg = 
  {
    "ref": "refs/heads/" + branch,
    "sha": sha
  };  return JSON.stringify(utils.concat_objects(msg, optional_args))
}


function make_request(options,msg){
  var req = https.request(options, function(res) {
    console.log("statusCode: ", res.statusCode);
    console.log("status: ", res.headers.status);
    //console.log("headers: ", res.headers)
    res.on('data', function(d) {
      process.stdout.write(d);
    });
  });

  req.on('error', function(e) {
    console.error(e);
  });

  if (typeof msg != 'undefined') {
    console.log("WRITING",msg)
    req.write(msg);
  }

  req.end();
}