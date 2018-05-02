var mongoose = require('mongoose');
var fs = require('fs');
var readLine = require('readline');
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
        bulk.find({'user':name}).update({$set:{'user':{'name':name, 'role':role}}}, function (err, docs) {
            if(err){
                console.log(err);
            }else {

            }
        });
        bulk.execute();
    });

}

var Revision = mongoose.model("Revision", RevisionSchema);

module.exports = Revision;