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
        // the venations life loop: one cycle -> age++
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
            var totalInfluencedVenations = influencedVenations.length;
            var isInfluenced = false;
            for (var c = 0; c < totalInfluencedVenations; c++) {
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
        var relativeNeighborVenations = getRelativeNeighborVeinations(point);
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

    function getRelativeNeighborVeinations(point) {
        var neighborVenations = getNeighborVenations(point);
        var relativeNeighborVenations = [];
        var totalNeighborVenations = neighborVenations.length;
        for (var i = 0; i < totalNeighborVenations; i++) {
            var auxinToP0 = neighborVenations[i].point - point;
            var fail = false;

            for (var c = 0; c < totalNeighborVenations; c++) {
                if (c == i) {
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
        var neighborhoodRadius = 3 * configuration.neighborhoodRadius * configuration.neighborhoodRadius;
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
        "twisted": false,
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWxnb3JpdGhtL0F1eGluLmpzIiwic3JjL2FsZ29yaXRobS9DaXJjbGVzUmVuZGVyZXIuanMiLCJzcmMvYWxnb3JpdGhtL0xpbmVzUmVuZGVyZXIuanMiLCJzcmMvYWxnb3JpdGhtL09wZW5WZW5hdGlvbkFsZ29yaXRobS5qcyIsInNyYy9hbGdvcml0aG0vUGF0aFJlbmRlcmVyLmpzIiwic3JjL2FsZ29yaXRobS9SdW5uZXIuanMiLCJzcmMvYWxnb3JpdGhtL1ZlbmF0aW9uLmpzIiwic3JjL2FsZ29yaXRobS9jb25maWd1cmF0aW9uLmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEF1eGluID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG4gICAgdGhpcy5pc0Rvb21lZCA9IGZhbHNlO1xuXG4gICAgdGhpcy50YWdnZWRWZW5hdGlvbnMgPSBbXTtcblxuICAgIHRoaXMuaWQgPSBBdXhpbi5wcm9ncmVzc2l2ZTtcbiAgICBBdXhpbi5wcm9ncmVzc2l2ZSsrO1xufVxuXG5BdXhpbi5wcm9ncmVzc2l2ZSA9IDA7XG5cbm1vZHVsZS5leHBvcnRzID0gQXV4aW47XG4iLCJ2YXIgT3BlblZlbmF0aW9uQWxnb3JpdGhtID0gcmVxdWlyZShcIi4vT3BlblZlbmF0aW9uQWxnb3JpdGhtXCIpO1xudmFyIGNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKFwiLi9jb25maWd1cmF0aW9uLmpzb25cIik7XG5cbnZhciBDaXJjbGVzUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIGZ1bmN0aW9uIGRyYXdWZW5hdGlvbnModmVuYXRpb25zKSB7XG5cbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG5cbiAgICAgICAgICAgIGlmICghdmVuYXRpb25zW2ldLnJlbmRlcmVkKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZlbmF0aW9uUGF0aCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgICAgIGNlbnRlcjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25zW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25zW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IHZpZXcudmlld1NpemUud2lkdGggKiBjb25maWd1cmF0aW9uLnZlbmF0aW9uUmFkaXVzLFxuICAgICAgICAgICAgICAgICAgICBmaWxsQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aDogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgdmVuYXRpb25zW2ldLnJlbmRlcmVkID0gdmVuYXRpb25QYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZykge1xuICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvbnNbaV0uc3Ryb2tlV2lkdGggKz0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nRmFjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvckFnaW5nICYmIHZlbmF0aW9uc1tpXS5hZ2UgPiBwYXJlbnQuYWdlIC8gMS41KSB7XG4gICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5zdHJva2VDb2xvciAtPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd0F1eGlucyhhdXhpbnMpIHtcblxuICAgICAgICB2YXIgdG90YWxBdXhpbnMgPSBhdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdXhpblBhdGggPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgIGNlbnRlcjogW1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIHJhZGl1czogdmlldy52aWV3U2l6ZS53aWR0aCAqIGNvbmZpZ3VyYXRpb24uYXV4aW5SYWRpdXMsXG4gICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLmF1eGluU3Ryb2tlQ29sb3JcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlndXJhdGlvbi5zaGFwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguUmVjdGFuZ2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieFwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ5XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcIndpZHRoXCI6IHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImhlaWdodFwiOiB2aWV3LnZpZXdTaXplLmhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsbENvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlRmlsbENvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VXaWR0aFwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBiYWNrZ3JvdW5kID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY2VudGVyXCI6IFt2aWV3LnZpZXdTaXplLndpZHRoIC8gMiwgdmlldy52aWV3U2l6ZS5oZWlnaHQgLyAyXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwicmFkaXVzXCI6IHZpZXcudmlld1NpemUud2lkdGggLyAyLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pbml0KCk7XG4gICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uZHJhd0F1eGlucyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGRyYXdBdXhpbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldEF1eGlucygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZHJhdzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgIGlmIChPcGVuVmVuYXRpb25BbGdvcml0aG0uaXNGaW5pc2hlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmF3VmVuYXRpb25zKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5nZXRWZW5hdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIE9wZW5WZW5hdGlvbkFsZ29yaXRobS5zdGVwKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENpcmNsZXNSZW5kZXJlcigpO1xuIiwidmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IHJlcXVpcmUoXCIuL09wZW5WZW5hdGlvbkFsZ29yaXRobVwiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xuXG52YXIgTGluZXNSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlbmRlcmVkVmVuYXRpb25zID0ge307XG5cbiAgICBmdW5jdGlvbiBkcmF3U2VlZFZlbmF0aW9ucyh2ZW5hdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlZWRzID0gXy5maXJzdCh2ZW5hdGlvbnMsIGNvbmZpZ3VyYXRpb24uc2VlZFZlbmF0aW9ucyk7XG4gICAgICAgIHZhciB0b3RhbFNlZWRzID0gc2VlZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsU2VlZHM7IGkrKykge1xuICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhzZWVkc1tpXS5jaGlsZHMsIHNlZWRzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdWZW5hdGlvbnMoY2hpbGRzLCBwYXJlbnQpIHtcblxuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSBjaGlsZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSkge1xuICAgICAgICAgICAgICAgIHZhciB2ZW5hdGlvblBhdGggPSBuZXcgUGF0aC5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbTogbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0bzogbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlSm9pbjogJ3JvdW5kJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSA9IHZlbmF0aW9uUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VXaWR0aCArPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmcgJiYgY2hpbGRzW2ldLmFnZSA+IHBhcmVudC5hZ2UgLyAxLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VDb2xvciAtPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRzW2ldLmNoaWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnR3aXN0ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhjaGlsZHNbaV0uY2hpbGRzLCBjaGlsZHNbaV0ucGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoY2hpbGRzW2ldLmNoaWxkcywgY2hpbGRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3QXV4aW5zKGF1eGlucykge1xuXG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF1eGluUGF0aCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBbXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB2aWV3LnZpZXdTaXplLndpZHRoICogY29uZmlndXJhdGlvbi5hdXhpblJhZGl1cyxcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uYXV4aW5TdHJva2VDb2xvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChjb25maWd1cmF0aW9uLnNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5SZWN0YW5nbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHZpZXcudmlld1NpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjZW50ZXJcIjogW3ZpZXcudmlld1NpemUud2lkdGggLyAyLCB2aWV3LnZpZXdTaXplLmhlaWdodCAvIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyYWRpdXNcIjogdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLmluaXQoKTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5kcmF3QXV4aW5zID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZHJhd0F1eGlucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0QXV4aW5zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICAgICAgICAvKmNvbnNvbGUubG9nKHJlbmRlcmVkVmVuYXRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgaWRzID0gXy5rZXlzKHJlbmRlcmVkVmVuYXRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDI7XG4gICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1soaSAtIDEpXSA9IHJlbmRlcmVkVmVuYXRpb25zWyhpIC0gMSldLnVuaXRlKHJlbmRlcmVkVmVuYXRpb25zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbKGkgLSAxKV0uc21vb3RoKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlKGkgPCBpZHMubGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVuZGVyZWRWZW5hdGlvbnMpOyovXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmF3U2VlZFZlbmF0aW9ucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0VmVuYXRpb25zKCkpO1xuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uc3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lc1JlbmRlcmVyKCk7XG4iLCJ2YXIgQXV4aW4gPSByZXF1aXJlKFwiLi9BdXhpbi5qc1wiKTtcbnZhciBWZW5hdGlvbiA9IHJlcXVpcmUoXCIuL1ZlbmF0aW9uLmpzXCIpO1xudmFyIGNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKFwiLi9jb25maWd1cmF0aW9uLmpzb25cIik7XG5cbnZhciBPcGVuVmVuYXRpb25BbGdvcml0aG0gPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciB2YWxpZFZlbmF0aW9uVGhyZWVzaG9sZCA9IGNvbmZpZ3VyYXRpb24ubWF4VmVuYXRpb25Ob2RlQWdlO1xuXG4gICAgdmFyIHZlbmF0aW9ucyA9IFtdO1xuICAgIHZhciBhdXhpbnMgPSBbXTtcbiAgICB2YXIgZmluaXNoZWQgPSBmYWxzZTtcblxuICAgIGZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tQ2lyY2xlUG9pbnQoKSB7XG4gICAgICAgICAgICB2YXIgdCA9IDIgKiBNYXRoLlBJICogTWF0aC5yYW5kb20oKTtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqICgwLjUgLSBjb25maWd1cmF0aW9uLnNlZWRzQ2VudGVyaW5nRmFjdG9yKTtcbiAgICAgICAgICAgIHZhciB4ID0gMC41ICsgciAqIE1hdGguY29zKHQpO1xuICAgICAgICAgICAgdmFyIHkgPSAwLjUgKyByICogTWF0aC5zaW4odCk7XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21TcXVhcmVQb2ludCgpIHtcbiAgICAgICAgICAgIHZhciB4ID0gTWF0aC5tYXgoTWF0aC5yYW5kb20oKSAtIGNvbmZpZ3VyYXRpb24uc2VlZHNDZW50ZXJpbmdGYWN0b3IsIDApO1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLm1heChNYXRoLnJhbmRvbSgpIC0gY29uZmlndXJhdGlvbi5zZWVkc0NlbnRlcmluZ0ZhY3RvciwgMCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0UmFuZG9tUG9pbnQoKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGNvbmZpZ3VyYXRpb24uc2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tU3F1YXJlUG9pbnQoKTtcbiAgICAgICAgICAgICAgICBjYXNlICdjaXJjbGUnOlxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21DaXJjbGVQb2ludCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2VlZFZlbmF0aW9ucygpIHtcbiAgICAgICAgICAgIHZhciBsb29wQ291bnRlciA9IDA7XG4gICAgICAgICAgICB3aGlsZSAodmVuYXRpb25zLmxlbmd0aCA8IGNvbmZpZ3VyYXRpb24uc2VlZFZlbmF0aW9ucyAmJiBsb29wQ291bnRlciA8IGNvbmZpZ3VyYXRpb24uc2VlZFZlbmF0aW9ucyAqIDEuNSkge1xuICAgICAgICAgICAgICAgIC8vIHNlZWQgYXV4aW4gaW5zaWRlIGEgY2lyY2xlXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50ID0gZ2V0UmFuZG9tUG9pbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhpdFRlc3RWZW5hdGlvbihwb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25zLnB1c2gobmV3IFZlbmF0aW9uKHBvaW50KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9vcENvdW50ZXIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNlZWRBdXhpbnMoKSB7XG4gICAgICAgICAgICB2YXIgbG9vcENvdW50ZXIgPSAwO1xuICAgICAgICAgICAgd2hpbGUgKGF1eGlucy5sZW5ndGggPCBjb25maWd1cmF0aW9uLnNlZWRBdXhpbnMgJiYgbG9vcENvdW50ZXIgPCBjb25maWd1cmF0aW9uLnNlZWRBdXhpbnMgKiAxLjUpIHtcbiAgICAgICAgICAgICAgICAvLyBzZWVkIGF1eGluIGluc2lkZSBhIGNpcmNsZVxuICAgICAgICAgICAgICAgIHZhciBwb2ludCA9IGdldFJhbmRvbVBvaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKCFoaXRUZXN0QXV4aW4ocG9pbnQpICYmICFoaXRUZXN0VmVuYXRpb24ocG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1eGlucy5wdXNoKG5ldyBBdXhpbihwb2ludCkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxvb3BDb3VudGVyKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzZWVkVmVuYXRpb25zKCk7XG4gICAgICAgIHNlZWRBdXhpbnMoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoaXRUZXN0QXV4aW4ocG9pbnQpIHtcbiAgICAgICAgdmFyIGF1eGluSGl0UmFkaXVzID0gY29uZmlndXJhdGlvbi50aHJlZXNob2xkQXV4aW5SYWRpdXM7XG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGQgPSBwb2ludC5nZXREaXN0YW5jZShhdXhpbnNbaV0ucG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGQgPCBhdXhpbkhpdFJhZGl1cykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpdFRlc3RWZW5hdGlvbihwb2ludCkge1xuICAgICAgICB2YXIgdmVuYXRpb25IaXRSYWRpdXMgPSBjb25maWd1cmF0aW9uLnRocmVlc2hvbGRWZW5hdGlvblJhZGl1cyAqIGNvbmZpZ3VyYXRpb24udGhyZWVzaG9sZFZlbmF0aW9uUmFkaXVzO1xuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSB2ZW5hdGlvbnMubGVuZ3RoO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGQgPSBwb2ludC5nZXREaXN0YW5jZSh2ZW5hdGlvbnNbaV0ucG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGQgPCB2ZW5hdGlvbkhpdFJhZGl1cykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhc1ZhbGlkVmVuYXRpb25zKCkge1xuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSB2ZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICB2YXIgdmFsaWRWZW5hdGlvbnMgPSB2ZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh2ZW5hdGlvbnNbaV0uYWdlID49IHZhbGlkVmVuYXRpb25UaHJlZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgdmFsaWRWZW5hdGlvbnMtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB2YWxpZFZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdGVwKCkge1xuXG4gICAgICAgIGlmICghaGFzVmFsaWRWZW5hdGlvbnMoKSkge1xuICAgICAgICAgICAgZmluaXNoZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcGxhY2VWZW5hdGlvbnMoKTtcbiAgICAgICAga2lsbEF1eGlucygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYWNlVmVuYXRpb25zKCkge1xuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSB2ZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICAvLyB0aGUgdmVuYXRpb25zIGxpZmUgbG9vcDogb25lIGN5Y2xlIC0+IGFnZSsrXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgaWYgKHZlbmF0aW9uc1tpXS5hZ2UgPCB2YWxpZFZlbmF0aW9uVGhyZWVzaG9sZCkge1xuICAgICAgICAgICAgICAgIHBsYWNlVmVuYXRpb24odmVuYXRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5hZ2UrKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBsYWNlVmVuYXRpb24odmVuYXRpb24pIHtcbiAgICAgICAgdmFyIGluZmx1ZW5jZXJBdXhpbnMgPSBnZXRJbmZsdWVuY2VyQXV4aW5zKHZlbmF0aW9uKTtcbiAgICAgICAgdmFyIHAgPSBnZXRBdXhpbkluZmx1ZW5jZURpcmVjdGlvbih2ZW5hdGlvbiwgaW5mbHVlbmNlckF1eGlucyk7XG5cbiAgICAgICAgaWYgKHAgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHAgKj0gMiAqIGNvbmZpZ3VyYXRpb24udmVuYXRpb25SYWRpdXM7XG4gICAgICAgIHAgPSBwICsgdmVuYXRpb24ucG9pbnQ7XG5cbiAgICAgICAgdmFyIG5ld1ZlbmF0aW9uID0gbmV3IFZlbmF0aW9uKHApO1xuICAgICAgICBuZXdWZW5hdGlvbi5wYXJlbnQgPSB2ZW5hdGlvbjtcblxuICAgICAgICB2ZW5hdGlvbnMucHVzaChuZXdWZW5hdGlvbik7XG4gICAgICAgIHZlbmF0aW9uLmNoaWxkcy5wdXNoKG5ld1ZlbmF0aW9uKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRBdXhpbkluZmx1ZW5jZURpcmVjdGlvbih2ZW5hdGlvbiwgaW5mbHVlbmNlckF1eGlucykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IFBvaW50KDAsIDApO1xuICAgICAgICB2YXIgdG90YWxJbmZsdWVuY2VyQXV4aW5zID0gaW5mbHVlbmNlckF1eGlucy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKCF0b3RhbEluZmx1ZW5jZXJBdXhpbnMpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEluZmx1ZW5jZXJBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIHAgPSBpbmZsdWVuY2VyQXV4aW5zW2ldLnBvaW50IC0gdmVuYXRpb24ucG9pbnQ7XG4gICAgICAgICAgICBwID0gcC5ub3JtYWxpemUoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdCArIHA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0Lmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgIHZhciBwID0gaW5mbHVlbmNlckF1eGluc1swXS5wb2ludCAtIHZlbmF0aW9uLnBvaW50O1xuICAgICAgICAgICAgcmVzdWx0ID0gcC5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5ub3JtYWxpemUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SW5mbHVlbmNlckF1eGlucyh2ZW5hdGlvbikge1xuICAgICAgICBpZiAodmVuYXRpb24ubmVpZ2hib3JBdXhpbnMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zID0gZ2V0TmVpZ2hib3JBdXhpbnModmVuYXRpb24ucG9pbnQpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmZsdWVuY2VyQXV4aW5zID0gW107XG4gICAgICAgIHZhciB0b3RhbE5laWdoYm9yQXV4aW5zID0gdmVuYXRpb24ubmVpZ2hib3JBdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTmVpZ2hib3JBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGluZmx1ZW5jZWRWZW5hdGlvbnMgPSBnZXRJbmZsdWVuY2VkVmVuYXRpb25zKHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zW2ldLnBvaW50KTtcbiAgICAgICAgICAgIHZhciB0b3RhbEluZmx1ZW5jZWRWZW5hdGlvbnMgPSBpbmZsdWVuY2VkVmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBpc0luZmx1ZW5jZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgdG90YWxJbmZsdWVuY2VkVmVuYXRpb25zOyBjKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5mbHVlbmNlZFZlbmF0aW9uc1tjXS5wb2ludCA9PSB2ZW5hdGlvbi5wb2ludCkge1xuICAgICAgICAgICAgICAgICAgICBpc0luZmx1ZW5jZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaXNJbmZsdWVuY2VkKSB7XG4gICAgICAgICAgICAgICAgaW5mbHVlbmNlckF1eGlucy5wdXNoKHZlbmF0aW9uLm5laWdoYm9yQXV4aW5zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmZsdWVuY2VyQXV4aW5zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE5laWdoYm9yQXV4aW5zKHBvaW50KSB7XG4gICAgICAgIHZhciBuZWlnaGJvcmhvb2RSYWRpdXMgPSBjb25maWd1cmF0aW9uLm5laWdoYm9yaG9vZFJhZGl1cztcbiAgICAgICAgdmFyIG5laWdoYm9yQXV4aW5zID0gW107XG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGQgPSBwb2ludC5nZXREaXN0YW5jZShhdXhpbnNbaV0ucG9pbnQsIHRydWUpO1xuICAgICAgICAgICAgaWYgKGQgPCBuZWlnaGJvcmhvb2RSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBuZWlnaGJvckF1eGlucy5wdXNoKGF1eGluc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JBdXhpbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0SW5mbHVlbmNlZFZlbmF0aW9ucyhwb2ludCkge1xuICAgICAgICB2YXIgcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucyA9IGdldFJlbGF0aXZlTmVpZ2hib3JWZWluYXRpb25zKHBvaW50KTtcbiAgICAgICAgdmFyIHRvdGFsUmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucyA9IHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsUmVsYXRpdmVOZWlnaGJvclZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnNbaV0ucG9pbnQgLSBwb2ludDtcbiAgICAgICAgICAgIGlmIChzLmxlbmd0aCA8IGNvbmZpZ3VyYXRpb24udGhyZWVzaG9sZFZlbmF0aW9uUmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgdG90YWxSZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zLS07XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UmVsYXRpdmVOZWlnaGJvclZlaW5hdGlvbnMocG9pbnQpIHtcbiAgICAgICAgdmFyIG5laWdoYm9yVmVuYXRpb25zID0gZ2V0TmVpZ2hib3JWZW5hdGlvbnMocG9pbnQpO1xuICAgICAgICB2YXIgcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucyA9IFtdO1xuICAgICAgICB2YXIgdG90YWxOZWlnaGJvclZlbmF0aW9ucyA9IG5laWdoYm9yVmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbE5laWdoYm9yVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdXhpblRvUDAgPSBuZWlnaGJvclZlbmF0aW9uc1tpXS5wb2ludCAtIHBvaW50O1xuICAgICAgICAgICAgdmFyIGZhaWwgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCB0b3RhbE5laWdoYm9yVmVuYXRpb25zOyBjKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYyA9PSBpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYXV4aW5Ub1AxID0gbmVpZ2hib3JWZW5hdGlvbnNbY10ucG9pbnQgLSBwb2ludDtcbiAgICAgICAgICAgICAgICBpZiAoYXV4aW5Ub1AxLmxlbmd0aCA+IGF1eGluVG9QMC5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBwMFRvUDEgPSBuZWlnaGJvclZlbmF0aW9uc1tjXS5wb2ludCAtIG5laWdoYm9yVmVuYXRpb25zW2ldLnBvaW50O1xuICAgICAgICAgICAgICAgIGlmIChhdXhpblRvUDAubGVuZ3RoID4gcDBUb1AxLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBmYWlsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWZhaWwpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zLnB1c2gobmVpZ2hib3JWZW5hdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TmVpZ2hib3JWZW5hdGlvbnMocG9pbnQpIHtcbiAgICAgICAgdmFyIG5laWdoYm9yaG9vZFJhZGl1cyA9IDMgKiBjb25maWd1cmF0aW9uLm5laWdoYm9yaG9vZFJhZGl1cyAqIGNvbmZpZ3VyYXRpb24ubmVpZ2hib3Job29kUmFkaXVzO1xuICAgICAgICB2YXIgbmVpZ2hib3JWZW5hdGlvbnMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsVmVuYXRpb25zID0gdmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHBvaW50LmdldERpc3RhbmNlKHZlbmF0aW9uc1tpXS5wb2ludCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZCA8IG5laWdoYm9yaG9vZFJhZGl1cykge1xuICAgICAgICAgICAgICAgIG5laWdoYm9yVmVuYXRpb25zLnB1c2godmVuYXRpb25zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvclZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBraWxsQXV4aW5zKCkge1xuICAgICAgICB2YXIgdG90YWxBdXhpbnMgPSBhdXhpbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsQXV4aW5zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBhdXhpbiA9IGF1eGluc1tpXTtcbiAgICAgICAgICAgIGlmIChhdXhpbi5pc0Rvb21lZCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmZsdWVuY2VkVmVuYXRpb25zID0gZ2V0SW5mbHVlbmNlZFZlbmF0aW9ucyhhdXhpbi5wb2ludCk7XG4gICAgICAgICAgICAgICAgdmFyIHRhZ2dlZFZlbmF0aW9ucyA9IGF1eGluLnRhZ2dlZFZlbmF0aW9ucztcbiAgICAgICAgICAgICAgICB2YXIgdG90YWxUYWdnZWRWZW5hdGlvbnMgPSB0YWdnZWRWZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHQgPSAwOyB0IDwgdG90YWxUYWdnZWRWZW5hdGlvbnM7IHQrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFnZ2VkVmVuYXRpb24gPSB0YWdnZWRWZW5hdGlvbnNbdF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gKHRhZ2dlZFZlbmF0aW9uLnBvaW50IC0gYXV4aW4ucG9pbnQpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBjb25maWd1cmF0aW9uLnRocmVlc2hvbGRWZW5hdGlvblJhZGl1cyB8fCBfLmNvbnRhaW5zKGluZmx1ZW5jZWRWZW5hdGlvbnMsIHRhZ2dlZFZlbmF0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFnZ2VkVmVuYXRpb25zLnNwbGljZSh0LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsVGFnZ2VkVmVuYXRpb25zLS07XG4gICAgICAgICAgICAgICAgICAgICAgICB0LS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAodGFnZ2VkVmVuYXRpb25zLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1eGlucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIHRvdGFsQXV4aW5zLS07XG4gICAgICAgICAgICAgICAgICAgIGktLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoaGl0VGVzdFZlbmF0aW9uKGF1eGluLnBvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW5mbHVlbmNlZFZlbmF0aW9ucyA9IGdldEluZmx1ZW5jZWRWZW5hdGlvbnMoYXV4aW4ucG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbHVlbmNlZFZlbmF0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXhpbi5pc0Rvb21lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdXhpbi50YWdnZWRWZW5hdGlvbnMgPSBpbmZsdWVuY2VkVmVuYXRpb25zO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV4aW5zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdGFsQXV4aW5zLS07XG4gICAgICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBcImluaXRcIjogaW5pdCxcbiAgICAgICAgXCJzdGVwXCI6IHN0ZXAsXG4gICAgICAgIFwiZ2V0QXV4aW5zXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGF1eGlucztcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRWZW5hdGlvbnNcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gdmVuYXRpb25zO1xuICAgICAgICB9LFxuICAgICAgICBcImlzRmluaXNoZWRcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gZmluaXNoZWQ7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gT3BlblZlbmF0aW9uQWxnb3JpdGhtKCk7XG4iLCJ2YXIgT3BlblZlbmF0aW9uQWxnb3JpdGhtID0gcmVxdWlyZShcIi4vT3BlblZlbmF0aW9uQWxnb3JpdGhtXCIpO1xudmFyIGNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKFwiLi9jb25maWd1cmF0aW9uLmpzb25cIik7XG5cbnZhciBQYXRoUmVuZGVyZXIgPSBmdW5jdGlvbigpIHtcblxuICAgIHZhciByZW5kZXJlZFZlbmF0aW9ucyA9IHt9O1xuICAgIHZhciB2ZW5hdGlvbnNQYXRoID0gbmV3IENvbXBvdW5kUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yXG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBkcmF3U2VlZFZlbmF0aW9ucyh2ZW5hdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlZWRzID0gXy5maXJzdCh2ZW5hdGlvbnMsIGNvbmZpZ3VyYXRpb24uc2VlZFZlbmF0aW9ucyk7XG4gICAgICAgIHZhciB0b3RhbFNlZWRzID0gc2VlZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsU2VlZHM7IGkrKykge1xuICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhzZWVkc1tpXS5jaGlsZHMsIHNlZWRzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdWZW5hdGlvbnMoY2hpbGRzLCBwYXJlbnQpIHtcblxuICAgICAgICB2YXIgaXRlcmF0aW9uUmVuZGVycyA9IFtdO1xuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSBjaGlsZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpbmNyZW1lbnROZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoIXJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2hpbGRzWyhpICsgMSldICE9PSBcInVuZGVmaW5lZFwiICYmIGNoaWxkc1tpXS5wb2ludC5nZXRBbmdsZShjaGlsZHNbKGkgKyAxKV0ucG9pbnQpID4gMikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmVuYXRpb25TZWdtZW50ID0gbmV3IFBhdGgobmV3IFNlZ21lbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1tpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzWyhpICsgMSldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkc1soaSArIDEpXS5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50TmV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmVuYXRpb25TZWdtZW50ID0gbmV3IFBhdGgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LmFkZChuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICkpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5hZGQobmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuc3Ryb2tlV2lkdGggPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoO1xuICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5zdHJva2VDb2xvciA9IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3I7XG4gICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LnN0cm9rZUNhcCA9ICdyb3VuZCc7XG4gICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LnN0cm9rZUpvaW4gPSAncm91bmQnO1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSA9IHZlbmF0aW9uU2VnbWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VXaWR0aCArPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmcgJiYgY2hpbGRzW2ldLmFnZSA+IHBhcmVudC5hZ2UgLyAxLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VDb2xvciAtPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRzW2ldLmNoaWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnR3aXN0ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhjaGlsZHNbaV0uY2hpbGRzLCBjaGlsZHNbaV0ucGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoY2hpbGRzW2ldLmNoaWxkcywgY2hpbGRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbmNyZW1lbnROZXh0KSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgdmVuYXRpb25zUGF0aC5icmluZ1RvRnJvbnQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3QXV4aW5zKGF1eGlucykge1xuXG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF1eGluUGF0aCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBbXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB2aWV3LnZpZXdTaXplLndpZHRoICogY29uZmlndXJhdGlvbi5hdXhpblJhZGl1cyxcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uYXV4aW5TdHJva2VDb2xvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChjb25maWd1cmF0aW9uLnNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5SZWN0YW5nbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHZpZXcudmlld1NpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjZW50ZXJcIjogW3ZpZXcudmlld1NpemUud2lkdGggLyAyLCB2aWV3LnZpZXdTaXplLmhlaWdodCAvIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyYWRpdXNcIjogdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLmluaXQoKTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5kcmF3QXV4aW5zID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZHJhd0F1eGlucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0QXV4aW5zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRyYXdTZWVkVmVuYXRpb25zKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5nZXRWZW5hdGlvbnMoKSk7XG5cbiAgICAgICAgICAgIE9wZW5WZW5hdGlvbkFsZ29yaXRobS5zdGVwKCk7XG5cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBhdGhSZW5kZXJlcigpO1xuIiwidmFyIGNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKFwiLi9jb25maWd1cmF0aW9uLmpzb25cIik7XG52YXIgQ2lyY2xlc1JlbmRlcmVyID0gcmVxdWlyZShcIi4vQ2lyY2xlc1JlbmRlcmVyXCIpO1xudmFyIExpbmVzUmVuZGVyZXIgPSByZXF1aXJlKFwiLi9MaW5lc1JlbmRlcmVyXCIpO1xudmFyIFBhdGhSZW5kZXJlciA9IHJlcXVpcmUoXCIuL1BhdGhSZW5kZXJlclwiKTtcblxuc3dpdGNoIChjb25maWd1cmF0aW9uLnJlbmRlcmVyKSB7XG4gICAgY2FzZSAnTGluZXNSZW5kZXJlcic6XG4gICAgICAgIHZhciBSZW5kZXJlciA9IExpbmVzUmVuZGVyZXI7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BhdGhSZW5kZXJlcic6XG4gICAgICAgIHZhciBSZW5kZXJlciA9IFBhdGhSZW5kZXJlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQ2lyY2xlc1JlbmRlcmVyJzpcbiAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgUmVuZGVyZXIgPSBDaXJjbGVzUmVuZGVyZXI7XG59XG5cblJlbmRlcmVyLmluaXQoKTtcbnBhcGVyLnZpZXcub25GcmFtZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCFSZW5kZXJlci5kcmF3KCkpIHtcbiAgICAgICAgcGFwZXIudmlldy5vbkZyYW1lID0gbnVsbDtcbiAgICB9XG59O1xuIiwidmFyIFZlbmF0aW9uID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICB0aGlzLnBvaW50ID0gcG9pbnQ7XG4gICAgdGhpcy5yZW5kZXJlZCA9IG51bGw7XG5cbiAgICB0aGlzLmlkID0gVmVuYXRpb24ucHJvZ3Jlc3NpdmU7XG4gICAgVmVuYXRpb24ucHJvZ3Jlc3NpdmUrKztcblxuICAgIHRoaXMuYWdlID0gMDtcbiAgICB0aGlzLm5laWdoYm9yQXV4aW5zID0gbnVsbDtcbiAgICB0aGlzLmNoaWxkcyA9IFtdO1xuICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbn1cblxuVmVuYXRpb24ucHJvZ3Jlc3NpdmUgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZlbmF0aW9uO1xuIiwibW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgXCJzaGFwZVwiOiBcImNpcmNsZVwiLFxuICAgIFwiYXV4aW5SYWRpdXNcIjogMC4wMTI1LFxuICAgIFwidmVuYXRpb25SYWRpdXNcIjogMC4wMTI1LFxuICAgIFwidGhyZWVzaG9sZEF1eGluUmFkaXVzXCI6IDAuMDA5LFxuICAgIFwidGhyZWVzaG9sZFZlbmF0aW9uUmFkaXVzXCI6IDAuMDEyNSxcbiAgICBcIm5laWdoYm9yaG9vZFJhZGl1c1wiOiAwLjEsXG4gICAgXCJzZWVkQXV4aW5zXCI6IDIwMDAsXG4gICAgXCJzZWVkVmVuYXRpb25zXCI6IDEsXG4gICAgXCJzZWVkc0NlbnRlcmluZ0ZhY3RvclwiOiAwLjAxLFxuICAgIFwibWF4VmVuYXRpb25Ob2RlQWdlXCI6IDIsXG4gICAgXCJyZW5kZXJlclwiOiBcIlBhdGhSZW5kZXJlclwiLFxuICAgIFwicmVuZGVyZXJDb25maWd1cmF0aW9uXCI6IHtcbiAgICAgICAgXCJkcmF3QXV4aW5zXCI6IHRydWUsXG4gICAgICAgIFwidHdpc3RlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZUNvbG9yXCI6IFwiI0EyQ0EwMVwiLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZ1wiOiBmYWxzZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3JcIjogMC4wMDM1LFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlV2lkdGhcIjogMSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdcIjogdHJ1ZSxcbiAgICAgICAgXCJ2ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3JcIjogMC4xLFxuICAgICAgICBcImF1eGluU3Ryb2tlQ29sb3JcIjogXCIjZmViYTE4XCIsXG4gICAgICAgIFwic2hhcGVGaWxsQ29sb3JcIjogXCIjZmZmXCIsXG4gICAgICAgIFwic2hhcGVTdHJva2VDb2xvclwiOiBcIiM2NjZcIixcbiAgICAgICAgXCJzaGFwZVN0cm9rZVdpZHRoXCI6IDFcbiAgICB9XG59XG4iXX0=
