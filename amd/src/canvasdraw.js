define(['jquery'], function($) {

  var elem;
  var canvas;
  var context_simple;
  var paint_simple = false;

  var clickX_simple = [];
  var clickY_simple = [];
  var clickDrag_simple = [];

  // clearCanvas = function () {
  // 	context.clearRect(0, 0, canvasWidth, canvasHeight);
  // },

  function addClickSimple(x, y, dragging) {
    clickX_simple.push(x);
    clickY_simple.push(y);
    clickDrag_simple.push(dragging);
  }

  function resetCanvas_simple(){
    clickX_simple = [];
    clickY_simple = [];
    clickDrag_simple = [];
    clearCanvas_simple();
  }

  function clearCanvas_simple() {
    context_simple.clearRect(0, 0, canvas.width, canvas.height);
  }

  function redrawSimple() {
    clearCanvas_simple();

    var radius = 2;
    context_simple.strokeStyle = "#df4b26";
    context_simple.lineJoin = "round";
    context_simple.lineWidth = radius;

    for (var i = 0; i < clickX_simple.length; i++) {
      context_simple.beginPath();
      if (clickDrag_simple[i] && i) {
        context_simple.moveTo(clickX_simple[i - 1], clickY_simple[i - 1]);
      } else {
        context_simple.moveTo(clickX_simple[i] - 1, clickY_simple[i]);
      }
      context_simple.lineTo(clickX_simple[i], clickY_simple[i]);
      context_simple.closePath();
      context_simple.stroke();
    }
  }

  function init(selector) {
    elem = selector;
    canvas = document.querySelector(selector);
    context_simple = canvas.getContext("2d");

    $(selector).mousedown(function(e) {
      // Mouse down location
      var viewportOffset = canvas.getBoundingClientRect();
      var top = viewportOffset.top;
      var left = viewportOffset.left;

      var mouseX = e.pageX - this.offsetLeft - left;
      var mouseY = e.pageY - this.offsetTop - top;

      paint_simple = true;
      addClickSimple(mouseX, mouseY, false);
      redrawSimple();
    });

    $(selector).mousemove(function(e) {
      var viewportOffset = canvas.getBoundingClientRect();
      var top = viewportOffset.top;
      var left = viewportOffset.left;
      if (paint_simple) {
        addClickSimple(e.pageX - this.offsetLeft - left, e.pageY - this.offsetTop - top, true);
        redrawSimple();
      }
    });

    $(selector).mouseup(function(e) {
      paint_simple = false;
      redrawSimple();
    });

    $(selector).mouseleave(function(e) {
      paint_simple = false;
    });

    $('#clearCanvasSimple').mousedown(function(e) {
      clickX_simple = new Array();
      clickY_simple = new Array();
      clickDrag_simple = new Array();
      clearCanvas_simple();
    });
    //
    // // Add touch event listeners to canvas element
    // canvas_simple.addEventListener("touchstart", function(e)
    // {
    // 	// Mouse down location
    // 	var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
    // 		mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
    //
    // 	paint_simple = true;
    // 	addClickSimple(mouseX, mouseY, false);
    // 	redrawSimple();
    // }, false);
    // canvas_simple.addEventListener("touchmove", function(e){
    //
    // 	var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
    // 		mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
    //
    // 	if(paint_simple){
    // 		addClickSimple(mouseX, mouseY, true);
    // 		redrawSimple();
    // 	}
    // 	e.preventDefault()
    // }, false);
    // canvas_simple.addEventListener("touchend", function(e){
    // 	paint_simple = false;
    //   	redrawSimple();
    // }, false);
    // canvas_simple.addEventListener("touchcancel", function(e){
    // 	paint_simple = false;
    // }, false);
  }

  return {
    init: init,
    clear: resetCanvas_simple,
  };
});
