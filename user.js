function User(){
	this.username = null;
	this.email = null;
	this.full_name = null;
	this.oauth = null;
}

User.prototype.set_username = function(username){
	this.username = username;
}

User.prototype.set_email = function(email){
	this.email = email;
}

User.prototype.set_full_name = function(full_name){
	this.full_name = full_name;
}

User.prototype.set_oauth = function(oauth){
	this.oauth = oauth;
}

module.exports = new User();