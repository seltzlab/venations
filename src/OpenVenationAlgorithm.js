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
