var mongoose = require("mongoose");
var fs = require('fs');
var readLine = require('readline');

var TitleSchema = new mongoose.Schema({
    title: String,
    latestDate: Date,
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
        console.log(res);
    });
}

var Title = mongoose.model('Title', TitleSchema);

module.exports = Title;