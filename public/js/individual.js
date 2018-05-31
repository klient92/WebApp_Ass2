$(document).ready(function () {
    $("#articleDiv").css("display","none");
    $('.individual').addClass('active');
    constructArticleTable("#articleDiv");
});

$(document).ready(function () {
    $.get( "http://localhost:3000/individual/get_all_title_and_revisions_nummber", function( data ) {
        data = data.result;
        for(var i=0;i<data.length;i++){
            var title = data[i]._id;
            var revisions = data[i].revisions;
            insertDataToTitleTable(title, revisions, i);
        }

    });
});

$(document).ready(function(){
    $("#titleTable").delegate('tr', 'click', function() {

        var title = $(this).find(">:first-child").text();
        var revisions = $(this).find(">:nth-child(2)").text();
        let revisions_id = $(this).find(">:nth-child(2)").attr('id');
        console.log(revisions_id);
        $.get( "http://localhost:3000/individual/update_title_from_wiki",{title: title}, function( data ) {
            data = data.result;
            data["oldRevisions"] = parseInt(revisions);
            data["newRevisions"] = parseInt(revisions) + parseInt(data.number);

            display(data,"#articleDiv", revisions_id);

        });
    });
});

function cleanArticleTable(field_id){
    var articleDiv = $(field_id);
    articleDiv.empty();
}

function constructArticleTable(field_id){

    var articleDiv = $(field_id);
    var alert = $('<div></div>').attr("id","topAlert").addClass("alert alert-success my-4").attr("role","alert");
    var title = $('<h3></h3>').attr("id","title");
    var revision = $('<h4></h4>').attr("id","revisionsNumber");
    //alert.insertAfter("#articleDiv")
    articleDiv.prepend(revision);
    articleDiv.prepend(title);
    articleDiv.prepend(alert);


}

function display(data, field_id, revisions_id){

    var articleDiv = $(field_id);

    articleDiv.css("display","block");
    let titleRevisionsNumber = $("#"+revisions_id);
    var status = data.status;
    var title = data.title;
    var updateString= "";

    if(status == "new"){

        updateString = "The data is up to date";

    }else {
        var number = data.number;

        titleRevisionsNumber.text((parseInt(titleRevisionsNumber.html()) + number).toString());

        var lastRevisionDate = data.last.timestamp;
        updateString = "Download " + number + " revision(s). The last revision date is : " + lastRevisionDate;

    }
    getNewRevisonsNumber("#topn-users-by-revisions", title, "-1", "5");

    // first chart
    getRevisionsDstbByYearAndUserType(title);
    // second chart
    getRevisionDstbByUserType(title);
    // third chart
    getRevisionDstbByYearInTop5User(title);

    $('#topAlert').text(updateString);
    $('#title').text(title);
    $('#revisionsNumber').text(titleRevisionsNumber.text());

}

function getRevisionsDstbByYearAndUserType(title){

    $.get( "http://localhost:3000/individual/revisions_distribution_by_year_user",{title: title}, function( data ) {
        var data = data.result;
        addBarChart(data);
    });

}

function getRevisionDstbByUserType(title) {
    $.get( "http://localhost:3000/individual/revisions_distribution_by_user",{title: title}, function( data ) {
        var data = data.result;
        addPieChart(data);
    });
}

function getRevisionDstbByYearInTop5User(title){
    $.get( "http://localhost:3000/individual/revisions_distribution_by_year_in_top5_user",{title: title}, function( data ) {
        var data = data.result;
        addThirdBarChart(data);
    });
}

function getNewRevisonsNumber(field_id, title, acd, topn){
    $("#topn-users-by-revisions").empty();
    $.get( "http://localhost:3000/individual/top_n_rgl_users_ranked_by_revisions",{title: title, acd:acd, topn:topn}, function( data ) {

        var data = data.result;
        for (var i =0 ;i<data.length;i++) {
            var title = data[i]._id.user;
            var total = data[i].total;
            var row = $('<tr></tr>');
            var th = $('<th scope="row"></th>').text(i + 1);
            var td_title = $('<td></td>').text(title);
            var td_total = $('<td></td>').text(total);
            row.append(th);
            row.append(td_title);
            row.append(td_total);

            $(field_id).append(row);
        }

    });
}

function insertDataToTitleTable(title, revisions, index){
    let title_index = "title_" + index.toString();
    var row = $('<tr></tr>');
    var td_title = $('<td></td>').text(title);
    var td_revisions = $('<td></td>').text(revisions).attr("id",title_index);
    row.append(td_title);
    row.append(td_revisions);
    $("#titleTableBody").append(row);

}

function searchFunction() {
    // Declare variables
    var input, filter, table, tr, td, i;
    input = document.getElementById("titleInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("titleTable");
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


function addPieChart(data) {

    var data_arr = [];
    var labels_arr = [];
    var total_users = 0;

    var color_arr = ['rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)'];

    var borderColor = [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)'];

    for (var i = 0; i < data.length; i++) {
        var total = data[i].total;
        var role = data[i]._id;
        total_users = total_users + total;
        data_arr.push(total);
        labels_arr.push(role);
    }

    var temp_arr = [];
    temp_arr.push({data: data_arr, backgroundColor: borderColor, borderColor: color_arr, borderWidth: 1});
    data["datasets"] = temp_arr;
    data["labels"] = labels_arr;

    var ctx = document.getElementById("individualPieChart").getContext('2d');

    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, chartData) {
                        var index = tooltipItem["index"];
                        var total = chartData[index].total;
                        var label = chartData[index]._id;
                        return label + ": " + total + " " + "(" + Math.round(total / total_users * 1000) / 10 + "%)";
                    }
                }
            },
            title: {
                display: true,
                text: 'Top 5 users with highest revisions distribution',
                fontSize: 20,
                fontColor: "white"
            },
            legend: {
                labels: {

                    fontColor: 'white'
                }
            }
        }
    });

    $("#individualPieChart").append(myDoughnutChart);

}

function addBarChart(data){

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


    var ctx = document.getElementById("individualBarChart_0").getContext('2d');
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
                text: 'Top 5 users with highest revisions distribution',
                fontSize: 20,
                fontColor: "white"
            },
            legend: {
                labels: {

                    fontColor: 'white'
                }
            }
        }
    });
    $("#individualBarChart_0").append(myChart);


}

function addThirdBarChart(data){
    var data_dict = data["data"];
    var inform_dict = data["inform"];
    var first_year = inform_dict["first_year"];
    var last_year = inform_dict["last_year"];


    var color_dict = {};
    color_dict["1"] = 'rgba(255, 99, 132, 0.2)';
    color_dict["2"] = 'rgba(54, 162, 235, 0.2)';
    color_dict["3"] = 'rgba(255, 206, 86, 1)';
    color_dict["4"] = 'rgba(75, 192, 192, 0.2)';
    color_dict["5"] = 'rgba(153, 102, 255, 0.2)'

    var borderColor_dict = {};
    borderColor_dict["1"] = 'rgba(255,99,132,1)';
    borderColor_dict["2"] = 'rgba(54, 162, 235, 1)';
    borderColor_dict["3"] = 'rgba(255, 206, 86, 1)';
    borderColor_dict["4"] = 'rgba(75, 192, 192, 1)';
    borderColor_dict["5"] = 'rgba(153, 102, 255, 1)';

    var labels =[];

    for(var year = first_year; year<=last_year; year++) {
        labels.push(year);
    }

    var dataset = [];
    var count = 1;
    for(let key in data_dict){
        var user = key;
        var role_datasets = data_dict[key];
        var year_set = [];
        var chart_data_dict ={};
        for(var year = first_year; year<=last_year; year++){
            var year_total = role_datasets[year];
            if(!year_total) year_total=0;
            year_set.push(year_total);
        }

        chart_data_dict["label"] = user;
        chart_data_dict["backgroundColor"] = color_dict[count.toString()];
        chart_data_dict["borderColor"] = borderColor_dict[count.toString()];
        chart_data_dict["borderWidth"] = 1;
        chart_data_dict["data"] = year_set;
        dataset.push(chart_data_dict);
        count ++;
    }


    var ctx = document.getElementById("individualBarChart_1").getContext('2d');
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
                text: 'Top 5 users with highest revisions distribution',
                fontSize: 20,
                fontColor: "white"
            },
            legend: {
                labels: {

                    fontColor: 'white'
                }
            }
        }
    });
    $("#individualBarChart_1").append(myChart);

}