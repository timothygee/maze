class RandomRecursiveDivision extends MazeAlgorithm {
    generationDescription() {
        return "The Random Recursive Division algorithm uses a similar philosophy to the regular Recursive Division Algorithm<br/>"
            + "Starts with no walls and splits an area into sections where walls are added.<br/>"
            + "In Recursive Division, I can be obvious where bottlenecks are located (you quickly find where the single path through a long wall is)<br/>"
            + "This Algorithm splits the areas into uneven sections.  The division lines are not straight and therefore the single path through is harder to find</br>"
            + "<ul>"
            + "<li>Create a list of areas needed to divide</li>"
            + "<li>Push the whole maze as an area</li>"
            + "<li>Get an area from the list</li>"
            + "<li>Pick two random nodes from the area and add one to collection 1 and one to collection 2</li>"
            + "<li>Randomly add neighbours of the original two nodes to their collections until all nodes in the area are in collection 1 or 2</li>"
            + "<li>Add walls along the cells dividing the collections (leaving 1 place with no wall)</li>"
            + "<li>Add each collection to the areas maze</li>"
            + "<li>Repeat from step 3 until an area has 2 or less nodes in an area</li>"
            + "<li>When there are no more areas left to divide the algorithm is finished</li>"
            + "</ul>"
    }
    //Recursive division starts with allnodes connected
    beforeGenerate() {
        for (var j = 0; j < this.height; ++j) {
            for (var i = 0; i < this.width; ++i) {
                if (i != 0) {
                    this.joinNeighbours(this.maze.getNode(i, j), this.maze.getNode(i - 1, j));
                    this.maze.getNode(i - 1, j).reset(); //Reset the update counter
                }
                if (j != 0) {
                    this.joinNeighbours(this.maze.getNode(i, j), this.maze.getNode(i, j - 1));
                    this.maze.getNode(i, j-1).reset();
                }
                this.maze.getNode(i, j).reset(); //Reset the update counter
            }
        }
    }
    generateMaze(options) {
        var sets = new SetManager();
        //Add the entire maze as an available area
        var areas = [this.maze.getNodes()];
        while (areas.length > 0) {
            //Get the first area and remove it from the list
            var areaNodes = areas.shift();
            //If there are 2 or less than 2 nodes then it cannot be split
            if (areaNodes.length <= 2) {
                continue;
            }
            //Get the first two nodes and create sets for each
            var node1 = this.pickRandom(areaNodes, true);
            var node2 = this.pickRandom(areaNodes, true);
            //Try to make the maze solve left to right
            if (node1.getX() < node2.getX()) {
                sets.push(node2);
                sets.push(node1);
            }
            else if (node1.getX() == node2.getX() && node1.getY() > node2.getY()) {
                sets.push(node2);
                sets.push(node1);
            }
            else {
                sets.push(node1);
                sets.push(node2);
            }
            var total = areaNodes.length;//Total amount of merges required
            while (total > 0) {
                //For each of the sets, find one item to add then repeat
                //This means one is added to set 1 then one to set 2 unless one cannot be added to one of the sets
                for (var set of sets) {
                    for (var node of set) {
                        var nodeneighbours = this.getNeighbours(node);
                        if (nodeneighbours.length > 0) {
                            var neighbour = this.pickRandom(nodeneighbours);
                            if (areaNodes.includes(neighbour)) {//If the neighbour is not in the area then ignore it
                                if (neighbour.getSet() == null) { //Only add the neighbour if they aren't in a set already
                                    sets.merge(node, neighbour);
                                    total--;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            var neighbours = [];
            this.maze.sendUpdates = false;
            for (var x = 0; x < this.width; ++x) {
                for (var y = 0; y < this.height; ++y) {
                    if (x < this.width - 1) {
                        var leftNode = this.maze.getNode(x, y);
                        var rightNode = this.maze.getNode(x + 1, y);
                        if (leftNode.getSet() != rightNode.getSet() && leftNode.getSet() != null && rightNode.getSet() != null) {
                            leftNode.setRight(null);
                            rightNode.setLeft(null);
                            neighbours.push([leftNode, rightNode]);
                        }
                    }
                    if (y < this.height - 1) {
                        var topNode = this.maze.getNode(x, y);
                        var bottomNode = this.maze.getNode(x, y + 1);
                        if (topNode.getSet() != bottomNode.getSet() && topNode.getSet() != null && bottomNode.getSet() != null) {
                            topNode.setBottom(null);
                            bottomNode.setTop(null);
                            neighbours.push([topNode, bottomNode]);
                        }
                    }
                }
            }
            //Pick a random wall just created and remove it
            var [ node3, node4 ] = this.pickRandom(neighbours);
            this.joinNeighbours(node3, node4);
            this.maze.sendUpdates = true;
            //Remove both sets and add an area for each to the areas list
            this.maze.sendUpdates = false;
            for (var set of sets) {
                if (set.length > 0) {
                    areas.splice(0, 0, sets.remove(set[0].getSet()));
                }
            }
            this.maze.sendUpdates = true;
        }
    }
}