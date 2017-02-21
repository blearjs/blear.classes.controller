/**
 * blear.classes.controller
 * @author ydr.me
 * @create 2016年06月04日14:09:36
 */

'use strict';



var random = require('blear.utils.random');
var typeis = require('blear.utils.typeis');
var object = require('blear.utils.object');
var array = require('blear.utils.array');
var access = require('blear.utils.access');
var plan = require('blear.utils.plan');
var fun = require('blear.utils.function');
var Events = require('blear.classes.events');

var eventTransmit = new Events();

var COMPONENT_FLAG = random.guid();
var DEFAULT_EVENT_TYPE = random.guid();
var Controller = Events.extend({
    className: 'Controller',
    constructor: function () {
        var the = this;

        Controller.parent(the);
        the.name = the.guid = random.guid();
        the.view = the.route = null;
        the[_installCallbackList] = [];
        the[_destroyCallbackList] = [];
        the[_showCallbackList] = [];
        the[_updateCallbackList] = [];
        the[_hideCallbackList] = [];
        the[_exports] = {
            watch: function (view, route) {
                the.view = view;
                the.route = route;
            },
            enter: function () {
                the.emit('beforeInstall');
                the[_installCallbackList].push(function () {
                    the.emit('afterInstall');
                });
                the[_execute](the[_installCallbackList]);
            },
            leave: function (view, route, next) {
                next(true);
            },
            destroy: function () {
                the.emit('beforeDestroy');
                the[_destroyCallbackList].push(function () {
                    the.emit('afterDestroy');
                });
                the[_execute](the[_destroyCallbackList]);
            },
            beforeShow: function (options) {
                the.emit('beforeShow', options);
            },
            show: function () {
                the[_execute](the[_showCallbackList]);
            },
            afterShow: function (options) {
                the.emit('afterShow', options);
            },
            update: function () {
                the.emit('beforeUpdate');
                the[_updateCallbackList].push(function () {
                    the.emit('afterUpdate');
                });
                the[_execute](the[_updateCallbackList]);
            },
            beforeHide: function (options) {
                the.emit('beforeHide', options);
            },
            hide: function (view, route, next) {
                the[_execute](the[_hideCallbackList], next);
            },
            afetrHide: function (options) {
                the.emit('afterHide', options);
            }
        };
    },

    /**
     * 设置一个名字，用于事件传递
     * @param name
     * @returns {Controller}
     */
    as: function (name) {
        this.name = name;
        return this;
    },

    /**
     * 给目标发送数据
     * @param target {Controller} 目标控制器
     * @param [type] {String} 事件类型，可选
     * @param data {*} 发送的数据
     * @returns {Controller}
     */
    send: function (target, type, data) {
        var the = this;
        var args = access.args(arguments);

        if (args.length === 2) {
            data = args[1];
            type = DEFAULT_EVENT_TYPE;
        }

        eventTransmit.emit(combineEventType(target, type), data, the);
        return the;
    },

    /**
     * 接收数据
     * @param [type] {String} 事件类型，可选
     * @param callback {Function} 回调
     * @argument callback: data {*} 接收的数据
     * @argument callback: source {Controller} 来源
     * @returns {Controller}
     */
    receive: function (type, callback) {
        var the = this;
        var args = access.args(arguments);

        if (args.length === 1) {
            callback = args[0];
            type = DEFAULT_EVENT_TYPE;
        }

        eventTransmit.on(combineEventType(the.name, type), callback);
        return the;
    },

    /**
     * 修改文档标题
     * @param title
     * @returns {Controller}
     */
    setTitle: function (title) {
        var the = this;

        if (the.view) {
            the.view.title(title);
        } else {
            the[_exports].title = title;
        }

        return the;
    },

    /**
     * 安装组件，自动管理，会在页面销毁的时候自动销毁
     * @param Component
     * @param ...args
     * @returns {*}
     */
    component: function (Component/*...args*/) {
        var args = access.args(arguments).slice(1);
        args.unshift(null);
        args.unshift(Component);
        var component = new (fun.bind.apply(null, args));
        component[COMPONENT_FLAG] = true;
        return component;
    },

    /**
     * 页面安装时需要做的事情
     * @param callback {Function} 事情
     * @returns {Controller}
     */
    install: function (callback) {
        return this[_autoBind](callback, _installCallbackList);
    },

    /**
     * 页面销毁时需要做的事情
     * @param callback {Function} 事情
     * @returns {Controller}
     */
    destroy: function (callback) {
        return this[_autoBind](callback, _destroyCallbackList);
    },

    /**
     * 页面展示时需要做的事情
     * @param callback {Function} 事情
     * @returns {Controller}
     */
    show: function (callback) {
        return this[_autoBind](callback, _showCallbackList);
    },

    /**
     * 页面更新时需要做的事情
     * @param callback {Function} 事情
     * @returns {Controller}
     */
    update: function (callback) {
        return this[_autoBind](callback, _updateCallbackList);
    },

    /**
     * 页面隐藏时需要做的事情
     * @param callback {Function} 事情
     * @returns {Controller}
     */
    hide: function (callback) {
        return this[_autoBind](callback, _hideCallbackList);
    },

    /**
     * 导出
     * @returns {{}|*}
     */
    export: function () {
        var the = this;

        // 销毁组件
        the.destroy(function () {
            object.each(the, function (key, val) {
                // 如果是组件，则进行销毁，并且置为 null
                if (val && val[COMPONENT_FLAG]) {
                    try {
                        the[key].destroy();
                    } catch (err) {
                        // ignore
                    }
                    the[key] = null;
                }
            });
            the.view = the.route = null;
        });

        return this[_exports];
    }
});

var sole = Controller.sole;
var _installCallbackList = sole();
var _destroyCallbackList = sole();
var _showCallbackList = sole();
var _updateCallbackList = sole();
var _hideCallbackList = sole();
var _exports = sole();
var _bind = sole();
var _autoBind = sole();
var _execute = sole();
var pro = Controller.prototype;

pro[_bind] = function (callback, callbackList) {
    if (typeis.Function(callback)) {
        callbackList.push(callback);
    }
};

pro[_execute] = function (callbackList, next) {
    var the = this;

    // 异步离开的回调
    if (next) {
        var hidePlan = plan.wait(1);

        array.each(callbackList, function (index, callback) {
            if (callback.length === 3) {
                hidePlan = hidePlan.task(function (next) {
                    callback.call(the, the.view, next);
                });
            } else {
                hidePlan = hidePlan.taskSync(function () {
                    callback.call(the, the.view);
                });
            }
        });

        hidePlan
        // 串行
            .serial(function () {
                next(true);
            });
    } else {
        array.each(callbackList, function (index, callback) {
            callback.call(the, the.view);
        });
    }
};

pro[_autoBind] = function autoPrototype(callbck, listName) {
    var the = this;

    if (typeis.Function(callbck)) {
        the[listName].push(callbck);
    }

    return the;
};

module.exports = Controller;


/**
 * 合并事件名称，分隔符为 ":"
 * @param ctrl
 * @param type
 * @returns {string}
 */
function combineEventType(ctrl, type) {
    return [ctrl, type].join(':');
}
