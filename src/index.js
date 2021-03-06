/**
 * blear.classes.controller
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 * @update 2018年03月07日17:35:10
 */

'use strict';

var Events = require('blear.classes.events');
var fun = require('blear.utils.function');
var array = require('blear.utils.array');
var selector = require('blear.core.selector');

var win = window;
var Controller = Events.extend({
    className: 'Controller',
    constructor: function () {
        var the = this;

        Controller.parent(the);
        the[_installCallbackList] = [];
        the[_showCallbackList] = [];
        the[_hideCallbackList] = [];
        the[_updateCallbackList] = [];
        the[_exports] = {
            install: function () {
                the[_execCallback](_installCallbackList, arguments);
            },
            show: function () {
                the[_execCallback](_showCallbackList, arguments);
            },
            hide: function () {
                the[_execCallback](_hideCallbackList, arguments);
            },
            update: function (view, route) {
                the[_execCallback](_updateCallbackList, arguments);
            }
        };
    },

    /**
     * 设置标题
     * @param title
     * @returns {Controller}
     */
    title: function (title) {
        var the = this;

        if (the.view) {
            the.view.title(title);
        } else {
            the[_exports].title = title;
        }

        return the;
    },

    /**
     * 安装阶段
     * @param callback {Function}
     * @returns {Controller}
     */
    install: function (callback) {
        return this[_pushCallback](_installCallbackList, callback);
    },

    /**
     * 显示阶段
     * @param callback {Function}
     * @returns {Controller}
     */
    show: function (callback) {
        return this[_pushCallback](_showCallbackList, callback);
    },

    /**
     * 隐藏阶段
     * @param callback {Function}
     * @returns {Controller}
     */
    hide: function (callback) {
        return this[_pushCallback](_hideCallbackList, callback);
    },

    /**
     * 更新阶段
     * @param callback {Function}
     * @returns {Controller}
     */
    update: function (callback) {
        return this[_pushCallback](_updateCallbackList, callback);
    },

    /**
     * 导出
     * @returns {{init: init, install: install, show: show, hide: hide, update: update}}
     */
    export: function () {
        return this[_exports];
    },

    /**
     * 同步
     * @returns {Controller}
     */
    sync: function () {
        return this[_sync]();
    },

    /**
     * 销毁
     */
    destroy: function () {
        var the = this;

        the[_installCallbackList]
            = the[_showCallbackList]
            = the[_hideCallbackList]
            = the[_updateCallbackList]
            = the[_exports]
            = null;
        Controller.invoke('destroy', the);
    }
});
var prop = Controller.prototype;
var sole = Controller.sole;
var _installCallbackList = sole();
var _showCallbackList = sole();
var _hideCallbackList = sole();
var _updateCallbackList = sole();
var _pushCallback = sole();
var _execCallback = sole();
var _exports = sole();
var _sync = sole();

prop[_sync] = function () {
    var the = this;
    var view = the.view;

    if (view && view.elId) {
        // MVVM 会将根节点进行替换，需要重新查找
        view.el = view.viewEl = selector.query('#' + view.elId)[0];
    }

    return the;
};

prop[_pushCallback] = function (name, callback) {
    var the = this;
    the[name].push(fun.ensure(callback));
    return the;
};

prop[_execCallback] = function (name, args) {
    var the = this;
    var view = args[0];
    var route = args[1];

    the.view = view;
    the.route = route;
    array.each(the[name], function (inde, callback) {
        the[_sync]();
        callback.call(win, view, route);
    });

    return the;
};

module.exports = Controller;
