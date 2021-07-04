class Prim extends MazeAlgorithm {
    generationDescription() {
        return "Prim's algorithm generates a minimum spaning tree using weighted edges.<br/>"
            + "This version randomly choose edges instead of using weights.<br/>"
            + "<ul>"
            + "<li>Create a walls collection and add the start node walls to it and mark it as visited (never add the mazes outer walls to the maze)</li>"
            + "<li>Pick a random wall from the collection (and remove it from the collection)</li>"
            + "<li>If one of the two nodes that the wall divides is visited; join the two nodes and mark the node as visited</li>"
            + "<li>Add the nodes walls to the wall list</li>"
            + "</ul>";
    }
    getWalls(node) {
        var newWalls = [];
        if (node !== null) {
            if (node.getTop() !== 0) {
                if (node.getY() - 1 >= 0) {
                    newWalls.push({
                        node1: node,
                        node2: this.maze.getNode(node.getX(), node.getY() - 1)
                    });
                }
            }
            if (node.getRight() !== 0) {
                if (node.getX() + 1 < this.width) {
                    newWalls.push({
                        node1: node,
                        node2: this.maze.getNode(node.getX() + 1, node.getY())
                    });
                }
            }
            if (node.getBottom() !== 0) {
                if (node.getY() + 1 < this.height) {
                    newWalls.push({
                        node1: node,
                        node2: this.maze.getNode(node.getX(), node.getY() + 1)
                    });
                }
            }
            if (node.getTop() !== 0) {
                if (node.getX() - 1 >= 0) {
                    newWalls.push({
                        node1: node,
                        node2: this.maze.getNode(node.getX() - 1, node.getY())
                    });
                }
            }
        }
        return newWalls;
    }
    generateMaze(options) {
        //Add the walls of the start node to the wall list
        var walls = [...this.getWalls(this.startNode)];
        this.startNode.visit();
        while (walls.length > 0) {
            //Randomly remove a set of walls and get the nodes
            var { node1, node2 } = this.pickRandom(walls, true);
            //If one has been visited, then merge them and add the unvisited nodes walls to the wall list
            if (node1.visited() && !node2.visited()) {
                this.joinNeighbours(node1, node2);
                walls.push(...this.getWalls(node2));
                node2.visit();
            }
        }
    }
}