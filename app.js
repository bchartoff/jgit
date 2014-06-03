var express = require('express');
var routes = require('./routes');
var path = require('path');
// var mongo = require('mongodb');
// var monk = require('monk');
// var redis = require('redis');
var https = require('https');
var http = require('http');
var querystring = require('querystring');
var base64 = require('./base64')
var config = require('./config')
var utils = require('./utils')


function App(){
  // this.db = redis.createClient();
  this.port = 3000;

  this.app = express();

}

App.prototype.start = function() {

  this.server = http.createServer(this.app)
  this.configure();
  this.listen();

  return this.server;
}


App.prototype.configure = function() {
  (function(app) {
    app.configure(function(){
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });
  })(this.app);
}


App.prototype.listen = function() {
  this.server.listen(this.port);
  console.log('Express server listening on port ' + this.port);

  var user = require('./user')

  user.set_username('bchartoff')
  user.set_email('bchartoff@gmail.com')
  user.set_full_name('Ben Chartoff')
  user.set_oauth(config.OAuth_master)

  // create_file(user,'posts/tmp6.txt',"creating file",base64.encode("sup yall 6"))
  // update_file(user,'posts/tmp4.txt',"testing update_file method",base64.encode("sup yall updated"));

  //not full RESTfull API, since it is exposed. GET method, POST is in apps/admin.
  //this.app.get('/url=:url', routes.img(this.db));
  // this.app.get('/create/:message/:content/*', routes.create_file(user));
  // this.app.get('/update/:message/:content/*', routes.update_file(user));


  // this.app.get('/contents/',routes.get_all_files(user))
  // this.app.get('/contents/*',routes.get_file(user))
  this.app.post('/contents/create/*', routes.create_file(user))
  this.app.post('/contents/update/*', routes.update_file(user))
  //this.app.get('/create', routes.create_file(user));
}

module.exports = new App();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






