"use strict";

describe("jlUtil module", function() {
  beforeEach(module("jlUtil", function($provide) {
    $provide.value('jlWindow', new test.mockWindow());
  }));

  describe("util service", function() {
    var util, $timeout;

    beforeEach(inject(function(_$timeout_, _util_) {
      $timeout = _$timeout_;
      util = _util_;

      jasmine.clock().install();
    }));

    describe("util.debounce", function() {
      it("should transform a flurry of calls into two, separated by 'delay' milliseconds", function() {
        var obj = { fn: function() {} };
        spyOn(obj, 'fn');

        var fn = util.debounce(obj.fn, 1000);

        var baseTime = new Date(2013, 9, 23);
        jasmine.clock().mockDate(baseTime);

        fn();
        fn();
        fn();
        fn();
        fn();

        $timeout.flush(0);
        jasmine.clock().tick(0);
        expect(obj.fn.calls.count()).toEqual(1);

        $timeout.flush(999);
        jasmine.clock().tick(999);
        expect(obj.fn.calls.count()).toEqual(1);

        $timeout.flush(1);
        jasmine.clock().tick(1);
        expect(obj.fn.calls.count()).toEqual(2);

        $timeout.flush(10000);
        jasmine.clock().tick(10000);
        expect(obj.fn.calls.count()).toEqual(2);
      });

      it("should limit calls to once per 'delay' milliseconds", function() {
        var obj = { fn: function() {} };
        spyOn(obj, 'fn');

        var fn = util.debounce(obj.fn, 1000);

        var baseTime = new Date(2013, 9, 23);
        jasmine.clock().mockDate(baseTime);

        var dt = 57;
        for (var t = 0; t < 10000; t += dt) {
          fn();

          expect(obj.fn.calls.count()).toEqual(1 + Math.floor(t / 1000));

          $timeout.flush(dt);
          jasmine.clock().tick(dt);
        }

        $timeout.flush(100000);
        jasmine.clock().tick(100000);

        expect(obj.fn.calls.count()).toEqual(11);
      });
    });

    describe("util.element", function() {
      var element;

      beforeEach(inject(function() {
        var html =
          "<div>" +
          "  <div id='div_1' class='class_a'>" +
          "    <p id='p_1' class='class_b'></p>" +
          "  </div>" +
          "  <span id='span_1' class='class_c'></span>" +
          "</div>";

        element = jQuery(html);
        element.appendTo(document.body);
      }));

      afterEach(function() {
        document.body.removeChild(element.get(0));
      });

      it("should retrieve element(s) by id", function() {
        expect(util.element("#div_1").get(0).id).toEqual("div_1");
      });

      it("should retrieve element(s) by class", function() {
        expect(util.element(".class_c").get(0).id).toEqual("span_1");
      });

      it("should retrieve element(s) by tag name", function() {
        expect(util.element("p").get(0).id).toEqual("p_1");
      });

      it("should return null for unmatching selector", function() {
        expect(util.element("nope")).toEqual(null);
      });
    });

    describe("util.bind", function() {
      it("should bind function to specified context", function() {
        var Obj = function() {
          this.property = "change me";

          this.fn = function() {
            this.property = "this is a test";
          };
        };

        var obj = new Obj();
        var obj_fn = obj.fn;

        var parent = {
          property: "don't change me",
          fn: util.bind(obj, obj_fn)
        };

        parent.fn();

        expect(parent.property).toEqual("don't change me");
        expect(obj.property).toEqual("this is a test");
      });
    });

    describe("util.isWindow", function() {
      it("should correctly identify window element", inject(function(jlWindow) {
        var e = jQuery("<div></div>");

        expect(util.isWindow(e)).toEqual(false);
        expect(util.isWindow(jlWindow)).toEqual(true);
      }));
    });

    describe("util.posWithinParent", function() {
      it("should correctly report position, taking scrolling into account", function() {
        var html = "";
        html += "<div id='element1' style='position: absolute; top: 100px; width: 500px; height: 100px; overflow-y: scroll'>";
        html += "  <div id='element2' style='position: relative; height: 1000px; top: 0; left: 0'>";
        html += "    <div id='target' style='position: relative; height: 50px; top: 50px; left: 0'></div>";
        html += "  </div>";
        html += "</div>";

        var root = jQuery(html);
        root.appendTo(document.body);

        var element1 = root;
        var target = root.find("#target");

        element1.scrollTop(80);
        element1.triggerHandler("scroll");

        expect(util.posWithinParent(target, element1).y).toEqual(50);

        document.body.removeChild(root.get(0));
      });
    });

    describe("util.relativePos", function() {
      it("should correctly report position, taking scrolling into account", function() {
        var html = "";
        html += "<div id='element1' style='position: absolute; top: 100px; width: 500px; height: 100px; overflow-y: scroll'>";
        html += "  <div id='element2' style='position: relative; height: 1000px; top: 0; left: 0'>";
        html += "    <div id='target' style='position: relative; height: 50px; top: 50px; left: 0'></div>";
        html += "  </div>";
        html += "</div>";

        var root = jQuery(html);
        root.appendTo(document.body);

        var element1 = root;
        var target = root.find("#target");

        element1.scrollTop(80);

        expect(util.relativePos(target, element1).y).toEqual(-30);

        document.body.removeChild(root.get(0));
      });
    });

    describe("util.shallowCopy", function() {
      it("should create a shallow copy of the object", function() {
        var obj1 = {
          key1: "val1",
          key2: "val2",
          key3: {
            key3_1: "val3_1",
            key3_2: "val3_2"
          },
          key4: "val4"
        };

        var obj2 = util.shallowCopy(obj1);
        obj2.key3.key3_3 = "new key";

        expect(obj1).toEqual(obj2);
        expect(obj1.key3.key3_3).toEqual("new key");
      });
    });

    describe("util.setYWithinParent", function() {
      var root, element1, target;

      beforeEach(function() {
        var html = "";
        html += "<div id='element1' style='position: absolute; top: 100px; width: 500px; height: 100px; overflow-y: scroll'>";
        html += "  <div id='element2' style='position: relative; height: 1000px; top: 0; left: 0'>";
        html += "    <div id='target' style='position: relative; height: 50px; top: 50px; left: 0'></div>";
        html += "  </div>";
        html += "</div>";

        root = jQuery(html);
        root.appendTo(document.body);

        element1 = root;
        target = root.find("#target");
      });

      afterEach(function() {
        document.body.removeChild(root.get(0));
      });

      it("should position the element correctly inside its parent", function() {
        element1.scrollTop(80);

        util.setYWithinParent(target, element1, 400);
        expect(util.posWithinParent(target, element1).y).toEqual(400);
      });

      it("should position the element correctly inside the window", inject(function(jlWindow) {
        jlWindow.scrollTop(80);

        util.setYWithinParent(target, jlWindow, 400);
        expect(util.posWithinParent(target, jlWindow).y).toEqual(400);
      }));
    });

    describe("util.setRelativeY", function() {
      var root, element1, target;

      beforeEach(function() {
        var html = "";
        html += "<div id='element1' style='position: absolute; top: 100px; width: 500px; height: 100px; overflow-y: scroll'>";
        html += "  <div id='element2' style='position: relative; height: 1000px; top: 0; left: 0'>";
        html += "    <div id='target' style='position: relative; height: 50px; top: 50px; left: 0'></div>";
        html += "  </div>";
        html += "</div>";

        root = jQuery(html);
        root.appendTo(document.body);

        element1 = root;
        target = root.find("#target");
      });

      afterEach(function() {
        document.body.removeChild(root.get(0));
      });

      it("should position the element correctly inside its parent", function() {
        element1.scrollTop(80);

        util.setRelativeY(target, element1, 400);
        expect(util.relativePos(target, element1).y).toEqual(400);
      });

      it("should position the element correctly inside the window", inject(function(jlWindow) {
        jlWindow.scrollTop(80);

        util.setRelativeY(target, jlWindow, 400);
        expect(util.relativePos(target, jlWindow).y).toEqual(400);
      }));
    });
  });
});
