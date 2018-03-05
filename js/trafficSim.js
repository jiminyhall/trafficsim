function Graph() {
  this.vertices = [];
  this.edges = [];
  this.numberOfEdges = [];
  this.idCnt=0;
  this.selected = -1;
}

/* each vertex object will have the following properties
    - id: unique ID number
    - x: x location
    - y: y location
    - type: "lone" (no edges) | "end" (one edge) | "join" (more than one edge)
*/
Graph.prototype.addVertex = function(id, x, y) {
  this.vertices.push( {id:id, x:x, y:y, selected:false, type:"lone"} );
  this.edges[id] = [];
}

/* Traverse from one point to another, returning all available paths */
Graph.prototype.pathsFromTo = function(vertexA, vertexB, next, history) {
  // if the next vertex matches the target then return that list
  if(next===vertexB)
    return history.push(next);
  // if the next is empty then there is no further to go, return the half finished path
  else if(next===[])
    return history;
  else {
      var queue = this.edges[next];
      history.push(next);
      while(queue.length) {
        var qi = queue.shift();
        this.pathsFromTo(vertexA, vertexB, qi, history);
      }
  }
}


Graph.prototype.print = function() {
  console.log(this.vertices.map(function(v) {
    return (v.id + ' -> ' + this.edges[v.id].join(', ')).trim();
  }, this).join(' | '));
}

Graph.prototype.addEdge = function(v_id1, v_id2) {
  if(this.edges[v_id1].findIndex(function(el) { return el==v_id2; }) == -1)
  {
    this.edges[v_id1].push(v_id2);
    this.edges[v_id2].push(v_id1);
    this.numberOfEdges++;
  }

  // check type classification of vertex
  var idx1 = this.vertices.findIndex(function(el) { return el.id==v_id1; });
  if(this.edges[v_id1].length==1) {
    this.vertices[idx1].type="end";
  } else if(this.edges[v_id1].length>1){
    this.vertices[idx1].type="join";
  }
  var idx2 = this.vertices.findIndex(function(el) { return el.id==v_id2; });
  if(this.edges[v_id2].length==1) {
    this.vertices[idx2].type="end";
  } else if (this.edges[v_id2].length>1) {
    this.vertices[idx2].type="join";
  }
}


// returns the ID of the vertex if it's hit, otherwise return -1
Graph.prototype.checkPoint = function(tx,ty,tr) {
  for(var i=0; i<this.vertices.length; i++) {
    var r = Math.sqrt((tx-this.vertices[i].x)*(tx-this.vertices[i].x) + (ty-this.vertices[i].y)*(ty-this.vertices[i].y));
    // console.log(this.vertices[i].id + " " + r);
    if(r<=tr) {
      console.log("Clicked vertext: " + this.vertices[i].id);
      return this.vertices[i].id;
    }

  }
  return -1;
}

var network;
var radius = 20;

function start() {
  console.log("Starting...");
  network = new Graph();
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.canvas.width = window.innerWidth-25;
  ctx.canvas.height = window.innerHeight-25;
  ctx.canvas.onmousedown = onmousedown;

}

function draw() {
  // clear the canvas
  var ctx = document.getElementById('canvas').getContext('2d');
  var w = document.getElementById('canvas').width;
  var h = document.getElementById('canvas').height;
  // console.log("W/h:" + w + "/" + h);
  ctx.clearRect(0,0,w,h);

  console.log("Drawing...");

  // Iterate through the edges, drawing the edges between lines
  for(var i in network.edges) {
    var idx1 = network.vertices.findIndex(function(el) { return el.id==i; });
    var x1 = network.vertices[idx1].x;
    var y1 = network.vertices[idx1].y;

    // console.log("Edge (" + x1 + "," + y1 + ") to (" + network.edges[i].length + ")");

    for(var j=0; j<network.edges[i].length; j++) {
      var idx2 = network.vertices.findIndex(function(el) { return el.id==network.edges[i][j]; });
      var x2 = network.vertices[idx2].x;
      var y2 = network.vertices[idx2].y;

      //console.log("Edge (" + x1 + "," + y1 + ") to (" + x2 + "," + y2 + ")");

      ctx.beginPath();
      ctx.strokeStyle = '#003300';
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
    }
  }

  // Iterate through the network, returning the points and drawing appropriate shapes
  for(var i=0; i<network.vertices.length; i++) {
      ctx.beginPath();
      ctx.arc(network.vertices[i].x, network.vertices[i].y, radius, 0, 2 * Math.PI, false);
      if(network.vertices[i].type=="lone") {
        ctx.fillStyle = 'white';
      } else if(network.vertices[i].type=="end") {
        ctx.fillStyle = 'yellow';
      } else if(network.vertices[i].type=="join") {
        ctx.fillStyle = 'green';
      }
      ctx.fill();
      ctx.lineWidth = 5;
      if(network.vertices[i].selected===true) ctx.strokeStyle = 'red';
      else ctx.strokeStyle = '#003300';
      ctx.stroke();

      // label vertex
      ctx.font = "10px Comic Sans MS";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText("V"+network.vertices[i].id, network.vertices[i].x, network.vertices[i].y+5);
  }

}

function onmousedown(e) {

  var ctx = document.getElementById('canvas').getContext('2d');
  var loc = windowToCanvas(ctx.canvas, e.clientX, e.clientY);
  console.log("Mouse clicked: " + loc.x.toFixed(2) + "," + loc.y.toFixed(2));

  var checkPoint = network.checkPoint(loc.x, loc.y, radius);

  /* BEHAVIOUR
      - if area clicked is blank then add vertex
      - if area clicked is an existing vertex then select
      - if area clicked is an existing edge then select it
      - if area clicked is an existing vertex and selected then deselect
      - if area clicked is an existing edge and selected then deselect
      - if an existing vertex is selected and area clicked is another vertext then add edge
 */

 // Checkpoint returns -1 if it does not match a vertex, if it does then it returns the V id
  if(checkPoint===-1) {
    network.addVertex(++network.idCnt, loc.x, loc.y);

    if(network.selected>0) {
      var j = network.vertices.findIndex(function(el) { return el.id === network.selected; } );
      network.vertices[j].selected = false;
      network.selected=-1;
    }

  } else {

    // if the selected vertext is clicked again, deselect
    if(network.selected === checkPoint) {
      network.selected = -1;
      var j = network.vertices.findIndex(function(el) { return el.id === checkPoint; } );
      network.vertices[j].selected = false;
    }
    // if no existing vertex selected, then select
    else if(network.selected === -1) {
      network.selected = checkPoint;
      var j = network.vertices.findIndex(function(el) { return el.id === checkPoint; } );
      network.vertices[j].selected = true;
    }
    // if another vertex selected then add an edge between the two vertices
    else if(network.selected > 0) {
      var j0 = network.vertices.findIndex(function(el) { return el.id === checkPoint; } );
      var j1 = network.vertices.findIndex(function(el) { return el.id === network.selected; } );
      console.log("Add edge between " + network.vertices[j0].id + " -> " + network.vertices[j1].id);
      network.addEdge(network.vertices[j0].id,network.vertices[j1].id);
    }
  }


  draw();
  network.print();


  // add vertices

}


function windowToCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();

  return {
    x: x - bbox.left * (canvas.width  / bbox.width),
    y: y - bbox.top  * (canvas.height / bbox.height)
  };
}
