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
