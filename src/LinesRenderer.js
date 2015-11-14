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
