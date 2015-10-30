(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Auxin = function(point) {
    this.point = point;
    this.isDoomed = false;

    this.taggedVenations = [];

    this.id = Auxin.progressive;
    Auxin.progressive++;
}

Auxin.progressive = 0;

module.exports = Auxin;

},{}],2:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("./configuration.json");

var CirclesRenderer = function() {

    function drawVenations(venations) {

        var totalVenations = venations.length;
        for (var i = 0; i < totalVenations; i++) {

            if (!venations[i].rendered) {
                var venationPath = new Path.Circle({
                    center: [
                        venations[i].point.x * view.viewSize.width,
                        venations[i].point.y * view.viewSize.height
                    ],
                    radius: view.viewSize.width * configuration.venationRadius,
                    fillColor: configuration.rendererConfiguration.venationStrokeColor,
                    strokeColor: configuration.rendererConfiguration.venationStrokeColor,
                    strokeWidth: configuration.rendererConfiguration.venationStrokeWidth
                });

                venations[i].rendered = venationPath;
            }
            else {
                if (configuration.rendererConfiguration.venationStrokeWidthAging) {
                    venations[i].strokeWidth += configuration.rendererConfiguration.venationStrokeWidthAgingFactor;
                }
                if (configuration.rendererConfiguration.venationStrokeColorAging && venations[i].age > parent.age / 1.5) {
                    venations[i].strokeColor -= configuration.rendererConfiguration.venationStrokeColorAgingFactor;
                }
            }
        }
    }

    function drawAuxins(auxins) {

        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var auxinPath = new Path.Circle({
                center: [
                    auxins[i].point.x * view.viewSize.width,
                    auxins[i].point.y * view.viewSize.height
                ],
                radius: view.viewSize.width * configuration.auxinRadius,
                strokeColor: configuration.rendererConfiguration.auxinStrokeColor
            });
        }
    }

    return {
        init: function() {

            switch (configuration.shape) {
                case 'square':
                    var background = new Path.Rectangle({
                        "x": 0,
                        "y": 0,
                        "width": view.viewSize.width,
                        "height": view.viewSize.height,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
                    break;
                case 'circle':
                default:
                    var background = new Path.Circle({
                        "center": [view.viewSize.width / 2, view.viewSize.height / 2],
                        "radius": view.viewSize.width / 2,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
            }

            OpenVenationAlgorithm.init();
            if (configuration.rendererConfiguration.drawAuxins === true) {
                drawAuxins(OpenVenationAlgorithm.getAuxins());
            }
        },
        draw: function() {

            if (OpenVenationAlgorithm.isFinished()) {
                return false;
            }

            drawVenations(OpenVenationAlgorithm.getVenations());

            OpenVenationAlgorithm.step();

            return true;
        }
    }
}

module.exports = CirclesRenderer();

},{"./OpenVenationAlgorithm":4,"./configuration.json":8}],3:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("./configuration.json");

var LinesRenderer = function() {

    var renderedVenations = {};

    function drawSeedVenations(venations) {
        var seeds = _.first(venations, configuration.seedVenations);
        var totalSeeds = seeds.length;
        for (var i = 0; i < totalSeeds; i++) {
            drawVenations(seeds[i].childs, seeds[i]);
        }
    }

    function drawVenations(childs, parent) {

        var totalVenations = childs.length;
        for (var i = 0; i < totalVenations; i++) {
            if (!renderedVenations[childs[i].id]) {
                var venationPath = new Path.Line({
                    from: new Point(
                        parent.point.x * view.viewSize.width,
                        parent.point.y * view.viewSize.height
                    ),
                    to: new Point(
                        childs[i].point.x * view.viewSize.width,
                        childs[i].point.y * view.viewSize.height
                    ),
                    strokeColor: configuration.rendererConfiguration.venationStrokeColor,
                    strokeWidth: configuration.rendererConfiguration.venationStrokeWidth,
                    strokeCap: 'round',
                    strokeJoin: 'round'
                });

                renderedVenations[childs[i].id] = venationPath;
            }
            else {
                if (configuration.rendererConfiguration.venationStrokeWidthAging) {
                    renderedVenations[childs[i].id].strokeWidth += configuration.rendererConfiguration.venationStrokeWidthAgingFactor;
                }
                if (configuration.rendererConfiguration.venationStrokeColorAging && childs[i].age > parent.age / 1.5) {
                    renderedVenations[childs[i].id].strokeColor -= configuration.rendererConfiguration.venationStrokeColorAgingFactor;
                }
            }

            if (childs[i].childs.length > 0) {
                if (configuration.rendererConfiguration.twisted === true) {
                    drawVenations(childs[i].childs, childs[i].parent);
                }
                else {
                    drawVenations(childs[i].childs, childs[i]);
                }
            }
        }
    }

    function drawAuxins(auxins) {

        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var auxinPath = new Path.Circle({
                center: [
                    auxins[i].point.x * view.viewSize.width,
                    auxins[i].point.y * view.viewSize.height
                ],
                radius: view.viewSize.width * configuration.auxinRadius,
                strokeColor: configuration.rendererConfiguration.auxinStrokeColor
            });
        }
    }

    return {
        init: function() {

            switch (configuration.shape) {
                case 'square':
                    var background = new Path.Rectangle({
                        "x": 0,
                        "y": 0,
                        "width": view.viewSize.width,
                        "height": view.viewSize.height,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
                    break;
                case 'circle':
                default:
                    var background = new Path.Circle({
                        "center": [view.viewSize.width / 2, view.viewSize.height / 2],
                        "radius": view.viewSize.width / 2,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
            }

            OpenVenationAlgorithm.init();
            if (configuration.rendererConfiguration.drawAuxins === true) {
                drawAuxins(OpenVenationAlgorithm.getAuxins());
            }
        },
        draw: function() {

            if (OpenVenationAlgorithm.isFinished()) {
                /*console.log(renderedVenations);
                var ids = _.keys(renderedVenations);
                var i = 2;
                do {
                    renderedVenations[(i - 1)] = renderedVenations[(i - 1)].unite(renderedVenations[i]);
                    renderedVenations[(i - 1)].smooth();
                    renderedVenations[i].remove();
                    i++;
                }
                while(i < ids.length)

                console.log(renderedVenations);*/
                return false;
            }

            drawSeedVenations(OpenVenationAlgorithm.getVenations());

            OpenVenationAlgorithm.step();

            return true;
        }
    }
}

module.exports = LinesRenderer();

},{"./OpenVenationAlgorithm":4,"./configuration.json":8}],4:[function(require,module,exports){
var Auxin = require("./Auxin.js");
var Venation = require("./Venation.js");
var configuration = require("./configuration.json");

var OpenVenationAlgorithm = function() {

    var validVenationThreeshold = configuration.maxVenationNodeAge;

    var venations = [];
    var auxins = [];
    var finished = false;

    function init() {

        function getRandomCirclePoint() {
            var t = 2 * Math.PI * Math.random();
            var r = Math.random() * (0.5 - configuration.seedsCenteringFactor);
            var x = 0.5 + r * Math.cos(t);
            var y = 0.5 + r * Math.sin(t);

            return new Point(x, y);
        }

        function getRandomSquarePoint() {
            var x = Math.max(Math.random() - configuration.seedsCenteringFactor, 0);
            var y = Math.max(Math.random() - configuration.seedsCenteringFactor, 0);
            return new Point(x, y);
        }

        function getRandomPoint() {
            switch (configuration.shape) {
                case 'square':
                    return getRandomSquarePoint();
                case 'circle':
                default:
                    return getRandomCirclePoint();
            }
        }

        function seedVenations() {
            var loopCounter = 0;
            while (venations.length < configuration.seedVenations && loopCounter < configuration.seedVenations * 1.5) {
                // seed auxin inside a circle
                var point = getRandomPoint();
                if (!hitTestVenation(point)) {
                    venations.push(new Venation(point));
                }

                loopCounter++;
            }
        }

        function seedAuxins() {
            var loopCounter = 0;
            while (auxins.length < configuration.seedAuxins && loopCounter < configuration.seedAuxins * 1.5) {
                // seed auxin inside a circle
                var point = getRandomPoint();
                if (!hitTestAuxin(point) && !hitTestVenation(point)) {
                    auxins.push(new Auxin(point));
                }

                loopCounter++;
            }
        }

        seedVenations();
        seedAuxins();
    }

    function hitTestAuxin(point) {
        var auxinHitRadius = configuration.threesholdAuxinRadius;
        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var d = point.getDistance(auxins[i].point, true);
            if (d < auxinHitRadius) {
                return true;
            }
        }

        return false;
    }

    function hitTestVenation(point) {
        var venationHitRadius = configuration.threesholdVenationRadius * configuration.threesholdVenationRadius;
        var totalVenations = venations.length;

        for (var i = 0; i < totalVenations; i++) {
            var d = point.getDistance(venations[i].point, true);
            if (d < venationHitRadius) {
                return true;
            }
        }

        return false;
    }

    function hasValidVenations() {
        var totalVenations = venations.length;
        var validVenations = venations.length;
        for (var i = 0; i < totalVenations; i++) {
            if (venations[i].age >= validVenationThreeshold) {
                validVenations--;
            }
        }

        return validVenations;
    }

    function step() {

        if (!hasValidVenations()) {
            finished = true;
            return;
        }

        placeVenations();
        killAuxins();
    }

    function placeVenations() {
        var totalVenations = venations.length;

        for (var i = 0; i < totalVenations; i++) {
            if (venations[i].age < validVenationThreeshold) {
                placeVenation(venations[i]);
            }
            venations[i].age++;
        }
    }

    function placeVenation(venation) {
        var influencerAuxins = getInfluencerAuxins(venation);
        var p = getAuxinInfluenceDirection(venation, influencerAuxins);

        if (p === null) {
            return;
        }

        p *= 2 * configuration.venationRadius;
        p = p + venation.point;

        var newVenation = new Venation(p);
        newVenation.parent = venation;

        venations.push(newVenation);
        venation.childs.push(newVenation);
    }

    function getAuxinInfluenceDirection(venation, influencerAuxins) {
        var result = new Point(0, 0);
        var totalInfluencerAuxins = influencerAuxins.length;

        if (!totalInfluencerAuxins) {
            return null;
        }

        for (var i = 0; i < totalInfluencerAuxins; i++) {
            var p = influencerAuxins[i].point - venation.point;
            p = p.normalize();
            result = result + p;
        }

        if (result.length < 1) {
            var p = influencerAuxins[0].point - venation.point;
            result = p.normalize();
        }
        else {
            result = result.normalize();
        }

        return result;
    }

    function getInfluencerAuxins(venation) {
        if (venation.neighborAuxins === null) {
            venation.neighborAuxins = getNeighborAuxins(venation.point);
        }
        var influencerAuxins = [];
        var totalNeighborAuxins = venation.neighborAuxins.length;
        for (var i = 0; i < totalNeighborAuxins; i++) {
            var influencedVenations = getInfluencedVenations(venation.neighborAuxins[i].point);
            var isInfluenced = false;
            for (var c = 0; c < influencedVenations.length; c++) {
                if (influencedVenations[c].point == venation.point) {
                    isInfluenced = true;
                    break;
                }
            }
            if (isInfluenced) {
                influencerAuxins.push(venation.neighborAuxins[i]);
            }
        }

        return influencerAuxins;
    }

    function getNeighborAuxins(point) {
        var neighborhoodRadius = configuration.neighborhoodRadius;
        var neighborAuxins = [];
        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var d = point.getDistance(auxins[i].point, true);
            if (d < neighborhoodRadius) {
                neighborAuxins.push(auxins[i]);
            }
        }

        return neighborAuxins;
    }

    function getInfluencedVenations(point) {
        var relativeNeighborVenations = getRelativeNeighborVeinNodes(point);
        var totalRelativeNeighborVenations = relativeNeighborVenations.length;
        for (var i = 0; i < totalRelativeNeighborVenations; i++) {
            var s = relativeNeighborVenations[i].point - point;
            if (s.length < configuration.threesholdVenationRadius) {
                relativeNeighborVenations.splice(i, 1);
                totalRelativeNeighborVenations--;
                i--;
            }
        }

        return relativeNeighborVenations;
    }

    function getRelativeNeighborVeinNodes(point) {
        var neighborVenations = getNeighborVenations(point);
        var relativeNeighborVenations = [];
        var totalNeighborVenations = neighborVenations.length;
        for (var i = 0; i < totalNeighborVenations; i++) {
            var auxinToP0 = neighborVenations[i].point - point;
            var fail = false;

            for (var c = 0; c < totalNeighborVenations; c++) {
                if (neighborVenations[i].point == neighborVenations[c].point) {
                    continue;
                }
                var auxinToP1 = neighborVenations[c].point - point;
                if (auxinToP1.length > auxinToP0.length) {
                    continue;
                }
                var p0ToP1 = neighborVenations[c].point - neighborVenations[i].point;
                if (auxinToP0.length > p0ToP1.length) {
                  fail = true;
                  break;
                }
            }

            if (!fail) {
                relativeNeighborVenations.push(neighborVenations[i]);
            }
        }

        return relativeNeighborVenations;
    }

    function getNeighborVenations(point) {
        var neighborhoodRadius = 4.0 * configuration.neighborhoodRadius * configuration.neighborhoodRadius;
        var neighborVenations = [];
        var totalVenations = venations.length;
        for (var i = 0; i < totalVenations; i++) {
            var d = point.getDistance(venations[i].point, true);
            if (d < neighborhoodRadius) {
                neighborVenations.push(venations[i]);
            }
        }

        return neighborVenations;
    }

    function killAuxins() {
        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var auxin = auxins[i];
            if (auxin.isDoomed) {
                var influencedVenations = getInfluencedVenations(auxin.point);
                var taggedVenations = auxin.taggedVenations;
                var totalTaggedVenations = taggedVenations.length;
                for (var t = 0; t < totalTaggedVenations; t++) {
                    var taggedVenation = taggedVenations[t];
                    var d = (taggedVenation.point - auxin.point).length;
                    if (d < configuration.threesholdVenationRadius || _.contains(influencedVenations, taggedVenation)) {
                        taggedVenations.splice(t, 1);
                        totalTaggedVenations--;
                        t--;
                    }
                }

                if (taggedVenations.length <= 0) {
                    auxins.splice(i, 1);
                    totalAuxins--;
                    i--;
                }
            }
            else {
                if (hitTestVenation(auxin.point)) {
                    var influencedVenations = getInfluencedVenations(auxin.point);
                    if (influencedVenations.length > 0) {
                        auxin.isDoomed = true;
                        auxin.taggedVenations = influencedVenations;
                    }
                    else {
                        auxins.splice(i, 1);
                        totalAuxins--;
                        i--;
                    }
                }
            }
        }
    }

    return {
        "init": init,
        "step": step,
        "getAuxins": function() {
            return auxins;
        },
        "getVenations": function() {
            return venations;
        },
        "isFinished": function() {
            return finished;
        }
    }
}

module.exports = OpenVenationAlgorithm();

},{"./Auxin.js":1,"./Venation.js":7,"./configuration.json":8}],5:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("./configuration.json");

var PathRenderer = function() {

    var renderedVenations = {};
    var venationsPath = new CompoundPath({
        strokeColor: configuration.rendererConfiguration.venationStrokeColor
    });

    function drawSeedVenations(venations) {
        var seeds = _.first(venations, configuration.seedVenations);
        var totalSeeds = seeds.length;
        for (var i = 0; i < totalSeeds; i++) {
            drawVenations(seeds[i].childs, seeds[i]);
        }
    }

    function drawVenations(childs, parent) {

        var iterationRenders = [];
        var totalVenations = childs.length;
        for (var i = 0; i < totalVenations; i++) {
            var incrementNext = false;
            if (!renderedVenations[childs[i].id]) {

                if (typeof childs[(i + 1)] !== "undefined" && childs[i].point.getAngle(childs[(i + 1)].point) > 2) {
                    var venationSegment = new Path(new Segment(
                        new Point(
                            parent.point.x * view.viewSize.width,
                            parent.point.y * view.viewSize.height
                        ),
                        new Point(
                            childs[i].point.x * view.viewSize.width,
                            childs[i].point.y * view.viewSize.height
                        ),
                        new Point(
                            childs[(i + 1)].point.x * view.viewSize.width,
                            childs[(i + 1)].point.y * view.viewSize.height
                        )
                    ));

                    incrementNext = true;
                }
                else {
                    var venationSegment = new Path({
                        strokeColor: configuration.rendererConfiguration.venationStrokeColor
                    });

                    venationSegment.add(new Point(
                        parent.point.x * view.viewSize.width,
                        parent.point.y * view.viewSize.height
                    ));

                    venationSegment.add(new Point(
                        childs[i].point.x * view.viewSize.width,
                        childs[i].point.y * view.viewSize.height
                    ));
                }

                venationSegment.strokeWidth = configuration.rendererConfiguration.venationStrokeWidth;
                venationSegment.strokeColor = configuration.rendererConfiguration.venationStrokeColor;
                venationSegment.strokeCap = 'round';
                venationSegment.strokeJoin = 'round';

                renderedVenations[childs[i].id] = venationSegment;
            }
            else {
                if (configuration.rendererConfiguration.venationStrokeWidthAging) {
                    renderedVenations[childs[i].id].strokeWidth += configuration.rendererConfiguration.venationStrokeWidthAgingFactor;
                }
                if (configuration.rendererConfiguration.venationStrokeColorAging && childs[i].age > parent.age / 1.5) {
                    renderedVenations[childs[i].id].strokeColor -= configuration.rendererConfiguration.venationStrokeColorAgingFactor;
                }
            }

            if (childs[i].childs.length > 0) {
                if (configuration.rendererConfiguration.twisted === true) {
                    drawVenations(childs[i].childs, childs[i].parent);
                }
                else {
                    drawVenations(childs[i].childs, childs[i]);
                }
            }

            if (incrementNext) {
                i++;
                if (typeof renderedVenations[childs[i].id] !== "undefined") {
                    renderedVenations[childs[i].id].remove();
                }
            }

        }

        venationsPath.bringToFront();
    }

    function drawAuxins(auxins) {

        var totalAuxins = auxins.length;
        for (var i = 0; i < totalAuxins; i++) {
            var auxinPath = new Path.Circle({
                center: [
                    auxins[i].point.x * view.viewSize.width,
                    auxins[i].point.y * view.viewSize.height
                ],
                radius: view.viewSize.width * configuration.auxinRadius,
                strokeColor: configuration.rendererConfiguration.auxinStrokeColor
            });
        }
    }

    return {
        init: function() {

            switch (configuration.shape) {
                case 'square':
                    var background = new Path.Rectangle({
                        "x": 0,
                        "y": 0,
                        "width": view.viewSize.width,
                        "height": view.viewSize.height,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
                    break;
                case 'circle':
                default:
                    var background = new Path.Circle({
                        "center": [view.viewSize.width / 2, view.viewSize.height / 2],
                        "radius": view.viewSize.width / 2,
                        "fillColor": configuration.rendererConfiguration.shapeFillColor,
                        "strokeColor": configuration.rendererConfiguration.shapeStrokeColor,
                        "strokeWidth": configuration.rendererConfiguration.shapeStrokeWidth
                    });
            }

            OpenVenationAlgorithm.init();
            if (configuration.rendererConfiguration.drawAuxins === true) {
                drawAuxins(OpenVenationAlgorithm.getAuxins());
            }
        },
        draw: function() {

            if (OpenVenationAlgorithm.isFinished()) {
                return false;
            }

            drawSeedVenations(OpenVenationAlgorithm.getVenations());

            OpenVenationAlgorithm.step();

            return true;
        }
    }
}

module.exports = PathRenderer();

},{"./OpenVenationAlgorithm":4,"./configuration.json":8}],6:[function(require,module,exports){
var configuration = require("./configuration.json");
var CirclesRenderer = require("./CirclesRenderer");
var LinesRenderer = require("./LinesRenderer");
var PathRenderer = require("./PathRenderer");

switch (configuration.renderer) {
    case 'LinesRenderer':
        var Renderer = LinesRenderer;
        break;
    case 'PathRenderer':
        var Renderer = PathRenderer;
        break;
    case 'CirclesRenderer':
    default:
        var Renderer = CirclesRenderer;
}

Renderer.init();
paper.view.onFrame = function(event) {
    if (!Renderer.draw()) {
        paper.view.onFrame = null;
    }
};

},{"./CirclesRenderer":2,"./LinesRenderer":3,"./PathRenderer":5,"./configuration.json":8}],7:[function(require,module,exports){
var Venation = function(point) {
    this.point = point;
    this.rendered = null;

    this.id = Venation.progressive;
    Venation.progressive++;

    this.age = 0;
    this.neighborAuxins = null;
    this.childs = [];
    this.parent = null;
}

Venation.progressive = 0;

module.exports = Venation;

},{}],8:[function(require,module,exports){
module.exports=module.exports = {
    "shape": "circle",
    "auxinRadius": 0.0125,
    "venationRadius": 0.0125,
    "threesholdAuxinRadius": 0.009,
    "threesholdVenationRadius": 0.0125,
    "neighborhoodRadius": 0.1,
    "seedAuxins": 2000,
    "seedVenations": 1,
    "seedsCenteringFactor": 0.01,
    "maxVenationNodeAge": 2,
    "renderer": "PathRenderer",
    "rendererConfiguration": {
        "drawAuxins": true,
        "twisted": true,
        "venationStrokeColor": "#A2CA01",
        "venationStrokeColorAging": false,
        "venationStrokeColorAgingFactor": 0.0035,
        "venationStrokeWidth": 1,
        "venationStrokeWidthAging": true,
        "venationStrokeWidthAgingFactor": 0.1,
        "auxinStrokeColor": "#feba18",
        "shapeFillColor": "#fff",
        "shapeStrokeColor": "#666",
        "shapeStrokeWidth": 1
    }
}

},{}]},{},[1,2,3,4,5,6,7])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWxnb3JpdGhtL0F1eGluLmpzIiwic3JjL2FsZ29yaXRobS9DaXJjbGVzUmVuZGVyZXIuanMiLCJzcmMvYWxnb3JpdGhtL0xpbmVzUmVuZGVyZXIuanMiLCJzcmMvYWxnb3JpdGhtL09wZW5WZW5hdGlvbkFsZ29yaXRobS5qcyIsInNyYy9hbGdvcml0aG0vUGF0aFJlbmRlcmVyLmpzIiwic3JjL2FsZ29yaXRobS9SdW5uZXIuanMiLCJzcmMvYWxnb3JpdGhtL1ZlbmF0aW9uLmpzIiwic3JjL2FsZ29yaXRobS9jb25maWd1cmF0aW9uLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBBdXhpbiA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xuICAgIHRoaXMuaXNEb29tZWQgPSBmYWxzZTtcblxuICAgIHRoaXMudGFnZ2VkVmVuYXRpb25zID0gW107XG5cbiAgICB0aGlzLmlkID0gQXV4aW4ucHJvZ3Jlc3NpdmU7XG4gICAgQXV4aW4ucHJvZ3Jlc3NpdmUrKztcbn1cblxuQXV4aW4ucHJvZ3Jlc3NpdmUgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1eGluO1xuIiwidmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IHJlcXVpcmUoXCIuL09wZW5WZW5hdGlvbkFsZ29yaXRobVwiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xuXG52YXIgQ2lyY2xlc1JlbmRlcmVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICBmdW5jdGlvbiBkcmF3VmVuYXRpb25zKHZlbmF0aW9ucykge1xuXG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuXG4gICAgICAgICAgICBpZiAoIXZlbmF0aW9uc1tpXS5yZW5kZXJlZCkge1xuICAgICAgICAgICAgICAgIHZhciB2ZW5hdGlvblBhdGggPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICBjZW50ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiB2aWV3LnZpZXdTaXplLndpZHRoICogY29uZmlndXJhdGlvbi52ZW5hdGlvblJhZGl1cyxcbiAgICAgICAgICAgICAgICAgICAgZmlsbENvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5yZW5kZXJlZCA9IHZlbmF0aW9uUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25zW2ldLnN0cm9rZVdpZHRoICs9IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZ0ZhY3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZyAmJiB2ZW5hdGlvbnNbaV0uYWdlID4gcGFyZW50LmFnZSAvIDEuNSkge1xuICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvbnNbaV0uc3Ryb2tlQ29sb3IgLT0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdBdXhpbnMoYXV4aW5zKSB7XG5cbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXV4aW5QYXRoID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBhdXhpbnNbaV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByYWRpdXM6IHZpZXcudmlld1NpemUud2lkdGggKiBjb25maWd1cmF0aW9uLmF1eGluUmFkaXVzLFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5hdXhpblN0cm9rZUNvbG9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGNvbmZpZ3VyYXRpb24uc2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgICAgICAgICAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQYXRoLlJlY3RhbmdsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdmlldy52aWV3U2l6ZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImNlbnRlclwiOiBbdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsIHZpZXcudmlld1NpemUuaGVpZ2h0IC8gMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJhZGl1c1wiOiB2aWV3LnZpZXdTaXplLndpZHRoIC8gMixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsbENvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlRmlsbENvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VXaWR0aFwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uaW5pdCgpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLmRyYXdBdXhpbnMgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkcmF3QXV4aW5zKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5nZXRBdXhpbnMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRyYXc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmlzRmluaXNoZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0VmVuYXRpb25zKCkpO1xuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uc3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaXJjbGVzUmVuZGVyZXIoKTtcbiIsInZhciBPcGVuVmVuYXRpb25BbGdvcml0aG0gPSByZXF1aXJlKFwiLi9PcGVuVmVuYXRpb25BbGdvcml0aG1cIik7XG52YXIgY29uZmlndXJhdGlvbiA9IHJlcXVpcmUoXCIuL2NvbmZpZ3VyYXRpb24uanNvblwiKTtcblxudmFyIExpbmVzUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciByZW5kZXJlZFZlbmF0aW9ucyA9IHt9O1xuXG4gICAgZnVuY3Rpb24gZHJhd1NlZWRWZW5hdGlvbnModmVuYXRpb25zKSB7XG4gICAgICAgIHZhciBzZWVkcyA9IF8uZmlyc3QodmVuYXRpb25zLCBjb25maWd1cmF0aW9uLnNlZWRWZW5hdGlvbnMpO1xuICAgICAgICB2YXIgdG90YWxTZWVkcyA9IHNlZWRzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFNlZWRzOyBpKyspIHtcbiAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoc2VlZHNbaV0uY2hpbGRzLCBzZWVkc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3VmVuYXRpb25zKGNoaWxkcywgcGFyZW50KSB7XG5cbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gY2hpbGRzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoIXJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0pIHtcbiAgICAgICAgICAgICAgICB2YXIgdmVuYXRpb25QYXRoID0gbmV3IFBhdGguTGluZSh7XG4gICAgICAgICAgICAgICAgICAgIGZyb206IG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgdG86IG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDYXA6ICdyb3VuZCcsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUpvaW46ICdyb3VuZCdcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0gPSB2ZW5hdGlvblBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0uc3Ryb2tlV2lkdGggKz0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nICYmIGNoaWxkc1tpXS5hZ2UgPiBwYXJlbnQuYWdlIC8gMS41KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0uc3Ryb2tlQ29sb3IgLT0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkc1tpXS5jaGlsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi50d2lzdGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoY2hpbGRzW2ldLmNoaWxkcywgY2hpbGRzW2ldLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkcmF3VmVuYXRpb25zKGNoaWxkc1tpXS5jaGlsZHMsIGNoaWxkc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd0F1eGlucyhhdXhpbnMpIHtcblxuICAgICAgICB2YXIgdG90YWxBdXhpbnMgPSBhdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdXhpblBhdGggPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgIGNlbnRlcjogW1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJhZGl1czogdmlldy52aWV3U2l6ZS53aWR0aCAqIGNvbmZpZ3VyYXRpb24uYXV4aW5SYWRpdXMsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLmF1eGluU3Ryb2tlQ29sb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlndXJhdGlvbi5zaGFwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguUmVjdGFuZ2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodFwiOiB2aWV3LnZpZXdTaXplLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsbENvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlRmlsbENvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VXaWR0aFwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2VudGVyXCI6IFt2aWV3LnZpZXdTaXplLndpZHRoIC8gMiwgdmlldy52aWV3U2l6ZS5oZWlnaHQgLyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmFkaXVzXCI6IHZpZXcudmlld1NpemUud2lkdGggLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pbml0KCk7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uZHJhd0F1eGlucyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGRyYXdBdXhpbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldEF1eGlucygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChPcGVuVmVuYXRpb25BbGdvcml0aG0uaXNGaW5pc2hlZCgpKSB7XG4gICAgICAgICAgICAgICAgLypjb25zb2xlLmxvZyhyZW5kZXJlZFZlbmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgdmFyIGlkcyA9IF8ua2V5cyhyZW5kZXJlZFZlbmF0aW9ucyk7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSAyO1xuICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbKGkgLSAxKV0gPSByZW5kZXJlZFZlbmF0aW9uc1soaSAtIDEpXS51bml0ZShyZW5kZXJlZFZlbmF0aW9uc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zWyhpIC0gMSldLnNtb290aCgpO1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1tpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3aGlsZShpIDwgaWRzLmxlbmd0aClcblxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlbmRlcmVkVmVuYXRpb25zKTsqL1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZHJhd1NlZWRWZW5hdGlvbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldFZlbmF0aW9ucygpKTtcblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLnN0ZXAoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGluZXNSZW5kZXJlcigpO1xuIiwidmFyIEF1eGluID0gcmVxdWlyZShcIi4vQXV4aW4uanNcIik7XG52YXIgVmVuYXRpb24gPSByZXF1aXJlKFwiLi9WZW5hdGlvbi5qc1wiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xuXG52YXIgT3BlblZlbmF0aW9uQWxnb3JpdGhtID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgdmFsaWRWZW5hdGlvblRocmVlc2hvbGQgPSBjb25maWd1cmF0aW9uLm1heFZlbmF0aW9uTm9kZUFnZTtcblxuICAgIHZhciB2ZW5hdGlvbnMgPSBbXTtcbiAgICB2YXIgYXV4aW5zID0gW107XG4gICAgdmFyIGZpbmlzaGVkID0gZmFsc2U7XG5cbiAgICBmdW5jdGlvbiBpbml0KCkge1xuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbUNpcmNsZVBvaW50KCkge1xuICAgICAgICAgICAgdmFyIHQgPSAyICogTWF0aC5QSSAqIE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkgKiAoMC41IC0gY29uZmlndXJhdGlvbi5zZWVkc0NlbnRlcmluZ0ZhY3Rvcik7XG4gICAgICAgICAgICB2YXIgeCA9IDAuNSArIHIgKiBNYXRoLmNvcyh0KTtcbiAgICAgICAgICAgIHZhciB5ID0gMC41ICsgciAqIE1hdGguc2luKHQpO1xuXG4gICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tU3F1YXJlUG9pbnQoKSB7XG4gICAgICAgICAgICB2YXIgeCA9IE1hdGgubWF4KE1hdGgucmFuZG9tKCkgLSBjb25maWd1cmF0aW9uLnNlZWRzQ2VudGVyaW5nRmFjdG9yLCAwKTtcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5tYXgoTWF0aC5yYW5kb20oKSAtIGNvbmZpZ3VyYXRpb24uc2VlZHNDZW50ZXJpbmdGYWN0b3IsIDApO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQb2ludCh4LCB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbVBvaW50KCkge1xuICAgICAgICAgICAgc3dpdGNoIChjb25maWd1cmF0aW9uLnNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbVNxdWFyZVBvaW50KCk7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tQ2lyY2xlUG9pbnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNlZWRWZW5hdGlvbnMoKSB7XG4gICAgICAgICAgICB2YXIgbG9vcENvdW50ZXIgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKHZlbmF0aW9ucy5sZW5ndGggPCBjb25maWd1cmF0aW9uLnNlZWRWZW5hdGlvbnMgJiYgbG9vcENvdW50ZXIgPCBjb25maWd1cmF0aW9uLnNlZWRWZW5hdGlvbnMgKiAxLjUpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWVkIGF1eGluIGluc2lkZSBhIGNpcmNsZVxuICAgICAgICAgICAgICAgIHZhciBwb2ludCA9IGdldFJhbmRvbVBvaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKCFoaXRUZXN0VmVuYXRpb24ocG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlbmF0aW9ucy5wdXNoKG5ldyBWZW5hdGlvbihwb2ludCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvb3BDb3VudGVyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZWVkQXV4aW5zKCkge1xuICAgICAgICAgICAgdmFyIGxvb3BDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHdoaWxlIChhdXhpbnMubGVuZ3RoIDwgY29uZmlndXJhdGlvbi5zZWVkQXV4aW5zICYmIGxvb3BDb3VudGVyIDwgY29uZmlndXJhdGlvbi5zZWVkQXV4aW5zICogMS41KSB7XG4gICAgICAgICAgICAgICAgLy8gc2VlZCBhdXhpbiBpbnNpZGUgYSBjaXJjbGVcbiAgICAgICAgICAgICAgICB2YXIgcG9pbnQgPSBnZXRSYW5kb21Qb2ludCgpO1xuICAgICAgICAgICAgICAgIGlmICghaGl0VGVzdEF1eGluKHBvaW50KSAmJiAhaGl0VGVzdFZlbmF0aW9uKHBvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnMucHVzaChuZXcgQXV4aW4ocG9pbnQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsb29wQ291bnRlcisrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2VlZFZlbmF0aW9ucygpO1xuICAgICAgICBzZWVkQXV4aW5zKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGl0VGVzdEF1eGluKHBvaW50KSB7XG4gICAgICAgIHZhciBhdXhpbkhpdFJhZGl1cyA9IGNvbmZpZ3VyYXRpb24udGhyZWVzaG9sZEF1eGluUmFkaXVzO1xuICAgICAgICB2YXIgdG90YWxBdXhpbnMgPSBhdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkID0gcG9pbnQuZ2V0RGlzdGFuY2UoYXV4aW5zW2ldLnBvaW50LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChkIDwgYXV4aW5IaXRSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoaXRUZXN0VmVuYXRpb24ocG9pbnQpIHtcbiAgICAgICAgdmFyIHZlbmF0aW9uSGl0UmFkaXVzID0gY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXMgKiBjb25maWd1cmF0aW9uLnRocmVlc2hvbGRWZW5hdGlvblJhZGl1cztcbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkID0gcG9pbnQuZ2V0RGlzdGFuY2UodmVuYXRpb25zW2ldLnBvaW50LCB0cnVlKTtcbiAgICAgICAgICAgIGlmIChkIDwgdmVuYXRpb25IaXRSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYXNWYWxpZFZlbmF0aW9ucygpIHtcbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgdmFyIHZhbGlkVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodmVuYXRpb25zW2ldLmFnZSA+PSB2YWxpZFZlbmF0aW9uVGhyZWVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHZhbGlkVmVuYXRpb25zLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsaWRWZW5hdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3RlcCgpIHtcblxuICAgICAgICBpZiAoIWhhc1ZhbGlkVmVuYXRpb25zKCkpIHtcbiAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHBsYWNlVmVuYXRpb25zKCk7XG4gICAgICAgIGtpbGxBdXhpbnMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVZlbmF0aW9ucygpIHtcbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh2ZW5hdGlvbnNbaV0uYWdlIDwgdmFsaWRWZW5hdGlvblRocmVlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICBwbGFjZVZlbmF0aW9uKHZlbmF0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2ZW5hdGlvbnNbaV0uYWdlKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwbGFjZVZlbmF0aW9uKHZlbmF0aW9uKSB7XG4gICAgICAgIHZhciBpbmZsdWVuY2VyQXV4aW5zID0gZ2V0SW5mbHVlbmNlckF1eGlucyh2ZW5hdGlvbik7XG4gICAgICAgIHZhciBwID0gZ2V0QXV4aW5JbmZsdWVuY2VEaXJlY3Rpb24odmVuYXRpb24sIGluZmx1ZW5jZXJBdXhpbnMpO1xuXG4gICAgICAgIGlmIChwID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwICo9IDIgKiBjb25maWd1cmF0aW9uLnZlbmF0aW9uUmFkaXVzO1xuICAgICAgICBwID0gcCArIHZlbmF0aW9uLnBvaW50O1xuXG4gICAgICAgIHZhciBuZXdWZW5hdGlvbiA9IG5ldyBWZW5hdGlvbihwKTtcbiAgICAgICAgbmV3VmVuYXRpb24ucGFyZW50ID0gdmVuYXRpb247XG5cbiAgICAgICAgdmVuYXRpb25zLnB1c2gobmV3VmVuYXRpb24pO1xuICAgICAgICB2ZW5hdGlvbi5jaGlsZHMucHVzaChuZXdWZW5hdGlvbik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QXV4aW5JbmZsdWVuY2VEaXJlY3Rpb24odmVuYXRpb24sIGluZmx1ZW5jZXJBdXhpbnMpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICAgICAgdmFyIHRvdGFsSW5mbHVlbmNlckF1eGlucyA9IGluZmx1ZW5jZXJBdXhpbnMubGVuZ3RoO1xuXG4gICAgICAgIGlmICghdG90YWxJbmZsdWVuY2VyQXV4aW5zKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxJbmZsdWVuY2VyQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwID0gaW5mbHVlbmNlckF1eGluc1tpXS5wb2ludCAtIHZlbmF0aW9uLnBvaW50O1xuICAgICAgICAgICAgcCA9IHAubm9ybWFsaXplKCk7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQgKyBwO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICB2YXIgcCA9IGluZmx1ZW5jZXJBdXhpbnNbMF0ucG9pbnQgLSB2ZW5hdGlvbi5wb2ludDtcbiAgICAgICAgICAgIHJlc3VsdCA9IHAubm9ybWFsaXplKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgPSByZXN1bHQubm9ybWFsaXplKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEluZmx1ZW5jZXJBdXhpbnModmVuYXRpb24pIHtcbiAgICAgICAgaWYgKHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zID09PSBudWxsKSB7XG4gICAgICAgICAgICB2ZW5hdGlvbi5uZWlnaGJvckF1eGlucyA9IGdldE5laWdoYm9yQXV4aW5zKHZlbmF0aW9uLnBvaW50KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5mbHVlbmNlckF1eGlucyA9IFtdO1xuICAgICAgICB2YXIgdG90YWxOZWlnaGJvckF1eGlucyA9IHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbE5laWdoYm9yQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpbmZsdWVuY2VkVmVuYXRpb25zID0gZ2V0SW5mbHVlbmNlZFZlbmF0aW9ucyh2ZW5hdGlvbi5uZWlnaGJvckF1eGluc1tpXS5wb2ludCk7XG4gICAgICAgICAgICB2YXIgaXNJbmZsdWVuY2VkID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IGluZmx1ZW5jZWRWZW5hdGlvbnMubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mbHVlbmNlZFZlbmF0aW9uc1tjXS5wb2ludCA9PSB2ZW5hdGlvbi5wb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luZmx1ZW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNJbmZsdWVuY2VkKSB7XG4gICAgICAgICAgICAgICAgaW5mbHVlbmNlckF1eGlucy5wdXNoKHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmZsdWVuY2VyQXV4aW5zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE5laWdoYm9yQXV4aW5zKHBvaW50KSB7XG4gICAgICAgIHZhciBuZWlnaGJvcmhvb2RSYWRpdXMgPSBjb25maWd1cmF0aW9uLm5laWdoYm9yaG9vZFJhZGl1cztcbiAgICAgICAgdmFyIG5laWdoYm9yQXV4aW5zID0gW107XG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGQgPSBwb2ludC5nZXREaXN0YW5jZShhdXhpbnNbaV0ucG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGQgPCBuZWlnaGJvcmhvb2RSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBuZWlnaGJvckF1eGlucy5wdXNoKGF1eGluc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JBdXhpbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SW5mbHVlbmNlZFZlbmF0aW9ucyhwb2ludCkge1xuICAgICAgICB2YXIgcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucyA9IGdldFJlbGF0aXZlTmVpZ2hib3JWZWluTm9kZXMocG9pbnQpO1xuICAgICAgICB2YXIgdG90YWxSZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zID0gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxSZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzID0gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9uc1tpXS5wb2ludCAtIHBvaW50O1xuICAgICAgICAgICAgaWYgKHMubGVuZ3RoIDwgY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB0b3RhbFJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMtLTtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZWxhdGl2ZU5laWdoYm9yVmVpbk5vZGVzKHBvaW50KSB7XG4gICAgICAgIHZhciBuZWlnaGJvclZlbmF0aW9ucyA9IGdldE5laWdoYm9yVmVuYXRpb25zKHBvaW50KTtcbiAgICAgICAgdmFyIHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsTmVpZ2hib3JWZW5hdGlvbnMgPSBuZWlnaGJvclZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxOZWlnaGJvclZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXV4aW5Ub1AwID0gbmVpZ2hib3JWZW5hdGlvbnNbaV0ucG9pbnQgLSBwb2ludDtcbiAgICAgICAgICAgIHZhciBmYWlsID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgdG90YWxOZWlnaGJvclZlbmF0aW9uczsgYysrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5laWdoYm9yVmVuYXRpb25zW2ldLnBvaW50ID09IG5laWdoYm9yVmVuYXRpb25zW2NdLnBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYXV4aW5Ub1AxID0gbmVpZ2hib3JWZW5hdGlvbnNbY10ucG9pbnQgLSBwb2ludDtcbiAgICAgICAgICAgICAgICBpZiAoYXV4aW5Ub1AxLmxlbmd0aCA+IGF1eGluVG9QMC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBwMFRvUDEgPSBuZWlnaGJvclZlbmF0aW9uc1tjXS5wb2ludCAtIG5laWdoYm9yVmVuYXRpb25zW2ldLnBvaW50O1xuICAgICAgICAgICAgICAgIGlmIChhdXhpblRvUDAubGVuZ3RoID4gcDBUb1AxLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgZmFpbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZmFpbCkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMucHVzaChuZWlnaGJvclZlbmF0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROZWlnaGJvclZlbmF0aW9ucyhwb2ludCkge1xuICAgICAgICB2YXIgbmVpZ2hib3Job29kUmFkaXVzID0gNC4wICogY29uZmlndXJhdGlvbi5uZWlnaGJvcmhvb2RSYWRpdXMgKiBjb25maWd1cmF0aW9uLm5laWdoYm9yaG9vZFJhZGl1cztcbiAgICAgICAgdmFyIG5laWdoYm9yVmVuYXRpb25zID0gW107XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGQgPSBwb2ludC5nZXREaXN0YW5jZSh2ZW5hdGlvbnNbaV0ucG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGQgPCBuZWlnaGJvcmhvb2RSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBuZWlnaGJvclZlbmF0aW9ucy5wdXNoKHZlbmF0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JWZW5hdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2lsbEF1eGlucygpIHtcbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXV4aW4gPSBhdXhpbnNbaV07XG4gICAgICAgICAgICBpZiAoYXV4aW4uaXNEb29tZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5mbHVlbmNlZFZlbmF0aW9ucyA9IGdldEluZmx1ZW5jZWRWZW5hdGlvbnMoYXV4aW4ucG9pbnQpO1xuICAgICAgICAgICAgICAgIHZhciB0YWdnZWRWZW5hdGlvbnMgPSBhdXhpbi50YWdnZWRWZW5hdGlvbnM7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsVGFnZ2VkVmVuYXRpb25zID0gdGFnZ2VkVmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRvdGFsVGFnZ2VkVmVuYXRpb25zOyB0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ2dlZFZlbmF0aW9uID0gdGFnZ2VkVmVuYXRpb25zW3RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9ICh0YWdnZWRWZW5hdGlvbi5wb2ludCAtIGF1eGluLnBvaW50KS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkIDwgY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXMgfHwgXy5jb250YWlucyhpbmZsdWVuY2VkVmVuYXRpb25zLCB0YWdnZWRWZW5hdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ2dlZFZlbmF0aW9ucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRhZ2dlZFZlbmF0aW9ucy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRhZ2dlZFZlbmF0aW9ucy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEF1eGlucy0tO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpdFRlc3RWZW5hdGlvbihhdXhpbi5wb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmx1ZW5jZWRWZW5hdGlvbnMgPSBnZXRJbmZsdWVuY2VkVmVuYXRpb25zKGF1eGluLnBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZmx1ZW5jZWRWZW5hdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV4aW4uaXNEb29tZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV4aW4udGFnZ2VkVmVuYXRpb25zID0gaW5mbHVlbmNlZFZlbmF0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1eGlucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEF1eGlucy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgXCJpbml0XCI6IGluaXQsXG4gICAgICAgIFwic3RlcFwiOiBzdGVwLFxuICAgICAgICBcImdldEF1eGluc1wiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhdXhpbnM7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VmVuYXRpb25zXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZlbmF0aW9ucztcbiAgICAgICAgfSxcbiAgICAgICAgXCJpc0ZpbmlzaGVkXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmlzaGVkO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wZW5WZW5hdGlvbkFsZ29yaXRobSgpO1xuIiwidmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IHJlcXVpcmUoXCIuL09wZW5WZW5hdGlvbkFsZ29yaXRobVwiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xuXG52YXIgUGF0aFJlbmRlcmVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcmVuZGVyZWRWZW5hdGlvbnMgPSB7fTtcbiAgICB2YXIgdmVuYXRpb25zUGF0aCA9IG5ldyBDb21wb3VuZFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvclxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZHJhd1NlZWRWZW5hdGlvbnModmVuYXRpb25zKSB7XG4gICAgICAgIHZhciBzZWVkcyA9IF8uZmlyc3QodmVuYXRpb25zLCBjb25maWd1cmF0aW9uLnNlZWRWZW5hdGlvbnMpO1xuICAgICAgICB2YXIgdG90YWxTZWVkcyA9IHNlZWRzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFNlZWRzOyBpKyspIHtcbiAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoc2VlZHNbaV0uY2hpbGRzLCBzZWVkc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3VmVuYXRpb25zKGNoaWxkcywgcGFyZW50KSB7XG5cbiAgICAgICAgdmFyIGl0ZXJhdGlvblJlbmRlcnMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gY2hpbGRzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaW5jcmVtZW50TmV4dCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKCFyZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkc1soaSArIDEpXSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjaGlsZHNbaV0ucG9pbnQuZ2V0QW5nbGUoY2hpbGRzWyhpICsgMSldLnBvaW50KSA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZlbmF0aW9uU2VnbWVudCA9IG5ldyBQYXRoKG5ldyBTZWdtZW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbaV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1soaSArIDEpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbKGkgKyAxKV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgICAgIGluY3JlbWVudE5leHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZlbmF0aW9uU2VnbWVudCA9IG5ldyBQYXRoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5hZGQobmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuYWRkKG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LnN0cm9rZVdpZHRoID0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aDtcbiAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuc3Ryb2tlQ29sb3IgPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yO1xuICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5zdHJva2VDYXAgPSAncm91bmQnO1xuICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5zdHJva2VKb2luID0gJ3JvdW5kJztcblxuICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0gPSB2ZW5hdGlvblNlZ21lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0uc3Ryb2tlV2lkdGggKz0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nICYmIGNoaWxkc1tpXS5hZ2UgPiBwYXJlbnQuYWdlIC8gMS41KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0uc3Ryb2tlQ29sb3IgLT0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNoaWxkc1tpXS5jaGlsZHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi50d2lzdGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoY2hpbGRzW2ldLmNoaWxkcywgY2hpbGRzW2ldLnBhcmVudCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkcmF3VmVuYXRpb25zKGNoaWxkc1tpXS5jaGlsZHMsIGNoaWxkc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaW5jcmVtZW50TmV4dCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHZlbmF0aW9uc1BhdGguYnJpbmdUb0Zyb250KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd0F1eGlucyhhdXhpbnMpIHtcblxuICAgICAgICB2YXIgdG90YWxBdXhpbnMgPSBhdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdXhpblBhdGggPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgIGNlbnRlcjogW1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJhZGl1czogdmlldy52aWV3U2l6ZS53aWR0aCAqIGNvbmZpZ3VyYXRpb24uYXV4aW5SYWRpdXMsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLmF1eGluU3Ryb2tlQ29sb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlndXJhdGlvbi5zaGFwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguUmVjdGFuZ2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodFwiOiB2aWV3LnZpZXdTaXplLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsbENvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlRmlsbENvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VXaWR0aFwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2VudGVyXCI6IFt2aWV3LnZpZXdTaXplLndpZHRoIC8gMiwgdmlldy52aWV3U2l6ZS5oZWlnaHQgLyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmFkaXVzXCI6IHZpZXcudmlld1NpemUud2lkdGggLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pbml0KCk7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uZHJhd0F1eGlucyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGRyYXdBdXhpbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldEF1eGlucygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChPcGVuVmVuYXRpb25BbGdvcml0aG0uaXNGaW5pc2hlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmF3U2VlZFZlbmF0aW9ucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0VmVuYXRpb25zKCkpO1xuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uc3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQYXRoUmVuZGVyZXIoKTtcbiIsInZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xudmFyIENpcmNsZXNSZW5kZXJlciA9IHJlcXVpcmUoXCIuL0NpcmNsZXNSZW5kZXJlclwiKTtcbnZhciBMaW5lc1JlbmRlcmVyID0gcmVxdWlyZShcIi4vTGluZXNSZW5kZXJlclwiKTtcbnZhciBQYXRoUmVuZGVyZXIgPSByZXF1aXJlKFwiLi9QYXRoUmVuZGVyZXJcIik7XG5cbnN3aXRjaCAoY29uZmlndXJhdGlvbi5yZW5kZXJlcikge1xuICAgIGNhc2UgJ0xpbmVzUmVuZGVyZXInOlxuICAgICAgICB2YXIgUmVuZGVyZXIgPSBMaW5lc1JlbmRlcmVyO1xuICAgICAgICBicmVhaztcbiAgICBjYXNlICdQYXRoUmVuZGVyZXInOlxuICAgICAgICB2YXIgUmVuZGVyZXIgPSBQYXRoUmVuZGVyZXI7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0NpcmNsZXNSZW5kZXJlcic6XG4gICAgZGVmYXVsdDpcbiAgICAgICAgdmFyIFJlbmRlcmVyID0gQ2lyY2xlc1JlbmRlcmVyO1xufVxuXG5SZW5kZXJlci5pbml0KCk7XG5wYXBlci52aWV3Lm9uRnJhbWUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghUmVuZGVyZXIuZHJhdygpKSB7XG4gICAgICAgIHBhcGVyLnZpZXcub25GcmFtZSA9IG51bGw7XG4gICAgfVxufTtcbiIsInZhciBWZW5hdGlvbiA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xuICAgIHRoaXMucmVuZGVyZWQgPSBudWxsO1xuXG4gICAgdGhpcy5pZCA9IFZlbmF0aW9uLnByb2dyZXNzaXZlO1xuICAgIFZlbmF0aW9uLnByb2dyZXNzaXZlKys7XG5cbiAgICB0aGlzLmFnZSA9IDA7XG4gICAgdGhpcy5uZWlnaGJvckF1eGlucyA9IG51bGw7XG4gICAgdGhpcy5jaGlsZHMgPSBbXTtcbiAgICB0aGlzLnBhcmVudCA9IG51bGw7XG59XG5cblZlbmF0aW9uLnByb2dyZXNzaXZlID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBWZW5hdGlvbjtcbiIsIm1vZHVsZS5leHBvcnRzPW1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwic2hhcGVcIjogXCJjaXJjbGVcIixcbiAgICBcImF1eGluUmFkaXVzXCI6IDAuMDEyNSxcbiAgICBcInZlbmF0aW9uUmFkaXVzXCI6IDAuMDEyNSxcbiAgICBcInRocmVlc2hvbGRBdXhpblJhZGl1c1wiOiAwLjAwOSxcbiAgICBcInRocmVlc2hvbGRWZW5hdGlvblJhZGl1c1wiOiAwLjAxMjUsXG4gICAgXCJuZWlnaGJvcmhvb2RSYWRpdXNcIjogMC4xLFxuICAgIFwic2VlZEF1eGluc1wiOiAyMDAwLFxuICAgIFwic2VlZFZlbmF0aW9uc1wiOiAxLFxuICAgIFwic2VlZHNDZW50ZXJpbmdGYWN0b3JcIjogMC4wMSxcbiAgICBcIm1heFZlbmF0aW9uTm9kZUFnZVwiOiAyLFxuICAgIFwicmVuZGVyZXJcIjogXCJQYXRoUmVuZGVyZXJcIixcbiAgICBcInJlbmRlcmVyQ29uZmlndXJhdGlvblwiOiB7XG4gICAgICAgIFwiZHJhd0F1eGluc1wiOiB0cnVlLFxuICAgICAgICBcInR3aXN0ZWRcIjogdHJ1ZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZUNvbG9yXCI6IFwiI0EyQ0EwMVwiLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZ1wiOiBmYWxzZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3JcIjogMC4wMDM1LFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlV2lkdGhcIjogMSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3JcIjogMC4xLFxuICAgICAgICBcImF1eGluU3Ryb2tlQ29sb3JcIjogXCIjZmViYTE4XCIsXG4gICAgICAgIFwic2hhcGVGaWxsQ29sb3JcIjogXCIjZmZmXCIsXG4gICAgICAgIFwic2hhcGVTdHJva2VDb2xvclwiOiBcIiM2NjZcIixcbiAgICAgICAgXCJzaGFwZVN0cm9rZVdpZHRoXCI6IDFcbiAgICB9XG59XG4iXX0=
