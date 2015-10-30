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
