class BFS extends MazeAlgorithm {
    solutionDescription() {
        return "Breadth-First Search (BFS) is an searching algorithm that looks at all nodes equidistant from the starting node before looking at nodes further afield<br/><br/>"
            + "Add the first node to a collection<br/>"
            + "While there are items in the collection:"
            + "<ul>"
            + "<li>Get the first node from the collection</li>"
            + "<li>If it is the end node, stop searching</li>"
            + "<li>Set the node as visited</li>"
            + "<li>Find all connected adjacent nodes</li>"
            + "<li>For each neighbour, if it has not been visited, add it to the collection</li>"
            + "</ul>";
    }
    solveMaze(options) {
        var toSearch = [this.startNode];//Queue of nodes to search. First in first out queue
        var paths = [[this.startNode]];//Array of all possible paths from the start node
        while (toSearch.length > 0) {
            var node = toSearch.shift();//Get first node in queue
            var path = paths.shift();//The path of the first node in the queue
            node.visit();
            if (node == this.endNode) {
                path.push(node);
                for (var i = 0; i < path.length; ++i) {
                    path[i].setPathLength(i);
                }
                return;
            }
            let neighbours = this.getNeighbours(node, { connected: true });
            for (var i = 0; i < neighbours.length; ++i) {
                if (!neighbours[i].visited()) {
                    //Copy the path because you will probably be pushing different version of it multiple times
                    var p = path.slice();
                    p.push(neighbours[i]);
                    paths.push(p);//Add new path to the end of the path array
                    toSearch.push(neighbours[i]);//Add the node to the end of the queue
                }
            }
        }
    }
}