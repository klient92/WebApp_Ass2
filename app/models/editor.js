var mongoose = require("mongoose");
var fs = require('fs');
var readLine = require('readline');
var EditorSchema = new mongoose.Schema({

    name: String,
    role: String

});

EditorSchema.statics.writeEditorsToDB = function(path, role){


    var botReader = readLine.createInterface({
        input: fs.createReadStream(path)
    });

    botReader.on('line', function (line) {
        var name = line;
        var editorData = new Editor({
            name: name,
            role: role
        });

        Editor.create(editorData, function(error, editor){
            if (error){

            } else {

            }
        });
    });
}


var Editor = mongoose.model("Editor", EditorSchema);

module.exports = Editor;