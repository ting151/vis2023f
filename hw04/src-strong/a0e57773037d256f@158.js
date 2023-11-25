function _1(md){return(
md`# HW04 Strong`
)}

function _artist(FileAttachment){return(
FileAttachment("artist-1.csv").csv()
)}

function _artist1(__query,FileAttachment,invalidation){return(
__query(FileAttachment("artist-1.csv"),{from:{table:"artist-1"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

function _Question1(artist){return(
Object.keys(artist[0])[2]
)}

function _Question2(artist){return(
Object.keys(artist[0])[15]
)}

function _data(artist,Question1,Question2,buildHierarchy)
{
  var innerCircleAnswer = artist.map(row => row[Question1]);
  var outerCircleAnswer = artist.map(row => row[Question2]);

  var combinedAnswers = innerCircleAnswer.map((innerAns, index) => innerAns + '-' + outerCircleAnswer[index]);

  var reformattedAnswers = combinedAnswers.map(item => {
    const [prefix, values] = item.split('-');
    const splitValues = values.split(';').map(value => value.trim());
    return splitValues.map(value => `${prefix}-${value}`);
  }).reduce((acc, curr) => acc.concat(curr), []);

  var answerCounts = {};
  reformattedAnswers.forEach(reformattedAns => {
    answerCounts[reformattedAns] = (answerCounts[reformattedAns] || 0) + 1;
  });

  var csvData = Object.entries(answerCounts).map(([answer, count]) => [answer, String(count)]);

  return buildHierarchy(csvData);
}


function _tw(FileAttachment){return(
FileAttachment("counties@2.json").json()
)}

function _chart(d3,topojson,tw,Question1,Question2,data,down)
{
  const width = 1200;
  const height = 610;
  
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height)
    .attr("style", "max-width: 100%; height: auto;user-select: none");

  const path = d3.geoPath(
    d3.geoProjection(function(x, y) {
      return [x, y];
    })
    .center([122.2, 23.9])
    .scale(9500)
  );
    
  const g = svg.append("g");

  const countys = g.append("g")
    .attr("fill", "#B99470")
    .attr("cursor", "pointer")
    .selectAll("path")
    .data(topojson.feature(tw, tw.objects.map).features)
    .join("path")
    .on("click", clickedCT)
    .attr("d", path);
  
  countys.append("title")
    .text(d => d.properties.name);

  
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", "#FDF7E4")
    .attr("stroke-linejoin", "round")
    .attr("d", path(topojson.mesh(tw, tw.objects.map, (a, b) => a !== b)));


  const label = svg
    .append("text");

  label
    .append("tspan")
    .attr("x", 500)
    .attr("y", 50)
    .attr("dx", 0)
    .attr("dy", "0em")
    .text(Question1)

  label
    .append("tspan")
    .attr("class", "ansFirst")
    .attr("x", 750)
    .attr("y", 50)
    .attr("dx", 0)
    .attr("dy", "2em")
    .text("")

  label
    .append("tspan")
    .attr("x", 500)
    .attr("y", 50)
    .attr("dx", 0)
    .attr("dy", "4em")
    .text(Question2)

  function selectArea(county) {
    if (['花蓮縣', '臺東縣'].some((ct) => ct === county)) {
      return "東部";
    } else if (['苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣'].some((ct) => ct === county)){
      return "中部";
    } else if (['嘉義市', '嘉義縣', '臺南市', '高雄市', '屏東縣', '澎湖縣'].some((ct) => ct === county)) {
      return "南部";
    } else if (['金門縣', '連江縣'].some((ct) => ct === county)){
      return "外島";
    } else {
      return "北部";
    }
  }

  function findSecAns(ct) {
    return data.children.reduce((curr, d) => {
      if (d.name == ct) return curr.concat(d.children);
      return curr;
    }, []);
  }

  let countyArea = "";
  function clickedCT(event, d) {
    event.stopPropagation();
    countys.transition().style("fill", null);
    d3.select(this).transition().style("fill", "#BBAB8C");
    const ct = selectArea(d.properties.name);
    label.select(".ansFirst")
      .text(d.properties.name + " 屬於 " + ct )
    if (countyArea !== ct) {
      down(svg, findSecAns(ct));
      countyArea = ct;
    }
  }

  svg.append("rect")
    .attr("id", "background")
    .attr("x", 500)
    .attr("y", 150)
    .attr("dx", 0)
    .attr("dy", 0)
    .attr("fill", "none")
    .attr("width", 650)
    .attr("height", 450)

  function clickedForeign(event, d) {
    label.select(".ansFirst").text("國外");
    countys.transition().style("fill", null);
    if (countyArea !== "國外") {
      down(svg, findSecAns("國外"));
      countyArea = "國外";
    }
  }
  
  svg.append("circle")
    .attr("class", "foreignCircle")
    .attr("cx", 1150)
    .attr("cy", 50)
    .attr("r", 40)
    .attr("cursor", "pointer")
    .style("fill", "#B99470")
    .on("click", clickedForeign)
    .on("mouseover", (event, d) => {
      svg.select(".foreignCircle").transition().style("fill", "#BBAB8C");
      svg.select(".foreignText").transition().style("fill", "#000");
    })
    .on("mouseleave", (event, d) => {
      svg.select(".foreignCircle").transition().style("fill", "#B99470");
      svg.select(".foreignText").transition().style("fill", "#fff");
    });

  svg.append("text")
    .attr("class", "foreignText")
    .attr("x", 1150)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("cursor", "pointer")
    .style("fill", "#fff")
    .text("國外")
    .on("click", clickedForeign)
    .on("mouseover", (event, d) => {
      svg.select(".foreignCircle").transition().style("fill", "#BBAB8C");
      svg.select(".foreignText").transition().style("fill", "#000");
    })
    .on("mouseleave", (event, d) => {
      svg.select(".foreignCircle").transition().style("fill", "#B99470");
      svg.select(".foreignText").transition().style("fill", "#fff");
    });
  
  return svg.node();
}


function _buildHierarchy(){return(
function buildHierarchy(csv) {
  // Helper function that transforms the given CSV into a hierarchical format.
  const root = { name: "root", children: [] };
  for (let i = 0; i < csv.length; i++) {
    const sequence = csv[i][0];
    const size = +csv[i][1];
    if (isNaN(size)) {
      // e.g. if this is a header row
      continue;
    }
    const parts = sequence.split("-");
    let currentNode = root;
    for (let j = 0; j < parts.length; j++) {
      const children = currentNode["children"];
      const nodeName = parts[j];
      let childNode = null;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        let foundChild = false;
        for (let k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = { name: nodeName, children: [] };
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = { name: nodeName, value: size };
        children.push(childNode);
      }
    }
  }
  return root;
}
)}

function _down(d3){return(
function down(svg, data) {
  
  const transition1 = svg.transition().duration(250);
  const transition2 = transition1.transition();

  data.sort((a, b) => b.value - a.value);
  
  svg.selectAll(".bar,.barText")
    .attr("fill-opacity", 1)
    .transition(transition1)
    .attr("fill-opacity", 0)
    .remove();

  let sum = data.reduce((curr, d) => d.value + curr, 0);
  
  let x = d3.scaleLinear()
    .domain([0, sum])
    .range([ 0, 550 ]);

  let y = d3.scaleBand()
    .domain(data.map((d) => d.name))
    .range([ 0, Math.min(31.875 * data.length, 510) ])
    .padding(0.1);
  
  svg.selectAll(".background")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 550)
    .attr("y", d => y(d.name) + 125)
    .attr("width", d => x(d.value))
    .attr("height", y.bandwidth() )
    .attr("fill", "#BBAB8C")
    .attr("fill-opacity", 0)
    .transition(transition2)
    .attr("fill-opacity", 1)

  svg.selectAll(".background")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "barText")
    .attr("x", 575 )
    .attr("y", d => y(d.name) + 125 + parseInt(y.bandwidth() / 2) + 5)
    .text(d => (d.value / sum * 100).toFixed(1) + "% - " + d.name)
    .attr("fill-opacity", 0)
    .transition(transition2)
    .attr("fill-opacity", 1)
  
}
)}

function _11(md){return(
md`## 結論
### 從上圖中，我們可以看出：
- ### 在國外的工作者都認為有以行動或計畫在推永續事務。
- ### 東部的工作者有 51.9%的人認為有以行動或計畫在推永續事務。
- ### 在南部的工作者有 50%的人認為有以行動或計畫在推永續事務。
- ### 在中部的工作者有47.6%的人認為有以行動或計畫在推永續事務。
- ### 在北部的工作者有38.9%的人認為有以行動或計畫在推永續事務。`
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["artist-1.csv", {url: new URL("./artist-1.csv", import.meta.url), mimeType: "text/csv", toString}],
    ["counties@2.json", {url: new URL("./counties@2.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("artist")).define("artist", ["FileAttachment"], _artist);
  main.variable(observer("artist1")).define("artist1", ["__query","FileAttachment","invalidation"], _artist1);
  main.variable(observer("Question1")).define("Question1", ["artist"], _Question1);
  main.variable(observer("Question2")).define("Question2", ["artist"], _Question2);
  main.variable(observer("data")).define("data", ["artist","Question1","Question2","buildHierarchy"], _data);
  main.variable(observer("tw")).define("tw", ["FileAttachment"], _tw);
  main.variable(observer("chart")).define("chart", ["d3","topojson","tw","Question1","Question2","data","down"], _chart);
  main.variable(observer("buildHierarchy")).define("buildHierarchy", _buildHierarchy);
  main.variable(observer("down")).define("down", ["d3"], _down);
  main.variable(observer()).define(["md"], _11);
  return main;
}
