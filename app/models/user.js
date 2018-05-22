var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var UserSchema = new mongoose.Schema({
  email:{
    type: String,
    lowercase: true,
    unique: true,
    trim: true,
    required: "Email address is required"
  },
  username: {
    type: String,
    unique: true,
      trim: true,
    required: "Username is required"
  },
  name: {
    firstname:{
    type: String,
    trim: true,
    required: "First Name is required"
    },
    lastname: {
    type: String,
    trim: true,
    required: "Last Name is required"

    }
  },
  password: {
    type: String
  }
});

// authenticate input against database document
UserSchema.statics.authenticate = function(email, password, callback){
  User.findOne({email: email})
  .exec(function(error, user){
    if (error){
      return callback(error);
    } else if (!user) {
      var err = new Error('User not found');
      return callback(err);
    }
    bcrypt.compare(password, user.password, function(error, result){
      if (result == true){
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
}

UserSchema.pre('save', function(next) {
  var user = this;
  bcrypt.hash(user.password, 10, function(err, hash){
    if(err){
      return next(err);
    }
    user.password = hash;
    next();
  });
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
