function _1(md){return(
md`# HW2 Strong baseline (2pt)`
)}

function _data(FileAttachment){return(
FileAttachment("data.json").json()
)}

function _yCounts(){return(
[]
)}

function _Constellation(data){return(
data.map(item => item.Constellation)
)}

function _constellationMapping(){return(
[
  "牡羊座", "金牛座", "雙子座", "巨蟹座", "獅子座",
  "處女座", "天秤座", "天蠍座", "射手座", "摩羯座",
  "水瓶座", "雙魚座"
]
)}

function _6(yCounts,Constellation,constellationMapping,data)
{
  yCounts.length = 0; //將yCounts清空
  
  var minConstellation = Math.min(...Constellation);
  var maxConstellation = Math.max(...Constellation); 
  for (var y=minConstellation; y<=maxConstellation; y++) { 
    yCounts.push({Constellation:constellationMapping[y], gender:"male", count:0}); 
    yCounts.push({Constellation:constellationMapping[y], gender:"female", count:0}); 
  }
  data.forEach (x=> {
    var i = (x.Constellation-minConstellation)*2 + (x.Gender== "男" ? 0 : 1); 
    yCounts[i].count++;
  })
  return yCounts
}


function _plot2(Inputs){return(
Inputs.form({
	mt:  Inputs.range([0, 100], {label: "marginTop", step: 1}),
	mr:  Inputs.range([0, 100], {label: "marginRight", step: 1}),
	mb:  Inputs.range([0, 100], {label: "marginBottom", step: 1}),
	ml:  Inputs.range([0, 100], {label: "marginLeft", step: 1}),
})
)}

function _8(Plot,plot2,constellationMapping,yCounts){return(
Plot.plot({
  marginTop: plot2.mt,
  marginRight: plot2.mr,
  marginBottom: plot2.mb,
  marginLeft: plot2.ml,
  
  grid: true,
  x: {
    label: "Constellation",
    domain: constellationMapping ,
  },
  marks: [
    Plot.ruleY([0]),
    Plot.barY(yCounts, { x: "Constellation", y: "count", tip: true, fill: "gender" }),
  ]
})
)}

function _9(Plot,data,constellationMapping){return(
Plot.plot({
  width:800,
  y: {grid: true, label: "count"},
  x: {label: "Constellation"},
  marks: [
    Plot.rectY(data, Plot.binX({y: "count"  }, {x: "Constellation", interval:1, fill:"Gender", tip: true} ), ),
    Plot.axisX({
      tickFormat: d => {
        return constellationMapping[d]; 
      },
    }),
    Plot.ruleY([0]),
    
  ],
  
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["data.json", {url: new URL("../data.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("yCounts")).define("yCounts", _yCounts);
  main.variable(observer("Constellation")).define("Constellation", ["data"], _Constellation);
  main.variable(observer("constellationMapping")).define("constellationMapping", _constellationMapping);
  main.variable(observer()).define(["yCounts","Constellation","constellationMapping","data"], _6);
  main.variable(observer("viewof plot2")).define("viewof plot2", ["Inputs"], _plot2);
  main.variable(observer("plot2")).define("plot2", ["Generators", "viewof plot2"], (G, _) => G.input(_));
  main.variable(observer()).define(["Plot","plot2","constellationMapping","yCounts"], _8);
  main.variable(observer()).define(["Plot","data","constellationMapping"], _9);
  return main;
}
