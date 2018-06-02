var fs = require('fs');
var readLine = require('readline');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/";


function setUserRole(path,role){
    var botReader = readLine.createInterface({
        input: fs.createReadStream(path)
    });

    botReader.on('line', function (line) {

        var name = line;
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("wikilatic");
          var myquery = {'user':name};
          var newvalues = {$set:{'role':role}};
          dbo.collection("revisions").updateMany(myquery, newvalues, function(err, res) {
            if (err) throw err;
            //console.log(res.result.nModified + " document(s) updated");
            db.close();
          });
        });

        
    });

}

setUserRole('./Bot.txt','bot');
//setUserRole('./Admin.txt','admin');







