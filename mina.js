

//Map dimensions (in pixels)
var width = 2000,
    height = 800;

//Map projection
var projection = d3.geoAlbersUsa()
    .scale(1000)
    .translate([width/3,height/3]) //translate to center the map in view

//Generate paths based on projection
var path = d3.geoPath() 
    .projection(projection);

//Create an SVG
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
     

//Group for the map features
var features = svg.append("g")
   .call(d3.zoom().on("zoom", function () { 
              svg.attr("transform", d3.event.transform)
         }))
    .attr("class","features");

//Create zoom/pan listener
//Change [1,Infinity] to adjust the min/max zoom scale
// svg= d3.select("svg")
//         .call(d3.zoom().on("zoom", function () {
//               svg.attr("transform", d3.event.transform)
//          }))
//         .append("g");

var tooltip = d3.select("body").append("div").attr("class","tooltip");
var barHeight=14;
var barX=1000; 
var outerRadius = 80;
var innerRadius = 0;
var arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);
      
var cityPopUp= d3.select("body").append("g.cityPopUp")
            .attr("class","cityPopUp");
  
var freq = d3.json("Frequency.json")
d3.json("countries.json").then(function(geodata) {
  // if (error) return console.log(error); //unknown error, check the console
  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(geodata.features)
    .enter()
    .append("path")
    .attr("d",path)
    .style("fill", function(d){

    if(d.properties.name == "California")
      return '#ff0000'
    else if(d.properties.name == "Florida" || 
            d.properties.name == "Illinois" ||
            d.properties.name == "Pennsylvania" ||
            d.properties.name == "Texas")
      return '#ff3232'
    
    else if(d.properties.name == "Georgia" || 
            d.properties.name == "Indiana" ||
            d.properties.name == "Louisiana" ||
            d.properties.name == "Michigan" ||
            d.properties.name == "Minnesota" ||
            d.properties.name == "North Carolina" ||
            d.properties.name == "New York" ||
            d.properties.name == "Ohio" ||
            d.properties.name == "Maryland"
            )
      return '#ff6666'


    else if(d.properties.name == "Iowa" || 
            d.properties.name == "Massachusetts" ||
            d.properties.name == "West Virginia" ||
            d.properties.name == "Nebraska" ||
            d.properties.name == "New Mexico" ||
            d.properties.name == "Oregon" ||
            d.properties.name == "Utah" 
            )
      return '#ff9999'


    else if(d.properties.name == "Alaska" || 
            d.properties.name == "Delaware" ||
            d.properties.name == "Hawaii" ||
            d.properties.name == "Idaho" ||
            d.properties.name == "Maine" ||
            d.properties.name == "Montana" ||
            d.properties.name == "Wyoming" || 
            d.properties.name == "New Hampshire" ||
            d.properties.name == "Rhode Island" ||
            d.properties.name == "South Dakota" ||
            d.properties.name == "Vermont" 
            )
      return "#ffcccc"

      else if (d.properties.name == "North Dakota")
          return '#ffe5e5'

    
    else return '#ffb2b2'
    ;})
    .style("opacity", 0.7)
    .style("stroke", "black")
     
    
	  // .style("stroke-width", "1");
    // .on("click",clicked);
.on('mouseover', function(d, i) {

    var currentState = this;
    d3.select(this).style('opacity', 0.3);
    
     })
.on('mouseout', function(d, i) {
    var nextState = this;
    d3.select(this).style('opacity', 0.7);})

});

// Data and color scale
var data = d3.map();
var colorScheme = ["#ffe5e5","#ffcccc","#ffb2b2","#ff9999","#ff6666","#ff3232","#ff0000"]
var colorScale = d3.scaleThreshold()
    .domain([1,260])
    .range(colorScheme)
    
d3.select(".legendContainer").append("svg")
// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -5)
    .text("# State Deaths")
    .style("font-weight","bold");
var labels = ['0-10', '10-50', '50-100', '100-300', '300-500', '500-1000', '> 1000'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(8)
    .scale(colorScale)
    ;
    
svg.select(".legendThreshold")
    .call(legend);
    


var barWidth = 50;
var barOffset = 5;



var frequency = d3.csv("frequency.csv")
frequency.then(function(data) {

svg.selectAll("circle")
	.data(data)
	.enter()
	.append("circle")
  .attr("class","frequency")
  // .attr("r",2)
  // .attr("cx",10)
  // .attr("cy",10)
	.attr("cx", function(d) {
		return projection([d.lng, d.lat])[0];
	})
	.attr("cy", function(d) {
		return projection([d.lng, d.lat])[1];
	})
  .style("r", function(d) {
    if (d.total < 10) {return 1}
    else if (d.total>= 10 && d.total<50) {return 2}
    else if (d.total>=50 && d.total<200) {return 5}
    else if (d.total>=200 && d.total<300) {return 10}
    else if (d.total>=300 && d.total<400) {return 35}
    else if (d.total>=400 && d.total<1000) {return 40}
    else 	{ return 40 }
  ;})

	.style("fill", "#008080")	
	.style("opacity", 0.5)	
  .on("mouseover", function(d) {
   tooltip.style("display","block").text(d.city);  
})
.on("mousemove",moveTooltip)
.on("mouseout", hideTooltip)
.on("click",clickCity);

}); 

// Data and color scale
var data = d3.map();
var colorScheme = ["","","","","","",""]
var colorScale = d3.scaleThreshold()
    .domain([1, 6, 11, 26, 101, 1001])
    .range(colorScheme);
var barWidth = 50;
var barOffset = 5;

d3.json("Frequency.json",function(data) {
  
 
  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d",path)


  stateBarChartFemales = svg.selectAll("g.stateBarChartFemales")
                    .data(geodata.features)
                    .enter().append("g")
                    .attr("class", "stateBarChartFemales")
                    .style("margin-right","3");

                 

    stateBarChartFemales.append("rect")
        .attr("class","stateBar")
        .attr("x", function(d,i){
              return width-570+ 11*i ;
            })
          .attr("y", height-460)
          .attr("width", 10)
          .attr("height",function(d,i){
              return d.Total;
            })
          .style("fill",genderColors[0])
          .attr("opacity","0.5");
          
          


stateNames=stateBarChartFemales.append("text")
              .text(function(d,i){
                            return d.NAME;
                          })
            .attr("transform", function(d,i){
              var xText = width-565+ 11*i ;
              var yText =  height-470;
              return "translate(" + xText + "," + yText + ") rotate(-90)";
            })
            .attr("font-size", 10)
            .attr("font-weight","bold");
           

});

var tooltipOffset = {x: 5, y: -25};
function moveTooltip() {
  tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
      .style("left",(d3.event.pageX+tooltipOffset.x)+"px");

}

function hideTooltip() {
  tooltip.style("display","none");}

// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d,i) {

}

var cityContainer = svg.append('rect')
                            .attr("x", width-1600)
                            .attr("y", height-300)
                            .attr("rx", 10)
                            .attr("ry",10)
                            .attr("width", 450)
                            .attr("height",280)
                            .attr("fill", "rgb(128, 128, 128)")
                            .attr("id", "cityContainer")
                            .attr("opacity", 0.2)
                          
                            .attr("display", "none")
                            // .on("click",closePopUp);




var legendContainer = svg.append('rect')
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("rx", 10)
                            .attr("ry",10)
                            .attr("width", 130)
                            .attr("height",200)
                            .attr("fill", "rgb(220,220,220)")
                            .attr("id", "legendContainer")
                            .attr("opacity", 0.2)
                          
                            
                            // .on("click",closePopUp);



                            
 var barChartTitle=svg.append("text")
                  .attr("id", "text")
                  .attr("x", width-1590)
                  .attr("y", height-270)
                  .attr("font-size", 18)
                  .style("font-weight","bold")
                  .attr("display", "none")
var totalCityDeaths=svg.append("text")
                  .attr("id", "cityDeaths")
                  .attr("x", width-1590)
                  .attr("y", height-240)
                  .attr("font-size", 16)
                  .style("font-weight","bold")
                  .attr("display","none");

var totalCityDeathsFemale=svg.append("text")
                  .attr("id", "cityFemalDeaths")
                  .attr("x", width-1590)
                  .attr("y", height-220)
                  .attr("font-size", 16)
                  // .style("font-weight","bold")
                  .attr("display","none");

var totalCityDeathsMale=svg.append("text")
                  .attr("id", "cityMaleDeaths")
                  .attr("x", width-1590)
                  .attr("y", height-200)
                  .attr("font-size", 16)
                  .attr("display","none");

 var genderTitle=svg.append("text")
                  .attr("id", "gendertext")
                  .attr("x", 660)
                  .attr("y", 750)
                  .attr("font-size", 14)
                  // .style("font-weight","bold")
                  .attr("display", "none");


var genderColors=["deepskyblue","hotpink"];

// function closePopUp(){
// cityContainer.attr("display", "none");
// barChartTitle.attr("display","none");
// totalCityDeaths.attr("display","none");
// totalCityDeathsFemale.attr("display","none");
// totalCityDeathsMale.attr("display","none");
// svg.select("#lala").attr("display","none");
// genderTitle.attr("display", "none");
// svg.select("#arcs").remove();

// }
function clickCity(d,i){
  cityContainer.attr("display", "block");
barChartTitle.attr("display","block")
                  .text(d.city+" Death Rate");
totalCityDeaths.attr("display","block")
                  .text("Total number of deaths: "+ d.total);

totalCityDeathsFemale.attr("display","block")
                  .text("# Female deaths: "+ d.females);

totalCityDeathsMale.attr("display","block")
                  .text("# Male deaths: "+ d.males);

genderTitle.attr("display","block").text("# of Males/Females")


dataNew = [d.males,d.females];

var pie = d3.pie();

var arcs = svg.selectAll("arc")
              .data(pie(dataNew))
              .enter()
              .append("g")
              .attr("id", "arcs")
              .attr("opacity",1.0)
              .attr("transform", "translate(720,650)")
              // .on("click", closePopUp)
              
             
  arcs.append("path")
      .attr("fill", function(d, i) {
        return genderColors[i];
      })
      .attr("d", arc)
      .attr("opacity",0.9);

  arcs.append("text")
      .attr("transform", function(d) {
        return "translate(" + arc.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .text(function(d) {
        return d.value;
      });
}



