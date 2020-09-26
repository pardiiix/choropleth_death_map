d3.csv("freq_by_state_latlong.csv", function(err, data) {

    
  var config = {"color1":"#fee6ce","color2":"#e6550d","stateDataColumn":"NAME","valueDataColumn":"Total"}
  
  var WIDTH = 850, HEIGHT = 500;
  
  var COLOR_COUNTS = 9;
  
  var SCALE = 1;
  
  function Interpolate(start, end, steps, count) {
      var s = start,
          e = end,
          final = s + (((e - s) / steps) * count);
      return Math.floor(final);
  }
  
  function Color(_r, _g, _b) {
      var r, g, b;
      var setColors = function(_r, _g, _b) {
          r = _r;
          g = _g;
          b = _b;
      };
  
      setColors(_r, _g, _b);
      this.getColors = function() {
          var colors = {
              r: r,
              g: g,
              b: b
          };
          return colors;
      };
  }
  
  function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
  }
  
  function valueFormat(d) {
    if (d > 1000000000) {
      return Math.round(d / 1000000000 * 10) / 10 + "B";
    } else if (d > 1000000) {
      return Math.round(d / 1000000 * 10) / 10 + "M";
    } else if (d > 1000) {
      return Math.round(d / 1000 * 10) / 10 + "K";
    } else {
      return d;
    }
  }
  
  var COLOR_FIRST = config.color1, COLOR_LAST = config.color2;
  
  var rgb = hexToRgb(COLOR_FIRST);
  
  var COLOR_START = new Color(rgb.r, rgb.g, rgb.b);
  
  rgb = hexToRgb(COLOR_LAST);
  var COLOR_END = new Color(rgb.r, rgb.g, rgb.b);
  
  var MAP_STATE = config.stateDataColumn;
  var MAP_VALUE = config.valueDataColumn;
  
  var width = WIDTH,
      height = HEIGHT;
  
  var valueById = d3.map();
  
  var startColors = COLOR_START.getColors(),
      endColors = COLOR_END.getColors();
  
  var colors = [];
  
  for (var i = 0; i < COLOR_COUNTS; i++) {
    var r = Interpolate(startColors.r, endColors.r, COLOR_COUNTS, i);
    var g = Interpolate(startColors.g, endColors.g, COLOR_COUNTS, i);
    var b = Interpolate(startColors.b, endColors.b, COLOR_COUNTS, i);
    colors.push(new Color(r, g, b));
  }
  
  var quantize = d3.scale.quantize()
      .domain([0, 1.0])
      .range(d3.range(COLOR_COUNTS).map(function(i) { return i }));
  
  var path = d3.geo.path();
  
  var projection = d3.geo.albersUsa();
  
  var svg = d3.select("#canvas-svg").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("float", "left")
      .attr("class", "float-child")
      .attr("class", "map")
    
  //adding this infobox to show info about that state (another svg)
   var infoBox = d3.select("#canvas-svg").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("float", "left")
        .attr("class", "float-child")
        .attr("id", "infoBox")
        .append('text')
        .attr("x","20")
        .attr("y", "35")
        .text("this is a test");

   var mapDots = d3.select(".map");
   
   var info = d3.select("#infoBox")
                .append("text")
                .attr("x", "20")
                .attr("y", "50")
                .text("using infoBox id");

  d3.tsv("https://s3-us-west-2.amazonaws.com/vida-public/geo/us-state-names.tsv", function(error, names) {
  
  name_id_map = {};
  id_name_map = {};
  
  for (var i = 0; i < names.length; i++) {
    name_id_map[names[i].name] = names[i].id;
    id_name_map[names[i].id] = names[i].name;
  }
  
  data.forEach(function(d) {
    var id = name_id_map[d[MAP_STATE]];
    valueById.set(id, +d[MAP_VALUE]); 
  });
  
  quantize.domain([d3.min(data, function(d){ return +d[MAP_VALUE] }),
    d3.max(data, function(d){ return +d[MAP_VALUE] })]);
  
  d3.json("https://s3-us-west-2.amazonaws.com/vida-public/geo/us.json", function(error, us) {
    svg.append("g")
        .attr("class", "states-choropleth")
      .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
      .enter().append("path")
        .attr("transform", "scale(" + SCALE + ")")
        .style("fill", function(d) {
          if (valueById.get(d.id)) {
            var i = quantize(valueById.get(d.id));
            var color = colors[i].getColors();
            return "rgb(" + color.r + "," + color.g +
                "," + color.b + ")";
          } else {
            return "";
          }
        })
        .attr("d", path)
        .on("mouseover", function(d) {
            var html = "";
            var stateName = id_name_map[d.id];
  
            html += "<div class=\"tooltip_kv\">";
            html += "<span class=\"tooltip_key\">";
            html += stateName;
            html += "</span>";
            html += "<span class=\"tooltip_value\">";
            html += (valueById.get(d.id) ? valueFormat(valueById.get(d.id)) : "");
            html += "";
            html += "</span>";
            html += "</div>";
            
            $("#tooltip-container").html(html);
            $(this).attr("fill-opacity", "0.5");
            $("#tooltip-container").show();
        
//             console.log(id_name_map)
        
            var coordinates = d3.mouse(this);
            
            var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;
            
            if (d3.event.layerX < map_width / 2) {
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX + 15) + "px");
            } else {
              var tooltip_width = $("#tooltip-container").width();
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
            
            var infoHtml = "";
        
            infoHtml += "<text class=\"info_key\" x =\"20\", y = \"30\" >";
            infoHtml += id_name_map[d.id];
            infoHtml += "</text>";
            infoHtml += "<text class=\"info_value\" x =\"20\", y = \"100\">";
            infoHtml += (valueById.get(d.id) ? valueFormat(valueById.get(d.id)) : "");
            infoHtml += "";
            infoHtml += "</text>";
            
            $(".float-child").html(infoHtml);
            $(this).attr("fill-opacity", "0.5");
            $(".float-child").show();
        
        
        }) //end of mouse in
        .on("mouseout", function() {
                $(this).attr("fill-opacity", "1.0");
                $("#tooltip-container").hide();
                $(".info_key").hide();
                $(".info_value").hide();
        
            })
        .on("click", function(d){
            var stateName = id_name_map[d.id];
            console.log('clicked', stateName);
            d3.csv("freq_by_city_latlong.csv", function(data){
//                 xloc = 20
//                 yloc = 35
//                 for (var e=0; e<data.length; e++){
//                      if(data[e].state_name == stateName){
//                              yloc += 10
//                              console.log(data[e].city, 'males:', data[e].males, 'females:', data[e].females);
//                              d3.selectAll('#infoBox')
//                                .append('text')
//                                .attr("x",xloc)
//                                .attr("y", yloc)
//                                .text(data[e].city+' males:'+data[e].males+ ' females:'+ data[e].females)
                    
                var Barwidth = 960;
                var Barheight = 500;
                var Baradj = 20;
//                 var barChartSVG = d3.select('#infoBox').append("svg")
//                                     .attr("preserveAspectRatio", "xMinYMin meet")
//                                     .attr("viewBox", "-" + Baradj + " -"+ Baradj + " " + (Barwidth + Baradj) + " " + (Barheight + Baradj))
//                                     .style("padding", 5)
//                                     .style("margin", 5)
//                                     .classed("svg-content", true);
             data.map(function(d) {
             d.males = +d.males;
             return d;});
            
                
                
                svg.selectAll("#infoBox")
                .data(data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function (d, i) {
                    for (i>0; i < data.length; i++) {
                        return i;
                    }
                })
                .attr("y", function (d) {
                    return Barheight - d.males;
                })
                .attr("width", 20)
                .attr("height", function (d) {
                    return d.males+ d.females;
                });
            
//             } //end of if
//                 } //end of for
            
            });
//             for (var e = 0; e<=frequency.length; e++){
//                 if (stateName == freqency.state_name[e]){
//                     console.log('stateName == freqency.state_name[e]')
//                 }
//             }
                
//                     console.log('yesss')
                
//                 function cityFreq(freq){
//                     console.log(freq)
//                 }
//                 cityFreq(freq)
//             }
        //getting this part ready for the plots
            var Barhtml = "";

            var totalDeathInState = valueFormat(valueById.get(d.id))
        
            Barhtml += "<text class=\"info_key\" x =\"20\", y = \"30\" >";
            Barhtml += stateName;
            Barhtml += "</text>";
            Barhtml += "<text class=\"info_value\" x =\"20\", y = \"100\">";
            Barhtml += (valueById.get(d.id) ?  totalDeathInState: "");
            Barhtml += "";
            Barhtml += "</text>";

            
            $("#infoBox").html(Barhtml);
            $(this).attr("fill-opacity", "0.5");
            $("#infoBox").show();
        
//             console.log(id_name_map)
        
            var coordinates = d3.mouse(this);
            
            var map_width = $('.states-choropleth')[0].getBoundingClientRect().width;
            
            if (d3.event.layerX < map_width / 2) {
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX + 15) + "px");
            } else {
              var tooltip_width = $("#tooltip-container").width();
              d3.select("#tooltip-container")
                .style("top", (d3.event.layerY + 15) + "px")
                .style("left", (d3.event.layerX - tooltip_width - 30) + "px");
            }
        })
      ;
  
    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("transform", "scale(" + SCALE + ")")
        .attr("d", path);
      
    //replace dots for deaths  
    d3.csv("freq_by_city_latlong.csv", function(err, cityData) {
//         console.log(cityData);
        
        mapDots.selectAll("circle")
        .data(cityData) 
        .enter()
        .append("circle")
        .attr("cx", function(x) {
            return projection([x.lng, x.lat])[0];
        })
        .attr("cy", function(x) {
            return projection([x.lng, x.lat])[1];
        })
        .attr("r", function(x) {
            return Math.sqrt(parseInt(x.males+x.females) * 0.03);
        })
            .style("fill", "rgb(153, 13, 3)")	
            .style("opacity", 0.85)	
        
    });//end of citydata
  
   
  });
  
  });
});

function clickCity(d,i){
    console.log(d.city)
//   cityContainer.attr("display", "block");
// barChartTitle.attr("display","block")
//                   .text(d.city+" Death Rate");
// totalCityDeaths.attr("display","block")
//                   .text("Total number of deaths: "+ d.total);

// totalCityDeathsFemale.attr("display","block")
//                   .text("# Female deaths: "+ d.females);

// totalCityDeathsMale.attr("display","block")
//                   .text("# Male deaths: "+ d.males);

// genderTitle.attr("display","block").text("# of Males/Females")


// dataNew = [d.males,d.females];

// var pie = d3.pie();

// var arcs = svg.selectAll("arc")
//               .data(pie(dataNew))
//               .enter()
//               .append("g")
//               .attr("id", "arcs")
//               .attr("opacity",1.0)
//               .attr("transform", "translate(720,650)")
//               // .on("click", closePopUp)
              
             
//   arcs.append("path")
//       .attr("fill", function(d, i) {
//         return genderColors[i];
//       })
//       .attr("d", arc)
//       .attr("opacity",0.9);

//   arcs.append("text")
//       .attr("transform", function(d) {
//         return "translate(" + arc.centroid(d) + ")";
//       })
//       .attr("text-anchor", "middle")
//       .text(function(d) {
//         return d.value;
//       });
}