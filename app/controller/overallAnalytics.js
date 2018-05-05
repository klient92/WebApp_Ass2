var express = require('express');
var User = require('../models/user.js');
var Revision = require('../models/revision');

function rankByRvsNumber(acd, topN){

    Revision.aggregate([
        {
            $group: {_id:"$title" , "total":{$sum:1}}
        },
        {$sort:{total:acd}},
        {$limit:topN}]).then(res=>{
        console.log(res);

    });
}

function rankByGroupOfRgsdUser(acd, topN){
    Revision.aggregate([
    {$match:{user:{'$not':/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/}}},
    {$group: {_id:{title:"$title", user:"$user"}}},
    {$group:{_id:"$_id.title", total:{$sum:1}}},
    {$sort:{total:acd}},
    {$limit:topN}])
     .then(res=>{
        console.log(res);
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
module.exports.rankByGroupOfRgsdUser = rankByGroupOfRgsdUser;
module.exports.rankByRvsNumber = rankByRvsNumber;