var express = require('express');
var User = require('../models/user.js');
var mid = require('../../middleware/index');


// Get // Index
module.exports.toIndex = function(req, res, next) {
    if (req.session && req.session.userId){
        return res.render('overall', { title: 'Overall Analytics' });
    }else {
        return res.render('index', { title: 'Home' });
    }
    if (req.session.isVisit) {
        req.session.isVisit ++;
        //console.log('-----------'+ '\n' + res + '-----------');
    }else {
        req.session.isVisit = 1;

    }

}



// Get // Profile
module.exports.toProfile = function(req, res, next) {

    User.findById(req.session.userId)
        .exec(function (error, user) {
            if(error){
                return next(error);
            } else {
                return res.render('profile', {tile: 'Profile', username: user.username});
            }
        });
}


// Get // Logout
module.exports.logout = function(req, res, next){
    req.session.destroy(function(error){
        if (error) {
            return next(error);
        } else {
            return res.redirect('/');
        }
    })
}

// Post // Login
module.exports.login = function(req, res, next) {
    if(req.body.email && req.body.password){
        User.authenticate(req.body.email, req.body.password, function(error, user){
            if (error || !user){
                var err = new Error('Wrong email or password');
                err.status = 401;
                return err;
            } else {
                req.session.userId = user._id;
                return res.redirect('/overall');
            }
        });
    }else{
        var err = new Error('email and password are required');
        err.status = 401;
        return next(err);
    }
}

// Post // Register
module.exports.register = function(req, res, next){
    if (req.body.email &&
        req.body.username &&
        req.body.firstname &&
        req.body.lastname &&
        req.body.password &&
        req.body.confirmPassword){

        if (req.body.password != req.body.confirmPassword){
            var err = new Error('Passwords do not match');
            err.status = 400;
            return next(err);
        }

        var userData = new User({
            email:req.body.email,
            username: req.body.username,
            name: {
                firstname: req.body.firstname,
                lastname: req.body.lastname
            },
            password: req.body.password
        });


        User.create(userData, function(error, user) {
            if (error){
                return next(error);
            } else {
                req.session.userId = user._id;
                console.log(user.username);
                return res.redirect('/');
            }
        });

    }else {
        var err = new Error('All fields required');
        err.status = 400;
        return next(err);
    }
}