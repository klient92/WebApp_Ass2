let total_articles = 0;

$(document).ready(function () {
    $('.overall').addClass('active');
    $('#overPieChart').css("display","none");

    $.get( "http://localhost:3000/overall/get_total_articles_number", function(data) {
        total_articles = data.result;
    });
});



$(document).ready(function() {
    //set initial state.
    $('#switchBtn').val($(this).is(':checked'));

    $('#switchBtn').change(function() {
        if($(this).is(":checked")) {
            $('#overBarChart').css("display","block");
            $('#overPieChart').css("display","none");
           console.log("aa");
        }else {
            $('#overBarChart').css("display","none");
            $('#overPieChart').css("display","block");
        }
        $('#switchBtn').val($(this).is(':checked'));
    });
});

$(document).ready(function(){
    addChart();
    addBar();
    // Titles of the three articles with highest number of revisions.
    get_topn_titles_with_highest_revisions("#topn-high-revision", "-1", "3");
    get_topn_titles_with_highest_revisions("#topn-low-revision", "1", "3");

    // The article edited by largest / smallest group of registered users.
    get_topn_titles_rank_by_group("#topn-high-group", "-1", "1");
    get_topn_titles_rank_by_group("#topn-low-group", "1", "1");

    // The top 3 articles with the longest history (measured by age).
    get_topn_articles_with_longest_or_shortest_history("#topn-longest-history", "-1", "3");
    get_topn_articles_with_longest_or_shortest_history("#topn-shortest-history", "1", "3");

})


$(document).ready(function() {

    $("#topn-revision-input").on("change", function() {
        empty_element("#topn-high-revision");
        empty_element("#topn-low-revision");
        let inputTopN =  $(this).val();
        if (inputTopN>total_articles){
            inputTopN = total_articles;

        }
        if(inputTopN<0){
            $(this).val(1);
            inputTopN = 1;
        }

        if(inputTopN==""){
            $(this).val(3);
            inputTopN = 3;

        }
        get_topn_titles_with_highest_revisions("#topn-high-revision", "-1", inputTopN);
        get_topn_titles_with_highest_revisions("#topn-low-revision", "1", inputTopN);
    });

});

function addBar(){

    var data_arr = [];
    var labels_arr = [];
    var data = {};
    var total_users = 0;

    var color_arr = ['rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'];

    var borderColor =  [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'];


    $.get( "http://localhost:3000/overall/distribution_by_user", function( data ) {
        data = data.result;
        for(var i=0;i<data.length;i++){
            var total = data[i].total;
            var role = data[i]._id;
            total_users = total_users + total;
            data_arr.push(total);
            labels_arr.push(role);
        }

        var temp_arr = [];
        temp_arr.push({data:data_arr, backgroundColor: borderColor, borderColor:color_arr, borderWidth:1});
        data["datasets"] = temp_arr;
        data["labels"] = labels_arr;

        var ctx = document.getElementById("overPieChart").getContext('2d');

        var myDoughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                tooltips: {
                    callbacks: {
                        label: function(tooltipItem, chartData) {
                        var index = tooltipItem["index"];
                        var total = chartData[index].total;
                        var label = chartData[index]._id;
                            return label + ": "+total + " " + "(" + Math.round(total/total_users*1000)/10+"%)";
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Revision number distribution by user type',
                    fontSize: 20,
                    fontColor: "white"
                },
            }
        });

        $("#overallPieChart").append(myDoughnutChart);
    });


}

function addChart(){

    $.get( "http://localhost:3000/overall/distribution_by_year_and_user", function( data ) {

        data = data.result;
        var data_dict = data["data"];
        var inform_dict = data["inform"];
        var first_year = inform_dict["first_year"];
        var last_year = inform_dict["last_year"];

        var color_dict = {};
        color_dict["bot"] = 'rgba(255, 99, 132, 0.2)';
        color_dict["admin"] = 'rgba(54, 162, 235, 0.2)';
        color_dict["rgl"] = 'rgba(255, 206, 86, 1)';
        color_dict["anon"] = 'rgba(75, 192, 192, 0.2)';

        var borderColor_dict = {};
        borderColor_dict["bot"] = 'rgba(255,99,132,1)';
        borderColor_dict["admin"] = 'rgba(54, 162, 235, 1)';
        borderColor_dict["rgl"] = 'rgba(255, 206, 86, 1)';
        borderColor_dict["anon"] = 'rgba(75, 192, 192, 1)';

        var labels =[];

        for(var year = first_year; year<=last_year; year++) {
            labels.push(year);
        }

        var dataset = [];

        for(key in data_dict){
            var role = key;
            var role_datasets = data_dict[key];
            var year_set = [];
            var chart_data_dict ={};
            for(var year = first_year; year<=last_year; year++){
                var year_total = role_datasets[year];
                if(!year_total) year_total=0;
                year_set.push(year_total);
            }

            chart_data_dict["label"] = role;
            chart_data_dict["backgroundColor"] = color_dict[role];
            chart_data_dict["borderColor"] = borderColor_dict[role];
            chart_data_dict["borderWidth"] = 1;
            chart_data_dict["data"] = year_set;
            dataset.push(chart_data_dict);
        }


        var ctx = document.getElementById("overBarChart").getContext('2d');
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: dataset
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
                title: {
                    display: true,
                    text: 'Revision number distribution by year and by user type',
                    fontSize: 20,
                    fontColor: "white"
                },
            }
        });
        $("#overallBarChart").append(myChart);

    });
}



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
            //console.log(row);
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
            //console.log(row);
        }
    });

}

function get_topn_articles_with_longest_or_shortest_history(field_id, acd, topn){

    $.get( "http://localhost:3000/overall/top-n-article-with-lors-history", {acd:acd, topn:topn}, function( data ) {
        var data = data.result;

        for (var i =0 ;i<data.length;i++) {
            var title = data[i]._id;
            var duration = Math.round(data[i].duration/1000/60/60/24*100)/100;
            var row = $('<tr></tr>');
            var th = $('<th scope="row"></th>').text(i+1);
            var td_title = $('<td></td>').text(title);
            var td_total = $('<td></td>').text(duration + " days");
            row.append(th);
            row.append(td_title);
            row.append(td_total);
            //console.log(row);
            $(field_id).append(row);

        }
    });

}