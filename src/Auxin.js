var Auxin = function(point) {
    this.point = point;
    this.isDoomed = false;

    this.taggedVenations = [];

    this.id = Auxin.progressive;
    Auxin.progressive++;
}

Auxin.progressive = 0;

module.exports = Auxin;
