var fs = require('fs');
var readLine = require('readline');

// Get All titles from folder
function getAllTitles(callback) {

        fs.readdir('./test', (err, files) => {
            if(err){
                reject(err);
            }else {
                var title_arr = [];
                for (var i=1; i<files.length;i++){
                	// console.log(files[i]);
                	var path = "./test/"+files[i];
                	readfile(path);

                }

            }

        });

}

function readfile(path){

	fs.readFile(path, 'utf8', function(error, data) {
    var obj = JSON.parse(data);
    // console.log(obj);
    var arr = []
    // console.log(obj.length);
    for(var i=0;i<obj.length;i++){
	    var timestamp = obj[i].timestamp;
        var myObjStr = JSON.stringify(obj[i]);
        var n = myObjStr.indexOf("timestamp");
        var timestring = myObjStr.substring(n-1, n+33);
        var tempString = "\"timestamp\":ISODate("  + "\""+timestamp+"\""  +")";
        myObjStr = myObjStr.replace(timestring,tempString)

        arr.push(myObjStr);

    }
    var final = "["+arr.join()+"]";


	fs.writeFileSync(path, final , 'utf-8'); 

});

}

getAllTitles(res=>{
	//console.log(res);

});