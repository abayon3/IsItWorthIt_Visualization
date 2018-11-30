var chartWidth = 600;
var chartHeight = 600;

d3.csv("colleges.csv", function(csv) {
    for (var i=0; i<csv.length; ++i) {
        csv[i]["Admission Rate"] = Number(csv[i]["Admission Rate"]);
        csv[i]["Expenditure Per Student"] = Number(csv[i]["Expenditure Per Student"]);
        csv[i]["Average Cost"] = Number(csv[i]["Average Cost"]);
        csv[i]["Median Earnings 8 years After Entry"] = Number(csv[i]["Median Earnings 8 years After Entry"]);
        csv[i]["Median Debt on Graduation"] = Number(csv[i]["Median Debt on Graduation"]);
    }

    /////////////////// Chart 1 //////////////////////////
    //////////////////////////////////////////////////////

    var avgAdmission = d3.nest()
        .rollup(function(v) { return d3.median(v, function(d) { return d["Admission Rate"]}) })
        .entries(csv)

    var avgCost = d3.nest()
        .rollup(function(v) { return d3.median(v, function(d) { return d["Average Cost"]}) })
        .entries(csv)


    var admissionExtent = d3.extent(csv, function(row) { return row["Admission Rate"] });
    var averageCostExtent = d3.extent(csv, function(row) { return row["Average Cost"] });

    var xScale1 = d3.scale.linear().domain(admissionExtent).range([80, 520]);
    var yScale1 = d3.scale.linear().domain(averageCostExtent).range([550, 50]);

    var xAxis1 = d3.svg.axis().scale(xScale1);
    var yAxis1 = d3.svg.axis().scale(yScale1);

    yAxis1.orient("left");

    var div = d3.select("body").append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

    var chart1 = d3.select("#chart1")
                    .append("svg:svg")
                    .attr("width", chartWidth)
                    .attr("height", chartHeight);

    var temp1 = chart1.selectAll("circle")
        .data(csv)
        .enter()
        .append("circle")
        .attr("id",function(d,i) {return i;})
        .attr("cx", function(d) { return xScale1(d["Admission Rate"]); })
        .attr("cy", function(d) { return yScale1(d["Average Cost"]); })
        .attr("r", 2.5)
        .on("mouseover", function(d) {
            div.transition()
                .duration(100)
                .style("opacity", .9);
            div	.html(d.Name + "<br/>" + "Admission Rate: %" + ((100 * d["Admission Rate"]).toFixed(2) + "<br/>" + "Average Cost of Attendance: $" + d["Average Cost"].toFixed(2)))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function(d, i) {
            chart1.selectAll("circle").classed("selected", false);
            chart2.selectAll("circle").classed("selected", function(z) {
                return d == z;
            })
            chart1.selectAll("circle").classed("selected", function(z) {
                return d == z;
            })
            populateDetails(d, i);
        });

        chart1
            .append("g")
            .attr("transform", "translate(0,"+ (chartWidth -50)+ ")")
            .call(xAxis1)
            .append("text")
            .attr("class", "label")
            .attr("x", chartWidth/2 + 50)
            .attr("y", 38)
            .style("text-anchor", "end")
            .text("Admission Rate");

        chart1
            .append("g")
            .attr("transform", "translate(80, 0)")
            .call(yAxis1)
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", -70)
            .attr("x", -260)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Average Cost of Attendance");

        var costMidLine = chart1.append("line")
            .attr("x1", 80)
            .attr("y1", 550-((avgCost-averageCostExtent[0])/(averageCostExtent[1]-averageCostExtent[0]) * 500))
            .attr("x2", 520)
            .attr("y2", 550-((avgCost-averageCostExtent[0])/(averageCostExtent[1]-averageCostExtent[0]) * 500))
            .attr("stroke-width", 2)
            .attr("stroke", "gray")
            .style("stroke-dasharray", ("3, 3"));

        chart1
            .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("x", -(((1 - avgCost/(averageCostExtent[1])) * 550) + 135))
            .attr("y", 540)
            .text("Median Average Cost of Attendance");

        var admissionMidLine = chart1.append("line")
            .attr("x1", ((avgAdmission-admissionExtent[0])/(admissionExtent[1]-admissionExtent[0]))*440 + 80)
            .attr("y1", 550)
            .attr("x2", ((avgAdmission-admissionExtent[0])/(admissionExtent[1]-admissionExtent[0]))*440 + 80)
            .attr("y2", 50)
            .attr("stroke-width", 2)
            .attr("stroke", "gray")
            .style("stroke-dasharray", ("3, 3"));

        chart1
            .append("text")
            .attr("class", "label")
            .attr("x", avgAdmission*440 + 10)
            .attr("y", 40)
            .text("Median Admission Rate");

        chart1.selectAll("circle").classed("LadLcost", function(d) {
            return d["Admission Rate"] <= avgAdmission && d["Average Cost"] <= avgCost;
        })

        chart1.selectAll("circle").classed("LadHcost", function(d) {
            return d["Admission Rate"] <= avgAdmission && d["Average Cost"] > avgCost;
        })

        chart1.selectAll("circle").classed("HadLcost", function(d) {
            return d["Admission Rate"] > avgAdmission && d["Average Cost"] <= avgCost;
        })

        chart1.selectAll("circle").classed("HadHcost", function(d) {
            return d["Admission Rate"] > avgAdmission && d["Average Cost"] > avgCost;
        })

        /////////////////// Chart 2 //////////////////////////
        //////////////////////////////////////////////////////

        var chart2 = d3.select("#chart2")
                        .append("svg:svg")
                        .attr("width", chartWidth)
                        .attr("height", chartHeight);

        var debtExtent = d3.extent(csv, function(row) { return row["Median Debt on Graduation"]/1000 });
        var earningsExtent = d3.extent(csv, function(row) { return row["Median Earnings 8 years After Entry"]/1000 });

        var xScale2 = d3.scale.linear().domain(earningsExtent).range([80, 520]);
        var yScale2 = d3.scale.linear().domain(debtExtent).range([550, 50]);

        var xAxis2 = d3.svg.axis().scale(xScale2);
        var yAxis2 = d3.svg.axis().scale(yScale2);

        yAxis2.orient("left");

        var temp2 = chart2.selectAll("circle")
            .data(csv)
            .enter()
            .append("circle")
            .attr("id",function(d,i) {return i;})
            .attr("cx", function(d) { return xScale2(d["Median Earnings 8 years After Entry"]/1000); })
            .attr("cy", function(d) { return yScale2(d["Median Debt on Graduation"]/1000); })
            .attr("r", 2.5)
            .on("mouseover", function(d) {
                div.transition()
                    .duration(100)
                    .style("opacity", .9);
                div	.html(d.Name + "<br/>" + "Median Earnings 8 years After Entry: $" + d["Median Earnings 8 years After Entry"].toFixed(2)
                                + "<br/>" + "Median Debt on Graduation: $" + d["Median Debt on Graduation"].toFixed(2))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(d, i) {
                chart2.selectAll("circle").classed("selected", false);
                chart1.selectAll("circle").classed("selected", function(z) {
                    return d == z;
                })
                chart2.selectAll("circle").classed("selected", function(z) {
                    return d == z;
                })
                populateDetails(d, i);
            });


            chart2
                .append("g")
                .attr("transform", "translate(0,"+ (chartWidth -50)+ ")")
                .call(xAxis2)
                .append("text")
                .attr("class", "label")
                .attr("x", chartWidth/2 + 150)
                .attr("y", 38)
                .style("text-anchor", "end")
                .text("Median Earnings 8 Years After Entry(in thousands)");

            chart2
                .append("g")
                .attr("transform", "translate(80, 0)")
                .call(yAxis2)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", -70)
                .attr("x", -180)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Median Debt on Graduation(in thousands)");

            xLink_idx = chart1.selectAll("circle").data().map(a => a["Admission Rate"]);

            yLink_idx = chart1.selectAll("circle").data().map(a => a["Average Cost"]);

            chart2.selectAll("circle").classed("LadLcost", function(d) {
                return xLink_idx.includes(d["Admission Rate"]) && yLink_idx.includes(d["Average Cost"]) &&
                d["Admission Rate"] <= avgAdmission &&
                d["Average Cost"] <= avgCost;
            })

            chart2.selectAll("circle").classed("LadHcost", function(d) {
                return xLink_idx.includes(d["Admission Rate"]) && yLink_idx.includes(d["Average Cost"]) &&
                d["Admission Rate"] <= avgAdmission &&
                d["Average Cost"] > avgCost;
            })

            chart2.selectAll("circle").classed("HadLcost", function(d) {
                return xLink_idx.includes(d["Admission Rate"]) && yLink_idx.includes(d["Average Cost"]) &&
                d["Admission Rate"] > avgAdmission &&
                d["Average Cost"] <= avgCost;
            })

            chart2.selectAll("circle").classed("HadHcost", function(d) {
                return xLink_idx.includes(d["Admission Rate"]) && yLink_idx.includes(d["Average Cost"]) &&
                d["Admission Rate"] > avgAdmission &&
                d["Average Cost"] > avgCost;
            })

        /////////////////// Filter ///////////////////////////
        //////////////////////////////////////////////////////

        d3.select("#filter").append("h2").text("Filter the data by: ");

        d3.select("#filter").append("span").text("Control: ");
        var controlSel = d3.select("#filter")
                            .append("g")
                            .append("select")
                            .attr("class", "selectCon")
                            .attr("id", "controlSel")
                            .on("change", onChange);

        d3.select("#filter").append("span").text("Region: ");
        var regionSel = d3.select("#filter")
                            .append("g")
                            .append("select")
                            .attr("class", "selectReg")
                            .attr("id", "regionSel")
                            .on("change", onChange);

        d3.select("#filter").append("span").text("Locale: ");
        var localeSel = d3.select("#filter")
                            .append("g")
                            .append("select")
                            .attr("class", "selectLoc")
                            .attr("id", "localeSel")
                            .on("change", onChange);


        var controls = controlSel.selectAll("option")
                                .data(["All", "Public", "Private"]).enter()
                                .append("option")
                                .text(function(d) {return d;})

        var regions = regionSel.selectAll("option")
                                .data(["All", "Far West", "Great Lakes", "Great Plains", "Mid-Atlantic", "New England", "Outlying Areas", "Rocky Mountains", "Southeast", "Southwest"]).enter()
                                .append("option")
                                .text(function(d) {return d;})

        var locales = localeSel.selectAll("option")
                                .data(["All", "Distant Rural", "Distant Town", "Fringe Rural", "Fringe Town", "Large City", "Large Suburb", "Mid-size City", "Mid-size Suburb", "Remote Rural", "Remote Town", "Small City", "Small Suburb"]).enter()
                                .append("option")
                                .text(function(d) {return d;})

        function onChange() {
            var selectConValue = d3.select(".selectCon").property("value")
            var selectRegValue = d3.select(".selectReg").property("value")
            var selectLocValue = d3.select(".selectLoc").property("value")
            d3.select("body")
            if (selectConValue != "All" || selectRegValue != "All" || selectLocValue != "All") {
                chart1.selectAll("circle")
                    .filter(function(d) {
                        var con = d.Control == selectConValue || selectConValue == "All";
                        var reg = d.Region == selectRegValue || selectRegValue == "All";
                        var loc = d.Locale == selectLocValue || selectLocValue == "All";
                        return con && reg && loc;
                    })
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style("display", "block")
                chart1.selectAll("circle")
                    .filter(function(d) {
                        var con = d.Control != selectConValue && selectConValue != "All";
                        var reg = d.Region != selectRegValue && selectRegValue != "All";
                        var loc = d.Locale != selectLocValue && selectLocValue != "All";
                        return con || reg || loc;
                    })
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style('display', 'none');
                chart2.selectAll("circle")
                    .filter(function(d) {
                        var con = d.Control == selectConValue || selectConValue == "All";
                        var reg = d.Region == selectRegValue || selectRegValue == "All";
                        var loc = d.Locale == selectLocValue || selectLocValue == "All";
                        return con && reg && loc;
                    })
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style("display", "block")
                chart2.selectAll("circle")
                    .filter(function(d) {
                        var con = d.Control != selectConValue && selectConValue != "All";
                        var reg = d.Region != selectRegValue && selectRegValue != "All";
                        var loc = d.Locale != selectLocValue && selectLocValue != "All";
                        return con || reg || loc;
                    })
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style('display', 'none');
            } else {
                chart1.selectAll("circle")
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style("display", "block")
                chart2.selectAll("circle")
                    .transition()
                    .duration(function(d) {
                        return Math.random() * 1000;
                    })
                    .delay(function(d) {
                        return d["Admission Rate"] * 300;
                    })
                    .style("display", "block")
            }
        }

        d3.select("#filter").append("p")

        d3.select("#filter")
            .append("g")
            .append("button")
            .attr("class", "hhButton")
            .text("High Admission Rate, High Cost")
            .on("click", function() {
                chart1.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadHcost").style("stroke", "#E250D0").style("fill", "#E250D0");
                chart2.selectAll(".HadHcost").style("stroke", "#E250D0").style("fill", "#E250D0");
            })

        d3.select("#filter")
            .append("g")
            .append("button")
            .attr("class", "hlButton")
            .text("High Admission Rate, Low Cost")
            .on("click", function() {
                chart1.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadLcost").style("stroke", "#5087E2").style("fill", "#5087E2");
                chart2.selectAll(".HadLcost").style("stroke", "#5087E2").style("fill", "#5087E2");
            })

        d3.select("#filter")
            .append("g")
            .append("button")
            .attr("class", "lhButton")
            .text("Low Admission Rate, High Cost")
            .on("click", function() {
                chart1.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".LadHcost").style("stroke", "#E2AB50").style("fill", "#E2AB50");
                chart2.selectAll(".LadHcost").style("stroke", "#E2AB50").style("fill", "#E2AB50");
            })

        d3.select("#filter")
            .append("g")
            .append("button")
            .attr("class", "llButton")
            .text("Low Admission Rate, Low Cost")
            .on("click", function() {
                chart1.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".HadLcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart2.selectAll(".LadHcost").style("stroke", "lightgray").style("fill", "lightgray");
                chart1.selectAll(".LadLcost").style("stroke", "#50E262").style("fill", "#50E262");
                chart2.selectAll(".LadLcost").style("stroke", "#50E262").style("fill", "#50E262");
            })

        d3.select("#filter")
            .append("g")
            .append("button")
            .text("Reset")
            .on("click", function() {
                chart1.selectAll(".LadLcost").style("stroke", "#50E262").style("fill", "#50E262");
                chart2.selectAll(".LadLcost").style("stroke", "#50E262").style("fill", "#50E262");
                chart1.selectAll(".HadLcost").style("stroke", "#5087E2").style("fill", "#5087E2");
                chart2.selectAll(".HadLcost").style("stroke", "#5087E2").style("fill", "#5087E2");
                chart1.selectAll(".LadHcost").style("stroke", "#E2AB50").style("fill", "#E2AB50");
                chart2.selectAll(".LadHcost").style("stroke", "#E2AB50").style("fill", "#E2AB50");
                chart1.selectAll(".HadHcost").style("stroke", "#E250D0").style("fill", "#E250D0");
                chart2.selectAll(".HadHcost").style("stroke", "#E250D0").style("fill", "#E250D0");
            })


        /////////////////// Details //////////////////////////
        //////////////////////////////////////////////////////

        function populateDetails(d, i) {
            college = d;
            index = i;
            document.getElementById("Name").innerHTML = college.Name;
            document.getElementById("Admission Rate").innerHTML = (100*college["Admission Rate"]).toFixed(2);
            document.getElementById("Average Cost").innerHTML = (+college["Average Cost"]).toFixed(2);
            document.getElementById("Expenditure Per Student").innerHTML = (+college["Expenditure Per Student"]).toFixed(2);
            document.getElementById("Median Debt").innerHTML = (+college["Median Debt on Graduation"]).toFixed(2);
            document.getElementById("Median Earnings").innerHTML = (+college["Median Earnings 8 years After Entry"]).toFixed(2);
            document.getElementById("Control").innerHTML = college.Control;
            document.getElementById("Region").innerHTML = college.Region;
            document.getElementById("Locale").innerHTML = college.Locale;
            document.getElementById("ACT Median").innerHTML = college["ACT Median"];
            document.getElementById("SAT Average").innerHTML = college["SAT Average"];
            document.getElementById("Undergrad Population").innerHTML = college["Undergrad Population"];
            document.getElementById("Average Faculty Salary").innerHTML = (+college["Average Faculty Salary"]).toFixed(2);
            document.getElementById("Retention").innerHTML = (100*college["Retention Rate (First Time Students)"]).toFixed(2);
            document.getElementById("Default Rate").innerHTML = (100*college["3 Year Default Rate"]).toFixed(2);
            document.getElementById("Federal Loans").innerHTML = (100*college["% Federal Loans"]).toFixed(2);
            document.getElementById("Pell Grant").innerHTML = (100*college["% Pell Grant Recipients"]).toFixed(2);
            document.getElementById("Average Age of Entry").innerHTML = (+college["Average Age of Entry"]).toFixed(2);
            document.getElementById("Median Family Income").innerHTML = college["Median Family Income"];
            document.getElementById("Poverty Rate").innerHTML = (100*college["Poverty Rate"]).toFixed(2);
            document.getElementById("Number of Unemployed 8 years after entry").innerHTML = college["Number of Unemployed 8 years after entry"];
            document.getElementById("Number of Employed 8 years after entry").innerHTML = college["Number of Employed 8 years after entry"];

            var white = +college["% White"];
            var black = +college["% Black"];
            var hispanic = +college["% Hispanic"];
            var asian = +college["% Asian"];
            var americanIndian = +college["% American Indian"];
            var pacificIslander = +college["% Pacific Islander"];
            var biracial = +college["% Biracial"];
            var other = 1 - white - black - hispanic - asian - americanIndian
                - pacificIslander - biracial;

            document.getElementById("White").innerHTML = "%" + (100*college["% White"]).toFixed(2);
            document.getElementById("Black").innerHTML = "%" + (100*college["% Black"]).toFixed(2);
            document.getElementById("Hispanic").innerHTML = "%" + (100*college["% Hispanic"]).toFixed(2);
            document.getElementById("Asian").innerHTML = "%" + (100*college["% Asian"]).toFixed(2);
            document.getElementById("American Indian").innerHTML = "%" + (100*college["% American Indian"]).toFixed(2);
            document.getElementById("Pacific Islander").innerHTML = "%" + (100*college["% Pacific Islander"]).toFixed(2);
            document.getElementById("Biracial").innerHTML = "%" + (100*college["% Biracial"]).toFixed(2);
            document.getElementById("Other").innerHTML = "%" + (100*other).toFixed(2);


            var ethData = [white, black, hispanic, asian, americanIndian, pacificIslander, biracial, other];
            var ethLabel = ["White", "Black", "Hispanic", "Asian", "American Indian", "Pacific Islander", "Biracial", "Other"];
            var color = ["#ee1c25","#a3218e","#592f93","#0465b2", "#05a45e", "#70bf42", "#fef102", "#f58225"];
            var ethWidth = 300, ethHeight = 100, ethTot = 0;
            var ethChart = d3.select("#ethChart")
                .append("svg:svg")
                .attr("width", ethWidth)
                .attr("height", ethHeight);

            function addBar(x, i) {
                ethChart.append("rect")
                    .attr("y", 0)
                    .attr("x", x)
                    .attr("width", ethData[i]*ethWidth)
                    .attr("height", 100)
                    .style("fill", color[i])
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(100)
                            .style("opacity", .9);
                        div	.html("%" + (this["width"].baseVal.value/3).toFixed(2))
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
            }

            for (i = 0; i < ethData.length; i++) {
                addBar(ethTot, i);
                ethTot += ethData[i]*ethWidth;
            }

            ethX = 0;
        }
    });

        var genDetails = d3.select("#genDetails")
                        .append("svg:svg")
                        .attr("width", 300)
                        .attr("height", 600);

        var finDetails = d3.select("#genDetails")
                        .append("svg:svg")
                        .attr("width", 300)
                        .attr("height", 600);

        var ethDetails = d3.select("#ethDetails")
                        .append("svg:svg")
                        .attr("width", 300)
                        .attr("height", 600);
