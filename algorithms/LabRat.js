class LabRat extends MazeAlgorithm {
    solutionDescription() {
        return "The Lab Rat algorithm is basically to move randomly<br/>"
            + "-> Move in one direction and follow that passage through any turnings until you reach the next junction.<br/>"
            + "-> Don't do any 180 degree turns unless you have to.</br>"
            + "This simulates a human randomly roaming the Maze without any memory of where they've been.<br/>"
            + "It's slow and isn't guaranteed to ever terminate or solve the Maze<br/>"
            + "The mouse has a tracker that allows the scientists to display the solution when the rat reaches the end";
    }
    solveMaze(options) {
        var path = [];//Used to display the last 5 nodes to visually see where the mouse is
        var solution = [];//Extra variable to store the solution
        var node = this.startNode;
        var direction = "S"; //Keep track of direction the rat is facing so we dont make any 180 degree turns
        if (node.getY() != 0) {
            direction = "E";
        }
        //When facing a direction, these are the directions are not 180 degrees
        var directionToNum = {
            "N": [0, 1, 3],
            "E": [3, 1, 2],
            "S": [0, 1, 2],
            "W": [2, 3, 0]
        };
        //Conversion of index numbers to directions
        var numToDirection = {
            0: "W",
            1: "E",
            2: "S",
            3: "N"
        }
        while (true) {
            node.visit();
            //Update the solution path
            if (solution.includes(node)) {
                solution.splice(solution.indexOf(node));
            }
            solution.push(node);
            //We have found the end of the maze, draw solution
            if (node == this.endNode) {
                for (var i = 0; i < solution.length; ++i) {
                    solution[i].setPathLength(i);
                }
                break;
            }
            path.push(node);
            //The mouse only has a small vision area. When the path is more than 5, unvisit any nodes that are removed
            if (path.length > 5) {
                var newpath = [];
                for (var i = path.length - 1; i >= 0; --i) {
                    if (newpath.length < 5) {
                        newpath.splice(0, 0, path[i]);
                    }
                    else {
                        path[i].unVisit();
                    }
                }
                path = newpath;
            }
            //Get the possible turns
            var neighbours = this.getNeighbours(node, { connected: true, includeWalls: true });
            node = null;
            var dir = null;
            var posibilities = directionToNum[direction].slice();
            //Try to take all the turns to avoid 180 degrees
            while (node == null) {
                if (posibilities.length == 0) {
                    //When there are no possibilities that are not 180 degrees,
                    //We have to take the 180 degree option
                    for (var i = 0; i < neighbours.length; ++i) {
                        if (neighbours[i] != null) {
                            node = neighbours[i];
                            dir = i;
                            break;
                        }
                    }
                }
                else {
                    //Pick a random direction
                    dir = this.pickRandom(posibilities, true);
                    node = neighbours[dir];
                }
            }
            direction = numToDirection[dir];
        }
    }
}