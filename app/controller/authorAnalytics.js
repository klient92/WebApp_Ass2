var express = require('express');
var User = require('../models/user.js');
var Revision = require('../models/revision');


module.exports.getUsersByName = function(req, res, next){
    Revision.getUsersByName(req.query.author, result=>{
        return res.send({result:result});
    });
}


module.exports.getUserAndHisRevisions = function(req, res, next){
    Revision.getUserAndHisRevisions(req.query.author, result=>{
        return res.send({result: result})
    });

}

module.exports.articlesChangedByUser = function(req, res, next){
    Revision.articlesChangedByUser(req.query.author, result=>{
        return res.send({result: result})
    });

}


module.exports.getTimestampsOfRevisionUnderUser = function(req, res, next){
    Revision.getTimestampsOfRevisionUnderUser(req.query.title, req.query.author, result=>{
        return res.send({result: result})
    });

}




