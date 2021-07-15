class Eller extends MazeAlgorithm {
    generationDescription() {
        return "Eller's Algorithm splits the maze into collections and merges them together as it moves through the maze</br>"
            + "The generation algorithm visualises each collection as a different colour</br>"
            + "<ul>"
            + "<li>Initialise the nodes of the first row so that each in its own collection</li>"
            + "<li>Traverse through each collection and randomly merge collections together (and remove maze walls between two merge nodes)</li>"
            + "<li>For each node horizontally, randomly add the node below to the collection (and remove the maze walls betwwen the two nodes</br>"
            + "    Each collection MUST have one downward join</li>"
            + "<li>In the next row any node that isn't in a collection, create new collections for each node in the row</li>"
            + "<li>Repeat the random horizontal merge and vertical merge until the last row</li>"
            + "<li>For the last row, join all adjacent nodes that are not already part of the same collection</li>"
            + "</ul>";
    }
    //You can change how often it will merge cells horizontally and vertically
    generationOptions() {
        return [
            {
                "type": "number",
                "text": "Horizontal Merge %",
                "id": "horizontalMerge",
                "min": 1,
                "max": 99,
                "default": 60
            },
            {
                "type": "number",
                "text": "Vertical Merge %",
                "id": "verticalMerge",
                "min": 1,
                "max": 99,
                "default": 30
            }
        ]
    }
    generateMaze(options) {
        var sets = new SetManager();
        var setCounter = 0;
        var horizontalMerge = options["horizontalMerge"] / 100 || 0.6;
        var verticalMerge = options["verticalMerge"] / 100 || 0.3;
        for (var j = 0; j < this.height; ++j) {
            //If node is not visited, then add it to the set manager
            for (var i = 0; i < this.width; ++i) {
                var node = this.maze.getNode(i, j);
                if (!node.visited()) {
                    sets.push(node, setCounter++);
                    node.visit();
                }
            }
            //For each node horizontally, randomly merge
            //In the last row, always merge if in different sets
            for (var i = 0; i < this.width - 1; ++i) {
                var leftNode = this.maze.getNode(i, j);
                var rightNode = this.maze.getNode(i + 1, j);
                if (Math.random() < horizontalMerge || j == this.height - 1) {
                    this.maze.sendUpdates = false;
                    if (sets.merge(leftNode, rightNode)) {
                        this.joinNeighbours(leftNode, rightNode);
                    }
                    this.maze.sendUpdates = true;
                }
            }
            //For all rows but the last row
            //Randomly merge downwards.  Each set MUST merge downwards once
            if (j < this.height - 1) {
                for (var set of sets) {
                    var nodes = sets.getNodesFromSetAtHeight(set, j);
                    var vertical = false;
                    var nth = false;
                    while (!vertical) {
                        for (var topNode of nodes) {
                            if (Math.random() < verticalMerge) {
                                var bottomNode = this.maze.getNode(topNode.getX(), topNode.getY() + 1);
                                this.maze.sendUpdates = false;
                                sets.push(bottomNode, topNode.getSet());
                                this.joinNeighbours(topNode, bottomNode);
                                bottomNode.visit();
                                this.maze.sendUpdates = true;
                                vertical = true;
                                //If the set has already been looped through without merging
                                //As soon as it merges once, stop the loop
                                if (nth) {
                                    break;
                                }
                            }
                        }
                        nth = true;
                    }
                }
            }
        }
    }
}