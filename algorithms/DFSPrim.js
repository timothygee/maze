class DFSPRIM extends MazeAlgorithm {
    generationDescription() {
        return "This algorithm uses a combination of Randomised Depth First Search and Randomised Prim's Algorithm</br>"
            + "This results in shorter paths than the full DFS Algorithm but much longer paths than Prim's Algorithm</br>"
            + "</br>"
            + "Get the start node and push it into a collection</br>"
            + "While there are nodes in the collection:</br>"
            + "<ul>"
            + "<li>Check if the current node has any unvisited neighbours</li>"
            + "<li>If there are none, remove the node to the collection otherwise push it to the collection</li>"
            + "<li>Set the node as visited</li>"
            + "<li>Pick a random unvisited neighbour and join with it</li>"
            + "<li>If there is a valid neighbour, set the neighbour as visited and add it to the collection</li>"
            + "<li>10% of the time or if there is no valid unvisited neighbour, pick a random node from the set and restart loop</li>"
            + "<li>Otherwise restart loop from neighbour</li>"
            + "</ul>";
    }
    //This changes how often it will choose a random node rather then match a DFS algorithm
    //If the DFS algorithm gets stuck it will always choose a random node
    //100 makes this behave the same as the PRIM algorithm
    //0 makes this behave close to the same as DFS
    generationOptions() {
        return [
            {
                "type": "number",
                "text": "Select Random %",
                "id": "selectRandom",
                "min": 0,
                "max": 100,
                "default": 10
            }
        ]
    }
    generateMaze(options) {
        var node = this.startNode;
        var selectRandom = (100 - options["selectRandom"]) / 100;
        //The frontier is a list of nodes that are adjacent to nodes NOT in the maze
        //The "random" node is taken from this list. So a random node is not truely random accross the whole maze
        var frontier = [node];
        while (frontier.length > 0) {
            var neighbours = this.getNeighbours(node, { visited: false });
            if (neighbours.length > 0) {
                if (frontier.indexOf(node) == -1) {
                    frontier.push(node);
                }
            }
            else {
                var i = frontier.indexOf(node);
                if (i >= 0) {
                    frontier.splice(i, 1);
                }
            }
            node.visit();
            var neighbour = this.pickRandom(neighbours);
            if (neighbour != null) {
                this.joinNeighbours(node, neighbour);
                neighbour.visit();
                frontier.push(neighbour);
            }
            var random = Math.random();
            if (random > selectRandom || neighbour == null) {
                //pick random
                node = this.pickRandom(frontier);
            }
            else {
                node = neighbour;
            }
        }
    }
}
