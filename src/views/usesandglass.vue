<template>
  <div style="width:90%; white-space:nowrap;margin:auto">
    <span style="border: 1px solid gray;display: inline-block; vertical-align: top; width:220px;">
      <div id="myPaletteDiv" style="height: 600px;"></div>
    </span>
    <span
      style="border: 1px solid gray;display: inline-block; vertical-align: top;width:calc(100% - 220px)"
    >
      <div id="myDiagramDiv" style="height: 600px"></div>
    </span>

    <div>
      <button id="saveModel" @click="save()">Save</button>
      <button @click="load()">Load</button>
      <button @click="clear()">Clear</button>
      <button @click="bind()">绑定</button>
      <button @click="bindComplete()">完成绑定</button>
      <br />Diagram Model saved in JSON format:
    </div>
    <textarea
      id="mySavedModel"
      style="width:100%;height:200px;border:1px solid #000"
      v-model="modelData"
    ></textarea>
    <div style="display:flex;min-height:200px;">
      <div style="width:100px;height:100px;border:1px solid red;margin-right:50px;"></div>
      <div style="width:800px;height:100px;border:1px solid blue">
        <div
          v-for="(item,index) in checkList"
          :key="index"
          style="color:blue;border:1px solid black;"
        >{{item}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import png2 from "../assets/2.png";
import png3 from "../assets/3.png";
import png4 from "../assets/4.png";
import png5 from "../assets/5.png";
import png6 from "../assets/6.png";
import png7 from "../assets/7.png";
import png8 from "../assets/8.png";
import png9 from "../assets/9.png";
import png1_2 from "../assets/1-2.png";
//import { Binding } from '../../static/js/go-debug'
let go = window.go;
let $ = go.GraphObject.make;

export default {
  name: "",
  data() {
    return {
      diagram: null,
      modelData: {
        class: "go.GraphLinksModel",
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
        nodeDataArray: [],
        linkDataArray: []
      },
      png2: png2,
      png3: png3,
      png4: png4,
      png5: png5,
      png6: png6,
      png7: png7,
      png8: png8,
      png9: png9,
      png1_2: png1_2,
      circleText: "M",
      checkList: [],
      firstKey: "",
      isBind: false,
      white: "white", // 0 or false
      gray: "#A0A0A0", // 1 or true
      black: "#000000",
      red: "red"
    };
  },
  mounted() {
    var white = "white"; // 0 or false
    var gray = "#A0A0A0"; // 1 or true
    var black = "#000000";
    var etext = "edittext";
    let _this = this;
    let myDiagram = $(go.Diagram, "myDiagramDiv", {
      "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
      "draggingTool.isGridSnapEnabled": true, // dragged nodes will snap to a grid of 10x10 cells
      "undoManager.isEnabled": true
    });

    // myDiagram.addDiagramListener("Modified", function(e) {
    //   var button = document.getElementById("saveModel");
    //   if (button) button.disabled = !myDiagram.isModified;
      
    //   var idx = document.title.indexOf("*");
    //   if (myDiagram.isModified) {
    //     if (idx < 0) document.title += "*";
    //   } else {
    //     if (idx >= 0) document.title = document.title.substr(0, idx);
    //   }
    // });

    myDiagram.linkTemplate = $(
      go.Link,
      {
        routing: go.Link.AvoidsNodes,
        //curve: go.Link.JumpOver,//线跳过
        corner: 0,
        relinkableFrom: true,
        relinkableTo: true,
        selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
        reshapable: true,
        shadowOffset: new go.Point(0, 0),
        shadowBlur: 5,
        shadowColor: "blue"
      },
      new go.Binding("points").makeTwoWay(),
      new go.Binding("isShadowed", "isSelected").ofObject(),
      $(go.Shape, { name: "SHAPE", strokeWidth: 2, stroke: gray })
    );

    // define templates for each type of node
    var oilGroove = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Auto",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "Circle",
            fill: white,
            width: 70,
            height: 70
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.TextBlock, { font: "16px sans-serif", text: "压油槽" })
      ),

      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),

      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;

          var node = myDiagram.model.findNodeDataForKey(data.key); //首先拿到这个节点的对象
          if (data.fill == _this.gray) {
            myDiagram.model.setDataProperty(node, "fill", _this.red); //然后对这个对象的属性进行更改
          } else if (data.fill == _this.white) {
            myDiagram.model.setDataProperty(node, "fill", _this.gray);
          } else if (data.fill == _this.red) {
            myDiagram.model.setDataProperty(node, "fill", _this.white);
          }
          //_this.changeStyle(data.key,data.fill)
          _this.updateStates(data.key);
        }
      }
    );
    var pressureGroove = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Auto",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "Circle",
            fill: white,
            width: 70,
            height: 70
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.TextBlock, { font: "16px sans-serif", text: "压气槽" })
      ),

      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var triangleTemplate = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Vertical",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleDown",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.Shape, {
          figure: "MinusLine",
          fill: gray,
          width: 20,
          height: 0
        }),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleUp",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),

      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "triangle" ? "triangle2" : "triangle";
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var triangle1Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Vertical",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleDown",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleUp",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "triangle1" ? "triangle3" : "triangle1";
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var triangle2Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Vertical",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleDown",
            fill: "white",
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.Shape, {
          figure: "MinusLine",
          width: 20,
          height: 0
        }),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleUp",
            fill: "white",
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "triangle2" ? "triangle" : "triangle2";
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var triangle3Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Vertical",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleDown",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleUp",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
       $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(0.5, 0.5)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "triangle3" ? "triangle1" : "triangle3";
          _this.changeStyle(data.key, data.fill);

          _this.updateStates(data.key);
        }
      }
    );
    var htriangleTemplate = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Horizontal",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleRight",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.Shape, {
          figure: "LineV",
          width: 0,
          height: 20
        }),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleLeft",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          //e.diagram.startTransaction("Toggle Input");
          var data = obj.part.data;
          data.category =
            data.category === "htriangle" ? "htriangle2" : "htriangle";
          _this.changeStyle(data.key, data.fill);

          _this.updateStates(data.key);
        }
      }
    );
    var htriangle1Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Horizontal",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleRight",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleLeft",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "htriangle1" ? "htriangle3" : "htriangle1";
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var htriangle2Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Horizontal",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleRight",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(go.Shape, {
          figure: "LineV",
          width: 0,
          height: 20
        }),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleLeft",
            fill: gray,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),

      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          console.log(data, "data2");
          data.category =
            data.category === "htriangle2" ? "htriangle" : "htriangle2";
          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var htriangle3Template = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Horizontal",
        $(
          go.Shape,
          this.shapeStyle(),
          {
            figure: "TriangleRight",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        ),
        $(
          go.Shape,
          this.shapeStyle2(),
          {
            figure: "TriangleLeft",
            fill: white,
            width: 20,
            height: 20
          },
          new go.Binding("fill", "fill").makeTwoWay()
        )
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
       $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0.5)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          var data = obj.part.data;
          data.category =
            data.category === "htriangle1" ? "htriangle3" : "htriangle1";

          _this.changeStyle(data.key, data.fill);
          _this.updateStates(data.key);
        }
      }
    );
    var rectangle = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Vertical",
        $(go.Shape, {
          figure: "Rectangle",
          fill: gray,
          width: 60,
          height: 10
        }),
        $(go.Shape, {
          figure: "Rectangle",
          fill: black,
          width: 30,
          height: 10
        }),
        $(go.Shape, {
          figure: "Rectangle",
          fill: gray,
          width: 60,
          height: 30
        })
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.8)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      })
    );
    var edittext = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.TextBlock,
        {
          background: white,
          editable: true,
          isMultiline: false,
          verticalAlignment: go.Spot.Center,
          font: '22px serif',
          height: 30,
        },
        new go.Binding("text", "text").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      })
    );
    var straight = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      {
        selectionAdorned: false, // don't show the standard selection handle
        resizable: true,
        resizeObjectName: "SHAPE", // user can resize the Shape
        rotatable: true,
        rotateObjectName: "SHAPE" // user can rotate the Shape                                           // without rotating the label
      },
      $(
        go.Shape,
        {
          name: "SHAPE",
          fill: $(go.Brush, "Linear", { 0.0: "white", 1.0: "#000" }),
          desiredSize: new go.Size(100, 50),
          width: 60,
          height: 0
        },
        new go.Binding("width").makeTwoWay(),
        new go.Binding("figure", "figure")
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      })
    );
    var circleText = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Panel,
        "Auto",
        $(go.Shape, this.shapeStyle(), {
          figure: "Circle",
          fill: white,
          width: 18,
          height: 18
        }),
        $(
          go.TextBlock,
          {
            font: "12px sans-serif",
            stroke: "red",
            editable: true,
            isMultiline: false
          },
          new go.Binding("text", "text").makeTwoWay()
        )
      ),

      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      })
    );
    var verticalLine = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      {
        selectionAdorned: false, // don't show the standard selection handle
        resizable: true,
        resizeObjectName: "SHAPE", // user can resize the Shape
        rotatable: true,
        rotateObjectName: "SHAPE" // user can rotate the Shape                                           // without rotating the label
      },
      $(
        go.Shape,
        {
          name: "SHAPE",
          fill: $(go.Brush, "Linear", { 0.0: "white", 1.0: "#000" }),
          desiredSize: new go.Size(100, 50),
          height: 40,
          width: 0
        },
        new go.Binding("height").makeTwoWay(),
        new go.Binding("figure", "figure")
      )
    );
    var picture = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 50, height: 120 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "Rt",
        alignment: new go.Spot(1, 0.16)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "Rb",
        alignment: new go.Spot(1, 0.82)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "Lt",
        alignment: new go.Spot(0, 0.33)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "Lb",
        alignment: new go.Spot(0, 0.67)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R1",
        alignment: new go.Spot(1, 0.33)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R2",
        alignment: new go.Spot(1, 0.67)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          shp.source == _this.png2
            ? (shp.source = _this.png1_2)
            : (shp.source = _this.png2);
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture1 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 30, height: 25 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture2 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 50, height: 70 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture3 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 30, height: 30 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture4 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 70, height: 40 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture5 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      {
        rotatable: true,
        rotateObjectName: "SHAPE" // user can rotate the Shape
      },
      new go.Binding("angle").makeTwoWay(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 25, height: 50,angle:0 },
        new go.Binding("source", "source").makeTwoWay(),

      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.7)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.7)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    var picture7 = $(
      go.Node,
      "Spot",
      this.nodeStyle(),
      $(
        go.Picture,
        this.imgStyle(),
        { width: 30, height: 30 },
        new go.Binding("source", "source").makeTwoWay()
      ),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right, true, true), {
        portId: "R",
        alignment: new go.Spot(1, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left, true, true), {
        portId: "L",
        alignment: new go.Spot(0, 0.5)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top, true, true), {
        portId: "T",
        alignment: new go.Spot(0.5, 0)
      }),
      $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom, true, true), {
        portId: "B",
        alignment: new go.Spot(0.5, 1)
      }),
      {
        // if double-clicked, an input node will change its value, represented by the color.
        doubleClick: function(e, obj) {
          e.diagram.startTransaction("Toggle Input");
          var shp = obj.findObject("NODESHAPE100");
          console.log(shp.source);
          // shp.source == _this.png2 ? shp.source = _this.png1_2 : shp.source = _this.png2;
          e.diagram.commitTransaction("Toggle Input");
        }
      }
    );
    // add the templates created above to myDiagram and palette
    myDiagram.nodeTemplateMap.add("oilGroove", oilGroove);
    myDiagram.nodeTemplateMap.add("pressureGroove", pressureGroove);
    myDiagram.nodeTemplateMap.add("triangle", triangleTemplate);
    myDiagram.nodeTemplateMap.add("triangle1", triangle1Template);
    myDiagram.nodeTemplateMap.add("triangle2", triangle2Template);
    myDiagram.nodeTemplateMap.add("triangle3", triangle3Template);
    myDiagram.nodeTemplateMap.add("htriangle", htriangleTemplate);
    myDiagram.nodeTemplateMap.add("htriangle1", htriangle1Template);
    myDiagram.nodeTemplateMap.add("htriangle2", htriangle2Template);
    myDiagram.nodeTemplateMap.add("htriangle3", htriangle3Template);
    myDiagram.nodeTemplateMap.add("rectangle", rectangle);
    myDiagram.nodeTemplateMap.add("edittext", edittext);
    myDiagram.nodeTemplateMap.add("straight", straight);
    myDiagram.nodeTemplateMap.add("verticalLine", verticalLine);
    myDiagram.nodeTemplateMap.add("picture", picture);
    myDiagram.nodeTemplateMap.add("picture1", picture1);
    myDiagram.nodeTemplateMap.add("picture2", picture2);
    myDiagram.nodeTemplateMap.add("picture3", picture3);
    myDiagram.nodeTemplateMap.add("picture5", picture5);
    myDiagram.nodeTemplateMap.add("picture4", picture4);
    myDiagram.nodeTemplateMap.add("picture7", picture7);
    myDiagram.nodeTemplateMap.add("circleText", circleText);

    let myPalette = $(
      go.Palette,
      "myPaletteDiv", // must name or refer to the DIV HTML element
      {
        "animationManager.duration": 800, // slightly longer than default (600ms) animation
        nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
        model: new go.GraphLinksModel([
          // specify the contents of the Palette
          { category: "triangle", fill: gray },
          { category: "triangle1", fill: gray },
          { category: "triangle2", fill: white },
          { category: "triangle3", fill: white },
          { category: "htriangle2", fill: gray },
          { category: "htriangle1", fill: gray },
          { category: "htriangle", fill: white },
          { category: "htriangle3", fill: white },
          { category: "oilGroove", fill: white },
          { category: "pressureGroove",fill:white },
          { category: "rectangle" },
          { category: "edittext", text: etext },
          { category: "straight", figure: "MinusLine" },
          { category: "verticalLine", figure: "LineV" },
          { category: "picture", source: _this.png2 },
          { category: "picture1", source: _this.png3 },
          { category: "picture2", source: _this.png4 },
          { category: "picture3", source: _this.png5 },
          { category: "picture5", source: _this.png7 },
          { category: "picture4", source: _this.png6 },
          { category: "picture7", source: _this.png9 },
          { category: "circleText", text: _this.circleText }
        ])
      }
    );
    this.diagram = myDiagram;
    // load the initial diagram
    this.load();

    // continually update the diagram
    //this.loop();
  },
  watch: {},
  computed: {},
  methods: {
    nodeStyle() {
      var sharedToolTip = $(
        "ToolTip",
        { "Border.figure": "RoundedRectangle" },
        $(
          go.TextBlock,
          { margin: 2 },
          new go.Binding("text", "", function(d) {
            return d.category;
          })
        )
      );
      return [
        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
          go.Point.stringify
        ),
        new go.Binding("isShadowed", "isSelected").ofObject(),
        {
          locationSpot: go.Spot.Center,
          selectionAdorned: false,
          shadowOffset: new go.Point(0, 0),
          shadowBlur: 15,
          shadowColor: "blue",
          toolTip: sharedToolTip,
          mouseEnter: (e, obj) => {
            this.showPorts(obj.part, true);
          },
          mouseLeave: (e, obj) => {
            this.showPorts(obj.part, false);
          },
          click: this.clickNode
        }
      ];
    },
    showPorts(node, show) {
      let diagram = node.diagram;
      if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
      node.ports.each(function(port) {
        port.stroke = show ? "white" : null;
      });
    },
    shapeStyle() {
      var _this = this;
      return {
        name: "NODESHAPE",
        fill: "lightgray",
        stroke: "#000000",
        desiredSize: new go.Size(40, 40),
        strokeWidth: 1
      };
    },
    shapeStyle2() {
      return {
        name: "NODESHAPE2",
        fill: "lightgray",
        stroke: "#000000",
        desiredSize: new go.Size(40, 40),
        strokeWidth: 1
      };
    },
    imgStyle() {
      return {
        name: "NODESHAPE100",
        // desiredSize: new go.Size(40, 40),
        // source:this.png2
        source: require("../assets/2.png"),
        width: 50
      };
    },
    portStyle(spot, input, output) {
      return {
        desiredSize: new go.Size(7, 7),
        fill: "transparent",
        stroke: null,
        alignment: spot,  // align the port on the main Shape
        alignmentFocus: spot,  // just inside the Shape
        fromSpot: spot,
        fromLinkable: output,
        toSpot: spot,
        toLinkable: input,
        //toMaxLinks: 1,//一个口能接受多少线
        cursor: "pointer" 
      };
    },
    save() {
      var img = this.diagram.makeImage({
        scale: 1,
        background: "#fff"
      });
      // 将图片的src属性作为URL地址
      var url = img.src;
      var a = document.createElement("a");
      var event = new MouseEvent("click");
      a.download = "流程图";
      a.href = url;
      a.dispatchEvent(event);

      this.modelData = this.diagram.model.toJson();
      localStorage.setItem("diagramData", this.modelData);
      // document.getElementById("mySavedModel").value = this.diagram.model.toJson();
      // localStorage.setItem("diagramData",document.getElementById("mySavedModel").value);
      this.diagram.isModified = false;
    },
    load() {
      var diagramData = localStorage.getItem("diagramData");
      if (diagramData) {
        this.modelData = diagramData;
        this.diagram.model = go.Model.fromJson(diagramData);
      } else {
        this.diagram.model = go.Model.fromJson(this.modelData);
        this.modelData = this.diagram.model.toJson();
      }
    },
    clear() {
      localStorage.clear();
      this.diagram.model.nodeDataArray = [];
      this.diagram.model.linkDataArray = [];
      this.modelData = this.diagram.model.toJson();
    },
    loop() {
      var _this = this;
      setTimeout(function() {
        _this.updateStates();
        _this.loop();
      }, 250);
    },
    changeStyle(key, fill) {
      var _this = this;
      var node = this.diagram.model.findNodeDataForKey(key); //首先拿到这个节点的对象
      if (fill == _this.gray) {
        this.diagram.model.setDataProperty(node, "fill", _this.white); //然后对这个对象的属性进行更改
      } else if (fill == _this.white) {
        this.diagram.model.setDataProperty(node, "fill", _this.gray);
      }
    },
    updateStates(key) {
      var _this = this;
      var oldskip = _this.diagram.skipsUndoManager;
      _this.diagram.skipsUndoManager = true;
      // //连接线随着点击改变
      // _this.diagram.nodes.each(function(node) {
      //     if (node.category === "oilGrove") {
      //         _this.doInput(node);
      //     }
      // });

      // // //相关联的随着点击改变
      console.log(key, "key");
      _this.diagram.nodes.each(function(node) {
        if (node.data.parent == key) {
          console.log(node.data, "node");
          _this.changeStyle(node.data.key, node.data.fill);
        }
      });
      _this.diagram.skipsUndoManager = oldskip;
    },
    doInput(node) {
      var _this = this;
      // the output is just the node's Shape.fill
      _this.setOutputLinks(node, node.findObject("NODESHAPE").fill);
    },

    // helper predicate
    linkIsTrue(link) {
      // assume the given Link has a Shape named "SHAPE"
      return link.findObject("SHAPE").stroke === gray;
    },

    // helper function for propagating results
    setOutputLinks(node, color) {
      node.findLinksOutOf().each(function(link) {
        link.findObject("SHAPE").stroke = color;
      });
    },
    clickNode(e, obj) {
      console.log("点击节点");
      console.log(obj.part.data);
      if (this.isBind) {
        if (this.checkList.length > 0) {
          console.log(
            "是否具有parent属性：",
            obj.part.data.hasOwnProperty("parent")
          );
          if (obj.part.data.hasOwnProperty("parent")) {
            alert("已绑定！！！");
          } else {
            if (obj.part.data.key != this.firstKey) {
              obj.part.data.parent = this.firstKey;
              this.checkList.push(obj.part.data);
            } else {
              alert("该节点无需进行绑定");
            }
          }
        } else {
          this.firstKey = obj.part.data.key;
          this.checkList.push(obj.part.data);
        }
      }
    },
    bind() {
      console.log("绑定关系");
      this.isBind = true;
    },
    bindComplete() {
      this.isBind = false;
    }
  }
};
</script>

<style>
</style>
