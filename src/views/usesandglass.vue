<template>
    <div style='width:90%; white-space:nowrap;margin:auto'>
        <span style='border: 1px solid gray;display: inline-block; vertical-align: top; width:220px;'>
            <div id='myPaletteDiv' style='height: 600px;'></div>
        </span>
        <span style='border: 1px solid gray;display: inline-block; vertical-align: top;width:calc(100% - 220px)'>
            <div id='myDiagramDiv' style='height: 600px'></div>
        </span>

        <div>
            <button id="saveModel" @click="save()">Save</button>
            <button @click="load()">Load</button>
            Diagram Model saved in JSON format:
        </div>
        <textarea id="mySavedModel"  style="width:100%;height:200px" >{ "class": "go.GraphLinksModel",
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [

 ],
  "linkDataArray": [

 ]}
        </textarea>
    </div>
</template>

<script>
let go = window.go
let $ = go.GraphObject.make

export default {
    name: '',
    data () {
        return {
            
            diagram: null,
            modelData:{ 
                "class": "go.GraphLinksModel",
                "linkFromPortIdProperty": "fromPort",
                "linkToPortIdProperty": "toPort",
                "nodeDataArray": [
                    // {"category":"input", "key":"input1", "loc":"-150 -80" },
                    // {"category":"output", "key":"output1", "loc":"200 -100" }
                ],
                "linkDataArray": [
                    //{"from":"input1", "fromPort":"T", "to":"output1", "toPort":"in"},
                ]
            }
        }
    },
    mounted () {
        var white = "white";  // 0 or false
        var gray = "#A0A0A0";  // 1 or true
        var etext="edittext";
        let _this = this
        let myDiagram =
            $(go.Diagram, "myDiagramDiv",
                {
                    "toolManager.mouseWheelBehavior": go.ToolManager.WheelZoom,
                    "draggingTool.isGridSnapEnabled": true,  // dragged nodes will snap to a grid of 10x10 cells
                    "undoManager.isEnabled": true,
                    
                })
       
             // define templates for each type of node
      var oilGroove =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Auto',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'Circle',
                        fill: white,
                        width: 70,
                        height: 70
                    },
                ),
                $(go.TextBlock,
                { font: "16px sans-serif",
                text:'压油槽' },
                ),
            ),
        
             $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top,true,true),
            { portId: "T", alignment: new go.Spot(0.5, 0) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom,true,true),
            { portId: "B", alignment: new go.Spot(0.5, 1) }),
         
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );

      var pressureGroove =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Auto',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'Circle',
                        fill: white,
                        width: 70,
                        height: 70
                    },
                ),
                $(go.TextBlock,
                { font: "16px sans-serif",
                text:'压气槽' },
                ),
            ),
        
          $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top,true,true),
            { portId: "T", alignment: new go.Spot(0.5, 0) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom,true,true),
            { portId: "B", alignment: new go.Spot(0.5, 1) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
     var triangleTemplate =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Vertical',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleDown',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
                   $(go.Shape,
                    {
                        figure: 'MinusLine',
                        fill: gray,
                        width: 20,
                        height: 0
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleUp',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
            ),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top,true,true),
            { portId: "T", alignment: new go.Spot(0.5, 0) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom,true,true),
            { portId: "B", alignment: new go.Spot(0.5, 1) }),
           
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              shp.fill = (shp.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
       var triangle1Template =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Vertical',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleDown',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleUp',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
            ),
              $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top,true,true),
            { portId: "T", alignment: new go.Spot(0.5, 0) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom,true,true),
            { portId: "B", alignment: new go.Spot(0.5, 1) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var triangle2Template =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Vertical',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleDown',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
                   $(go.Shape,
                    {
                        figure: 'MinusLine',
                        width: 20,
                        height: 0
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleUp',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
            ),
              $(go.Shape, "Rectangle", this.portStyle(go.Spot.Top,true,true),
            { portId: "T", alignment: new go.Spot(0.5, 0) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Bottom,true,true),
            { portId: "B", alignment: new go.Spot(0.5, 1) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var htriangleTemplate =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Horizontal',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleRight',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
                   $(go.Shape,
                    {
                        figure: 'LineV',
                        width: 0,
                        height: 20
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleLeft',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
            ),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var htriangle1Template =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Horizontal',
                $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleRight',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleLeft',
                        fill: 'white',
                        width: 20,
                        height: 20
                    }),
            ),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var htriangle2Template =
        $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Horizontal',
                 $(go.Shape,this.shapeStyle(),
                    {
                        figure: 'TriangleRight',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
                   $(go.Shape,
                    {
                        figure: 'LineV',
                        width: 0,
                        height: 20
                    }),
                $(go.Shape,this.shapeStyle2(),
                    {
                        figure: 'TriangleLeft',
                        fill: gray,
                        width: 20,
                        height: 20
                    }),
            ),
           $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var rectangle= $(go.Node, "Spot", this.nodeStyle(),
         $(go.Panel, 'Vertical',
                 $(go.Shape,
                    {
                        figure: 'Rectangle',
                        fill: gray,
                        width: 60,
                        height: 10
                    }),
                   $(go.Shape,
                    {
                        figure: 'Rectangle',
                        fill: '#000000',
                        width: 30,
                        height: 10
                    }),
                $(go.Shape,
                    {
                        figure: 'Rectangle',
                        fill: gray,
                        width: 60,
                        height: 30
                    }),
            ),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Right,true,true),  
            { portId: "R", alignment: new go.Spot(1, 0.5) }),
            $(go.Shape, "Rectangle", this.portStyle(go.Spot.Left,true,true),
            { portId: "L", alignment: new go.Spot(0, 0.5) }),
          { // if double-clicked, an input node will change its value, represented by the color.
            doubleClick: function(e, obj) {
              e.diagram.startTransaction("Toggle Input");
              var shp = obj.findObject("NODESHAPE");
              shp.fill = (shp.fill === gray) ? white : gray;
               var shp2 = obj.findObject("NODESHAPE2");
              shp2.fill = (shp2.fill === gray) ? white : gray;
              _this.updateStates();
              e.diagram.commitTransaction("Toggle Input");
            }
          }
        );
        var edittext= $(go.Node,this.nodeStyle(),
        $(go.TextBlock,
        { text: etext,
          background: white,
          editable: true, isMultiline: false })
        );
    var edittext1= $(go.Part,
        $(go.TextBlock,
        { text: etext,
          background: white,
          editable: true, isMultiline: false })
        );
      // add the templates created above to myDiagram and palette
        myDiagram.nodeTemplateMap.add("oilGroove", oilGroove);
        myDiagram.nodeTemplateMap.add("pressureGroove", pressureGroove);
        myDiagram.nodeTemplateMap.add("triangle", triangleTemplate);
        myDiagram.nodeTemplateMap.add("triangle1", triangle1Template);
        myDiagram.nodeTemplateMap.add("triangle2", triangle2Template);
        myDiagram.nodeTemplateMap.add("htriangle", htriangleTemplate);
        myDiagram.nodeTemplateMap.add("htriangle1", htriangle1Template);
        myDiagram.nodeTemplateMap.add("htriangle2", htriangle2Template);
        myDiagram.nodeTemplateMap.add("rectangle", rectangle);
        myDiagram.nodeTemplateMap.add("edittext", edittext);

      myDiagram.linkTemplate =
        $(go.Link,
          {
            routing: go.Link.AvoidsNodes,
            curve: go.Link.JumpOver,
            corner: 0,
            relinkableFrom: true, 
            relinkableTo: true,
            selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
            reshapable: true,
            //resegmentable: true,
            shadowOffset: new go.Point(0, 0), shadowBlur: 5, shadowColor: "blue",
          },
          //new go.Binding("isShadowed", "isSelected").ofObject(),
           $(go.Shape,
             { name: "SHAPE", strokeWidth: 2, stroke: '#000' })
        
        );
   
        let myPalette =
            $(go.Palette, 'myPaletteDiv', // must name or refer to the DIV HTML element
                {
                    'animationManager.duration': 800, // slightly longer than default (600ms) animation
                    nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                    model: new go.GraphLinksModel([ // specify the contents of the Palette
                        { category: "oilGroove" },
                        { category: "pressureGroove" },
                        { category: "triangle" },
                        { category: "triangle1" },
                        { category: "triangle2" },
                        { category: "htriangle" },
                        { category: "htriangle1" },
                        { category: "htriangle2" },
                        { category: "rectangle" },
                        { category: "edittext"}
                        
                    ])
                })
       this.diagram = myDiagram
        // load the initial diagram
        this.load();

        // continually update the diagram
        this.loop();
        
    },
    watch: {
       
    },
    computed: {},
    methods: {
        nodeStyle() {
             var sharedToolTip =
                $("ToolTip",
                { "Border.figure": "RoundedRectangle" },
                $(go.TextBlock, { margin: 2 },
                new go.Binding("text", "", function(d) { return d.category; })
            ));
            return [new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
            new go.Binding("isShadowed", "isSelected").ofObject(),
            {
                locationSpot: go.Spot.Center,
                selectionAdorned: false,
                shadowOffset: new go.Point(0, 0),
                shadowBlur: 15,
                shadowColor: "blue",
                toolTip: sharedToolTip,
                mouseEnter: (e, obj) => {
                    this.showPorts(obj.part, true)
                },
                mouseLeave: (e, obj) => {
                    this.showPorts(obj.part, false)
                }
            }];
        },
        showPorts (node, show) {
            let diagram = node.diagram
            if (!diagram || diagram.isReadOnly || !diagram.allowLink) return
            node.ports.each(function (port) {
                port.stroke = (show ? 'white' : null)
            })
        },
        shapeStyle() {
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
        portStyle(spot,input,output) {
            return {
                desiredSize: new go.Size(5, 5),
                fill: 'transparent',
                stroke:null,
                fromSpot: spot,
                fromLinkable: output,
                toSpot: spot,
                toLinkable: input,
                toMaxLinks: 1,
                cursor: "pointer",
                
            };
        },
        save() {
            
            var img = this.diagram.makeImage({
                scale: 1
            });
            // 将图片的src属性作为URL地址
            var url = img.src;
            var a = document.createElement('a');
            var event = new MouseEvent('click');
            a.download = '流程图';
            a.href = url;
            a.dispatchEvent(event);

            document.getElementById("mySavedModel").value = this.diagram.model.toJson();
            //myDiagram.isModified = false;
        },
        load() {
            this.diagram.model = go.Model.fromJson(document.getElementById("mySavedModel").value);
            this.diagram.isModified = false;
        },
        loop() {
            var _this=this
            setTimeout(function() { _this.updateStates(); _this.loop(); }, 250);
        },
        updateStates() {
            var _this=this
            var oldskip = this.diagram.skipsUndoManager;
            this.diagram.skipsUndoManager = true;
            // //连接线随着点击改变
            // this.diagram.nodes.each(function(node) {
            //     if (node.category === "input") {
            //         _this.doInput(node);
            //     }
            // });

            // //相连的随着点击改变
            // this.diagram.nodes.each(function(node) {
            //     switch (node.category) {
            //     case "output": _this.doOutput(node); break;
            //     case "input": break;  // doInput already called, above
            //     }
            // });
            this.diagram.skipsUndoManager = oldskip;
        },
        // doInput(node) {
        //     var _this=this
        //     // the output is just the node's Shape.fill
        //     _this.setOutputLinks(node, node.findObject("NODESHAPE").fill);
        // },
        // doOutput(node) {
        //     // assume there is just one input link
        //     // we just need to update the node's Shape.fill
        //     node.linksConnected.each(function(link) { node.findObject("NODESHAPE").fill = link.findObject("SHAPE").stroke; });
        // },
       
        // helper predicate
        linkIsTrue(link) {  // assume the given Link has a Shape named "SHAPE"
            return link.findObject("SHAPE").stroke === gray;
        },

        // helper function for propagating results
        setOutputLinks(node, color) {
            node.findLinksOutOf().each(function(link) { link.findObject("SHAPE").stroke = color; });
        }
    }
}
</script>

<style>

</style>
