// https://observablehq.com/@eversonm/d3-com-crossfilter-e-dc-js-parte-2@177
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter e DC.js (Parte 2)`
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.0/css/bootstrap.min.css" integrity="sha384-PDle/QlgIONtM1aqA2Qemk5gPOE7wFq8+Em+G/hmo5Iq0CCmYZLv3fVRDJ4MMwEA" crossorigin="anonymous">`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/65a308ffa630689c11a031252998ef8d/raw/a004c770786229d54264406118ae21ba7e4c51a8/earthquakes.csv").then(function(data){
  // formatando nossos dados
  let parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S")
  
  data.forEach(function(d,i){
       
      d.dtg = parseDate(d.origintime.substr(0,19))
      d.magnitude = d3.format(".1f")(d.magnitude)
      d.depth = d3.format("d")(d.depth) 
    
   })
  return data
})
)});
  main.variable(observer("cross")).define("cross", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDimension")).define("dateDimension", ["cross"], function(cross){return(
cross.dimension(d => d.dtg)
)});
  main.variable(observer("magnitudeDimension")).define("magnitudeDimension", ["cross"], function(cross){return(
cross.dimension(d => d.magnitude)
)});
  main.variable(observer("magGroup")).define("magGroup", ["magnitudeDimension"], function(magnitudeDimension){return(
magnitudeDimension.group()
)});
  main.variable(observer("depthDimension")).define("depthDimension", ["cross"], function(cross){return(
cross.dimension(d => d.depth)
)});
  main.variable(observer("depthGroup")).define("depthGroup", ["depthDimension"], function(depthDimension){return(
depthDimension.group()
)});
  main.variable(observer("timeDimension")).define("timeDimension", ["cross","d3"], function(cross,d3){return(
cross.dimension(d => d3.timeHour(d.dtg))
)});
  main.variable(observer("timeGroup")).define("timeGroup", ["timeDimension"], function(timeDimension){return(
timeDimension.group()
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","dateDimension","d3","magnitudeDimension","magGroup","depthDimension","depthGroup","dataset","timeDimension","timeGroup"], function(md,container,dc,dateDimension,d3,magnitudeDimension,magGroup,depthDimension,depthGroup,dataset,timeDimension,timeGroup)
{
  // let view = md`${container('dc-table-graph','Dc Table Graph')}`
  let view = md`${container()}`
  let dcdataTable = dc.dataTable(view.querySelector("#dc-table-graph"))
  
  dcdataTable.width(960)
           .height(800)
           .dimension(dateDimension)
           // .margins({top: 30, right: 50, bottom: 25, left: 40})
           .group(d => "List of all earthquakes corresponding to the filters")
           .size(10)
           .columns(['dtg','magnitude','depth','latitude','longitude'])
           .sortBy(d => d.dtg)
           .order(d3.ascending)
  dcdataTable.render()
  
  
  let barChart = dc.barChart(view.querySelector("#magnitude-chart"))
  let xScale = d3.scaleLinear()
                  .domain([0,8])
  // barChart.xAxis().ticks(5)
  barChart.width(480)
           .height(150)
           .dimension(magnitudeDimension)
           // .margins({top: 30, right: 50, bottom: 25, left: 40})
           // .renderArea(false)
           .x(xScale)
           .elasticY(true)
           // .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           // .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
           // .brushOn(false)
           .group(magGroup, 'Nº de eventos magnitude')
           // .xAxis().tickFormat(d3.format("d"))
  // barChart.centerBar(true)
  barChart.gap(56)
  barChart.render() //necessario para todo grafico

  let barChart2= dc.barChart(view.querySelector("#depth-chart"))
  let xScale2= d3.scaleLinear()
                  .domain([0,100])
  // barChart.xAxis().ticks(5)
  barChart2.width(480)
           .height(150)
           .dimension(depthDimension)
           // .margins({top: 30, right: 50, bottom: 25, left: 40})
           // .renderArea(false)
           .x(xScale2)
           .elasticY(true)
           // .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           // .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
           // .brushOn(false)
           .group(depthGroup)
           // .xAxis().tickFormat(d3.format("d"))
  // barChart.centerBar(true)
  barChart2.gap(1)
  barChart2.render() //necessario para todo grafico
  
  let lineChart = dc.lineChart(view.querySelector("#time-chart"))
  let xScale3= d3.scaleTime()
                  .domain(d3.extent(dataset, d => d.dtg))
  // barChart.xAxis().ticks(5)
  lineChart.width(960)
           .height(150)
           .dimension(timeDimension)
           // .margins({top: 30, right: 50, bottom: 25, left: 40})
           // .renderArea(false)
           .x(xScale3)
           .elasticY(true)
           // .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           // .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
           // .brushOn(false)
           .group(timeGroup)
           // .xAxis().tickFormat(d3.format("d"))
  // barChart.centerBar(true)
  // barChart.gap(1)
  lineChart.render() //necessario para todo grafico
  return view
}
);
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role="main" class="container">
    <div class="row">
      <h4> Earthquakes in New Zealand</h4>
    </div>
    <div class='row'>
        <div id='magnitude-chart' class="col-6">
          <h5> Number of Events by Magnitude </h5>
        </div>
            
        <div id='depth-chart' class="col-6">
          <h5> Events by Depth (km) </h5>
        </div>
    </div>
    <div class='row'>
      <div id='time-chart' class="single-col">
        <h5> Events per hour </h5>
      </div>
    </div>
    <table class="table table-hover" id="dc-table-graph">
        <thead>
            <tr class="header">
                <th>DTG</th>
                <th>Magnitude</th>
                <th>Depth</th>
                <th>Latitude</th>
                <th>Longitude</th>
            </tr>
        </thead>
    </table>
   <p>Earthquake data via <a href="https://quakesearch.geonet.org.nz/">Geonet</a>.</p>
  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  return main;
}
