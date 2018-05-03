var mongoose = require('mongoose');
var fs = require('fs');
var readLine = require('readline');
var Title = require('./title');


var RevisionSchema = new mongoose.Schema({
    revid: String,
    parentid: String,
    title: String,
    timestamp: Date,
    user: String,
    userRole: String,
    // parentRevision: {
    //     type:  mongoose.Schema.Types.ObjectId,
    //     ref: 'Revision'
    // }
});

RevisionSchema.statics.bulkUpdateUser = function(path,role){
    var botReader = readLine.createInterface({
        input: fs.createReadStream(path)
    });

    botReader.on('line', function (line) {
        var name = line;
        let bulk = Revision.collection.initializeUnorderedBulkOp();
        bulk.find({'user':name}).update({$set:{'role':role}}, function (err, docs) {
            if(err){
                console.log(err);
            }else {

            }
        });
        bulk.execute(function(err, doc){
            if(err){
                console.log('revision bulk update fail!');
            }else {
                // console.log( doc.user + ' bulk update done!');
            }
        });
    });

}

// Set the latest Date and oldest date
RevisionSchema.statics.setTheLorODate = function (title, acd, callback){

    Revision.find({title:title}).
    sort({timestamp:acd}).
    select('title timestamp').
    limit(1).exec((err, res) => {
        var query = {title:title},
            options = { upsert: true, new: true, setDefaultsOnInsert: true };
        var update = {};
        if(acd == -1){
            update = {latestDate: res[0].timestamp};
        }else {
            update = {oldestDate: res[0].timestamp};
        }
        Title.findOneAndUpdate(query, update, options, function(error, result) {

        });
    });

}

// Set anonymous user role
RevisionSchema.statics.setAnnoUserRole = function(){

    let bulk = Revision.collection.initializeUnorderedBulkOp();
    bulk.find({'anon':{"$exists":true}}).update({$set:{'role':"anon"}}, function (err, docs) {
        if(err){
            console.log(err);
        }else {
            console.log(docs);
        }
    });
    bulk.execute(function(err, doc){
        if(err){
            console.log('revision bulk update fail!');
        }else {
            console.log('1');
        }
    });
}




var Revision = mongoose.model("Revision", RevisionSchema);


module.exports = Revision;