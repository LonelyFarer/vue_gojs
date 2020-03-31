<template>
    <div style='width:90%; white-space:nowrap;margin:auto'>
        <span style='border: 1px solid gray;display: inline-block; vertical-align: top; width:240px;'>
            <div ref='myPaletteDiv' style='height: 600px;'></div>
        </span>
        <span style='border: 1px solid gray;display: inline-block; vertical-align: top;width:calc(100% - 240px)'>
            <div ref='myDiagramDiv' style='height: 600px'></div>
        </span>

        
    </div>
</template>

<script>
let go = window.go
let $ = go.GraphObject.make

export default {
    name: '',
    props: ['modelData'],
    data () {
        return {
            diagram: null
        }
    },
    mounted () {
        let self = this
        let myDiagram =
            $(go.Diagram, this.$refs.myDiagramDiv,
                {
                    initialContentAlignment: go.Spot.Center,
                    // layout: $(go.TreeLayout, {angle: 90, arrangement: go.TreeLayout.ArrangementHorizontal}),
                    'undoManager.isEnabled': true,
                    // Model ChangedEvents get passed up to component users
                    'ModelChanged': function (e) {
                        self.$emit('model-changed', e)
                    },
                    'ChangedSelection': function (e) {
                        self.$emit('changed-selection', e)
                    },
                    'Modified': function (e) {
                        self.$emit('modified', e)
                    },
                    'TextEdited': function (e) {
                        self.$emit('text-edited', e)
                    },
                    allowDrop: true
                })
        myDiagram.nodeTemplateMap.add('',
            $(window.go.Node, 'Vertical', this.nodeStyle(),
               
                new go.Binding('itemArray', 'verticalItems'),
                {
                    itemTemplate:
                    $(go.Panel, 'Auto',
                        $(go.Shape,
                            {
                                figure: 'TriangleDown',
                                fill: '#91E3E0',
                                width: 20,
                                height: 20
                            },
                            new go.Binding('fill', 'color'),
                            new go.Binding('figure', 'type'),
                            new go.Binding('height', 'h'),
                            new go.Binding('width', 'w'),

                           
                        ),
                        $(go.TextBlock,
                        // { font: "20px sans-serif" },
                         { font: "16px sans-serif" },
                        new go.Binding("text", "text")),
                        this.makePort('L', go.Spot.Left, true, true),
                        this.makePort('R', go.Spot.Right, true, true)
                    )
                    
                },
            )
        )

        myDiagram.linkTemplate =
            $(go.Link,
              
                // the whole link panel
                {
                    routing: go.Link.AvoidsNodes,
                    curve: go.Link.JumpOver,
                    corner: 5,
                    toShortLength: 4,
                    relinkableFrom: true,
                    relinkableTo: true,
                    reshapable: true,
                    resegmentable: true,
                   
                    mouseEnter: function (e, link) {
                        link.findObject('HIGHLIGHT').stroke = 'rgba(30,144,255,0.2)'
                    },
                    mouseLeave: function (e, link) {
                        link.findObject('HIGHLIGHT').stroke = 'transparent'
                    }
                },
                new go.Binding('points').makeTwoWay(),
                $(go.Shape, // the highlight shape, normally transparent
                    {isPanelMain: true, strokeWidth: 8, stroke: 'transparent', name: 'HIGHLIGHT'}),
                $(go.Shape, // the link path shape
                    {isPanelMain: true, stroke: 'gray', strokeWidth: 2}),
                $(go.Panel, 'Auto', // the link label, normally not visible
                    {visible: true, name: 'LABEL', segmentIndex: 2, segmentFraction: 0.5},
                    new go.Binding('visible', 'visible').makeTwoWay(),
                   
                )
            )

        let myPalette =
            $(go.Palette, this.$refs.myPaletteDiv, // must name or refer to the DIV HTML element
                {
                    'animationManager.duration': 800, // slightly longer than default (600ms) animation
                    nodeTemplateMap: myDiagram.nodeTemplateMap, // share the templates used by myDiagram
                    // nodeTemplate: myDiagram.nodeTemplate, // share the templates used by myDiagram
                    model: new go.GraphLinksModel([ // specify the contents of the Palette
                        {
                            //key: 1,
                            text: 'Alpha',
                            verticalItems: [
                                { type: 'TriangleDown', h: 20, color: '#A0A0A0' },
                                { type: 'MinusLine', h: 0 },
                                { type: 'TriangleUp', h: 20, color: '#A0A0A0' }
                            ]
                        },
                        {
                            //key: 2,
                            text: 'Beta',
                            verticalItems: [
                                { type: 'TriangleDown', h: 20, color: '#A0A0A0' },
                                { type: 'TriangleUp', h: 20, color: '#A0A0A0' }
                            ]
                        },
                        {
                            //key: 3,
                            text: 'Gamma',
                            verticalItems: [
                                { type: 'TriangleDown', h: 20, color: null },
                                { type: 'MinusLine', h: 0 },
                                { type: 'TriangleUp', h: 20, color: null }
                            ]
                        },
                        {
                            //key: 4,
                            text: 'Jay',
                            verticalItems: [
                                { type: 'circle', h: 70,w: 70, color: null,text:'压油槽' },
                                
                            ]
                        },
                        {
                            //key: 5,
                            verticalItems: [
                                { type: 'circle', h: 70,w: 70, color: null,text:'压气槽' },
                                
                            ]
                        },
                        {
                            verticalItems: [
                                { type: 'Rectangle', h: 10,w:60, color: '#A0A0A0' },
                                { type: 'Rectangle', h: 10,w:30, color: '#000000' },
                                { type: 'Rectangle', h: 30,w:60, color: '#A0A0A0' }
                            ]
                        },
                    ])
                })
        console.log(myPalette)
        this.diagram = myDiagram
        this.updateModel(this.modelData)
    },
    watch: {
        modelData: function (val) {
            console.log('watch')
            console.log(val)
            this.updateModel(val)
        }
    },
    computed: {},
    methods: {
        makePort (name, spot, output, input) {
            return $(go.Shape, 'Circle',
                {
                    fill: 'transparent',
                    stroke: null, // this is changed to 'white' in the showPorts function
                    desiredSize: new go.Size(8, 8),
                    alignment: spot,
                    alignmentFocus: spot, // align the port on the main Shape
                    portId: name, // declare this object to be a 'port'
                    fromSpot: spot,
                    toSpot: spot, // declare where links may connect at this port
                    fromLinkable: output,
                    toLinkable: input, // declare whether the user may draw links to/from here
                    cursor: 'pointer' // show a different cursor to indicate potential link point
                })
        },
        nodeStyle () {
            return [
                new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
                {
                    locationSpot: go.Spot.Center,
                    mouseEnter: (e, obj) => {
                        this.showPorts(obj.part, true)
                    },
                    mouseLeave: (e, obj) => {
                        this.showPorts(obj.part, false)
                    }
                }
            ]
        },
        showPorts (node, show) {
            let diagram = node.diagram
            if (!diagram || diagram.isReadOnly || !diagram.allowLink) return
            node.ports.each(function (port) {
                port.stroke = (show ? 'white' : null)
            })
        },
        model: function () {
            return this.diagram.model
        },
        updateModel: function (val) {
            // No GoJS transaction permitted when replacing Diagram.model.
            if (val instanceof go.Model) {
                this.diagram.model = val
            } else {
                let m = new go.GraphLinksModel()
                if (val) {
                    for (let p in val) {
                        m[p] = val[p]
                    }
                }
                this.diagram.model = m
            }
        },
        updateDiagramFromData: function () {
            this.diagram.startTransaction()
            // This is very general but very inefficient.
            // It would be better to modify the diagramData data by calling
            // Model.setDataProperty or Model.addNodeData, et al.
            this.diagram.updateAllRelationshipsFromData()
            this.diagram.updateAllTargetBindings()
            this.diagram.commitTransaction('updated')
        }
    }
}
</script>

<style>

</style>
