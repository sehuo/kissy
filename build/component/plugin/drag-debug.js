/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:42
*/
/*
combined files : 

component/plugin/drag

*/
/**
 * @ignore
 * drag plugin for kissy component
 * @author yiminghe@gmail.com
 */
KISSY.add('component/plugin/drag',['dd'], function (S, require) {
    var DD = require('dd');

    function onDragEnd() {
        var component = this.component;
        var offset = component.$el.offset();
        component.setInternal('xy', [offset.left, offset.top]);
    }

    /**
     * drag plugin for kissy component
     *
     *      @example
     *      KISY.use('overlay,component/plugin/drag,dd/plugin/proxy',
     *      function(S,Overlay,DragPlugin,ProxyPlugin){
     *        var o =new Overlay.Dialog({
     *          plugins:[
     *              new DragPlugin({
     *                  handles: [function(){ return o.get('header'); }],
     *                  plugins: [ProxyPlugin]
     *              })
     *          ]
     *        })
     *        // or
     *        o.plug(new DragPlugin({
     *          handles:[function(){ return o.get('header'); }]
     *        });
     *      });
     *
     *
     * @class KISSY.Component.Plugin.Drag
     * @extends KISSY.DD.Draggable
     */
    return DD.Draggable.extend({
        pluginId: 'component/plugin/drag',

        pluginBindUI: function (component) {
            this.set('node', component.$el);
            this.start();
            this.component = component;
            this.on('dragend', onDragEnd);
        },

        pluginDestructor: function () {
            this.destroy();
        }
    }, {
        ATTRS: {
            move: {
                value: 1
            },
            groups: {
                value: false
            }
        }
    });

});
