var mongoose = require("mongoose");
var fs = require('fs');
var readLine = require('readline');

var TitleSchema = new mongoose.Schema({
    title: String,
    latestDate: Date,
    oldestDate: Date,
    lifeSpan: Number
});



var Title = mongoose.model('Title', TitleSchema);

module.exports = Title;