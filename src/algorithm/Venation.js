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
