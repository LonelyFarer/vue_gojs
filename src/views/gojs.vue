<template>
  <div id="sample">
    <div style="width: 100%; display: flex; justify-content: space-between">
      <div id="paletteZone" style="width: 160px; height: 400px; margin-right: 2px; background-color: lightblue; padding: 10px;">
        <!-- <div class="draggable" draggable="true">
         
        </div> -->
        <sandglass draggable="true"></sandglass>
        <div class="draggable" draggable="true">
          Coffee
        </div>
        <div class="draggable" draggable="true">
          Tea
        </div>
      </div>
      <div ref="myDiagramDiv" style="flex-grow: 1; height: 420px; border: solid 1px black"></div>
    </div>
    <input id="remove" type="checkbox" /><label for="remove">Remove HTML item after drag</label>
    
  </div>
</template>

<script>
import sandglass from '../components/sandglass'
export default {
     components: {
        sandglass
    },
    data () {
        return {
            
        }
    },
    mounted(){
      this.init()
    },
    methods:{
      init() {
      if (window.goSamples) goSamples();  // init for these samples -- you don't need to call this
      // *********************************************************
      // First, set up the infrastructure to do HTML drag-and-drop
      // *********************************************************
      var dragged = null; // A reference to the element currently being dragged
      // highlight stationary nodes during an external drag-and-drop into a Diagram
      function highlight(node) {  // may be null
        var oldskips = myDiagram.skipsUndoManager;
        myDiagram.skipsUndoManager = true;
        myDiagram.startTransaction("highlight");
        if (node !== null) {
          myDiagram.highlight(node);
        } else {
          myDiagram.clearHighlighteds();
        }
        myDiagram.commitTransaction("highlight");
        myDiagram.skipsUndoManager = oldskips;
      }
      // This event should only fire on the drag targets.
      // Instead of finding every drag target,
      // we can add the event to the document and disregard
      // all elements that are not of class "draggable"
      document.addEventListener("dragstart", function(event) {
        if (event.target.className !== "draggable") return;
        // Some data must be set to allow drag
        event.dataTransfer.setData("text", event.target.textContent);
        // store a reference to the dragged element and the offset of the mouse from the center of the element
        dragged = event.target;
        dragged.offsetX = event.offsetX - dragged.clientWidth / 2;
        dragged.offsetY = event.offsetY - dragged.clientHeight / 2;
        // Objects during drag will have a red border
        event.target.style.border = "2px solid red";
      }, false);
      // This event resets styles after a drag has completed (successfully or not)
      document.addEventListener("dragend", function(event) {
        // reset the border of the dragged element
        dragged.style.border = "";
        highlight(null);
      }, false);
      // Next, events intended for the drop target - the Diagram div
      var div = this.$refs.myDiagramDiv;
      div.addEventListener("dragenter", function(event) {
        // Here you could also set effects on the Diagram,
        // such as changing the background color to indicate an acceptable drop zone
        // Requirement in some browsers, such as Internet Explorer
        event.preventDefault();
      }, false);
      div.addEventListener("dragover", function(event) {
        // We call preventDefault to allow a drop
        // But on divs that already contain an element,
        // we want to disallow dropping
        if (this === myDiagram.div) {
          var can = event.target;
          var pixelratio = window.PIXELRATIO;
          // if the target is not the canvas, we may have trouble, so just quit:
          if (!(can instanceof HTMLCanvasElement)) return;
          var bbox = can.getBoundingClientRect();
          var bbw = bbox.width;
          if (bbw === 0) bbw = 0.001;
          var bbh = bbox.height;
          if (bbh === 0) bbh = 0.001;
          var mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw);
          var my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh);
          var point = myDiagram.transformViewToDoc(new go.Point(mx, my));
          var curnode = myDiagram.findPartAt(point, true);
          if (curnode instanceof go.Node) {
            highlight(curnode);
          } else {
            highlight(null);
          }
        }
        if (event.target.className === "dropzone") {
          // Disallow a drop by returning before a call to preventDefault:
          return;
        }
        // Allow a drop on everything else
        event.preventDefault();
      }, false);
      div.addEventListener("dragleave", function(event) {
        // reset background of potential drop target
        if (event.target.className == "dropzone") {
          event.target.style.background = "";
        }
        highlight(null);
      }, false);
      // handle the user option for removing dragged items from the Palette
      var remove = document.getElementById('remove');
      div.addEventListener("drop", function(event) {
        // prevent default action
        // (open as link for some elements in some browsers)
        event.preventDefault();
        // Dragging onto a Diagram
        if (this === myDiagram.div) {
          var can = event.target;
          var pixelratio = window.PIXELRATIO;
          // if the target is not the canvas, we may have trouble, so just quit:
          if (!(can instanceof HTMLCanvasElement)) return;
          var bbox = can.getBoundingClientRect();
          var bbw = bbox.width;
          if (bbw === 0) bbw = 0.001;
          var bbh = bbox.height;
          if (bbh === 0) bbh = 0.001;
          var mx = event.clientX - bbox.left * ((can.width / pixelratio) / bbw) - dragged.offsetX;
          var my = event.clientY - bbox.top * ((can.height / pixelratio) / bbh) - dragged.offsetY;
          var point = myDiagram.transformViewToDoc(new go.Point(mx, my));
          myDiagram.startTransaction('new node');
          myDiagram.model.addNodeData({
            location: point,
            text: event.dataTransfer.getData('text'),
            color: "lightyellow"
          });
          myDiagram.commitTransaction('new node');
          
          if (remove.checked) dragged.parentNode.removeChild(dragged);
        }
        
      }, false);
     
      var $ = go.GraphObject.make;  // for conciseness in defining templates
      let myDiagram = $(go.Diagram, this.$refs.myDiagramDiv,  // create a Diagram for the DIV HTML element
        {
          "undoManager.isEnabled": true
        });
      window.PIXELRATIO = myDiagram.computePixelRatio(); // constant needed to determine mouse coordinates on the canvas
     
      myDiagram.nodeTemplate =
        $(go.Node, "Auto",
          { locationSpot: go.Spot.Center },
          new go.Binding('location'),
          $(go.Shape, "Rectangle",
            { fill: 'white' },
            // Shape.fill is bound to Node.data.color
            new go.Binding("fill", "color"),
            // this binding changes the Shape.fill when Node.isHighlighted changes value
            new go.Binding("fill", "isHighlighted", function(h, shape) {
              if (h) return "red";
              var c = shape.part.data.color;
              return c ? c : "white";
            }).ofObject()),  // binding source is Node.isHighlighted
          $(go.TextBlock,
            { margin: 3, font: "bold 16px sans-serif", width: 140, textAlign: 'center' },
            // TextBlock.text is bound to Node.data.key
            new go.Binding("text"))
        );
      myDiagram.model = new go.GraphLinksModel(
        [
          { text: "Alpha", color: "lightblue" },
          { text: "Beta", color: "orange" },
          { text: "Gamma", color: "lightgreen" },
          { text: "Delta", color: "pink" }
        ],
        []);
    }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.draggable {
      font: bold 16px sans-serif;
      width: 140px;
      height: 20px;
      text-align: center;
      background: white;
      cursor: move;
      margin-top: 20px;
    }
    .palettezone {
      width: 160px;
      height: 400px;
      background: lightblue;
      padding: 10px;
      padding-top: 1px;
      float: left;
    }
</style>
