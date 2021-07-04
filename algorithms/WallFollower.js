class WallFollower extends MazeAlgorithm {
    solutionDescription() {
        return "The Wall Follower algorithm will continue to follow a left (or right) wall until it finds the end of the maze<br/>"
            + "In a non-looped maze, following a left (or right) wall will always eventually to the end<br/>"
            + "<br/>"
            + "From the start node, find the left wall<br/>"
            + "In the begining, the 'person' in the maze is facing south, so left/right is reversed<br/>"
            + "Each time it turns, keep track of the direction the 'person' is facing so you always choose their left<br/>"
    }
    //You can follow the right wall or left wall
    solutionOptions() {
        return [
            {
                "type": "select",
                "text": "Wall to Follow",
                "id": "wallToFollow",
                "options": [
                    { "value": "left", "text": "Left" },
                    { "value": "right", "text": "Right" }
                ]
            }
        ];
    }
    solveMaze(options) {
        var node = this.startNode;
        var path = [];
        //These mazes are either from top to bottom or left to right
        //Therefore the direction the imaginary person is facing is:
        //Top to Bottom: South
        //Left to Right: East
        var direction = "S";
        if (node.getY() != 0) {
            direction = "E";
        }
        //For each direction this is a map of turning left
        var directionToNum = {
            "N": [4, 1, 2, 3],
            "E": [1, 2, 3, 4],
            "S": [2, 3, 4, 1],
            "W": [3, 4, 1, 2]
        };
        //firection for turning rght
        if ("wallToFollow" in options && options["wallToFollow"] == "right") {
            directionToNum = {
                "N": [2, 1, 4, 3],
                "E": [3, 2, 1, 4],
                "S": [4, 3, 2, 1],
                "W": [1, 4, 3, 2]
            };
        }
        //Conversion of numbers to directions
        var numToDirection = {
            1: "N",
            2: "E",
            3: "S",
            4: "W"
        }
        //Conversion of numbers to node methods to call
        var directions = {
            1: { "has": "hasTop",       "get": "getTop"    },
            2: { "has": "hasRight",     "get": "getRight"  },
            3: { "has": "hasBottom",    "get": "getBottom" },
            4: { "has": "hasLeft",      "get": "getLeft"    }
        };
        while (true) {
            //If node is in the path already, we must have backtracked somewhere
            //Remove from path
            var index = path.indexOf(node);
            if (index >= 0) {
                path.splice(index);
            }
            path.push(node);
            node.visit();
            //We found the end! break
            if (node == this.endNode) {
                break;
            }
            //Get the possible turns
            var conv = directionToNum[direction];
            for (var i of conv) {
                //Take the first possible available turn
                if (node[directions[i]["has"]]()) {
                    node = node[directions[i]["get"]]();
                    direction = numToDirection[i];
                    break;
                }
            }
        }
        for (var i = 0; i < path.length; ++i) {
            path[i].setPathLength(i);
        }
    }
}