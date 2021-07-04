class DFS extends MazeAlgorithm {
    generationDescription() {
        return "Randomised Depth First Search uses the DFS algorithm to generate the maze</br>"
            + "It continues joining unvisited (randomly chosen) adjacent nodes in a single path until there are no adjacent nodes to merge with</br>"
            + "It then backtracks until it finds a node with an unvisited neighbour</br>"
            + "<ul>"
            + "<li>From the start node, randomly choose an unvisited neighbour</li>"
            + "<li>Set the neighbour the main node and look for its unvisited neighbours</li>"
            + "<li>When it arives at a node with no unvisited neighbours, backtrack to the last node that has some and continue</li>"
            + "<li>When all cells are visited (backtracked to start node) the maze is complete</li>"
            + "</ul>";
    }
    //As this is implemented as a loop rather than recursively
    //It remembers which node is next using an array of nodes
    //If the node you are currently visiting has no viable neighbours (unconnected), remove it from the array
    //The loop continues from the previous node
    //Eventually there will be no nodes in the array
    generateMaze(options) {
        var path = [this.startNode];
        while (path.length > 0) {
            var node = path[path.length - 1];
            node.visit();
            if (path.includes(node)) {
                path.splice(path.indexOf(node));
            }
            path.push(node);
            let neighbours = this.getNeighbours(node, { connected: false });
            var nextFound = false;
            while (neighbours.length > 0) {
                let neighbour = this.pickRandom(neighbours, true);
                if (neighbour.visited()) {
                    continue;
                }
                this.joinNeighbours(node, neighbour);
                path.push(neighbour);
                nextFound = true;
                break;
            }
            if (!nextFound) {
                path.pop();
            }
        }
    }
    solutionDescription() {
        return "Depth-First Search (DFS) is a search algorithm that searches for nodes one path at a time<br/>"
            + "At node junctions it will inheritly have a bias to which ever direction the algorithm chooses to go first<br/>"
            + "For mazes this means that if there is the option of Left or Right, the algorithm will be programed to always go left until its options have been exhausted before returning to search the right side<br/><br/>"
            + "You can choose the bias in the bias text field above: T -> Top, R -> Right, B -> Bottom, L -> Left"
    }
    //As the maze will always be solved with a bias towards the left, right, top or bottom
    //This option allows you choose the bias
    solutionOptions() {
        return [
            {
                "type": "text",
                "text": "Bias",
                "id": "bias",
                "default": "LRBT",
                "validate": function (element, value) {
                    var require = ["L", "R", "B", "T"];
                    var validated = "";
                    for (var i = 0; i < value.length; ++i) {
                        if (require.includes(value[i].toUpperCase())) {
                            validated += value[i].toUpperCase();
                            require.splice(require.indexOf(value[i].toUpperCase()), 1);
                        }
                    }
                    for (var char of require) {
                        validated += char;
                    }
                    element.value = validated;
                },
                "tooltip": "Order of neighbour nodes to check:\n  T -> Top\n  R -> Right\n  B -> Bottom\n  L -> Left\n"
            }
        ];
    }
    //As this is implemented as a loop rather than recursively
    //It remembers which node is next using an array of nodes
    //If the node you are currently visiting has no viable neighbours (unconnected), remove it from the array
    //The loop continues from the previous node
    //Eventually it will reach the end of the maze
    //The path from the start to the end is then left in the array
    solveMaze(options) {
        let mapping = { "L": 0, "R": 1, "B": 2, "T": 3 };
        var path = [this.startNode];
        while (path.length > 0) {
            var node = path[path.length - 1];
            node.visit();
            if (path.includes(node)) {
                path.splice(path.indexOf(node));
            }
            path.push(node);
            if (node == this.endNode) {
                for (var i = 0; i < path.length; ++i) {
                    path[i].setPathLength(i);
                }
                return;
            }
            var neighbours = this.getNeighbours(node, { connected: true, includeWalls: true });
            if ("bias" in options) {
                let newNeighbours = [];
                for (var letter of options["bias"]) {
                    newNeighbours.push(neighbours[mapping[letter]]);
                }
                neighbours = newNeighbours;
            }
            neighbours = neighbours.filter((value) => value != null && value != 0);
            var nextFound = false;
            for (var neighbour of neighbours) {
                if (neighbour.visited()) {
                    continue;
                }
                path.push(neighbour);
                nextFound = true;
                break;
            }
            if (!nextFound) {
                path.pop();
            }
        }
    }
}