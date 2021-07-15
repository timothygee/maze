class RecursiveDivision extends MazeAlgorithm {
    generationDescription() {
        return "The Recursive Division algorithm splits the maze into smaller and smaller sections, adding walls as it bisects each section</br>"
            + "It is a fairly unique algorithm adding walls to the maze as opposed to removing them</br>"
            + "<ul>"
            + "<li>Begin with an empty maze (all neighbours are connected)</li>"
            + "<li>Choose whether you will bisect the maze horizontally or vertically.</li>"
            + "<li>Randomly choose a place to bisect the maze and add walls (disconnect neighbours)</li>"
            + "<li>Choose a random place along the bisected wall to leave connected</li>"
            + "<li>Repeat from step 2 with the areas on either side of the wall.</li>"
            + "<li>If either area has a width or height less than 2, then stop bisecting it</li>"
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
    //Based on the passed in coords, split the area it makes
    split(x1, y1, x2, y2) {
        var width = Math.abs(x2 - x1);
        var height = Math.abs(y2 - y1);
        if (height < 2 || width < 2) {
            return [];
        }
        var division = null;
        //If the area is wider than it is tall -> split vertically
        if (width > height) {
            division = "verticle";
        }
        //If the area is taller than it is wide -> split horizontally
        else if (height > width) {
            division = "horizontal";
        }
        //If its a square choose a random direction
        else {
            division = this.pickRandom(["verticle", "horizontal"]);
        }
        //Set the x or y location of the split
        if (division == "horizontal") {
            var y = y1 + Math.floor(Math.random() * (height - 2));
            return [{
                "left": x1,
                "top": y1,
                "right": x2,
                "bottom": y2,
                "direction": division,
                "position": y
            }];
        }
        else {
            var x = x1 + Math.floor(Math.random() * (width - 2));
            return [{
                "left": x1,
                "top": y1,
                "right": x2,
                "bottom": y2,
                "direction": division,
                "position": x
            }];
        }
    }
    generateMaze() {
        let areas = this.split(0, 0, this.width, this.height);
        //While there are areas to split
        while (areas.length > 0) {
            //Get an area from the area list
            let area = areas.splice(0, 1)[0];
            if (area["direction"] == "verticle") {
                //Choose a random location to leave the wall open. Choose a random place from an array with index numbers
                var arr = new Array(Math.abs(area["bottom"] - area["top"])).fill().map((_, i) => area["top"] + i);
                var skip = this.pickRandom(arr);
                for (var i = area["top"]; i < area["bottom"]; ++i) {
                    if (i == skip) {//The random height to leave open
                        continue;
                    }
                    var node1 = this.maze.getNode(area["position"], i);
                    var node2 = this.maze.getNode(area["position"] + 1, i);
                    //Remove the walls between the two nodes
                    this.maze.sendUpdates = false;
                    node1.setRight(null);
                    node2.setLeft(null);
                    this.maze.sendUpdates = true;
                }
                //Add the subsections to the areas array (at the beginining)
                areas.splice(0, 0, ...this.split(area["position"] + 1, area["top"], area["right"], area["bottom"]));
                areas.splice(0, 0, ...this.split(area["left"], area["top"], area["position"] + 1, area["bottom"]));
            }
            else {
                //Choose a random location to leave the wall open. Choose a random place from an array with index numbers
                var arr = new Array(Math.abs(area["right"] - area["left"])).fill().map((_, i) => area["left"] + i);
                var skip = this.pickRandom(arr);
                for (var i = area["left"]; i < area["right"]; ++i) {
                    if (i == skip) {//The random height to leave open
                        continue;
                    }
                    var node1 = this.maze.getNode(i, area["position"]);
                    var node2 = this.maze.getNode(i, area["position"] + 1);
                    //Remove the walls between the two nodes
                    this.maze.sendUpdates = false;
                    node1.setBottom(null);
                    node2.setTop(null);
                    this.maze.sendUpdates = true;
                }
                //Add the subsections to the areas array (at the beginining)
                areas.splice(0, 0, ...this.split(area["left"], area["position"] + 1, area["right"], area["bottom"]));
                areas.splice(0, 0, ...this.split(area["left"], area["top"], area["right"], area["position"] + 1));
            }
        }
    }
}