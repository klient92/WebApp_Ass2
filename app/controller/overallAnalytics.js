var express = require('express');
var User = require('../models/user.js');
var Revision = require('../models/revision');
var Title = require("../models/title");


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
    Title.rankByHistroy(parseInt(req.query.acd), parseInt(req.query.topn), function (result) {
        return res.send({result: result});
    });

}



function overallDstbByYandU(){
    Revision.aggregate([
        {$project:{year:{$year:"$timestamp"},role:1}},
        {$group:{_id:{year:"$year", role:"$role"},total:{$sum:1}}},
        {$sort:{total:1}},
        ]).then(res=>{
        console.log(res);
        });

}

function distributionByUser(){
    Revision.aggregate([

        {$group:{_id:"$role", total:{$sum:1}}}]).
        then((res)=>{
            console.log(res);
        });
}

module.exports.distributionByUser = distributionByUser;
module.exports.overallDstbByYandU = overallDstbByYandU;
