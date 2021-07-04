class Kruskal extends MazeAlgorithm {
    generationDescription() {
        return "Kruskal's Algorithm generates a maze by deleting walls between nodes until every node is connected to every other node</br>"
            + "<ul>"
            + "<li>Create a list of all walls</li>"
            + "<li>Create a collection for each node</li>"
            + "<li>Choose a random wall</li>"
            + "<li>If the nodes divided by this wall belong to distinct collections, remove the current wall and join the collections of the two nodes</li>"
            + "<li>If the nodes divided by this wall belong to the same collection, remove the wall and do not join the two collections</li>"
            + "<li>Repeat while there are walls in the list</li>"
            + "</ul>";
    }
    generateMaze() {
        var walls = [];
        var sets = new SetManager();
        //Add add the walls to the walls array
        //Add all nodes as sets
        for (var i = 0; i < this.width; ++i) {
            for (var j = 0; j < this.height; ++j) {
                var node = this.maze.getNode(i, j);
                if (node.getX() + 1 < this.width) {
                    walls.push({
                        node1: node,
                        node2: this.maze.getNode(i + 1, j)
                    });
                }
                if (node.getY() + 1 < this.height) {
                    walls.push({
                        node1: node,
                        node2: this.maze.getNode(i, j + 1)
                    });
                }
                sets.push(node);
            }
        }
        while (walls.length > 0) {
            //Remove a random wall from the wall list
            var { node1, node2 } = this.pickRandom(walls, true);
            //Attempt to join the nodes (remove wall)
            if (sets.merge(node1, node2)) {
                //If successful, join the neighbours
                node1.visit();
                node2.visit();
                this.joinNeighbours(node2, node1);
            }
        }
    }
}