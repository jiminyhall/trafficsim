// Global variables

var network;
var radius = 20;

function Graph() {
  this.vertices = []; // each point aka node, each vertex can join any number of other vertices
  this.edges = []; // an array of arrays, each array of the vertex id containing adjacent vertices
  this.paths = []; // this is the paths from each end node to end node
  this.numberOfEdges = [];
  this.idCnt=0;
  this.selected = -1; // if a vertex is currently selected then its id is stored here
}

/* each vertex object will have the following properties
    - id: unique ID number
    - x: x location
    - y: y location
    - type: "lone" (no edges) | "end" (one edge) | "join" (more than one edge)
*/
Graph.prototype.addVertex = function(id, x, y) {
  this.vertices.push( {id:id, x:x, y:y, selected:false, type:"lone",
                       del_x:x+radius/1.2,
                       del_y:y+radius/1.2,
                       del_r:radius/2,
                       mv_x:x-radius/1.2,
                       mv_y:y+radius/1.2,
                       mv_r:radius/2} );
  this.edges[id] = [];
}

Graph.prototype.moveVertex = function(id, nx, ny) {

  var idx = this.vertices.findIndex(function(el) { return el.id==id; });

  this.vertices[idx].x -= nx;
  this.vertices[idx].del_x -= nx;
  this.vertices[idx].mv_x -= nx;
  this.vertices[idx].y -= ny;
  this.vertices[idx].del_y -= ny;
  this.vertices[idx].mv_y -= ny;
}

Graph.prototype.deleteVertex = function(id) {
  // get this index from the id
  var idx = this.vertices.findIndex(function(el) { return el.id==id; });

  // first remove edges containing this vertex using the edge list
  var self = this;
  this.edges[id].forEach(function(e) {
    var e_idx = self.edges[e].findIndex(function(el) { return el==id; });
    self.edges[e].splice(e_idx,1);
    self.numberOfEdges--;

    // check node type
    if(self.edges[e].length === 0) {
      var rm_idx = self.vertices.findIndex(function(el) { return el.id==e; });
      self.vertices[rm_idx].type="lone";
    }
    if(self.edges[e].length === 1) {
      var rm_idx = self.vertices.findIndex(function(el) { return el.id==e; });
      self.vertices[rm_idx].type="end";
    }

  });

  // remove the vertex using splice
  this.vertices.splice(idx, 1);

  // remove vertex from edge list
  this.edges[id] = [];

  this.print();

}

Graph.prototype.getByID = function(id) {
  return this.vertices[this.vertices.findIndex(function(el) { return el.id==id; })];
}

Graph.prototype.endToEndPaths = function(vA) {

  var self=this;
  self.paths=[];

  // get list of all end nodes
  var endNodes = self.vertices.filter(function(el) {return el.type==="end"} );

  endNodes.forEach(function(el) {

    var history = [];
    history.push(el.id);
    var queue = self.edges[el.id];

    queue.forEach(function(q) {
        self._pathsToEnd(q, history.slice(0));
    });
  });

  return self.paths;
}

Graph.prototype._pathsToEnd = function(vA, history) {

  var self=this;
  history.push(vA);
  var queue = this.edges[vA].filter(function(el) { return !history.includes(el); });

  if(queue.length<1) {
      var v = this.getByID(vA);
      if(this.getByID(vA).type === "end") {
        self.paths.push(history);
      }
  }

  queue.forEach(function(el) {
      self._pathsToEnd(el, history.slice(0));
  })


}



Graph.prototype.print = function() {
  console.log(this.vertices.map(function(v) {
    return ("v" + v.id + ' -> ' + this.edges[v.id].join(', ')).trim();
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
    if(r<=tr) {
      console.log("Clicked vertext: " + this.vertices[i].id);
      return this.vertices[i].id;
    }

  }
  return -1;
}



function start() {

  network = new Graph();
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.canvas.width = window.innerWidth-25;
  ctx.canvas.height = window.innerHeight-25;
  ctx.canvas.onmousedown = onmousedown;
  ctx.canvas.onmousemove = onmousemove;
  ctx.canvas.onmouseup = onmouseup;

  // add Test vertexes and edges
  network.addVertex(++network.idCnt, 200, 100); // 1
  network.addVertex(++network.idCnt, 100, 200); // 2
  network.addVertex(++network.idCnt, 200, 200); // 3
  network.addVertex(++network.idCnt, 300, 200); // 4
  network.addVertex(++network.idCnt, 100, 300); // 5
  network.addVertex(++network.idCnt, 200, 300); // 6
  network.addVertex(++network.idCnt, 300, 300); // 7
  network.addVertex(++network.idCnt, 200, 400); // 8

  network.addEdge(1,3);
  network.addEdge(2,3);
  network.addEdge(3,4);
  network.addEdge(4,6);
  network.addEdge(2,6);
  network.addEdge(2,5);
  network.addEdge(3,5);
  network.addEdge(3,7);
  network.addEdge(4,7);
  network.addEdge(5,6);
  network.addEdge(6,7);
  network.addEdge(6,8);



  network.endToEndPaths();
  draw();

}

function draw() {
  // clear the canvas
  var ctx = document.getElementById('canvas').getContext('2d');
  var w = document.getElementById('canvas').width;
  var h = document.getElementById('canvas').height;
  ctx.clearRect(0,0,w,h);

  // For each edge index list, iterate through the vertexes in the list, drawing the edges between vertexes
  network.edges.forEach(function(edge_list, vtx1_id) {

    if(edge_list.length>0) {

      // Get the origin (vtx1) details
      var vtx1_idx = network.vertices.findIndex(function(v) { return v.id==vtx1_id; });
      var x1 = network.vertices[vtx1_idx].x;
      var y1 = network.vertices[vtx1_idx].y;

      // draw an edge between the origin (vtx1) and the vertex in the list (vtx2), for each edge in the list
      edge_list.forEach(function(vtx2_id) {
        var vtx2_idx = network.vertices.findIndex(function(v) { return v.id==vtx2_id; });
        var x2 = network.vertices[vtx2_idx].x;
        var y2 = network.vertices[vtx2_idx].y;

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#003300';
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
      });
    }
  });



  // Iterate through the paths, drawing the paths over the numberOfEdges
  var pathWeight = 1 / network.paths.length;
  for(var i in network.paths) {
    ctx.beginPath();
    ctx.lineJoin="round";
    ctx.lineWidth=20;
    ctx.moveTo( (network.getByID(network.paths[i][0])).x,
                (network.getByID(network.paths[i][0])).y);
    for(var j=1; j<network.paths[i].length; j++) {

      ctx.lineTo( (network.getByID(network.paths[i][j])).x,
                  (network.getByID(network.paths[i][j])).y);

    }

    ctx.strokeStyle = 'rgba(255, 0, 0, ' + pathWeight +')';
    ctx.stroke();
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
      ctx.strokeStyle = 'black';
      ctx.stroke();
      // check if is selected, make outline red and add a delete circle on the bottom right hand side
      if(network.vertices[i].selected===true) {

        // make outline red
        ctx.strokeStyle = 'red';
        ctx.stroke();

        // draw right select circle (DELETE)
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(network.vertices[i].del_x, network.vertices[i].del_y, network.vertices[i].del_r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
        // draw left circle (MOVE)
        ctx.beginPath();
        ctx.arc(network.vertices[i].mv_x, network.vertices[i].mv_y, network.vertices[i].mv_r, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();


        ctx.font = "14px FontAwesome";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline="middle";
        ctx.fillText("\uf00d", network.vertices[i].x+(radius/1.2), network.vertices[i].y+(radius/1.2));
        ctx.fillText("\uf047", network.vertices[i].x-(radius/1.2), network.vertices[i].y+(radius/1.2));


      }
      else {
        ctx.strokeStyle = '#003300';
        ctx.stroke();
      }

      // label vertex
      ctx.font = "10px Comic Sans MS";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.textBaseline="middle";
      ctx.fillText("V"+network.vertices[i].id, network.vertices[i].x, network.vertices[i].y);
  }

}

function onmousemove(e) {
  // Check for onmousedown when clicked on the move button, then measure the move
  if(moveVtx>0) {
    var ctx = document.getElementById('canvas').getContext('2d');
    var loc = windowToCanvas(ctx.canvas, e.clientX, e.clientY);
    //console.log("Mouse moved on V" + moveVtx + ": " + loc.x.toFixed(2) + "," + loc.y.toFixed(2));

    // get the difference in position on the drag
    var diffX = oMoveX - loc.x;
    var diffY = oMoveY - loc.y;

    // update position of vtx and redraw
    network.moveVertex(moveVtx, diffX, diffY);
    oMoveX = loc.x;
    oMoveY = loc.y;
    draw();
  }
}


var moveVtx = -1;
var oMoveX;
var oMoveY;

function onmouseup(e) {
  moveVtx = -1;
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

 // if a node is selected, check if the move or delete icons are hit
 if(network.selected>0) {

   var j = network.vertices.findIndex(function(el) { return el.id === network.selected; } );
   // console.log("Move point: " + network.vertices[j].mv_x + "," + network.vertices[j].mv_y);

   var r = Math.sqrt((loc.x-network.vertices[j].mv_x)*(loc.x-network.vertices[j].mv_x) + (loc.y-network.vertices[j].mv_y)*(loc.y-network.vertices[j].mv_y));
   if(r<=network.vertices[j].mv_r) {
     console.log("Clicked MOVE button");
     moveVtx = network.selected;
     oMoveX = loc.x;
     oMoveY = loc.y;
     return;
   }

   r = Math.sqrt((loc.x-network.vertices[j].del_x)*(loc.x-network.vertices[j].del_x) + (loc.y-network.vertices[j].del_y)*(loc.y-network.vertices[j].del_y));
   if(r<=network.vertices[j].del_r) {
     console.log("Clicked DELETE button");
     network.deleteVertex(network.selected);
     network.selected=-1;
     network.endToEndPaths();
     draw();
     return;
   }


 }


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

  network.endToEndPaths();
  console.log(network.paths);
  draw();
  network.print();

}


function windowToCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();

  return {
    x: x - bbox.left * (canvas.width  / bbox.width),
    y: y - bbox.top  * (canvas.height / bbox.height)
  };
}
