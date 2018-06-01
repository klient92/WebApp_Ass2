
let search_author_name = "";


$(document).ready(function () {
    $("#articleDiv").css("display","none");
    $('.author').addClass('active');
    $('.alertDiv').css("display","none");
});


$(document).ready(function () {

    $("#searchBtn").on('click', function (e) {
        var format = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
        var author = $(".authorInput").val();
        $('#authorTableBody').empty();
        $("#dataTableBody").empty();

        if(format.test(author) || !author){
            $(".alertDiv").html("<strong>Warning!</strong> Special characters are not allowed");
            $(".alertDiv").fadeIn();

        }else {
            $(".alertDiv").fadeOut();

            $.get( "http://localhost:3000/author/find_users",{author:author}, function( data ) {
                data = data.result;
                for(let i=0;i<data.length;i++){
                    let authorName = data[i]._id;
                    insertDataToAuthorTable(authorName, i);
                }
                console.log(data.length);
            });
        }
    });
});

$(document).on('click' ,'.authorRow',function(){
    let name = $(this).text();
    search_author_name = name;
    $("#dataTableBody").empty();
    $.get( "http://localhost:3000/author/articles_by_author",{author:name}, function( data ) {
        data = data.result;

        if (data.length == 0) {

            $(".alertDiv").fadeIn();
        }else {
            $(".alertDiv").fadeOut()
            for(var i=0;i<data.length;i++){
                var title = data[i]._id;
                var revisions = data[i].total;
                insertDataToCollapseTableBody(title, revisions);
            }
        }

    });
});




$(document).on("click",".accordion-toggle", function () {

    let author = $(".authorInput").val();
    let clickedItemName = $(this).find(">:first-child").text();
    let id = "#" + clickedItemName.replace(/ /g, "-").replace(/\(|\)/g, "") + "TimestampTableBody";
    $(id).empty();
    $.get( "http://localhost:3000/author/revision_timestamp_by_author_and_article",{author: search_author_name, title: clickedItemName}, function( data ) {
        data = data.result;
        for(let i=0;i<data.length;i++){
            var timestamp = data[i].timestamp;
            insertDataToTimestampTable(id, timestamp);
        }

    });
});


function insertDataToCollapseTableBody(title, revisions){

    let id = title.replace(/ /g, "-").replace(/\(|\)/g, "");
    let userInfoRow = $('<tr></tr>').attr("data-toggle","collapse")
        .attr("data-target","#"+id).addClass("accordion-toggle");

    let userRowData = $('<td></td>').text(title);
    let RevisionRowData = $('<td></td>').text(revisions);

    let hiddenRow = $('<tr></tr>');
    let hiddenRowData = $('<td></td>').addClass('hiddenRow').attr("colspan","6");
    let ttDiv = $('<div></div>').addClass('accordian-body collapse').attr("id",id);
    let tableDiv = $('<div></div>').addClass('table-wrapper-2');
    let ttTable = $('<table></table>').attr('id', id + 'TimestampTable').addClass('timestampTable');
    let tableHeader = $('<thead></thead>');
    let headerRow = $('<tr></tr>').addClass('header bg-primary text-light');
    let ttHeaderTitle = $('<th></th>').attr('style','width:40%').text('Timestamp');
    let ttBody = $('<tbody></tbody>').attr('id',id +"TimestampTableBody").addClass('timestampTableBody');

    let tableBody = $('#dataTableBody');
    tableBody.append(userInfoRow);
    userInfoRow.append(userRowData);
    userInfoRow.append(RevisionRowData);

    tableBody.append(hiddenRow);
    hiddenRow.append(hiddenRowData);
    hiddenRowData.append(ttDiv);
    ttDiv.append(tableDiv);
    tableDiv.append(ttTable);
    ttTable.append(tableHeader);
    tableHeader.append(headerRow);
    headerRow.append(ttHeaderTitle);
    ttTable.append(ttBody);


}

function insertDataToTimestampTable(id,timestamp) {

    var row = $('<tr></tr>');
    var td_title = $('<td></td>').text(timestamp);
    row.append(td_title);
    $(id).append(row);
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

function insertDataToAuthorTable(authorName, index){
    let title_index = "author_" + index.toString();
    var row = $('<tr></tr>').addClass('authorRow');
    var td_author = $('<td></td>').text(authorName).attr("id",title_index);
    row.append(td_author);
    $("#authorTableBody").append(row);

}