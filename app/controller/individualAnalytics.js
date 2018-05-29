var express = require('express');
var User = require('../models/user.js');
var Revision = require('../models/revision');
var Title = require("../models/title");

module.exports.getAllTitleAndRevisionsNumber = function(req, res, next){
    Revision.getAllTitlesAndRevisions(function(result){
        return res.send({result: result});
    });
}

module.exports.updateLatestDataFromWikiAPI = function(req, res, next){
    Revision.updateLatestDataFromWikiAPI(req.query.title, result=>{
        return res.send({result: result})
    });

}

module.exports.getTopNUserbyRevision = function(req, res, next){
    Revision.getTopNUserbyRevision(req.query.title, parseInt(req.query.acd), parseInt(req.query.topn), result=>{
        return res.send({result: result})
    });

}

// first bar chart
module.exports.individualDstbByYandU = function(req, res, next){
    Revision.individualDstbByYandU(req.query.title, result=>{
        return res.send({result: result})
    });

}

// second pie chart
module.exports.individualDstbByUser = function(req, res, next){
    Revision.individualDstbByUser(req.query.title, result=>{
        return res.send({result: result})
    });

}

// third bar chart
module.exports.rvsnMadeByTop5ByY = function(req, res, next){
    Revision.rvsnMadeByTop5ByY(req.query.title, result=>{
        return res.send({result: result})
    });

}