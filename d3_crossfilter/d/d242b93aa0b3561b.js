// https://observablehq.com/@eversonm/d3-com-crossfilter-e-dc-js@426
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter e DC.js`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/d8df8d875edda71aa2e2365fae2ce225/raw/1e949d3da02ed6caa21fe3a7a12a4e5a611a4bab/stocks.csv").then(function(data){
  // formatando nossos dados
  let parseDate = d3.timeParse("%Y/%m/%d")
  data.forEach(function(d,i){
       d.date = parseDate(d.date)
       d.google = +d.google //numerico
       d.facebook = +d.facebook //numerico
    
       d.varfacebook = parseFloat((d.facebook - data[0].facebook)/data[0].facebook)
       d.vargoogle = parseFloat((d.google - data[0].google)/data[0].google)
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension( d => d.date)
)});
  main.variable(observer("googleDim")).define("googleDim", ["facts"], function(facts){return(
facts.dimension( d => d.google)
)});
  main.variable(observer("topTenGoogle")).define("topTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.top(10)
)});
  main.variable(observer("bottomTenGoogle")).define("bottomTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.bottom(10)
)});
  main.variable(observer("googleByDayGroup")).define("googleByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.google)
)});
  main.variable(observer("googleDim2")).define("googleDim2", ["facts"], function(facts){return(
facts.dimension(d => d.vargoogle)
)});
  main.variable(observer("topTen")).define("topTen", ["googleDim2"], function(googleDim2){return(
googleDim2.top(10)
)});
  main.variable(observer("googleGroup")).define("googleGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.vargoogle)
)});
  main.variable(observer("facebookGroup")).define("facebookGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.varfacebook)
)});
  main.variable(observer("fbByDayGroup")).define("fbByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.facebook)
)});
  main.variable(observer("container")).define("container", function(){return(
function container(id, title) { 
  return `
<div class='container'>
<div class='content'>
<div class='container'>
<div class='row'>
    <div class='span12' id='${id}'>
      <h4>${title}</h4>
    </div>
  </div>
</div>
</div>
</div>`
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","d3","dateDim","googleByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup)
{
  let view = md`${container('chart','Valores das ações do Google')}`
  let lineChart = dc.lineChart(view.querySelector("#chart"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  lineChart.width(800)
           .height(400)
           .dimension(dateDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .renderArea(false)
           .x(xScale)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(googleByDayGroup, 'Google')
  dc.renderAll() //necessario para todo grafico
  return view      
}
);
  main.variable(observer("buildcomposite")).define("buildcomposite", ["md","container","dc","d3","dateDim","googleByDayGroup","fbByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup,fbByDayGroup)
{
  let view = md`${container('chart2', 'Valores das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart2"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleByDayGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(fbByDayGroup, 'Facebook') //dimensao eh a mesma
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("acoes")).define("acoes", ["md","container","dc","d3","dateDim","googleGroup","facebookGroup"], function(md,container,dc,d3,dateDim,googleGroup,facebookGroup)
{
  let view = md`${container('chart3', 'Variação dos valores das ações do Google e do Facebook(%)')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart3"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(facebookGroup, 'Facebook') //dimensao eh a mesma
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("dataset2")).define("dataset2", ["d3"], function(d3){return(
d3.json('https://raw.githubusercontent.com/emanueles/datavis-course/master/assets/files/observable/movies.json').then(function(data) {
  // let xScale = d3.scaleLinear()
  //     .domain([0, d3.max(dataset, d => d.Year)])
  //     .range([0,width])
  data.forEach(function(d,i){
       d.Year = +d.Year //numerico
       d.Genre = d.Genre //literal
       d.WWGross = +d.Worldwide_Gross_M
  })
  return data;
})
)});
  main.variable(observer("facts2")).define("facts2", ["crossfilter","dataset2"], function(crossfilter,dataset2){return(
crossfilter(dataset2)
)});
  main.variable(observer("yearDim")).define("yearDim", ["facts2"], function(facts2){return(
facts2.dimension( d => d.Year)
)});
  main.variable(observer("genreDim")).define("genreDim", ["facts2"], function(facts2){return(
facts2.dimension( d => d.Genre)
)});
  main.variable(observer("moviesYear")).define("moviesYear", ["yearDim"], function(yearDim){return(
yearDim.group().reduceSum(d => d.Worldwide_Gross_M)
)});
  main.variable(observer("moviesGenre")).define("moviesGenre", ["genreDim"], function(genreDim){return(
genreDim.group().reduceSum(d => d.Worldwide_Gross_M)
)});
  main.variable(observer("barras1")).define("barras1", ["md","container","dc","d3","yearDim","moviesYear"], function(md,container,dc,d3,yearDim,moviesYear)
{
  let view = md`${container('chart5','Bilheteria por Ano')}`
  let barChart = dc.barChart(view.querySelector("#chart5"))
  let xScale = d3.scaleLinear()
                  .domain([yearDim.bottom(1)[0].Year -0.5, yearDim.top(1)[0].Year +0.5])
  barChart.xAxis().ticks(5)
  barChart.width(800)
           .height(400)
           .dimension(yearDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           // .renderArea(false)
           .x(xScale)
           // .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(moviesYear, 'Total Bilheteria por Ano')
           .xAxis().tickFormat(d3.format("d"))
  barChart.centerBar(true)
  barChart.gap(70)
  barChart.render() //necessario para todo grafico
  return view
}
);
  main.variable(observer("barras2")).define("barras2", ["md","container","dc","d3","genreDim","moviesGenre"], function(md,container,dc,d3,genreDim,moviesGenre)
{
  let view = md`${container('chart6','Bilheteria por Gêrero')}`
  let barChart = dc.barChart(view.querySelector("#chart6"))
  let xScale = d3.scaleOrdinal()
                  .domain(genreDim)
  barChart.width(800)
           .height(400)
           .dimension(genreDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           // .renderArea(false)
           .x(xScale)
           .xUnits(dc.units.ordinal)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(650).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(moviesGenre, 'Total Bilheteria por Ano')
  
  // barChart.centerBar(true)
  barChart.gap(40)
  barChart.render() //necessario para todo grafico
  return view
}
);
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
require("dc")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  return main;
}
