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
