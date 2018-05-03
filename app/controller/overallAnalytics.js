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

function rankByGroupOfRsdUser(acd, topN){
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

module.exports.rankByGroupOfRsdUser = rankByGroupOfRsdUser;
module.exports.rankByRvsNumber = rankByRvsNumber;