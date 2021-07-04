
class AStar extends MazeAlgorithm {
    solutionDescription() {
        return "A* is an informed path search algorithm (best-first search)<br/>"
            + "It uses weighted graphs to find the smallest cost path to the end node<br/>"
            + "<br/>"
            + "It calculates the weight using the formula:<br/>"
            + "    <i>f(n) = g(n) + h(n)</i><br/>"
            + "where, n is the next node on the path<br/>"
            + "       g(n) is the cost of the path from the start node<br/>"
            + "       h(n) is the estimated cost of the path to the end node<br/>"
            + "It will always take the path of the next unvisited node with the lowest f(n) value";
    }
    calculate(node1, node2) {
        var x = Math.abs(node1.getX() - node2.getX());
        var y = Math.abs(node1.getY() - node2.getY());
        return x + y;
    }
    calculateF(node) {
        return node.g + node.h;
    }
    solveMaze(options) {
        var open = [this.startNode];
        this.startNode.g = 0;
        this.startNode.h = this.calculate(this.startNode, this.endNode);
        this.startNode.setSet(this.calculateF(this.startNode));
        var closed = [];
        while (open.length > 0) {
            // Grab the lowest f(x) to process next
            var node = null;
            for (var i = 0; i < open.length; i++) {
                if (node == null) {
                    node = open[i];
                }
                else {
                    if (open[i].getSet() < node.getSet()) {
                        node = open[i];
                    }
                }
            }
            // End case -- result has been found, return the traced path
            if (node == this.endNode) {
                var path = [node];
                while (node.parent != null) {
                    node = node.parent;
                    path.push(node);
                }
                path = path.reverse();
                for (var i = 0; i < path.length; i++) {
                    path[i].setPathLength(i);
                }
                return;
            }
       
            // Normal case -- move currentNode from open to closed, process each of its neighbors
            var index = open.indexOf(node);
            open.splice(index, 1);
            closed.push(node);
            node.setSet(null);
            node.visit();
            var neighbours = node.getNeighbours().filter((neighbour) => neighbour != 0 && neighbour != null);
            for (var i = 0; i < neighbours.length; i++) {
                var neighbour = neighbours[i];
                if(closed.includes(neighbour)) {
                    // not a valid node to process, skip to next neighbor
                    continue;
                }

                // g score is the shortest distance from start to current node, we need to check if
                //   the path we have arrived at this neighbor is the shortest one we have seen yet
                var gScore = node.g + 1;
                var gScoreIsBest = false;

                if(!open.includes(neighbour)) {
                    // This the the first time we have arrived at this node, it must be the best
                    // Also, we need to take the h (heuristic) score since we haven't done so yet
                    gScoreIsBest = true;
                    neighbour.h = this.calculate(node, this.endNode);
                    open.push(neighbour);
                }
                else if(gScore < neighbour.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                }
        
                if (gScoreIsBest) {
                    // Found an optimal (so far) path to this node.   Store info on how we got here and
                    //  just how good it really is...
                    neighbour.g = gScore;
                    neighbour.setSet(this.calculateF(node));
                    neighbour.parent = node;
                }
            }
        }
    }
}