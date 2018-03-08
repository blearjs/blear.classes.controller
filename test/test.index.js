/**
 * karma 测试 文件
 * @author ydr.me
 * @create 2016-05-17 12:13
 */


'use strict';

var Controller = require('../src/index.js');

describe('单元测试', function () {
    it('返回的对象属性完整', function (done) {
        var ctrl = new Controller();
        var exports = ctrl.export();

        expect(typeof exports.init).toBe('function');
        expect(typeof exports.install).toBe('function');
        expect(typeof exports.show).toBe('function');
        expect(typeof exports.hide).toBe('function');
        expect(typeof exports.update).toBe('function');
        ctrl.destroy();
        done();
    });

    it('install 能够正常运行', function (done) {
        var ctrl = new Controller();
        var called1Times = 0;
        var called2Times = 0;
        var calledList = [];

        ctrl.install(function () {
            called1Times++;
            calledList.push(0);
        });

        ctrl.install(function () {
            called2Times++;
            calledList.push(1);
        });

        var exports = ctrl.export();

        exports.install();
        expect(called1Times).toBe(1);
        expect(called2Times).toBe(1);
        expect(calledList.length).toBe(2);
        expect(calledList[0]).toBe(0);
        expect(calledList[1]).toBe(1);

        ctrl.destroy();
        done();
    });

    it('show 能够正常运行', function (done) {
        var ctrl = new Controller();
        var called1Times = 0;
        var called2Times = 0;
        var calledList = [];

        ctrl.show(function () {
            called1Times++;
            calledList.push(0);
        });

        ctrl.show(function () {
            called2Times++;
            calledList.push(1);
        });

        var exports = ctrl.export();

        exports.show();
        expect(called1Times).toBe(1);
        expect(called2Times).toBe(1);
        expect(calledList.length).toBe(2);
        expect(calledList[0]).toBe(0);
        expect(calledList[1]).toBe(1);

        ctrl.destroy();
        done();
    });

    it('hide 能够正常运行', function (done) {
        var ctrl = new Controller();
        var called1Times = 0;
        var called2Times = 0;
        var calledList = [];

        ctrl.hide(function () {
            called1Times++;
            calledList.push(0);
        });

        ctrl.hide(function () {
            called2Times++;
            calledList.push(1);
        });

        var exports = ctrl.export();

        exports.hide();
        expect(called1Times).toBe(1);
        expect(called2Times).toBe(1);
        expect(calledList.length).toBe(2);
        expect(calledList[0]).toBe(0);
        expect(calledList[1]).toBe(1);

        ctrl.destroy();
        done();
    });

    it('update 能够正常运行', function (done) {
        var ctrl = new Controller();
        var called1Times = 0;
        var called2Times = 0;
        var calledList = [];

        ctrl.update(function () {
            called1Times++;
            calledList.push(0);
        });

        ctrl.update(function () {
            called2Times++;
            calledList.push(1);
        });

        var exports = ctrl.export();

        exports.update();
        expect(called1Times).toBe(1);
        expect(called2Times).toBe(1);
        expect(calledList.length).toBe(2);
        expect(calledList[0]).toBe(0);
        expect(calledList[1]).toBe(1);

        ctrl.destroy();
        done();
    });

    it('#title 控制器导出初始化之前', function () {
        var ctrl = new Controller();
        var title = 'aaa';

        ctrl.title(title);
        var exports = ctrl.export();

        expect(exports.title).toBe(title);
    });

    it('#title 控制器导出初始化之后', function () {
        var ctrl = new Controller();
        var exports = ctrl.export();
        var title1 = 'aaa';
        var title2 = '';
        var view = {
            title: function (title) {
                title2 = title;
            }
        };
        var route = {};
        exports.init(view, route);
        ctrl.title(title1);

        expect(title2).toEqual(title1);
    });
});
