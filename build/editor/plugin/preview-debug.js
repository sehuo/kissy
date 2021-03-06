/*
Copyright 2014, KISSY v5.0.0
MIT Licensed
build time: Apr 15 17:49
*/
/*
combined files : 

editor/plugin/preview

*/
/**
 * @ignore
 * preview for kissy editor
 * @author yiminghe@gmail.com
 */
KISSY.add('editor/plugin/preview',['./button'], function (S, require) {
    var win = window;
    require('./button');
    function Preview() {
    }

    S.augment(Preview, {
        pluginRenderUI: function (editor) {
            editor.addButton('preview', {
                tooltip: '预览',
                listeners: {
                    click: function () {
                        var iWidth, iHeight, iLeft;
                        try {
                            var screen = win.screen;
                            iHeight = Math.round(screen.height * 0.7);
                            iLeft = Math.round(screen.width * 0.1);
                            iWidth = Math.round(screen.width * 0.8);
                        } catch (e) {
                            iWidth = 640; // 800 * 0.8,
                            iHeight = 420; // 600 * 0.7,
                            iLeft = 80; // (800 - 0.8 * 800) /2 = 800 * 0.1.
                        }
                        var sHTML = S.substitute(editor.getDocHtml(), {
                                title: '预览'
                            }),
                            sOpenUrl = '',
                            oWindow = win.open(sOpenUrl,
                                // 每次都弹出新窗口
                                '',
                                'toolbar=yes,' +
                                    'location=no,' +
                                    'status=yes,' +
                                    'menubar=yes,' +
                                    'scrollbars=yes,' +
                                    'resizable=yes,' +
                                    'width=' +
                                    iWidth +
                                    ',height=' + iHeight + ',left=' + iLeft), winDoc = oWindow.document;
                        winDoc.open();
                        winDoc.write(sHTML);
                        winDoc.close();
                        //ie 重新显示
                        oWindow.focus();
                    }

                }
            });
        }
    });

    return Preview;
});

