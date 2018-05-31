var fs = require('fs');
var readLine = require('readline');
var Editor = require('../app/models/editor');
var Revision = require('../app/models/revision');
var Title = require('../app/models/title');
var https = require('https');

var MongoClient = require('mongodb').MongoClient;




function bulkUpdate() {
    let bulkOp = Revision.collection.initializeUnorderedBulkOp();
    let count = 0;
    Revision.find().forEach(function(doc) {
        Editor.findOne({'name':doc.user}, function (err, editor) {
            bulkOp.find({ '_id': doc._id }).updateOne({
                '$user': { 'name': editor.name, 'role':editor.role}
            });
            count++;
            if(count % 100 === 0) {
                // Execute per 100 operations and re-init
                bulkOp.execute();
                bulkOp = collection.initializeOrderedBulkOp();
            }

        });


    });

// Clean up queues
    if(count > 0) {
        bulkOp.execute();
    }
}



function promiseSave(){

    getAllTitles(function (titles) {
        var P = function(val, idx){
            return new Promise(resolve => setTimeout(function() {
                iterator(resolve(val), idx-1, next);
            }, 0));
        };
        var results = Promise.all(titles.map(P));

        results.then(data =>
            console.log(data) //["yeah", "noooo", "rush", "RP"]
        );

    });

}



// Get All titles from folder
function getAllTitles(callback) {

        fs.readdir('./public/data/revisions', (err, files) => {
            if(err){
                reject(err);
            }else {
                var title_arr = [];
                for (var i=0; i<files.length;i++){
                    var newName = files[i].replace('.json','');
                    if(newName!='.DS_Store')
                    title_arr.push(newName);
                }
                return callback(title_arr);
            }

        });

}

// Write title date to db
function writeTitleDateToDB(){

    getAllTitles(title_arr=>{

    for(let i = 0; i<title_arr.length;i++){
        let title = title_arr[i];

        Revision.getRevisionNumberByTitle(title, (revisions) =>{

            var options = { upsert: true, new: true, setDefaultsOnInsert: true };
            Title.findOneAndUpdate({title:title},
            {revisions: revisions},
            options,
            (err, result)=>{

            });
        });
    //     getTheLorODate(title, -1, (lDate)=>{
    //         time_arr.push(lDate);
    //         getTheLorODate(title, 1, (oDate)=>{
    //             time_arr.push(oDate)
                //let latestDate = time_arr[0];
                //let oldestDate = time_arr[1];

                //var oneDay = 24*60*60*1000;
                //var diffDays = Math.round(Math.abs((latestDate - oldestDate)/(oneDay)));
                //var options = { upsert: true, new: true, setDefaultsOnInsert: true };
                // Title.findOneAndUpdate({title:title},
                // {lifeSpan: diffDays, latestDate: latestDate, oldestDate: oldestDate},
                // options,
                // (err, result)=>{
                //
                // });
    //         });
    //     });
    }
    });

}


// function getTheLorODate(title, acd, callback){
//     Revision.find({title:title}).
//     sort({timestamp:acd}).
//     select('title timestamp').
//     limit(1).exec((err, res) => {
//         return callback(res[0].timestamp);
//     });
// }



function writeEditorsToDB(bot_filePath, admin_filePath) {

    var editor_array = {
        editors:[]
    };

    var botReader = readLine.createInterface({
        input: fs.createReadStream(bot_filePath)
    });

    botReader.on('line', function (line) {
        var name = line;
        var editorData = new Editor({
            name: name,
            role: 'bot'
        });

        Editor.create(editorData, function(error, editor){
            if (error){
                return next(error);
            } else {

            }
        });
    });

    var adminReader = readLine.createInterface({
        input: fs.createReadStream(admin_filePath)
    });

    adminReader.on('line', function (line) {
        var name = line;
        var editorData = new Editor({
            name: name,
            role: 'admin'
        });

        Editor.create(editorData, function(error, editor){
            if (error){
                return next(error);
            } else {

            }
        });
    }).on('close', function() {

    });

}


module.exports.writeTitleDateToDB = writeTitleDateToDB;
module.exports.promiseSave = promiseSave;
module.exports.bulkUpdate = bulkUpdate;
module.exports.writeEditorsToDB = writeEditorsToDB;
