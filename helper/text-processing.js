var fs = require('fs');
var readLine = require('readline');
var Editor = require('../app/models/editor');
var Revision = require('../app/models/revision');
var Title = require('../app/models/title');
var https = require('https');



// Get the latest Revision ID by timestamp
function getOldRvIDByTitle(title, callback){

        Revision.aggregate(
            [
                {$match:{title:title}},
                {$sort:{timestamp:-1}},
                {$limit:1}

            ],
            function(err, records){
                if(err){

                }else {
                    return callback(records[0]['revid']);

                }
            }
        )
}


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


//Get the latest data set and save
function getNewestData(callback) {

    getAllTitles(function (titles) {
        for (var i = 0; i < titles.length; i++) {
            let titleName = titles[i];
            getOldRvIDByTitle(titleName, function (revid) {
            console.log(revid);
                var title = titleName.replace(/ /g, "_");
                var content = 'ids|user|timestamp|userid';
                var rvid = revid;
                var url_latest = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=' + title + '&rvprop=' + content + '&format=json';
                var url_from = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=' + title + '&rvprop=' + content + '&rvendid=' + rvid + '&rvlimit=500&format=json';
                //console.log(title);
                fetchData(url_from, titleName, function (datajson) {
                    if (datajson.length != 1) {
                        Revision.insertMany(datajson, function (err, doc) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log(datajson[0]['title']);
                                console.log(datajson.length);
                            }
                        });
                    } else {
                        console.log(datajson[0]['title']);
                        console.log(datajson.length);
                    }
                });
            });
        }

    });
}




// Make http request to WikiAPI
function fetchData(url, title, callback){

    https.get(url, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            var datajson = JSON.parse(data);
            datajson = datajson['query']['pages'];
            datajson = datajson[Object.keys(datajson)[0]];
            datajson = datajson['revisions'];
            for(var i = 0; i<datajson.length; i++){
                datajson[i]['title'] = title;
            }
            return callback(datajson);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
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
        let time_arr = [];
        getTheLorODate(title,-1, (lDate)=>{
            time_arr.push(lDate);
            getTheLorODate(title, 1, (oDate)=>{
                time_arr.push(oDate)
                let latestDate = time_arr[0];
                let oldestDate = time_arr[1];

                var oneDay = 24*60*60*1000;
                var diffDays = Math.round(Math.abs((latestDate - oldestDate)/(oneDay)));
                var options = { upsert: true, new: true, setDefaultsOnInsert: true };
                Title.findOneAndUpdate({title:title},
                {lifeSpan: diffDays, latestDate: latestDate, oldestDate: oldestDate},
                options,
                (err, result)=>{

                });
            });
        });
    }
    });

}


function getTheLorODate(title, acd, callback){
    Revision.find({title:title}).
    sort({timestamp:acd}).
    select('title timestamp').
    limit(1).exec((err, res) => {
        return callback(res[0].timestamp);
    });
}

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
module.exports.getOldRvIDByTitle = getOldRvIDByTitle;
module.exports.getNewestData = getNewestData;
module.exports.bulkUpdate = bulkUpdate;
module.exports.writeEditorsToDB = writeEditorsToDB;
//module.exports.joinEditorAndRevisions = joinEditorAndRevisions;
// function joinEditorAndRevisions(){
//
//     var MongoClient = require('mongodb').MongoClient;
//     var url = "mongodb://localhost:27017/wikilatic";
//
//     MongoClient.connect(url, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db("wikilatic");
//         dbo.collection('revisions').aggregate([
//             { $lookup:
//                     {
//                         from: 'editors',
//                         localField: 'name',
//                         foreignField: 'user',
//                         as: 'userDetails'
//                     }
//             }
//         ]).toArray(function(err, res) {
//             if (err) throw err;
//             console.log(JSON.stringify(res));
//             db.close();
//         });
//     });
// }