var mongoose = require("mongoose");
var fs = require('fs');
var readLine = require('readline');

var TitleSchema = new mongoose.Schema({
    title: String,
    revisions: Number,
    oldestDate: Date,
    lifeSpan: Number
});

// The top 3 articles with the longest/shortest history (measured by age).
TitleSchema.statics.rankByHistroy = function(acd, topN, callback){
    Title.aggregate([
        {$project:{title:1, lifeSpan:1}},
        {$sort:{lifeSpan:acd}},
        {$limit:topN}
    ]).then(res=>{
        return callback(res);
    });
}

// Get All Titles and Revisions number
TitleSchema.statics.getAllTitleAndRevisionsNumber = function(callback){
    Title.find({},(err,result)=>{

    return callback(result);
    })
}

var Title = mongoose.model('Title', TitleSchema);

module.exports = Title;