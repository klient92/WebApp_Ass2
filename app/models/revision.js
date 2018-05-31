var mongoose = require('mongoose');
var fs = require('fs');
var readLine = require('readline');
var Title = require('./title');
var https = require('https');
var Editor = require('./editor');

var RevisionSchema = new mongoose.Schema({
    revid: String,
    parentid: Number,
    title: String,
    timestamp: Date,
    user: String,
    role: String,

});

RevisionSchema.statics.setUserRole = function(path,role){
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
                //console.log( doc.user + ' bulk update done!');
            }
        });
    });

}

// ------------------------------------- Overall ----------------------------------------

// Get Total article number
RevisionSchema.statics.getTotalArticleNumber = function(callback){
    Revision.distinct("title", (err, res)=>{
        return callback(res.length);
    });
}


RevisionSchema.statics.rankByRvsNumber = function(acd, topN, callback){

    Revision.aggregate([
        {
            $group: {_id:"$title" , "total":{$sum:1}}
        },
        {$sort:{total:acd}},
        {$limit:topN}]).then(res=>{
        return callback(res);

    });
}

// The article edited by largest/smallest group of registered users.
RevisionSchema.statics.rankByGroupOfRgsdUser = function (acd, topN, callback){
    Revision.aggregate([
        //{$match:{user:{'$not':/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/}}},
        {$match:{role:"rgl"}},
        {$group: {_id:{title:"$title", user:"$user"}}},
        {$group:{_id:"$_id.title", total:{$sum:1}}},
        {$sort:{total:acd}},
        {$limit:topN}])
        .then(res=>{
            //console.log(res);
            return callback(res);
        });

}
// The top 3 articles with the longest/shortest history (measured by age).
RevisionSchema.statics.rankByTimeSpan = function (acd, topN, callback){
    Revision.aggregate([

        {$project:{title:1, timestamp:1}},
        {$group: {_id:"$title", first_date:{$min:"$timestamp"}}},
        {$project:{_id:1,duration:{$subtract:[new Date(), "$first_date"]}}},
        {$sort:{duration:acd}},
        {$limit:3},
    ])
        .then(res=>{
            //console.log(res);
            return callback(res);
        });

}

// A bar chart of revision number distribution by year and by user type across the
// whole dataset.
RevisionSchema.statics.overallDstbByYandU = function(callback){
    Revision.aggregate([
        {$project:{year:{$year:"$timestamp"},role:1}},
        {$group:{_id:{year:"$year", role:"$role"},total:{$sum:1}}},
        {$sort:{total:1}},
    ]).then(res=>{
    // console.log(res);
        var first_year = 2018;
        var last_year = 0;
        var result = {};
        var inform_dict = {};
        var data_dict = {};

        data_dict["bot"] = {};
        data_dict["admin"] = {};
        data_dict["rgl"] = {};
        data_dict["anon"] = {};

        for(var i=0;i<res.length; i++){
        //console.log(res[i]["_id"]);
            var year = res[i]._id.year;
            if(year>last_year) last_year = year;
            if(year<first_year) first_year = year;

            var role = res[i]._id.role;
            var total = res[i].total;
            var temp_dict = data_dict[role];
            temp_dict[year] = total;
        }
        inform_dict["first_year"] = first_year;
        inform_dict["last_year"] = last_year;

        result["inform"] = inform_dict;
        result["data"] = data_dict;

        return callback(result);
    });

}

RevisionSchema.statics.distributionByUser = function(callback){
    Revision.aggregate([
        {$group:{_id:"$role", total:{$sum:1}}}]).
    then((res)=>{

        return callback(res);
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
    var query = {'anon':{"$exists":true}};
    var role = 'anon';
    bulkRoleUpdate(query, role);
}


// Set regular user's role
RevisionSchema.statics.setRglUserRole = function(){
    var query = {'role':{"$exists":false}};
    var role = 'rgl';
    bulkRoleUpdate(query, role);
}

function bulkRoleUpdate(query, role){

    let bulk = Revision.collection.initializeUnorderedBulkOp();
    bulk.find(query).update({$set:{'role':role}}, function (err, docs) {
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
            console.log('Bulk update role: ' + role + " finished");
        }
    });
}

RevisionSchema.statics.updateAllDateToISODate = function update(){
    Revision.find().cursor()
        .on('data', function(doc){
            Revision.findOneAndUpdate({_id:doc.id}, {$set:{timestamp:new Date(doc.timestamp)}},(err, res)=>{
                if(err) console.log(err);
                //else console.log(res);
            });
        })
        .on('error', function(err){
            // handle error
        })
        .on('end', function(){
            console.log("Finish all date updating!");
        });

}

// ------------------------------------- Individual ----------------------------------------

// Get number of revision of a given title
// RevisionSchema.statics.getNumberOfRevsion = function(title){
//     var count = Revision.find({title:title}).count((err, res)=>{
//         //console.log(res);
//     })
//     // console.log(count)
//     // return count;
// }

RevisionSchema.statics.getAllTitlesAndRevisions = function(callback){
    Revision.aggregate([{$group:{_id:"$title", revisions:{$sum:1}}}])
        .then(res=>{
            return callback(res);
        });
}

// Fetch the latest data from Wiki API
RevisionSchema.statics.updateLatestDataFromWikiAPI = function(titleName, callback){
    getOldRvIDByTitle(titleName, function (record) {

        var timestamp = record["timestamp"];
        //timestamp = timestamp.slice(8,-1);
        var timespan = (Date.now() - timestamp) / 1000/60/60/24;

        if(timespan>1){
            var revid = record["revid"];
            var title = titleName.replace(/ /g, "_");
            var content = 'ids|user|timestamp|userid';
            var rvid = revid;
            var url_latest = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=' + title + '&rvprop=' + content + '&format=json';
            var url_from = 'https://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=' + title + '&rvprop=' + content + '&rvendid=' + rvid + '&rvlimit=500&format=json';

            fetchAndSaveRevisionData(url_from, titleName, result=>{
                return callback(result);
            });
        }else {
            var inform = {};
            inform["status"] = "new";
            inform['title'] = titleName;
            return callback(inform);
        }


        // , function (datajson) {
        //     if (datajson.length != 1) {
        //         Revision.insertMany(datajson, function (err, doc) {
        //             if (err) {
        //                 console.log(err)
        //             } else {
        //                 return callback(datajson.length, doc[0]);
        //                 // console.log(datajson[0]['title']);
        //                 // console.log(datajson.length);
        //             }
        //         });
        //     } else {
        //         return callback(datajson.length, doc[0]);
        //         // console.log(datajson[0]['title']);
        //         // console.log(datajson.length);
        //     }
        // });
    });

}


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
                return callback(records[0]);

            }
        }
    )
}



// Make http request to WikiAPI
function fetchAndSaveRevisionData(url, title, callback){

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

            // for(let i = 0; i<datajson.length; i++){
            //     datajson[i]['title'] = title;
            //     var user = datajson[i]['user'];
            //     Editor.find({name:user},(err,res)=>{
            //         if(res.length !=0 ) {
            //             datajson[i]['role'] = res[0].role;
            //         }
            //         else if("anon" in datajson[i]){
            //             datajson[i]['role'] = "anon";
            //         }else {
            //             datajson[i]['role'] = "rgl";
            //         }
                    // var query = {revid:datajson[i]['revid']},
                    //     options = { upsert: true, new: true, setDefaultsOnInsert: true };
                    // Revision.findOneAndUpdate(query, datajson[i], options, function(error, result) {
                    //
                    // });
            //     })
            // }
            var inform = {};
            inform["status"] = "update";
            inform["title"] = title;
            inform["number"] = datajson.length - 1;
            inform["last"] = datajson[0];
            return callback(inform);
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

RevisionSchema.statics.getTopNUserbyRevision = function(title, acd, topN, callback){
    Revision.aggregate([
        {$match:{title:title, role:"rgl"}},
        {$group:{_id:{title:"$title", user:"$user"}, total:{$sum:1}}},
        {$sort:{total:acd}},
        {$limit:topN}
    ]).then(res=>{
        return callback(res);
    });
}

// A bar chart of revision number distributed by year and by user type for this article.
RevisionSchema.statics.individualDstbByYandU = function(title, callback){

    Revision.aggregate([
        {$match:{title:title}},
        {$project:{year:{$year:"$timestamp"},role:1}},
        {$group:{_id:{year:"$year", role:"$role"},total:{$sum:1}}},
        {$sort:{total:1}},
    ]).then(res=>{

        var first_year = 2018;
        var last_year = 0;
        var result = {};
        var inform_dict = {};
        var data_dict = {};

        data_dict["bot"] = {};
        data_dict["admin"] = {};
        data_dict["rgl"] = {};
        data_dict["anon"] = {};

        for(var i=0;i<res.length; i++){
            //console.log(res[i]["_id"]);
            var year = res[i]._id.year;
            if(year>last_year) last_year = year;
            if(year<first_year) first_year = year;

            var role = res[i]._id.role;
            var total = res[i].total;
            var temp_dict = data_dict[role];
            temp_dict[year] = total;
        }
        inform_dict["first_year"] = first_year;
        inform_dict["last_year"] = last_year;

        result["inform"] = inform_dict;
        result["data"] = data_dict;

        return callback(result);
    });

}

// A pie chart of revision number distribution based on user type for this article.
RevisionSchema.statics.individualDstbByUser = function(title, callback){
    Revision.aggregate([
        {$match:{title:title}},
        {$group:{_id:"$role", total:{$sum:1}}}]).
    then((res)=>{
        return callback(res);
    });
}

// A bar chart of revision number distributed by year made by one or a few of the top 5
RevisionSchema.statics.rvsnMadeByTop5ByY = function (title, callback) {

    Revision.aggregate([
        {$match:{title:title}},
        {$project:{year:{$year:"$timestamp"},user:1}},
        {$group:{_id:{user:"$user", year:"$year"}, total:{$sum:1}}},
        {$addFields:{_id:"$_id.user", year:"$_id.year"}},
        {$group:{_id:"$_id", arr:{$push:"$$ROOT"},total:{$sum:"$total"}}},
        {$sort:{total:-1}},
        {$limit:5}
        ])
     .then((res)=>{

     var data_dict = {};
     var data = {};
     var inform = {};
     var firstYear = 2000;
     var last_year = 2000;
        for(var i=0;i<res.length;i++){

            var dataItem = res[i];
            var user = dataItem._id;
            var data_arr = dataItem.arr;
            var year_total_dict = {};
            for(var a=0;a<data_arr.length;a++){
                var total = data_arr[a].total;
                var year = data_arr[a].year;
                if(a==0) firstYear = year;
                if(firstYear>year){
                    firstYear = year;
                }
                if(last_year<year){
                    last_year = year;
                }
                year_total_dict[year] = total;
            }
            data[user] = year_total_dict;

        }
        inform["first_year"] = firstYear;
        inform["last_year"] = last_year;

         for(let key in data){
             var temp_dict = data[key];
             for(let i=firstYear;i<=last_year;i++){
                if(i in temp_dict){

                }else {
                temp_dict[i] = 0;
                }
             }
         }

        data_dict["data"] = data;
        data_dict["inform"] = inform;
        return callback(data_dict);
    });
}

// ------------------------------------ Author Analytics -----------------------------------
//

RevisionSchema.statics.getUserAndHisRevisions = function(author, callback){
    Revision.aggregate([
        {$match:{user:author}},
        {$group:{_id:"$user", total:{$sum:1}}}
    ]).then(res=>{

        return callback(res);
    });
}


RevisionSchema.statics.articlesChangedByUser = function (author, callback) {

    Revision.aggregate([
        {$match:{user:author}},
        {$project:{user:1, title:1}},
        {$group:{_id:"$title", total:{$sum:1}}}

    ]).then(res=>{
        console.log(res);
        return callback(res);
    });

}

RevisionSchema.statics.getTimestampsOfRevisionUnderUser = function(title, author, callback){
    Revision.aggregate([
        {$match:{user:author, title:title}},
        {$project:{timestamp:1}}

    ]).then(res=>{
    return callback(res);

    });

}

// ---------------------------------- Helper -------------------------------
RevisionSchema.statics.getRevisionNumberByTitle = function (title, callback) {
    Revision.count({title: title}, (err, res) => {
        return callback(res);
    });
}


var Revision = mongoose.model("Revision", RevisionSchema);
module.exports = Revision;