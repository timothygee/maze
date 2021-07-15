class Wilson extends MazeAlgorithm {
    generationDescription() {
        return "Wilson's Algorithm uses a loop-erased random walk to generate a uniform spaning tree maze (graph containing all verticies without loops).</br>"
            + "Due to its random nature (and loop-erasing), this algorithm can be very slow when the maze is near empty.</br>"
            + "<ul>"
            + "<li>Remove a random node not in the maze and add it to the maze</li>"
            + "<li>Choose another random node not in the maze and add it to a path</li>"
            + "<li>From this node, choose a random neighbour</li>"
            + "<li>If that node is part of the maze, add all the nodes in the path to the maze (removing the walls between each)</li>"
            + "<li>If that node is already part of the path, remove all the nodes from the path after this node</li>"
            + "<li>If that node is not in the path or the maze, add it to the path</li>"
            + "<li>Repeat until all nodes are in the maze</li>"
            + "</ul>";
    }
    //Where to choose the next node from
    generationOptions() {
        return [
            {
                "type": "select",
                "text": "Next Node Selection",
                "id": "nextNode",
                "options": [
                    { "text": "Random", "value": "random" },
                    { "text": "Top Left-Right", "value": "topl2r" },
                    { "text": "Top Right-Left", "value": "topr2l" },
                    { "text": "Top Left-Bottom Left", "value": "leftt2b" },
                    { "text": "Top Right-Bottom Right", "value": "rightt2b" },
                    { "text": "Bottom Left-Right", "value": "bottoml2r" },
                    { "text": "Bottom Right-Left", "value": "bottomr2l" },
                    { "text": "Bottom Left-Top Left", "value": "leftb2t" },
                    { "text": "Bottom Right-Top Right", "value": "rightb2t" },
                ]
            }
        ];
    }
    getNextNode(options, remaining) {
        //If random pick random
        if (!("nextNode" in options) || options["nextNode"] == "random") {
           return this.pickRandom(remaining, false);
        }
        //Improve selection algorithm? remember previously selected to start loop from
        switch (options["nextNode"]) {
            case "topl2r":
                for (var i = 0; i < this.height; ++i) {
                    for (var j = 0; j < this.width; ++j) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "topr2l":
                for (var i = 0; i < this.height; ++i) {
                    for (var j = this.width - 1; j >= 0 ; --j) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "leftt2b":
                for (var j = 0; j < this.width; ++j) {
                    for (var i = 0; i < this.height; ++i) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "rightt2b":
                for (var j = this.width - 1; j >= 0 ; --j) {
                    for (var i = 0; i < this.height; ++i) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "bottoml2r":
                for (var i = this.height - 1; i >= 0 ; --i) {
                    for (var j = 0; j < this.width; ++j) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "bottomr2l":
                for (var i = this.height - 1; i >= 0 ; --i) {
                    for (var j = this.width - 1; j >= 0 ; --j) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "leftb2t":
                for (var j = 0; j < this.width; ++j) {
                    for (var i = this.height - 1; i >= 0 ; --i) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
            case "rightb2t":
                for (var j = this.width - 1; j >= 0 ; --j) {
                    for (var i = this.height - 1; i >= 0 ; --i) {
                        if (!this.maze.getNode(j, i).visited()) {
                            return this.maze.getNode(j, i);
                        }
                    }
                }
                break;
        }
    }
    generateMaze(options) {
        //get a list of all nodes
        var remaining = this.maze.getNodes();
        //get the next node. It will be added to the maze and removed from remaining
        let node = this.getNextNode(options, remaining);
        remaining.splice(remaining.indexOf(node), 1);
        node.visit();
        var path = [];
        while (remaining.length > 0) {
            if (path.length == 0) {
                //When we have just added the last random path to the maze, we need a new random node
                let startPath = this.getNextNode(options, remaining);
                path.push(startPath);
                startPath.inNextPath();
            }
            //Get the last node from the path, and continue walking from it
            let walkNode = path[path.length - 1];
            let neighbours = this.getNeighbours(walkNode);
            //Not sure if this helps, but remove the previous node from the possible next nodes
            if (path.length > 2) {
                let previousWalkNode = path[path.length - 2];
                if (neighbours.includes(previousWalkNode)) {
                    neighbours.splice(neighbours.indexOf(previousWalkNode), 1);
                }
            }
            //Randomly pick the next node
            let nextNode = this.pickRandom(neighbours);
            let pos = path.indexOf(nextNode);
            //If the next node is in the path, remove all items in the path after it
            if (pos >= 0) {
                let removed = path.splice(pos + 1);
                for (var i = 0; i < removed.length; ++i) {
                    removed[i].resetNextPath();
                }
            }
            //If the next node is part of the maze, add the entire path to the maze in the order it was added to the path
            else if (nextNode.visited()) {
                var previous = nextNode;
                for (var i = path.length - 1; i >= 0; i--) {
                    let node = path[i];
                    this.maze.sendUpdates = false;
                    node.visit();
                    node.resetNextPath();
                    this.joinNeighbours(node, previous);
                    this.maze.sendUpdates = true;
                    previous = node;
                    remaining.splice(remaining.indexOf(node), 1);
                }
                path = [];
            }
            //If the next item is not in the path or maze, add it to the path and continue
            else {
                path.push(nextNode);
                nextNode.inNextPath();
            }
        }
    }
}