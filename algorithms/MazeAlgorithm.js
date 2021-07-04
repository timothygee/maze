//base class for maze algorithms
class MazeAlgorithm {
    constructor(maze) {
        this.maze = maze;
        this._generatorUpdates = 0;
        this._solverUpdates = 0;
        this._solverVisits = 0;
    }
    //Getters
    get height() {
        return this.maze.height;
    }
    get width() {
        return this.maze.width;
    }
    get area() {
        return this.maze.width * this.maze.height;
    }
    get startNode() {
        return this.maze.startNode;
    }
    get endNode() {
        return this.maze.endNode;
    }

    //Generation Methods
    beforeGenerate() {}
    afterGenerate() {}
    generationDescription() {
        return "No description supplied";
    }
    generationOptions() {
        return [];
    }

    //Solution Methods
    beforeSolve() {}
    afterSolve() {}
    solutionDescription() {
        return "No description supplied";
    }
    solutionOptions() {
        return [];
    }

    //Helper Methods
    //Pick a random entry from the passed array (and remove if required)
    pickRandom(array, remove=false) {
        var r = Math.random();
        for (var i = 0; i < array.length; ++i) {
            if (r >= i / array.length && r < (i + 1) / array.length) {
                if (remove) {
                    return array.splice(i, 1)[0];
                }
                else {
                    return array[i];
                }
            }
        }
        if (array.length == 0)
            return null;
        else {
            if (remove) {
                return array.splice(0, 1)[0];
            }
            else {
                return array[0];
            }
        }
    }
    //Connect the two nodes by removing the wall between them
    joinNeighbours(node1, node2) {
        //Moving Up or Down
        if (node1.getX() == node2.getX()) {
            if (node1.getY() > node2.getY()) {
                node1.setTop(node2);
                node2.setBottom(node1);
            }
            else {
                node1.setBottom(node2);
                node2.setTop(node1);
            }
        }
        //Moving Left or Right
        else {
            if (node1.getX() > node2.getX()) {
                node1.setLeft(node2);
                node2.setRight(node1);
            }
            else {
                node1.setRight(node2);
                node2.setLeft(node1);
            }
        }
    }
    //Get the neighbours of the passed cell
    //If connected == null -> get all neighbours
    //If connected == true -> only get joined nodes (no wall in between)
    //If connected == false -> only get non-joined nodes (wall in between)
    //if includeWalls == false -> do not include wall nodes
    //If includeWalls == true -> include nodes that have walls in between (if connected == true, adds null instead of node)
    //If visited == null -> include all neighbours
    //if visited == true -> only include visited neighbours
    //if visited == false -> only include non-visited neighbours
    getNeighbours(node, { connected = null, includeWalls = false, visited = null } = {}) {
        function areConnected(node1, node2) {
            if (node1.getLeft() == node2) return true;
            if (node1.getRight() == node2) return true;
            if (node1.getBottom() == node2) return true;
            if (node1.getTop() == node2) return true;
            return false;
        }
        function checkConnected(neighbour) {
            if (connected == null) return true;
            else if (connected == true && areConnected(node, neighbour)) return true;
            else if (connected == false && !areConnected(node, neighbour)) return true;
            return false;
        }
        function checkVisited(neighbour) {
            if (visited == null) return true;
            else if (visited == true && neighbour.visited()) return true;
            else if (visited == false && !neighbour.visited()) return true;
            return false;
        }
        var neighbours = [];
        var x = node.getX();
        var y = node.getY();
        if (x != 0) {
            var neighbour = this.maze.getNode(x - 1, y);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (x != this.width - 1) {
            var neighbour = this.maze.getNode(x + 1, y);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (y != this.height - 1) {
            var neighbour = this.maze.getNode(x, y + 1);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (y != 0) {
            var neighbour = this.maze.getNode(x, y - 1);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        return neighbours;
    }

    //Data methods
    setGenerationUpdates(value) {
        this._generatorUpdates = value;
    }
    getGenerationUpdates() {
        return this._generatorUpdates;
    }
    setSolveVisits(value) {
        this._solverVisits = value;
    }
    getSolveVisits() {
        return this._solverVisits;
    }
    setSolveUpdates(value) {
        this._solverUpdates = value;
    }
    getSolveUpdates() {
        return this._solverUpdates;
    }
}
