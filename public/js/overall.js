$(document).ready(function () {
    $('.overall').addClass('active');
});

$(document).ready(function() {

    $("#overall-search1").click(function() {
        alert( "Handler for .click() called." );
    });

});

$(document).ready(function(){

    get_topn_titles_with_highest_revisions("#topn-high-revision", "-1", "3");
    get_topn_titles_with_highest_revisions("#topn-low-revision", "1", "3");
    get_topn_titles_rank_by_group("#topn-high-group", "-1", "1");
    get_topn_titles_rank_by_group("#topn-low-group", "1", "1");

})


$(document).ready(function() {

    $("#topn-revision-input").on("change paste keyup", function() {
        empty_element("#topn-high-revision");
        empty_element("#topn-low-revision");
        get_topn_titles_with_highest_revisions("#topn-high-revision", "-1", $(this).val());
        get_topn_titles_with_highest_revisions("#topn-low-revision", "1", $(this).val());
    });

});


function empty_element(element_id){
    $(element_id).empty();
}

function get_topn_titles_with_highest_revisions(field_id, acd, topn){

    $.get( "http://localhost:3000/overall/tln-articles-with-highest-number-of-revisions", {acd:acd, topn:topn}, function( data ) {
        var data = data.result;
        for (var i =0 ;i<data.length;i++) {
            var title = data[i]._id;
            var total = data[i].total;
            var row = $('<tr></tr>');
            var th = $('<th scope="row"></th>').text(i+1);
            var td_title = $('<td></td>').text(title);
            var td_total = $('<td></td>').text(total);
            row.append(th);
            row.append(td_title);
            row.append(td_total);

            $(field_id).append(row);
            console.log(row);
        }
    });

}

function get_topn_titles_rank_by_group(field_id, acd, topn){

    $.get( "http://localhost:3000/overall/tln-articles-edited-by-registered-users", {acd:acd, topn:topn}, function( data ) {
        var data = data.result;
        for (var i =0 ;i<data.length;i++) {
            var title = data[i]._id;
            var total = data[i].total;
            var row = $('<tr></tr>');
            var th = $('<th scope="row"></th>').text(i+1);
            var td_title = $('<td></td>').text(title);
            var td_total = $('<td></td>').text(total);
            row.append(th);
            row.append(td_title);
            row.append(td_total);

            $(field_id).append(row);
            console.log(row);
        }
    });

}