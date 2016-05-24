var secNames = [
    {
        'label': 'Non-Energy Minerals',
        'code': 1100,
        'color':'#485fd1',
    },
    {
        'label': 'Producer Manufacturing',
        'code': 1200,
        'color':'#5572df',
    },
    {
        'label': 'Electronic Technology',
        'code': 1300,
        'color':'#6384eb',
    },
    {
        'label': 'Consumer Durables',
        'code': 1400,
        'color':'#7295f4',
    },
    {
        'label': 'Energy Minerals',
        'code': 2100,
        'color':'#81a4fb',
    },
    {
        'label': 'Process Industries',
        'code': 2200,
        'color':'#90b2fe',
    },
    {
        'label': 'Health Technology',
        'code': 2300,
        'color':'#9fbfff',
    },
    {
        'label': 'Consumer Non-Durables',
        'code': 2400,
        'color':'#afcafc',
    },
    {
        'label': 'Industrial Services',
        'code': 3100,
        'color':'#bed2f6',
    },
    {
        'label': 'Commercial Services',
        'code': 3200,
        'color':'#cbd8ee',
    },
    {
        'label': 'Distribution Services',
        'code': 3250,
        'color':'#d7dce3',
    },
    {
        'label': 'Technology Services',
        'code': 3300,
        'color':'#e2dad5',
    },
    {
        'label': 'Health Services',
        'code': 3350,
        'color':'#ecd3c5',
    },
    {
        'label': 'Consumer Services',
        'code': 3400,
        'color':'#f2c9b4',
    },
    {
        'label': 'Retail Trade',
        'code': 3500,
        'color':'#f6bda2',
    },
    {
        'label': 'Transportation',
        'code': 4600,
        'color':'#f7ad90',
    },
    {
        'label': 'Utilities',
        'code': 4700,
        'color':'#f59d7e',
    },
    {
        'label': 'Finance',
        'code': 4800,
        'color':'#f08b6e',
    },
    {
        'label': 'Communications',
        'code': 4900,
        'color': '#e9785d',
    },
    {
        'label': 'Miscellaneous',
        'code': 6000,
        'color':'#df634e',
    },
    {
        'label': 'Government',
        'code': 7000,
        'color':'#d24b40',
    },
    {
        'label': 'Not Classified',
        'code': 9999,
        'color':'#c43032',
    },];

var colNames = {},i;

for (i=0;i<secNames.length;i++) {
    colNames[secNames[i].code]= { 'color': heatMapColorforValue(i/(secNames.length-1.0)), 'name': secNames[i].label};   //secNames[i].color;
}


function heatMapColorforValue(value){
    var h = (1.0 - value) * 240;
    return "hsl(" + h + ", 100%, 50%)";
}


function myRedraw(chart) {

    //var chart = $('#portfolio_value').highcharts();
    var extremes = chart.xAxis[0];
    //console.log(extremes);
    start = extremes.min;
    end = extremes.max;
    //document.getElementById("input1").value = start;
    //document.getElementById("input2").value = end;

    // Do a REFRESH :

    $.getJSON('/_update',
        {start_to: start, end_to: end,},
        function(data) {

            //$("#result_len").text(data.result_len);

            console.log('data from server:')
            console.log(data);


            //  Scatter Plot
            var myplot = data.network['nodes'];
            myScatter(myplot,"#myscatterplot");




            // NV3 Horizontal BarCharts Long
            nv.addGraph(function() {
                var chart = nv.models.multiBarHorizontalChart()
                    //.x(function(d) { return d.label })
                    //.y(function(d) { return d.value })
                    .margin({top: 30, right: 20, bottom: 50, left: 175})
                    .showValues(true)
                    .tooltips(false)
                    .showControls(false);

                chart.yAxis
                    .tickFormat(d3.format(',.2f'));

                var datanv = [
                    {
                        'key': "Long",
                        "color": "#d62728",
                        'values': data.retsecL,
                    },
                    {
                        'key': "Shadow",
                        "color": "#1f77b4",
                        'values': data.retsecLShadow,

                    },
                    {
                        'key': 'Benchmark',
                        "color": "#FF0060",
                        'values': data.retsecBench,
                    }
                ];




                d3.select('#chartnv3horizontal svg')
                    .datum(datanv)
                    .transition().duration(500)
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });

            // NV3 Horizontal BarCharts Short
            nv.addGraph(function() {
                var chart = nv.models.multiBarHorizontalChart()
                   // .x(function(d) { return d.label })
                   // .y(function(d) { return d.value })
                    .margin({top: 30, right: 20, bottom: 50, left: 175})
                    .showValues(true)
                    .tooltips(false)
                    .showControls(false);

                chart.yAxis
                    .tickFormat(d3.format(',.2f'));


                var datanv = [
                    {
                        'key': "Short",
                        "color": "#d62728",
                        'values': data.retsecS,
                    },
                    {
                        'key': "Shadow",
                        "color": "#1f77b4",
                        'values': data.retsecSshadow,

                    },
                    {
                        'key': 'Benchmark',
                        "color": "#FF0060",
                        'values': data.retsecBench,
                    }
                ];




                d3.select('#chartnv3 svg')
                    .datum(datanv)
                    .transition().duration(500)
                    .call(chart);

                nv.utils.windowResize(chart.update);

                return chart;
            });

            // NV3 Bar Charts Performance
            /*nv.addGraph(function() {
                var chart = nv.models.multiBarChart();

                chart.reduceXTicks(false);

                chart.margin({top: 30, right: 20, bottom: 100, left: 60});
                chart.xAxis
                    .rotateLabels(-45);
                //    .tickFormat(d3.format('s'));

                chart.yAxis
                    .tickFormat(d3.format(',.1f'));

                // overwrite tooltip to display secNames
                chart.tooltip
                    .headerFormatter(function(d, i) {
                        return d;
                    });

                var datanv = [
                    {
                        'key': "Long",
                        'values': data.retsecL,
                    },
                    {
                        'key': "Shadow",
                        'values': data.retsecLShadow,

                    },
                    {
                        'key': 'Benchmark',
                        'values': data.retsecBench,
                    }
                ]


                console.log("data for MultiBar Chart");
                console.log(datanv);

                d3.select('#chartnv3 svg')
                    .datum(datanv)
                    .transition().duration(500)
                    .call(chart)
                ;

                nv.utils.windowResize(chart.update);

                return chart;
            });*/



            // Upate Network
            D3ok(data.network);


            // Dynamic Pie charts Short Portfolio
            $(function () {

                $('#piechartShort').highcharts({
                    chart: {
                        type: "pie",

                    },
                    title: {
                        text: "Sector Weights <br> Short Portfolio and its Shadow",
                    },

                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {

                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true
                            },
                            showInLegend: false
                        }
                    },

                    xAxis: {
                        type: 'category',
                        allowDecimals: false,
                        title: {
                            text: ""
                        }
                    },
                    yAxis: {
                        title: {
                            text: "Weights"
                        }
                    },
                    series: [
                        {
                            name: 'Short',
                            center: [300,150],
                            data: data.wsecSshadow,
                            colorByPoint: true
                        },
                        {
                            name: 'Shadow Short',
                            center: [850,150],
                            data: data.wsecSshadow,
                            colorByPoint: true
                        },

                    ]
                });

            });

            // Dynamic Pie charts Long Portfolio
            $(function () {

                $('#piechartLong').highcharts({
                    chart: {
                        type: "pie"
                    },
                    title: {
                        text: "Sector Weights <br> Long Portfolio and its Shadow",
                    },

                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true
                            },
                            showInLegend: false
                        }
                    },

                    xAxis: {
                        type: 'category',
                        allowDecimals: false,
                        title: {
                            text: ""
                        }
                    },
                    yAxis: {
                        title: {
                            text: "Weights"
                        }
                    },
                    series: [
                        {
                            name: 'Long',
                            center: [300,150],
                            data: data.wsecL,
                            colorByPoint: true
                        },
                        {
                            name: 'Shadow Long',
                            center: [850,150],
                            data: data.wsecLshadow,
                            colorByPoint: true
                        },

                    ]
                });

            });


        }
    );
}


function myScatter(data, divid) {

    var activestock = undefined;
    var currentOffset = {'x':0.0, 'y': 0.0};

    d3.select(divid).selectAll("svg").remove();

    var margin = {top: 20, right: 20, bottom: 30, left: 20},
        outerWidth = 940,
        outerHeight = 500,
        width = outerWidth - margin.left - margin.right,
        height = outerHeight - margin.top - margin.bottom;

    var xScale = d3.scale.linear()
        .range([0, width]).nice();

    var yScale = d3.scale.linear()
        .range([height, 0]).nice();


    var xMax = d3.max(data, function (d) {
                return d.x1;
            }) * 1.05,
        xMin = d3.min(data, function (d) {
            return d.x1;
        }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function (d) {
                return d.y1;
            }) * 1.05,
        yMin = d3.min(data, function (d) {
            return d.y1;
        }),
        yMin = yMin > 0 ? 0 : yMin;

    xScale.domain([xMin, xMax]);
    yScale.domain([yMin, yMax]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickSize(-width);

   // var color = d3.scale.category10();
    var color = d3.scale.linear()
        .domain([-10.0, 0, 10.0])
        .range(["red", "white", "green"]);

    var zoomBeh = d3.behavior.zoom()
        .x(xScale)
        .y(yScale)
        .scaleExtent([0, 500])
        .on("zoom", zoom);

    // setup fill color
    var cValue = function (d) {
        return d.return;
    };


    // add the graph canvas to the body of the webpage
    var svg = d3.select(divid).append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    // add the tooltip area to the webpage
    var tooltip = d3.select(divid).append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // x-axis
    svg.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("classed", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("First Eigenfunction");

    // y-axis
    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .attr("classed", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Second Eigenfunction");


    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");

    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);

    objects.selectAll(".node")
        .data(data)
        .enter().append("circle")
        .classed("node", true)
        .attr('id', function (d) {
            return "c" + d.index;
        })
        .attr("r", 5)
        .attr("transform", transform)
        .style('fill',function(d,i){

            if (data[i].return>0)
                return "lawngreen"
            else return "orangered"
            //return color(data[i].return)
        })
        .style('opacity',function(d,i) {
            return Math.min(1, Math.abs(data[i].return) / 10.0);
        })
        .on("mouseover", function (d, i) {
            highlightNode(d, true, this);
        })
        .on("mouseout", function (d) {
            highlightNode(d,false,this);
            if (activestock !=undefined)
            highlightNode(data[activestock],true,this);
        })
        .on("click",centeratNode);


    var graphLabels = objects.append('svg:g').attr('class', 'grp gLabel')
        .selectAll("g.label")
        .data(data, function (d) {
            return d.label
        })
        .enter().append("svg:g")
        .attr('id', function (d) {
            return "l" + d.index;
        })
        .attr('class', 'label');


    labels = graphLabels.append('svg:text')
        .attr('x', '-2em')
        .attr('y', '-.5em')
        .attr('pointer-events', 'none') // they go to the circle beneath
        .attr('id', function (d) {
            return "lf" + d.index;
        })
        .attr('class', 'nlabel')
        .attr("transform", transform)
        .text(function (d) {
            return d.label;
        });

    d3.select("#searchtic").on("click", centeratTicker);
    d3.select("#tic2find").on("keyup", function () {
        if (d3.event.keyCode === 13) {
            centeratTicker();
        }
    });

    d3.select("#colormode").on("change",do_colorchange)

    function do_colorchange(){

        var droplist  = d3.select("#colormode").property('value');

        // locate the SVG nodes: circle & label group
        circles = objects.selectAll('circle');

        if (droplist=='Portfolio') {

            circles.style('fill', function (d, i) {

                if (data[i]['pos'] < 0)
                    return "red"
                if (data[i]['pos'] > 0)
                    return "green"

                return "grey"

            })
            circles.style('opacity',.8);
        }

        if (droplist=='Return') {

            circles.style('fill',function(d,i){

                if (data[i].return>0)
                return "lawngreen"
                else return "orangered"
                //return color(data[i].return)
            });

            circles.style('opacity',function(d,i){
                return Math.min(1,Math.abs(data[i].return)/10.0);
            });
        }

        if (droplist=='Sector') {

            circles.style('fill', function (d, i) {

                return colNames[data[i].sector].color;
            });

            circles.style('opacity',.8);
        }
    }

    function myselectstock(new_idx) {

        s = getViewportSize();
        d = data[new_idx];

        widt = s.w < width ? s.w : width;
        heigt = s.h < height ? s.h : height;

        myzoom = zoomBeh.scale();
        console.log('zoom:');
        console.log(myzoom);
        xMin = xScale.invert(0);
        xMax = xScale.invert(width);
        yMax = yScale.invert(0);
        yMin = yScale.invert(height);

        offset1 = {
            x: d.x1 - (xMax + xMin) / 2.0,
            y: d.y1 - (yMin + yMax) / 2.0
        };

        offset = {
            x: widt / 2 - xScale(d.x1),
            y: heigt / 2 - yScale(d.y1)
        };


        xScale.domain([xMin + offset1.x, xMax + offset1.x]);
        yScale.domain([yMin + offset1.y, yMax + offset1.y]);
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);
        zoomBeh.x(xScale);
        zoomBeh.y(yScale);


        if (offset1 !== undefined &&
            (offset1.x != currentOffset.x || offset1.y != currentOffset.y )) {

            currentOffset.x = offset1.x;
            currentOffset.y = offset1.y;

            svg.selectAll(".node")
                .transition().duration(500)
                .attr("transform", transform);

            svg.selectAll(".nlabel")
                .transition().duration(500)
                .attr("transform", transform);

        }



    }

    function centeratTicker() {

        var ticker = d3.select("#tic2find").property('value');

        function searchStringInArray(str, strArray) {
            for (var j = 0; j < strArray.length; j++) {
                if (strArray[j].label.match(str)) return j;
            }
            return -1;
        }

        var id = searchStringInArray(ticker, data);
        if (id < 0)
            id = 0;

        myselectstock(id);
        highlightNode(data[id], true);
        activestock = id;

    }

    function centeratNode(node){

        activestock = node.index;
        myselectstock(activestock);
        highlightNode(node,true);
    }

    function highlightNode(node, on) {
        // If we are to activate a stock, and there's already one active,
        // first switch that one off
        if (on && activestock !== undefined) {
            highlightNode(data[activestock], false);
        }


        // locate the SVG nodes: circle & label group
        circle = objects.select('#c' + node.index);
        label = objects.select('#l' + node.index);


        // activate/deactivate the node itself
        circle.classed('main', on);

        label.classed('on', on);
        label.selectAll('text')
            .classed('main', on);

        // activate all siblings
        Object(node.links).forEach(function (id) {
            objects.select("#c" + id).classed('sibling', on);
            label = objects.select('#l' + id);
            label.classed('on', on);
            label.selectAll('text.nlabel')
                .classed('sibling', on);
        });

        // set the value for the current active stock
       // activestock = on ? node.index : undefined;
    }

    function zoom() {

        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".node")
            .attr("transform", transform);

        svg.selectAll(".nlabel")
            .attr("transform", transform);

    }

    function transform_t(d) {
        return "translate(" + (currentOffset.x+xScale(d.x)) + "," + (currentOffset.y+yScale(d.y)) + ")";
    }

    function transform(d) {
        return "translate(" + xScale(d.x1) + "," + yScale(d.y1) + ")";
    }

    // Get the current size & offset of the browser's viewport window
    function getViewportSize( w ) {
        var w = w || window;

        if( w.innerWidth != null )
            return { w: w.innerWidth,
                h: w.innerHeight,
                x : w.pageXOffset,
                y : w.pageYOffset };
        var d = w.document;
        if( document.compatMode == "CSS1Compat" )
            return { w: d.documentElement.clientWidth,
                h: d.documentElement.clientHeight,
                x: d.documentElement.scrollLeft,
                y: d.documentElement.scrollTop };
        else
            return { w: d.body.clientWidth,
                h: d.body.clientHeight,
                x: d.body.scrollLeft,
                y: d.body.scrollTop};
    }

}


