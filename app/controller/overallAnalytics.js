var express = require('express');
var User = require('../models/user.js');
var Revision = require('../models/revision');
var Title = require("../models/title");


module.exports.getTotalArticleNumber = function (req, res, next) {
    Revision.getTotalArticleNumber(function (result) {
        return res.send({result: result});
    });
}


module.exports.getTLNArticleWithHighestRevision = function(req, res, next){
    Revision.rankByRvsNumber(parseInt(req.query.acd), parseInt(req.query.topn), function (result) {
        return res.send({result: result});
    });

}

module.exports.rankByGroupOfRgsdUser = function(req, res, next){
    Revision.rankByGroupOfRgsdUser(parseInt(req.query.acd), parseInt(req.query.topn), function (result) {
        return res.send({result: result});
    });

}

module.exports.rankByHistory = function(req, res, next){
    Revision.rankByTimeSpan(parseInt(req.query.acd), parseInt(req.query.topn), function (result) {
        return res.send({result: result});
    });

}

module.exports.overallDstbByYandU = function (req, res, next) {
    Revision.overallDstbByYandU(function (result) {
        return res.send({result: result});
    });
}



module.exports.distributionByUser = function (req, res, next) {
    Revision.distributionByUser(function (result) {
        return res.send({result: result});
    });
}



