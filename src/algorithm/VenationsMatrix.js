var VenationsMatrix = function() {

    // matrix neighbor radius
    var R = 9;

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
            i: Math.floor(point.x * N),
            j: Math.floor(point.y * N)
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
