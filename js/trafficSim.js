
function start() {
  console.log("Starting...");
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.canvas.onmousedown = onmousedown
}

function onmousedown(e) {

  var ctx = document.getElementById('canvas').getContext('2d');
  var loc = windowToCanvas(ctx.canvas, e.clientX, e.clientY);
  console.log("Mouse clicked: " + loc.x.toFixed(2) + "," + loc.y.toFixed(2));

}


function windowToCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();

  return {
    x: x - bbox.left * (canvas.width  / bbox.width),
    y: y - bbox.top  * (canvas.height / bbox.height)
  };
}
