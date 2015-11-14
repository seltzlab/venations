(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports=module.exports = {
    "shape": "circle",
    "auxinRadius": 0.0125,
    "venationRadius": 0.0125,
    "threesholdAuxinRadius": 0.009,
    "threesholdVenationRadius": 0.0125,
    "neighborhoodRadius": 0.1,
    "seedAuxins": 2000,
    "seedVenations": 1,
    "seedsCenteringFactor": 0.025,
    "maxVenationNodeAge": 2,
    "renderer": "PathRenderer",
    "rendererConfiguration": {
        "drawAuxins": true,
        "twisted": false,
        "venationStrokeColor": "#5ca900",
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

},{}],2:[function(require,module,exports){
var Auxin = function(point) {
    this.point = point;
    this.isDoomed = false;

    this.taggedVenations = [];

    this.id = Auxin.progressive;
    Auxin.progressive++;
}

Auxin.progressive = 0;

module.exports = Auxin;

},{}],3:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("../configuration.json");

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

},{"../configuration.json":1,"./OpenVenationAlgorithm":5}],4:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("../configuration.json");

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

},{"../configuration.json":1,"./OpenVenationAlgorithm":5}],5:[function(require,module,exports){
var Auxin = require("./Auxin.js");
var Venation = require("./Venation.js");
var VenationsMatrix = require("./VenationsMatrix.js");
var configuration = require("../configuration.json");

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
        var neighborVenationsByMatrix = VenationsMatrix.get(point);
        if (neighborVenationsByMatrix.length < 1) {
            neighborVenationsByMatrix = venations.slice(0);
        }
        var totalVenations = neighborVenationsByMatrix.length;
        for (var i = 0; i < totalVenations; i++) {
            var d = point.getDistance(neighborVenationsByMatrix[i].point, true);
            if (d < neighborhoodRadius) {
                neighborVenations.push(neighborVenationsByMatrix[i]);
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

},{"../configuration.json":1,"./Auxin.js":2,"./Venation.js":8,"./VenationsMatrix.js":9}],6:[function(require,module,exports){
var OpenVenationAlgorithm = require("./OpenVenationAlgorithm");
var configuration = require("../configuration.json");

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

},{"../configuration.json":1,"./OpenVenationAlgorithm":5}],7:[function(require,module,exports){
var configuration = require("../configuration.json");
var CirclesRenderer = require("./CirclesRenderer");
var LinesRenderer = require("./LinesRenderer");
var PathRenderer = require("./PathRenderer");

var VenationsMatrix = require("./VenationsMatrix");

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

console.time("render");
Renderer.init();
paper.view.onFrame = function(event) {
    if (!Renderer.draw()) {
        paper.view.onFrame = null;
        console.timeEnd("render");
    }
};

},{"../configuration.json":1,"./CirclesRenderer":3,"./LinesRenderer":4,"./PathRenderer":6,"./VenationsMatrix":9}],8:[function(require,module,exports){
var venationsMatrix = require("./VenationsMatrix");

var Venation = function(point) {
    this.point = point;
    this.rendered = null;

    this.id = Venation.progressive;
    Venation.progressive++;

    this.age = 0;
    this.neighborAuxins = null;
    this.childs = [];
    this.parent = null;

    // calculate the matrix cell
    venationsMatrix.add(this);
}

Venation.progressive = 0;

module.exports = Venation;

},{"./VenationsMatrix":9}],9:[function(require,module,exports){
var VenationsMatrix = function() {

    // matrix neighbor radius
    var R = 1;

    // init the matrix
    var N = 10;
    var matrix = {};
    for (var i = 0; i < N; i++) {
        matrix[i] = {};
        for (var j = 0; j < N; j++) {
            matrix[i][j] = [];
        }
    }

    var coords = function(point) {
        return {
            i: Math.floor(Math.abs(point.x) * N),
            j: Math.floor(Math.abs(point.y) * N)
        };
    }

    return {
        add: function(venation) {
            var c = coords(venation.point);
            matrix[c.i][c.j].push(venation);
        },
        get: function(point) {
            var c = coords(point);

            var result = matrix[c.i][c.j].slice(0);

            var minLimitI = (c.i - R) <= 0 ? c.i : c.i - R;
            var maxLimitI = (c.i + R) > N ? c.i : c.i + R;
            var minLimitJ = (c.j - R) <= 0 ? c.j : c.j - R;
            var maxLimitJ = (c.j + R) > N ? c.j : c.j + R;

            for (var i = minLimitI; i <= maxLimitI; i++) {
                if (typeof matrix[i] === "undefined") {
                    continue;
                }

                for (var j = minLimitJ; j <= maxLimitJ; j++) {
                    if (typeof matrix[i][j] !== "undefined" && matrix[i][j].length > 0) {
                        result.concat(matrix[i][j].slice(0));
                    }
                }
            }

            return result;
        },
        getMatrix: function() {
            return matrix;
        },
        coords: coords
    }
};

module.exports = VenationsMatrix();

},{}]},{},[2,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWd1cmF0aW9uLmpzb24iLCJzcmMvQXV4aW4uanMiLCJzcmMvQ2lyY2xlc1JlbmRlcmVyLmpzIiwic3JjL0xpbmVzUmVuZGVyZXIuanMiLCJzcmMvT3BlblZlbmF0aW9uQWxnb3JpdGhtLmpzIiwic3JjL1BhdGhSZW5kZXJlci5qcyIsInNyYy9SdW5uZXIuanMiLCJzcmMvVmVuYXRpb24uanMiLCJzcmMvVmVuYXRpb25zTWF0cml4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzPW1vZHVsZS5leHBvcnRzID0ge1xuICAgIFwic2hhcGVcIjogXCJjaXJjbGVcIixcbiAgICBcImF1eGluUmFkaXVzXCI6IDAuMDEyNSxcbiAgICBcInZlbmF0aW9uUmFkaXVzXCI6IDAuMDEyNSxcbiAgICBcInRocmVlc2hvbGRBdXhpblJhZGl1c1wiOiAwLjAwOSxcbiAgICBcInRocmVlc2hvbGRWZW5hdGlvblJhZGl1c1wiOiAwLjAxMjUsXG4gICAgXCJuZWlnaGJvcmhvb2RSYWRpdXNcIjogMC4xLFxuICAgIFwic2VlZEF1eGluc1wiOiAyMDAwLFxuICAgIFwic2VlZFZlbmF0aW9uc1wiOiAxLFxuICAgIFwic2VlZHNDZW50ZXJpbmdGYWN0b3JcIjogMC4wMjUsXG4gICAgXCJtYXhWZW5hdGlvbk5vZGVBZ2VcIjogMixcbiAgICBcInJlbmRlcmVyXCI6IFwiUGF0aFJlbmRlcmVyXCIsXG4gICAgXCJyZW5kZXJlckNvbmZpZ3VyYXRpb25cIjoge1xuICAgICAgICBcImRyYXdBdXhpbnNcIjogdHJ1ZSxcbiAgICAgICAgXCJ0d2lzdGVkXCI6IGZhbHNlLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlQ29sb3JcIjogXCIjNWNhOTAwXCIsXG4gICAgICAgIFwidmVuYXRpb25TdHJva2VDb2xvckFnaW5nXCI6IGZhbHNlLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZ0ZhY3RvclwiOiAwLjAwMzUsXG4gICAgICAgIFwidmVuYXRpb25TdHJva2VXaWR0aFwiOiAxLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZ1wiOiB0cnVlLFxuICAgICAgICBcInZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZ0ZhY3RvclwiOiAwLjEsXG4gICAgICAgIFwiYXV4aW5TdHJva2VDb2xvclwiOiBcIiNmZWJhMThcIixcbiAgICAgICAgXCJzaGFwZUZpbGxDb2xvclwiOiBcIiNmZmZcIixcbiAgICAgICAgXCJzaGFwZVN0cm9rZUNvbG9yXCI6IFwiIzY2NlwiLFxuICAgICAgICBcInNoYXBlU3Ryb2tlV2lkdGhcIjogMVxuICAgIH1cbn1cbiIsInZhciBBdXhpbiA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgdGhpcy5wb2ludCA9IHBvaW50O1xuICAgIHRoaXMuaXNEb29tZWQgPSBmYWxzZTtcblxuICAgIHRoaXMudGFnZ2VkVmVuYXRpb25zID0gW107XG5cbiAgICB0aGlzLmlkID0gQXV4aW4ucHJvZ3Jlc3NpdmU7XG4gICAgQXV4aW4ucHJvZ3Jlc3NpdmUrKztcbn1cblxuQXV4aW4ucHJvZ3Jlc3NpdmUgPSAwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF1eGluO1xuIiwidmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IHJlcXVpcmUoXCIuL09wZW5WZW5hdGlvbkFsZ29yaXRobVwiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4uL2NvbmZpZ3VyYXRpb24uanNvblwiKTtcblxudmFyIENpcmNsZXNSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gZHJhd1ZlbmF0aW9ucyh2ZW5hdGlvbnMpIHtcblxuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSB2ZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcblxuICAgICAgICAgICAgaWYgKCF2ZW5hdGlvbnNbaV0ucmVuZGVyZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmVuYXRpb25QYXRoID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICAgICAgY2VudGVyOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvbnNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvbnNbaV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgICAgIHJhZGl1czogdmlldy52aWV3U2l6ZS53aWR0aCAqIGNvbmZpZ3VyYXRpb24udmVuYXRpb25SYWRpdXMsXG4gICAgICAgICAgICAgICAgICAgIGZpbGxDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2ZW5hdGlvbnNbaV0ucmVuZGVyZWQgPSB2ZW5hdGlvblBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VXaWR0aEFnaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlbmF0aW9uc1tpXS5zdHJva2VXaWR0aCArPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmcgJiYgdmVuYXRpb25zW2ldLmFnZSA+IHBhcmVudC5hZ2UgLyAxLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25zW2ldLnN0cm9rZUNvbG9yIC09IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZ0ZhY3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3QXV4aW5zKGF1eGlucykge1xuXG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF1eGluUGF0aCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBbXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB2aWV3LnZpZXdTaXplLndpZHRoICogY29uZmlndXJhdGlvbi5hdXhpblJhZGl1cyxcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uYXV4aW5TdHJva2VDb2xvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChjb25maWd1cmF0aW9uLnNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5SZWN0YW5nbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHZpZXcudmlld1NpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjZW50ZXJcIjogW3ZpZXcudmlld1NpemUud2lkdGggLyAyLCB2aWV3LnZpZXdTaXplLmhlaWdodCAvIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyYWRpdXNcIjogdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLmluaXQoKTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5kcmF3QXV4aW5zID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZHJhd0F1eGlucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0QXV4aW5zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldFZlbmF0aW9ucygpKTtcblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLnN0ZXAoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2lyY2xlc1JlbmRlcmVyKCk7XG4iLCJ2YXIgT3BlblZlbmF0aW9uQWxnb3JpdGhtID0gcmVxdWlyZShcIi4vT3BlblZlbmF0aW9uQWxnb3JpdGhtXCIpO1xudmFyIGNvbmZpZ3VyYXRpb24gPSByZXF1aXJlKFwiLi4vY29uZmlndXJhdGlvbi5qc29uXCIpO1xuXG52YXIgTGluZXNSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlbmRlcmVkVmVuYXRpb25zID0ge307XG5cbiAgICBmdW5jdGlvbiBkcmF3U2VlZFZlbmF0aW9ucyh2ZW5hdGlvbnMpIHtcbiAgICAgICAgdmFyIHNlZWRzID0gXy5maXJzdCh2ZW5hdGlvbnMsIGNvbmZpZ3VyYXRpb24uc2VlZFZlbmF0aW9ucyk7XG4gICAgICAgIHZhciB0b3RhbFNlZWRzID0gc2VlZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsU2VlZHM7IGkrKykge1xuICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhzZWVkc1tpXS5jaGlsZHMsIHNlZWRzW2ldKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdWZW5hdGlvbnMoY2hpbGRzLCBwYXJlbnQpIHtcblxuICAgICAgICB2YXIgdG90YWxWZW5hdGlvbnMgPSBjaGlsZHMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIGlmICghcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSkge1xuICAgICAgICAgICAgICAgIHZhciB2ZW5hdGlvblBhdGggPSBuZXcgUGF0aC5MaW5lKHtcbiAgICAgICAgICAgICAgICAgICAgZnJvbTogbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICB0bzogbmV3IFBvaW50KFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICApLFxuICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJyxcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlSm9pbjogJ3JvdW5kJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSA9IHZlbmF0aW9uUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VXaWR0aCArPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZVdpZHRoQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmcgJiYgY2hpbGRzW2ldLmFnZSA+IHBhcmVudC5hZ2UgLyAxLjUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXS5zdHJva2VDb2xvciAtPSBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi52ZW5hdGlvblN0cm9rZUNvbG9yQWdpbmdGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2hpbGRzW2ldLmNoaWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnR3aXN0ZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhjaGlsZHNbaV0uY2hpbGRzLCBjaGlsZHNbaV0ucGFyZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRyYXdWZW5hdGlvbnMoY2hpbGRzW2ldLmNoaWxkcywgY2hpbGRzW2ldKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkcmF3QXV4aW5zKGF1eGlucykge1xuXG4gICAgICAgIHZhciB0b3RhbEF1eGlucyA9IGF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxBdXhpbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF1eGluUGF0aCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgY2VudGVyOiBbXG4gICAgICAgICAgICAgICAgICAgIGF1eGluc1tpXS5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB2aWV3LnZpZXdTaXplLndpZHRoICogY29uZmlndXJhdGlvbi5hdXhpblJhZGl1cyxcbiAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uYXV4aW5TdHJva2VDb2xvclxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgc3dpdGNoIChjb25maWd1cmF0aW9uLnNoYXBlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3F1YXJlJzpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5SZWN0YW5nbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJ4XCI6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInlcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwid2lkdGhcIjogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaGVpZ2h0XCI6IHZpZXcudmlld1NpemUuaGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJmaWxsQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVGaWxsQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZUNvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlQ29sb3IsXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0cm9rZVdpZHRoXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlU3Ryb2tlV2lkdGhcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tncm91bmQgPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgXCJjZW50ZXJcIjogW3ZpZXcudmlld1NpemUud2lkdGggLyAyLCB2aWV3LnZpZXdTaXplLmhlaWdodCAvIDJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJyYWRpdXNcIjogdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLmluaXQoKTtcbiAgICAgICAgICAgIGlmIChjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5kcmF3QXV4aW5zID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgZHJhd0F1eGlucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0QXV4aW5zKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkcmF3OiBmdW5jdGlvbigpIHtcblxuICAgICAgICAgICAgaWYgKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5pc0ZpbmlzaGVkKCkpIHtcbiAgICAgICAgICAgICAgICAvKmNvbnNvbGUubG9nKHJlbmRlcmVkVmVuYXRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgaWRzID0gXy5rZXlzKHJlbmRlcmVkVmVuYXRpb25zKTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IDI7XG4gICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1soaSAtIDEpXSA9IHJlbmRlcmVkVmVuYXRpb25zWyhpIC0gMSldLnVuaXRlKHJlbmRlcmVkVmVuYXRpb25zW2ldKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyZWRWZW5hdGlvbnNbKGkgLSAxKV0uc21vb3RoKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2ldLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlKGkgPCBpZHMubGVuZ3RoKVxuXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVuZGVyZWRWZW5hdGlvbnMpOyovXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBkcmF3U2VlZFZlbmF0aW9ucyhPcGVuVmVuYXRpb25BbGdvcml0aG0uZ2V0VmVuYXRpb25zKCkpO1xuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uc3RlcCgpO1xuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW5lc1JlbmRlcmVyKCk7XG4iLCJ2YXIgQXV4aW4gPSByZXF1aXJlKFwiLi9BdXhpbi5qc1wiKTtcbnZhciBWZW5hdGlvbiA9IHJlcXVpcmUoXCIuL1ZlbmF0aW9uLmpzXCIpO1xudmFyIFZlbmF0aW9uc01hdHJpeCA9IHJlcXVpcmUoXCIuL1ZlbmF0aW9uc01hdHJpeC5qc1wiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4uL2NvbmZpZ3VyYXRpb24uanNvblwiKTtcblxudmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHZhbGlkVmVuYXRpb25UaHJlZXNob2xkID0gY29uZmlndXJhdGlvbi5tYXhWZW5hdGlvbk5vZGVBZ2U7XG5cbiAgICB2YXIgdmVuYXRpb25zID0gW107XG4gICAgdmFyIGF1eGlucyA9IFtdO1xuICAgIHZhciBmaW5pc2hlZCA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21DaXJjbGVQb2ludCgpIHtcbiAgICAgICAgICAgIHZhciB0ID0gMiAqIE1hdGguUEkgKiBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogKDAuNSAtIGNvbmZpZ3VyYXRpb24uc2VlZHNDZW50ZXJpbmdGYWN0b3IpO1xuICAgICAgICAgICAgdmFyIHggPSAwLjUgKyByICogTWF0aC5jb3ModCk7XG4gICAgICAgICAgICB2YXIgeSA9IDAuNSArIHIgKiBNYXRoLnNpbih0KTtcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBQb2ludCh4LCB5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldFJhbmRvbVNxdWFyZVBvaW50KCkge1xuICAgICAgICAgICAgdmFyIHggPSBNYXRoLm1heChNYXRoLnJhbmRvbSgpIC0gY29uZmlndXJhdGlvbi5zZWVkc0NlbnRlcmluZ0ZhY3RvciwgMCk7XG4gICAgICAgICAgICB2YXIgeSA9IE1hdGgubWF4KE1hdGgucmFuZG9tKCkgLSBjb25maWd1cmF0aW9uLnNlZWRzQ2VudGVyaW5nRmFjdG9yLCAwKTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUG9pbnQoeCwgeSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBnZXRSYW5kb21Qb2ludCgpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY29uZmlndXJhdGlvbi5zaGFwZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ3NxdWFyZSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21TcXVhcmVQb2ludCgpO1xuICAgICAgICAgICAgICAgIGNhc2UgJ2NpcmNsZSc6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUNpcmNsZVBvaW50KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZWVkVmVuYXRpb25zKCkge1xuICAgICAgICAgICAgdmFyIGxvb3BDb3VudGVyID0gMDtcbiAgICAgICAgICAgIHdoaWxlICh2ZW5hdGlvbnMubGVuZ3RoIDwgY29uZmlndXJhdGlvbi5zZWVkVmVuYXRpb25zICYmIGxvb3BDb3VudGVyIDwgY29uZmlndXJhdGlvbi5zZWVkVmVuYXRpb25zICogMS41KSB7XG4gICAgICAgICAgICAgICAgLy8gc2VlZCBhdXhpbiBpbnNpZGUgYSBjaXJjbGVcbiAgICAgICAgICAgICAgICB2YXIgcG9pbnQgPSBnZXRSYW5kb21Qb2ludCgpO1xuICAgICAgICAgICAgICAgIGlmICghaGl0VGVzdFZlbmF0aW9uKHBvaW50KSkge1xuICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvbnMucHVzaChuZXcgVmVuYXRpb24ocG9pbnQpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsb29wQ291bnRlcisrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2VlZEF1eGlucygpIHtcbiAgICAgICAgICAgIHZhciBsb29wQ291bnRlciA9IDA7XG4gICAgICAgICAgICB3aGlsZSAoYXV4aW5zLmxlbmd0aCA8IGNvbmZpZ3VyYXRpb24uc2VlZEF1eGlucyAmJiBsb29wQ291bnRlciA8IGNvbmZpZ3VyYXRpb24uc2VlZEF1eGlucyAqIDEuNSkge1xuICAgICAgICAgICAgICAgIC8vIHNlZWQgYXV4aW4gaW5zaWRlIGEgY2lyY2xlXG4gICAgICAgICAgICAgICAgdmFyIHBvaW50ID0gZ2V0UmFuZG9tUG9pbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWhpdFRlc3RBdXhpbihwb2ludCkgJiYgIWhpdFRlc3RWZW5hdGlvbihwb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zLnB1c2gobmV3IEF1eGluKHBvaW50KSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbG9vcENvdW50ZXIrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHNlZWRWZW5hdGlvbnMoKTtcbiAgICAgICAgc2VlZEF1eGlucygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpdFRlc3RBdXhpbihwb2ludCkge1xuICAgICAgICB2YXIgYXV4aW5IaXRSYWRpdXMgPSBjb25maWd1cmF0aW9uLnRocmVlc2hvbGRBdXhpblJhZGl1cztcbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHBvaW50LmdldERpc3RhbmNlKGF1eGluc1tpXS5wb2ludCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZCA8IGF1eGluSGl0UmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGl0VGVzdFZlbmF0aW9uKHBvaW50KSB7XG4gICAgICAgIHZhciB2ZW5hdGlvbkhpdFJhZGl1cyA9IGNvbmZpZ3VyYXRpb24udGhyZWVzaG9sZFZlbmF0aW9uUmFkaXVzICogY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXM7XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHBvaW50LmdldERpc3RhbmNlKHZlbmF0aW9uc1tpXS5wb2ludCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZCA8IHZlbmF0aW9uSGl0UmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFzVmFsaWRWZW5hdGlvbnMoKSB7XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIHZhciB2YWxpZFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgaWYgKHZlbmF0aW9uc1tpXS5hZ2UgPj0gdmFsaWRWZW5hdGlvblRocmVlc2hvbGQpIHtcbiAgICAgICAgICAgICAgICB2YWxpZFZlbmF0aW9ucy0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHZhbGlkVmVuYXRpb25zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0ZXAoKSB7XG5cbiAgICAgICAgaWYgKCFoYXNWYWxpZFZlbmF0aW9ucygpKSB7XG4gICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBwbGFjZVZlbmF0aW9ucygpO1xuICAgICAgICBraWxsQXV4aW5zKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxhY2VWZW5hdGlvbnMoKSB7XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IHZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIC8vIHRoZSB2ZW5hdGlvbnMgbGlmZSBsb29wOiBvbmUgY3ljbGUgLT4gYWdlKytcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbFZlbmF0aW9uczsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodmVuYXRpb25zW2ldLmFnZSA8IHZhbGlkVmVuYXRpb25UaHJlZXNob2xkKSB7XG4gICAgICAgICAgICAgICAgcGxhY2VWZW5hdGlvbih2ZW5hdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmVuYXRpb25zW2ldLmFnZSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGxhY2VWZW5hdGlvbih2ZW5hdGlvbikge1xuICAgICAgICB2YXIgaW5mbHVlbmNlckF1eGlucyA9IGdldEluZmx1ZW5jZXJBdXhpbnModmVuYXRpb24pO1xuICAgICAgICB2YXIgcCA9IGdldEF1eGluSW5mbHVlbmNlRGlyZWN0aW9uKHZlbmF0aW9uLCBpbmZsdWVuY2VyQXV4aW5zKTtcblxuICAgICAgICBpZiAocCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcCAqPSAyICogY29uZmlndXJhdGlvbi52ZW5hdGlvblJhZGl1cztcbiAgICAgICAgcCA9IHAgKyB2ZW5hdGlvbi5wb2ludDtcblxuICAgICAgICB2YXIgbmV3VmVuYXRpb24gPSBuZXcgVmVuYXRpb24ocCk7XG4gICAgICAgIG5ld1ZlbmF0aW9uLnBhcmVudCA9IHZlbmF0aW9uO1xuXG4gICAgICAgIHZlbmF0aW9ucy5wdXNoKG5ld1ZlbmF0aW9uKTtcbiAgICAgICAgdmVuYXRpb24uY2hpbGRzLnB1c2gobmV3VmVuYXRpb24pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEF1eGluSW5mbHVlbmNlRGlyZWN0aW9uKHZlbmF0aW9uLCBpbmZsdWVuY2VyQXV4aW5zKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgICAgIHZhciB0b3RhbEluZmx1ZW5jZXJBdXhpbnMgPSBpbmZsdWVuY2VyQXV4aW5zLmxlbmd0aDtcblxuICAgICAgICBpZiAoIXRvdGFsSW5mbHVlbmNlckF1eGlucykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsSW5mbHVlbmNlckF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcCA9IGluZmx1ZW5jZXJBdXhpbnNbaV0ucG9pbnQgLSB2ZW5hdGlvbi5wb2ludDtcbiAgICAgICAgICAgIHAgPSBwLm5vcm1hbGl6ZSgpO1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0ICsgcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChyZXN1bHQubGVuZ3RoIDwgMSkge1xuICAgICAgICAgICAgdmFyIHAgPSBpbmZsdWVuY2VyQXV4aW5zWzBdLnBvaW50IC0gdmVuYXRpb24ucG9pbnQ7XG4gICAgICAgICAgICByZXN1bHQgPSBwLm5vcm1hbGl6ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm5vcm1hbGl6ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbmZsdWVuY2VyQXV4aW5zKHZlbmF0aW9uKSB7XG4gICAgICAgIGlmICh2ZW5hdGlvbi5uZWlnaGJvckF1eGlucyA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdmVuYXRpb24ubmVpZ2hib3JBdXhpbnMgPSBnZXROZWlnaGJvckF1eGlucyh2ZW5hdGlvbi5wb2ludCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZmx1ZW5jZXJBdXhpbnMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsTmVpZ2hib3JBdXhpbnMgPSB2ZW5hdGlvbi5uZWlnaGJvckF1eGlucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxOZWlnaGJvckF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaW5mbHVlbmNlZFZlbmF0aW9ucyA9IGdldEluZmx1ZW5jZWRWZW5hdGlvbnModmVuYXRpb24ubmVpZ2hib3JBdXhpbnNbaV0ucG9pbnQpO1xuICAgICAgICAgICAgdmFyIHRvdGFsSW5mbHVlbmNlZFZlbmF0aW9ucyA9IGluZmx1ZW5jZWRWZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGlzSW5mbHVlbmNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgYyA9IDA7IGMgPCB0b3RhbEluZmx1ZW5jZWRWZW5hdGlvbnM7IGMrKykge1xuICAgICAgICAgICAgICAgIGlmIChpbmZsdWVuY2VkVmVuYXRpb25zW2NdLnBvaW50ID09IHZlbmF0aW9uLnBvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGlzSW5mbHVlbmNlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0luZmx1ZW5jZWQpIHtcbiAgICAgICAgICAgICAgICBpbmZsdWVuY2VyQXV4aW5zLnB1c2godmVuYXRpb24ubmVpZ2hib3JBdXhpbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZmx1ZW5jZXJBdXhpbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0TmVpZ2hib3JBdXhpbnMocG9pbnQpIHtcbiAgICAgICAgdmFyIG5laWdoYm9yaG9vZFJhZGl1cyA9IGNvbmZpZ3VyYXRpb24ubmVpZ2hib3Job29kUmFkaXVzO1xuICAgICAgICB2YXIgbmVpZ2hib3JBdXhpbnMgPSBbXTtcbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZCA9IHBvaW50LmdldERpc3RhbmNlKGF1eGluc1tpXS5wb2ludCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZCA8IG5laWdoYm9yaG9vZFJhZGl1cykge1xuICAgICAgICAgICAgICAgIG5laWdoYm9yQXV4aW5zLnB1c2goYXV4aW5zW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZWlnaGJvckF1eGlucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbmZsdWVuY2VkVmVuYXRpb25zKHBvaW50KSB7XG4gICAgICAgIHZhciByZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zID0gZ2V0UmVsYXRpdmVOZWlnaGJvclZlaW5hdGlvbnMocG9pbnQpO1xuICAgICAgICB2YXIgdG90YWxSZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zID0gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxSZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzID0gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9uc1tpXS5wb2ludCAtIHBvaW50O1xuICAgICAgICAgICAgaWYgKHMubGVuZ3RoIDwgY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXMpIHtcbiAgICAgICAgICAgICAgICByZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB0b3RhbFJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMtLTtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRSZWxhdGl2ZU5laWdoYm9yVmVpbmF0aW9ucyhwb2ludCkge1xuICAgICAgICB2YXIgbmVpZ2hib3JWZW5hdGlvbnMgPSBnZXROZWlnaGJvclZlbmF0aW9ucyhwb2ludCk7XG4gICAgICAgIHZhciByZWxhdGl2ZU5laWdoYm9yVmVuYXRpb25zID0gW107XG4gICAgICAgIHZhciB0b3RhbE5laWdoYm9yVmVuYXRpb25zID0gbmVpZ2hib3JWZW5hdGlvbnMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsTmVpZ2hib3JWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGF1eGluVG9QMCA9IG5laWdoYm9yVmVuYXRpb25zW2ldLnBvaW50IC0gcG9pbnQ7XG4gICAgICAgICAgICB2YXIgZmFpbCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBjID0gMDsgYyA8IHRvdGFsTmVpZ2hib3JWZW5hdGlvbnM7IGMrKykge1xuICAgICAgICAgICAgICAgIGlmIChjID09IGkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBhdXhpblRvUDEgPSBuZWlnaGJvclZlbmF0aW9uc1tjXS5wb2ludCAtIHBvaW50O1xuICAgICAgICAgICAgICAgIGlmIChhdXhpblRvUDEubGVuZ3RoID4gYXV4aW5Ub1AwLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHAwVG9QMSA9IG5laWdoYm9yVmVuYXRpb25zW2NdLnBvaW50IC0gbmVpZ2hib3JWZW5hdGlvbnNbaV0ucG9pbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGF1eGluVG9QMC5sZW5ndGggPiBwMFRvUDEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGZhaWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZmFpbCkge1xuICAgICAgICAgICAgICAgIHJlbGF0aXZlTmVpZ2hib3JWZW5hdGlvbnMucHVzaChuZWlnaGJvclZlbmF0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVsYXRpdmVOZWlnaGJvclZlbmF0aW9ucztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXROZWlnaGJvclZlbmF0aW9ucyhwb2ludCkge1xuICAgICAgICB2YXIgbmVpZ2hib3Job29kUmFkaXVzID0gMyAqIGNvbmZpZ3VyYXRpb24ubmVpZ2hib3Job29kUmFkaXVzICogY29uZmlndXJhdGlvbi5uZWlnaGJvcmhvb2RSYWRpdXM7XG4gICAgICAgIHZhciBuZWlnaGJvclZlbmF0aW9ucyA9IFtdO1xuICAgICAgICB2YXIgbmVpZ2hib3JWZW5hdGlvbnNCeU1hdHJpeCA9IFZlbmF0aW9uc01hdHJpeC5nZXQocG9pbnQpO1xuICAgICAgICBpZiAobmVpZ2hib3JWZW5hdGlvbnNCeU1hdHJpeC5sZW5ndGggPCAxKSB7XG4gICAgICAgICAgICBuZWlnaGJvclZlbmF0aW9uc0J5TWF0cml4ID0gdmVuYXRpb25zLnNsaWNlKDApO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IG5laWdoYm9yVmVuYXRpb25zQnlNYXRyaXgubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsVmVuYXRpb25zOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBkID0gcG9pbnQuZ2V0RGlzdGFuY2UobmVpZ2hib3JWZW5hdGlvbnNCeU1hdHJpeFtpXS5wb2ludCwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAoZCA8IG5laWdoYm9yaG9vZFJhZGl1cykge1xuICAgICAgICAgICAgICAgIG5laWdoYm9yVmVuYXRpb25zLnB1c2gobmVpZ2hib3JWZW5hdGlvbnNCeU1hdHJpeFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmVpZ2hib3JWZW5hdGlvbnM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24ga2lsbEF1eGlucygpIHtcbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXV4aW4gPSBhdXhpbnNbaV07XG4gICAgICAgICAgICBpZiAoYXV4aW4uaXNEb29tZWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5mbHVlbmNlZFZlbmF0aW9ucyA9IGdldEluZmx1ZW5jZWRWZW5hdGlvbnMoYXV4aW4ucG9pbnQpO1xuICAgICAgICAgICAgICAgIHZhciB0YWdnZWRWZW5hdGlvbnMgPSBhdXhpbi50YWdnZWRWZW5hdGlvbnM7XG4gICAgICAgICAgICAgICAgdmFyIHRvdGFsVGFnZ2VkVmVuYXRpb25zID0gdGFnZ2VkVmVuYXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHRvdGFsVGFnZ2VkVmVuYXRpb25zOyB0KyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhZ2dlZFZlbmF0aW9uID0gdGFnZ2VkVmVuYXRpb25zW3RdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9ICh0YWdnZWRWZW5hdGlvbi5wb2ludCAtIGF1eGluLnBvaW50KS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkIDwgY29uZmlndXJhdGlvbi50aHJlZXNob2xkVmVuYXRpb25SYWRpdXMgfHwgXy5jb250YWlucyhpbmZsdWVuY2VkVmVuYXRpb25zLCB0YWdnZWRWZW5hdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ2dlZFZlbmF0aW9ucy5zcGxpY2UodCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbFRhZ2dlZFZlbmF0aW9ucy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgdC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRhZ2dlZFZlbmF0aW9ucy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICBhdXhpbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICB0b3RhbEF1eGlucy0tO1xuICAgICAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGhpdFRlc3RWZW5hdGlvbihhdXhpbi5wb2ludCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGluZmx1ZW5jZWRWZW5hdGlvbnMgPSBnZXRJbmZsdWVuY2VkVmVuYXRpb25zKGF1eGluLnBvaW50KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZmx1ZW5jZWRWZW5hdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV4aW4uaXNEb29tZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXV4aW4udGFnZ2VkVmVuYXRpb25zID0gaW5mbHVlbmNlZFZlbmF0aW9ucztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1eGlucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3RhbEF1eGlucy0tO1xuICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgXCJpbml0XCI6IGluaXQsXG4gICAgICAgIFwic3RlcFwiOiBzdGVwLFxuICAgICAgICBcImdldEF1eGluc1wiOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBhdXhpbnM7XG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VmVuYXRpb25zXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZlbmF0aW9ucztcbiAgICAgICAgfSxcbiAgICAgICAgXCJpc0ZpbmlzaGVkXCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGZpbmlzaGVkO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE9wZW5WZW5hdGlvbkFsZ29yaXRobSgpO1xuIiwidmFyIE9wZW5WZW5hdGlvbkFsZ29yaXRobSA9IHJlcXVpcmUoXCIuL09wZW5WZW5hdGlvbkFsZ29yaXRobVwiKTtcbnZhciBjb25maWd1cmF0aW9uID0gcmVxdWlyZShcIi4uL2NvbmZpZ3VyYXRpb24uanNvblwiKTtcblxudmFyIFBhdGhSZW5kZXJlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlbmRlcmVkVmVuYXRpb25zID0ge307XG4gICAgdmFyIHZlbmF0aW9uc1BhdGggPSBuZXcgQ29tcG91bmRQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGRyYXdTZWVkVmVuYXRpb25zKHZlbmF0aW9ucykge1xuICAgICAgICB2YXIgc2VlZHMgPSBfLmZpcnN0KHZlbmF0aW9ucywgY29uZmlndXJhdGlvbi5zZWVkVmVuYXRpb25zKTtcbiAgICAgICAgdmFyIHRvdGFsU2VlZHMgPSBzZWVkcy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxTZWVkczsgaSsrKSB7XG4gICAgICAgICAgICBkcmF3VmVuYXRpb25zKHNlZWRzW2ldLmNoaWxkcywgc2VlZHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHJhd1ZlbmF0aW9ucyhjaGlsZHMsIHBhcmVudCkge1xuXG4gICAgICAgIHZhciBpdGVyYXRpb25SZW5kZXJzID0gW107XG4gICAgICAgIHZhciB0b3RhbFZlbmF0aW9ucyA9IGNoaWxkcy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG90YWxWZW5hdGlvbnM7IGkrKykge1xuICAgICAgICAgICAgdmFyIGluY3JlbWVudE5leHQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmICghcmVuZGVyZWRWZW5hdGlvbnNbY2hpbGRzW2ldLmlkXSkge1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjaGlsZHNbKGkgKyAxKV0gIT09IFwidW5kZWZpbmVkXCIgJiYgY2hpbGRzW2ldLnBvaW50LmdldEFuZ2xlKGNoaWxkc1soaSArIDEpXS5wb2ludCkgPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2ZW5hdGlvblNlZ21lbnQgPSBuZXcgUGF0aChuZXcgU2VnbWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnQucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50LnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzW2ldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbKGkgKyAxKV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRzWyhpICsgMSldLnBvaW50LnkgKiB2aWV3LnZpZXdTaXplLmhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgICApKTtcblxuICAgICAgICAgICAgICAgICAgICBpbmNyZW1lbnROZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2ZW5hdGlvblNlZ21lbnQgPSBuZXcgUGF0aCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2VDb2xvcjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvclxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuYWRkKG5ldyBQb2ludChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC54ICogdmlldy52aWV3U2l6ZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudC5wb2ludC55ICogdmlldy52aWV3U2l6ZS5oZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LmFkZChuZXcgUG9pbnQoXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbaV0ucG9pbnQueCAqIHZpZXcudmlld1NpemUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHNbaV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZlbmF0aW9uU2VnbWVudC5zdHJva2VXaWR0aCA9IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGg7XG4gICAgICAgICAgICAgICAgdmVuYXRpb25TZWdtZW50LnN0cm9rZUNvbG9yID0gY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udmVuYXRpb25TdHJva2VDb2xvcjtcbiAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuc3Ryb2tlQ2FwID0gJ3JvdW5kJztcbiAgICAgICAgICAgICAgICB2ZW5hdGlvblNlZ21lbnQuc3Ryb2tlSm9pbiA9ICdyb3VuZCc7XG5cbiAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdID0gdmVuYXRpb25TZWdtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZykge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdLnN0cm9rZVdpZHRoICs9IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlV2lkdGhBZ2luZ0ZhY3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZyAmJiBjaGlsZHNbaV0uYWdlID4gcGFyZW50LmFnZSAvIDEuNSkge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdLnN0cm9rZUNvbG9yIC09IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnZlbmF0aW9uU3Ryb2tlQ29sb3JBZ2luZ0ZhY3RvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaGlsZHNbaV0uY2hpbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24udHdpc3RlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBkcmF3VmVuYXRpb25zKGNoaWxkc1tpXS5jaGlsZHMsIGNoaWxkc1tpXS5wYXJlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZHJhd1ZlbmF0aW9ucyhjaGlsZHNbaV0uY2hpbGRzLCBjaGlsZHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGluY3JlbWVudE5leHQpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiByZW5kZXJlZFZlbmF0aW9uc1tjaGlsZHNbaV0uaWRdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcmVkVmVuYXRpb25zW2NoaWxkc1tpXS5pZF0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICB2ZW5hdGlvbnNQYXRoLmJyaW5nVG9Gcm9udCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdBdXhpbnMoYXV4aW5zKSB7XG5cbiAgICAgICAgdmFyIHRvdGFsQXV4aW5zID0gYXV4aW5zLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b3RhbEF1eGluczsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXV4aW5QYXRoID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAgICAgICBjZW50ZXI6IFtcbiAgICAgICAgICAgICAgICAgICAgYXV4aW5zW2ldLnBvaW50LnggKiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICBhdXhpbnNbaV0ucG9pbnQueSAqIHZpZXcudmlld1NpemUuaGVpZ2h0XG4gICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICByYWRpdXM6IHZpZXcudmlld1NpemUud2lkdGggKiBjb25maWd1cmF0aW9uLmF1eGluUmFkaXVzLFxuICAgICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5hdXhpblN0cm9rZUNvbG9yXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKGNvbmZpZ3VyYXRpb24uc2hhcGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzcXVhcmUnOlxuICAgICAgICAgICAgICAgICAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQYXRoLlJlY3RhbmdsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInhcIjogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwieVwiOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJ3aWR0aFwiOiB2aWV3LnZpZXdTaXplLndpZHRoLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJoZWlnaHRcIjogdmlldy52aWV3U2l6ZS5oZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImZpbGxDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZUZpbGxDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlQ29sb3JcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VDb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3Ryb2tlV2lkdGhcIjogY29uZmlndXJhdGlvbi5yZW5kZXJlckNvbmZpZ3VyYXRpb24uc2hhcGVTdHJva2VXaWR0aFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnY2lyY2xlJzpcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB2YXIgYmFja2dyb3VuZCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImNlbnRlclwiOiBbdmlldy52aWV3U2l6ZS53aWR0aCAvIDIsIHZpZXcudmlld1NpemUuaGVpZ2h0IC8gMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBcInJhZGl1c1wiOiB2aWV3LnZpZXdTaXplLndpZHRoIC8gMixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiZmlsbENvbG9yXCI6IGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLnNoYXBlRmlsbENvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VDb2xvclwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZUNvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdHJva2VXaWR0aFwiOiBjb25maWd1cmF0aW9uLnJlbmRlcmVyQ29uZmlndXJhdGlvbi5zaGFwZVN0cm9rZVdpZHRoXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBPcGVuVmVuYXRpb25BbGdvcml0aG0uaW5pdCgpO1xuICAgICAgICAgICAgaWYgKGNvbmZpZ3VyYXRpb24ucmVuZGVyZXJDb25maWd1cmF0aW9uLmRyYXdBdXhpbnMgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBkcmF3QXV4aW5zKE9wZW5WZW5hdGlvbkFsZ29yaXRobS5nZXRBdXhpbnMoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRyYXc6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICBpZiAoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmlzRmluaXNoZWQoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZHJhd1NlZWRWZW5hdGlvbnMoT3BlblZlbmF0aW9uQWxnb3JpdGhtLmdldFZlbmF0aW9ucygpKTtcblxuICAgICAgICAgICAgT3BlblZlbmF0aW9uQWxnb3JpdGhtLnN0ZXAoKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGF0aFJlbmRlcmVyKCk7XG4iLCJ2YXIgY29uZmlndXJhdGlvbiA9IHJlcXVpcmUoXCIuLi9jb25maWd1cmF0aW9uLmpzb25cIik7XG52YXIgQ2lyY2xlc1JlbmRlcmVyID0gcmVxdWlyZShcIi4vQ2lyY2xlc1JlbmRlcmVyXCIpO1xudmFyIExpbmVzUmVuZGVyZXIgPSByZXF1aXJlKFwiLi9MaW5lc1JlbmRlcmVyXCIpO1xudmFyIFBhdGhSZW5kZXJlciA9IHJlcXVpcmUoXCIuL1BhdGhSZW5kZXJlclwiKTtcblxudmFyIFZlbmF0aW9uc01hdHJpeCA9IHJlcXVpcmUoXCIuL1ZlbmF0aW9uc01hdHJpeFwiKTtcblxuc3dpdGNoIChjb25maWd1cmF0aW9uLnJlbmRlcmVyKSB7XG4gICAgY2FzZSAnTGluZXNSZW5kZXJlcic6XG4gICAgICAgIHZhciBSZW5kZXJlciA9IExpbmVzUmVuZGVyZXI7XG4gICAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ1BhdGhSZW5kZXJlcic6XG4gICAgICAgIHZhciBSZW5kZXJlciA9IFBhdGhSZW5kZXJlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQ2lyY2xlc1JlbmRlcmVyJzpcbiAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgUmVuZGVyZXIgPSBDaXJjbGVzUmVuZGVyZXI7XG59XG5cbmNvbnNvbGUudGltZShcInJlbmRlclwiKTtcblJlbmRlcmVyLmluaXQoKTtcbnBhcGVyLnZpZXcub25GcmFtZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKCFSZW5kZXJlci5kcmF3KCkpIHtcbiAgICAgICAgcGFwZXIudmlldy5vbkZyYW1lID0gbnVsbDtcbiAgICAgICAgY29uc29sZS50aW1lRW5kKFwicmVuZGVyXCIpO1xuICAgIH1cbn07XG4iLCJ2YXIgdmVuYXRpb25zTWF0cml4ID0gcmVxdWlyZShcIi4vVmVuYXRpb25zTWF0cml4XCIpO1xuXG52YXIgVmVuYXRpb24gPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHRoaXMucG9pbnQgPSBwb2ludDtcbiAgICB0aGlzLnJlbmRlcmVkID0gbnVsbDtcblxuICAgIHRoaXMuaWQgPSBWZW5hdGlvbi5wcm9ncmVzc2l2ZTtcbiAgICBWZW5hdGlvbi5wcm9ncmVzc2l2ZSsrO1xuXG4gICAgdGhpcy5hZ2UgPSAwO1xuICAgIHRoaXMubmVpZ2hib3JBdXhpbnMgPSBudWxsO1xuICAgIHRoaXMuY2hpbGRzID0gW107XG4gICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuXG4gICAgLy8gY2FsY3VsYXRlIHRoZSBtYXRyaXggY2VsbFxuICAgIHZlbmF0aW9uc01hdHJpeC5hZGQodGhpcyk7XG59XG5cblZlbmF0aW9uLnByb2dyZXNzaXZlID0gMDtcblxubW9kdWxlLmV4cG9ydHMgPSBWZW5hdGlvbjtcbiIsInZhciBWZW5hdGlvbnNNYXRyaXggPSBmdW5jdGlvbigpIHtcblxuICAgIC8vIG1hdHJpeCBuZWlnaGJvciByYWRpdXNcbiAgICB2YXIgUiA9IDE7XG5cbiAgICAvLyBpbml0IHRoZSBtYXRyaXhcbiAgICB2YXIgTiA9IDEwO1xuICAgIHZhciBtYXRyaXggPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgICAgICBtYXRyaXhbaV0gPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBOOyBqKyspIHtcbiAgICAgICAgICAgIG1hdHJpeFtpXVtqXSA9IFtdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGNvb3JkcyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpOiBNYXRoLmZsb29yKE1hdGguYWJzKHBvaW50LngpICogTiksXG4gICAgICAgICAgICBqOiBNYXRoLmZsb29yKE1hdGguYWJzKHBvaW50LnkpICogTilcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhZGQ6IGZ1bmN0aW9uKHZlbmF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgYyA9IGNvb3Jkcyh2ZW5hdGlvbi5wb2ludCk7XG4gICAgICAgICAgICBtYXRyaXhbYy5pXVtjLmpdLnB1c2godmVuYXRpb24pO1xuICAgICAgICB9LFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgICAgICB2YXIgYyA9IGNvb3Jkcyhwb2ludCk7XG5cbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBtYXRyaXhbYy5pXVtjLmpdLnNsaWNlKDApO1xuXG4gICAgICAgICAgICB2YXIgbWluTGltaXRJID0gKGMuaSAtIFIpIDw9IDAgPyBjLmkgOiBjLmkgLSBSO1xuICAgICAgICAgICAgdmFyIG1heExpbWl0SSA9IChjLmkgKyBSKSA+IE4gPyBjLmkgOiBjLmkgKyBSO1xuICAgICAgICAgICAgdmFyIG1pbkxpbWl0SiA9IChjLmogLSBSKSA8PSAwID8gYy5qIDogYy5qIC0gUjtcbiAgICAgICAgICAgIHZhciBtYXhMaW1pdEogPSAoYy5qICsgUikgPiBOID8gYy5qIDogYy5qICsgUjtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IG1pbkxpbWl0STsgaSA8PSBtYXhMaW1pdEk7IGkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWF0cml4W2ldID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSBtaW5MaW1pdEo7IGogPD0gbWF4TGltaXRKOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtYXRyaXhbaV1bal0gIT09IFwidW5kZWZpbmVkXCIgJiYgbWF0cml4W2ldW2pdLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdC5jb25jYXQobWF0cml4W2ldW2pdLnNsaWNlKDApKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0TWF0cml4OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRyaXg7XG4gICAgICAgIH0sXG4gICAgICAgIGNvb3JkczogY29vcmRzXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBWZW5hdGlvbnNNYXRyaXgoKTtcbiJdfQ==
