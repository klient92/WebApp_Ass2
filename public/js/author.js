$(document).ready(function () {
    $("#articleDiv").css("display","none");
    $('.author').addClass('active');

});


$(document).ready(function () {

    $("#searchBtn").on('click', function (e) {
        var author = $(".authorInput").val();
        $("#titleTableBody").empty();
        $.get( "http://localhost:3000/author/articles_by_author",{author:author}, function( data ) {
            data = data.result;
            console.log(data);
            for(var i=0;i<data.length;i++){
                var title = data[i]._id;
                var revisions = data[i].total;
                insertDataToTitleTable(title, revisions);
            }

        });

    });
});

$(document).ready(function(){
    $("#titleTable").delegate('tr', 'click', function() {
        $("#timestampTableBody").empty();
        var author = $(".authorInput").val();

        var title = $(this).find(">:first-child").text();
        //var revisions = $(this).find(">:nth-child(2)").text();
        console.log(title);
        $.get( "http://localhost:3000/author/revision_timestamp_by_author_and_article",{author: author, title: title}, function( data ) {
            data = data.result;

            // data["oldRevisions"] = parseInt(revisions);
            // data["newRevisions"] = parseInt(revisions) + parseInt(data.number);
            //
            // display(data,"#articleDiv");
            console.log(data);
            for(let i=0;i<data.length;i++){
                var timestamp = data[i].timestamp;
                insertDataToTimestampTable(timestamp);
            }

        });
    });
});

function insertDataToTimestampTable(timestamp) {
    var row = $('<tr></tr>');
    var td_title = $('<td></td>').text(timestamp);
    row.append(td_title);
    $("#timestampTableBody").append(row);
}


function insertDataToTitleTable(title, revisions){

    var row = $('<tr></tr>');
    var td_title = $('<td></td>').text(title);
    var td_revisions = $('<td></td>').text(revisions);
    row.append(td_title);
    row.append(td_revisions);
    $("#titleTableBody").append(row);

}



function searchFunction() {
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("authorInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("authorTable");
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}