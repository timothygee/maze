class AldousBroder extends MazeAlgorithm {
    generationDescription() {
        return "The Aldous-Broder Algorithm picks a random node and a random neighbour of that node.</br>"
            + "It is a very simple maze algorithm to write but it is extremely inefficient. It relies on random chance to visit every node in the maze</br>"
            + "<ul>"
            + "<li>If the neighbour has already been visited, restart the algorithm from the neighbour.</li>"
            + "<li>If the neightbour has not been visited, join the node and the neighbour.</li>"
            + "<li>The Algorithm ends when all cells have been joined.</li>"
            + "</ul>";
    }
    generateMaze() {
        var remaining = this.area - 1; //Minus 1 for the start node
        var node = this.pickRandom(this.maze.getNodes()); //Get any random node from the maze
        while (remaining > 0) {
            node.visit();
            let neighbours = this.getNeighbours(node);
            var next = this.pickRandom(neighbours); //Get any random neighbour and go there
            if (!next.visited()) {
                remaining--;
                this.joinNeighbours(node, next);
            }
            else {
                //Unvisit the node so that the GUI is forced to update when revisiting already visited cells
                next.unVisit();
            }
            node = next;
        }
    }
}