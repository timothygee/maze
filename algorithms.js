class Maze {
    constructor(w, h) {
        this._width = w || 10;
        this._height = h || 10;
        this.startend = "T2B";
        this._start = null;
        this._end = null;
        this.graph = null;
        this.generator = null;
        this.solver = null;
        this._onUpdate = [];
        this._onBeforeSolve = [];
        this._onAfterSolve = [];
        this._onSolved = [];
        this._onBeforeInitialise = [];
        this._onAfterInitialise = [];
        this._onInitialised = [];
        this._onBeforeGenerate = [];
        this._onAfterGenerate = [];
        this._onGenerated = [];
        this._generationTime = null;
        this._initialisationTime = null;
        this._solveTime = null;
        this._sendUpdates = true;
        this._sendUpdatesQueue = [];
    }
    /****************************************\
                 Getters/Setters
    \****************************************/
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    get startNode() {
        return this._start;
    }
    get endNode() {
        return this._end;
    }
    get sendUpdates() {
        return this._sendUpdates;
    }
    set sendUpdates(value) {
        if (value == true) {
            this.handleEvent(this._onUpdate, this._sendUpdatesQueue);
            this._sendUpdatesQueue = [];
        }
        this._sendUpdates = value;
    }
    /****************************************\
                Initialise Methods
    \****************************************/
    initialiseMaze(w, h,startend=null) {
        this.handleEvent(this._onBeforeInitialise);
        performance.mark("start");
        this._width = w || this._width;
        this._height = h || this._height;
        this.startend = startend || this.startend;
        this.graph = new Array(this.width);
        let startPos, endPos;
        if (this.startend == "L2R") {
            startPos = [0, Math.floor(Math.random() * (this.height))];
            endPos = [this.width - 1, Math.floor(Math.random() * (this.height))];
        }
        else {
            startPos = [Math.floor(Math.random() * (this.width)), 0];
            endPos = [Math.floor(Math.random() * (this.width)), this.height - 1];
        }
        for (var i = 0; i < this.width; ++i) {
            this.graph[i] = new Array(this.height);
            for (var j = 0; j < this.height; ++j) {
                let node = new Node(i, j);
                if (j == startPos[1] && i == startPos[0]) {
                    this._start = node;
                }
                if (j == endPos[1] && i == endPos[0]) {
                    this._end = node;
                }
                if (j == 0) { node.setTop(0); }
                if (i == this.width-1) { node.setRight(0); }
                if (j == this.height-1) { node.setBottom(0); }
                if (i == 0) { node.setLeft(0); }
                this.graph[i][j] = node;
                node.onUpdate(((function () {
                    return function (node) {
                        if (this.sendUpdates)
                            this.handleEvent(this._onUpdate, node);
                        else
                            this._sendUpdatesQueue.push(node);
                    }
                })()).bind(this));
            }
        }
        performance.measure("initialisationTime", "start");
        this._initialisationTime = performance.getEntriesByType("measure")[0].duration.toFixed(3);
        performance.clearMeasures();
        this.handleEvent(this._onAfterInitialise);
        this.handleEvent(this._onInitialised);
    }
    getInitialisationTime() {
        return this._initialisationTime;
    }
    /****************************************\
                Generator Methods
    \****************************************/
    getGenerator(type) {
        switch(type) {
            case "AldousBroder":
                return new AldousBroder(this);
            case "Eller":
                return new Eller(this);
            case "DFS":
                return new DFS(this);
            case "Kruskal":
                return new Kruskal(this);
            case "PRIM":
                return new PRIM(this);
            case "RecursiveDivision":
                return new RecursiveDivision(this);
            case "RandomRecursiveDivision":
                return new RandomRecursiveDivision(this);
            case "Wilson":
                return new Wilson(this);
            case "DFSPRIM":
                return new DFSPRIM(this);
        }
        throw "Generator type \"" + type + "\" not supported";
    }
    generateMaze(type, options={}) {
        if (this.graph == null) {
            this.generateEmpty();
        }
        for (var i = 0; i < this.width; ++i) {
            for (var j = 0; j < this.height; ++j) {
                this.graph[i][j].resetAll();
            }
        }
        this.generator = this.getGenerator(type);
        this.generator.beforeGenerate();
        this.handleEvent(this._onBeforeGenerate);
        performance.mark("start");
        this.generator.generateMaze(options);
        performance.measure("initialisationTime", "start");
        this.handleEvent(this._onAfterGenerate);
        this._generationTime = performance.getEntriesByType("measure")[0].duration.toFixed(3);
        performance.clearMeasures();
        var updates = 0;
        for (var i = 0; i < this.height; ++i) {
            for (var j = 0; j < this.width; ++j) {
                updates += this.graph[j][i].getUpdateCount();
                this.graph[j][i].reset();
            }
        }
        this.generator.setGenerationUpdates(updates);
        this.generator.afterGenerate();
        this.handleEvent(this._onGenerated);
    }
    getGenerationDescription() {
        return this.generator.generationDescription();
    }
    getGenerationUpdates() {
        return this.generator.getGenerationUpdates();
    }
    getGenerationOptions(type) {
        this.generator = this.getGenerator(type);
        return this.generator.generationOptions();
    }
    getGenerationTime() {
        return this._generationTime;
    }
    /****************************************\
                Solver Methods
    \****************************************/
    resetSolution() {
        if (this.graph == null) {
            return false;
        }
        for (var i = 0; i < this.width; ++i) {
            for (var j = 0; j < this.height; ++j) {
                this.graph[i][j].reset();
            }
        }
        return true;
    }
    getSolver(type) {
        switch (type) {
            case "AStar":
                return new AStar(this);
            case "DFS":
                return new DFS(this);
            case "BFS":
                return new BFS(this);
            case "WallFollower":
                return new WallFollower(this);
        }
        throw "Solver type \"" + type + "\" not supported";
    }
    solveMaze(type, options = {}) {
        this.resetSolution();
        this.solver = this.getSolver(type);
        this.solver.beforeSolve();
        this.handleEvent(this._onBeforeSolve);
        performance.mark("start");
        this.solver.solveMaze(options);
        performance.measure("initialisationTime", "start");
        this._solveTime = performance.getEntriesByType("measure")[0].duration.toFixed(3);
        performance.clearMeasures();
        var updates = 0;
        var visits = 0;
        for (var i = 0; i < this.height; ++i) {
            for (var j = 0; j < this.width; ++j) {
                updates += this.graph[j][i].getUpdateCount();
                if (this.graph[j][i].visited()) {
                    visits++;
                }
                this.graph[j][i].resetUpdateCount();
            }
        }
        this.solver.setSolveUpdates(updates);
        this.solver.setSolveVisits(visits);
        this.solver.afterSolve();
        this.handleEvent(this._onAfterSolve);
        this.handleEvent(this._onSolved);
    }
    getSolveUpdates() {
        return this.solver.getSolveUpdates();
    }
    getSolveVisits() {
        return this.solver.getSolveVisits();
    }
    getSolutionOptions(type) {
        this.solver = this.getSolver(type);
        return this.solver.solutionOptions();
    }
    getSolutionDescription() {
        return this.solver.solutionDescription();
    }
    getSolveTime() {
        return this._solveTime;
    }
    /****************************************\
                    Node Methods
    \****************************************/
    getNode(x, y) {
        if (x < 0 || x >= this.width) {
            return null;
        }
        if (y < 0 || y >= this.height) {
            return null;
        }
        return this.graph[x][y];
    }
    getNodes() {
        var nodes = [];
        for (var i = 0; i < this.width; ++i) {
            for (var j = 0; j < this.height; ++j) {
                nodes.push(this.getNode(i, j));
            }
        }
        return nodes;
    }
    /****************************************\
                  Event Methods
    \****************************************/
    onUpdate(fn) {
        this._onUpdate.push(fn);
    }
    onBeforeInitialise(fn) {
        this._onBeforeInitialise.push(fn);
    }
    onAfterInitialise(fn) {
        this._onAfterInitialise.push(fn);
    }
    onInitialised(fn) {
        this._onInitialised.push(fn);
    }
    onBeforeGenerate(fn) {
        this._onBeforeGenerate.push(fn);
    }
    onAfterGenerate(fn) {
        this._onAfterGenerate.push(fn);
    }
    onGenerated(fn) {
        this._onGenerated.push(fn);
    }
    onBeforeSolve(fn) {
        this._onBeforeSolve.push(fn);
    }
    onAfterSolve(fn) {
        this._onAfterSolve.push(fn);
    }
    onSolved(fn) {
        this._onSolved.push(fn);
    }
    handleEvent(listeners) {
        var args = Array.prototype.slice.call(arguments);
        args.splice(0, 1);
        for (var i = 0; i < listeners.length; ++i) {
            listeners[i](...args);
        }
    }
}

class Node {
    constructor(x, y) {
        this._x = x;
        this._y = y;
        this._t = null;
        this._r = null;
        this._b = null;
        this._l = null;
        this._visited = false;
        this._onUpdate = [];
        this._pathLength = 0;
        this._updates = 0;
        this._inNextPath = false;
        this._setNo = null;
    }
    /****************************************\
             Coords Methods
    \****************************************/
    getX() {
        return this._x;
    }
    getY() {
        return this._y;
    }
    /****************************************\
             Neighbour Methods
    \****************************************/
    getNeighbours() {
        return [this._t, this._r, this._b, this._l];
    }
    getTop() { return this._t; }
    getRight() { return this._r; }
    getBottom() { return this._b; }
    getLeft() { return this._l; }
    hasTop() { return [null, 0].indexOf(this._t) == -1; }
    hasRight() { return [null, 0].indexOf(this._r) == -1; }
    hasBottom() { return [null, 0].indexOf(this._b) == -1; }
    hasLeft() { return [null, 0].indexOf(this._l) == -1; }
    setTop(node) {
        if (this._t == node) return;
        this._t = node;
        this.handleUpdate();
    }
    setRight(node) {
        if (this._r == node) return;
        this._r = node;
        this.handleUpdate();
    }
    setBottom(node) {
        if (this._b == node) return;
        this._b = node;
        this.handleUpdate();
    }
    setLeft(node) {
        if (this._l == node) return;
        this._l = node;
        this.handleUpdate();
    }
    /****************************************\
             Visit Methods
    \****************************************/
    visit() {
        if (this._visited) return;
        this._visited = true;
        this.handleUpdate();
    }
    visited() {
        return this._visited;
    }
    unVisit() {
        if (!this._visited) return;
        this._visited = false;
        this.handleUpdate();
    }
    /****************************************\
             value Methods
    \****************************************/
    setPathLength(length) {
        if (length == this._pathLength) return;
        this._pathLength = length;
        this.handleUpdate();
    }
    getPathLength() {
        return this._pathLength;
    }
    getUpdateCount() {
        return this._updates;
    }
    resetUpdateCount() {
        this._updates = 0;
    }
    getNextPath() {
        return this._inNextPath;
    }
    inNextPath() {
        if (this._inNextPath) return;
        this._inNextPath = true;
        this.handleUpdate();
    }
    resetNextPath() {
        if (!this._inNextPath) return;
        this._inNextPath = false;
        this.handleUpdate();
    }
    getSet() {
        return this._setNo;
    }
    setSet(no) {
        if (this._setNo == no) return;
        this._setNo = no;
        this.handleUpdate();
    }
    /****************************************\
                  Event Methods
    \****************************************/
    onUpdate(fn) {
        this._onUpdate.push(fn);
    }
    handleUpdate() {
        this._updates++;
        for (var i = 0; i < this._onUpdate.length; ++i) {
            this._onUpdate[i](Object.assign(Object.create(Object.getPrototypeOf(this)), this));
        }
    }
    /****************************************\
             Resetter Methods
    \****************************************/
    reset() {
        var update = false;
        if (this._pathLength != 0) {
            update = true;
            this._pathLength = 0;
        }
        if (this._inNextPath != false) {
            update = true;
            this._inNextPath = false;
        }
        if (this._setNo != null) {
            update = true;
            this._setNo = null;
        }
        if (this._visited != false) {
            update = true;
            this._visited = false;
        }
        if (update) {
            this.handleUpdate();
        }
        this._updates = 0;
    }
    resetAll() {
        var update = false;
        if (this._pathLength != 0) {
            update = true;
            this._pathLength = 0;
        }
        if (this._inNextPath != false) {
            update = true;
            this._inNextPath = false;
        }
        if (this._setNo != null) {
            update = true;
            this._setNo = null;
        }
        if (this._visited != false) {
            update = true;
            this._visited = false;
        }
        if (this._t != 0) {
            update = true;
            this._t = null;
        }
        if (this._r != 0) {
            update = true;
            this._r = null;
        }
        if (this._b != 0) {
            update = true;
            this._b = null;
        }
        if (this._l != 0) {
            update = true;
            this._l = null;
        }
        if (update) {
            this.handleUpdate();
        }
        this._updates = 0;
    }
}

class MazeAlgorithm {
    constructor(maze) {
        this.maze = maze;
        this._generatorUpdates = 0;
        this._solverUpdates = 0;
        this._solverVisits = 0;
    }
    //Getters
    get height() {
        return this.maze.height;
    }
    get width() {
        return this.maze.width;
    }
    get area() {
        return this.maze.width * this.maze.height;
    }
    get startNode() {
        return this.maze.startNode;
    }
    get endNode() {
        return this.maze.endNode;
    }

    //Generation Methods
    beforeGenerate() {}
    afterGenerate() {}
    generationDescription() {
        return "No description supplied";
    }
    generationOptions() {
        return [];
    }

    //Solution Methods
    beforeSolve() {}
    afterSolve() {}
    solutionDescription() {
        return "No description supplied";
    }
    solutionOptions() {
        return [];
    }

    //Helper Methods
    //Pick a random entry from the passed array (and remove if required)
    pickRandom(array, remove=false) {
        var r = Math.random();
        for (var i = 0; i < array.length; ++i) {
            if (r >= i / array.length && r < (i + 1) / array.length) {
                if (remove) {
                    return array.splice(i, 1)[0];
                }
                else {
                    return array[i];
                }
            }
        }
        if (array.length == 0)
            return null;
        else {
            if (remove) {
                return array.splice(0, 1)[0];
            }
            else {
                return array[0];
            }
        }
    }
    //Connect the two nodes by removing the wall between them
    joinNeighbours(node1, node2) {
        //Moving Up or Down
        if (node1.getX() == node2.getX()) {
            if (node1.getY() > node2.getY()) {
                node1.setTop(node2);
                node2.setBottom(node1);
            }
            else {
                node1.setBottom(node2);
                node2.setTop(node1);
            }
        }
        //Moving Left or Right
        else {
            if (node1.getX() > node2.getX()) {
                node1.setLeft(node2);
                node2.setRight(node1);
            }
            else {
                node1.setRight(node2);
                node2.setLeft(node1);
            }
        }
    }
    //Get the neighbours of the passed cell
    //If connected == null -> get all neighbours
    //If connected == true -> only get joined nodes (no wall in between)
    //If connected == false -> only get non-joined nodes (wall in between)
    //if includeWalls == false -> do not include wall nodes
    //If includeWalls == true -> include nodes that have walls in between (if connected == true, adds null instead of node)
    //If visited == null -> include all neighbours
    //if visited == true -> only include visited neighbours
    //if visited == false -> only include non-visited neighbours
    getNeighbours(node, { connected = null, includeWalls = false, visited = null } = {}) {
        function areConnected(node1, node2) {
            if (node1.getLeft() == node2) return true;
            if (node1.getRight() == node2) return true;
            if (node1.getBottom() == node2) return true;
            if (node1.getTop() == node2) return true;
            return false;
        }
        function checkConnected(neighbour) {
            if (connected == null) return true;
            else if (connected == true && areConnected(node, neighbour)) return true;
            else if (connected == false && !areConnected(node, neighbour)) return true;
            return false;
        }
        function checkVisited(neighbour) {
            if (visited == null) return true;
            else if (visited == true && neighbour.visited()) return true;
            else if (visited == false && !neighbour.visited()) return true;
            return false;
        }
        var neighbours = [];
        var x = node.getX();
        var y = node.getY();
        if (x != 0) {
            var neighbour = this.maze.getNode(x - 1, y);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (x != this.width - 1) {
            var neighbour = this.maze.getNode(x + 1, y);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (y != this.height - 1) {
            var neighbour = this.maze.getNode(x, y + 1);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        if (y != 0) {
            var neighbour = this.maze.getNode(x, y - 1);
            if (checkVisited(neighbour) && checkConnected(neighbour)) {
                neighbours.push(neighbour);
            }
            if (connected && includeWalls) {
                if (!checkConnected(neighbour)) {
                    neighbours.push(null);
                }
            }
        }
        else if (includeWalls) {
            neighbours.push(null);
        }
        return neighbours;
    }

    //Data methods
    setGenerationUpdates(value) {
        this._generatorUpdates = value;
    }
    getGenerationUpdates() {
        return this._generatorUpdates;
    }
    setSolveVisits(value) {
        this._solverVisits = value;
    }
    getSolveVisits() {
        return this._solverVisits;
    }
    setSolveUpdates(value) {
        this._solverUpdates = value;
    }
    getSolveUpdates() {
        return this._solverUpdates;
    }
}

class AldousBroder extends MazeAlgorithm {
    generationDescription() {
        return "The Aldous-Border Algorithm picks a random node and a random neighbour of that node.</br>"
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

class DFS extends MazeAlgorithm {
    generationDescription() {
        return "Randomised Depth First Search uses the DFS algorithm to generate the maze</br>"
            + "It continues joining unvisited (randomly chosen) adjacent nodes in a single path until there are no adjacent nodes to merge with</br>"
            + "It then backtracks until it finds a node with an unvisited neighbour</br>"
            + "<ul>"
            + "<li>From the start node, randomly choose an unvisited neighbour</li>"
            + "<li>Set the neighbour the main node and look for its unvisited neighbours</li>"
            + "<li>When it arives at a node with no unvisited neighbours, backtrack to the last node that has some and continue</li>"
            + "<li>When all cells are visited (backtracked to start node) the maze is complete</li>"
            + "</ul>";
    }
    //As this is implemented as a loop rather than recursively
    //It remembers which node is next using an array of nodes
    //If the node you are currently visiting has no viable neighbours (unconnected), remove it from the array
    //The loop continues from the previous node
    //Eventually there will be no nodes in the array
    generateMaze(options) {
        var path = [this.startNode];
        while (path.length > 0) {
            var node = path[path.length - 1];
            node.visit();
            if (path.includes(node)) {
                path.splice(path.indexOf(node));
            }
            path.push(node);
            let neighbours = this.getNeighbours(node, { connected: false });
            var nextFound = false;
            while (neighbours.length > 0) {
                let neighbour = this.pickRandom(neighbours, true);
                if (neighbour.visited()) {
                    continue;
                }
                this.joinNeighbours(node, neighbour);
                path.push(neighbour);
                nextFound = true;
                break;
            }
            if (!nextFound) {
                path.pop();
            }
        }
    }
    solutionDescription() {
        return "Depth-First Search (DFS) is a search algorithm that searches for nodes one path at a time<br/>"
            + "At node junctions it will inheritly have a bias to which ever direction the algorithm chooses to go first<br/>"
            + "For mazes this means that if there is the option of Left or Right, the algorithm will be programed to always go left until its options have been exhausted before returning to search the right side<br/><br/>"
            + "You can choose the bias in the bias text field above: T -> Top, R -> Right, B -> Bottom, L -> Left"
    }
    //As the maze will always be solved with a bias towards the left, right, top or bottom
    //This option allows you choose the bias
    solutionOptions() {
        return [
            {
                "type": "text",
                "text": "Bias",
                "id": "bias",
                "default": "LRBT",
                "validate": function (element, value) {
                    var require = ["L", "R", "B", "T"];
                    var validated = "";
                    for (var i = 0; i < value.length; ++i) {
                        if (require.includes(value[i].toUpperCase())) {
                            validated += value[i].toUpperCase();
                            require.splice(require.indexOf(value[i].toUpperCase()), 1);
                        }
                    }
                    for (var char of require) {
                        validated += char;
                    }
                    element.value = validated;
                },
                "tooltip": "Order of neighbour nodes to check:\n  T -> Top\n  R -> Right\n  B -> Bottom\n  L -> Left\n"
            }
        ];
    }
    //As this is implemented as a loop rather than recursively
    //It remembers which node is next using an array of nodes
    //If the node you are currently visiting has no viable neighbours (unconnected), remove it from the array
    //The loop continues from the previous node
    //Eventually it will reach the end of the maze
    //The path from the start to the end is then left in the array
    solveMaze(options) {
        let mapping = { "L": 0, "R": 1, "B": 2, "T": 3 };
        var path = [this.startNode];
        while (path.length > 0) {
            var node = path[path.length - 1];
            node.visit();
            if (path.includes(node)) {
                path.splice(path.indexOf(node));
            }
            path.push(node);
            if (node == this.endNode) {
                for (var i = 0; i < path.length; ++i) {
                    path[i].setPathLength(i);
                }
                return;
            }
            var neighbours = this.getNeighbours(node, { connected: true, includeWalls: true });
            if ("bias" in options) {
                let newNeighbours = [];
                for (var letter of options["bias"]) {
                    newNeighbours.push(neighbours[mapping[letter]]);
                }
                neighbours = newNeighbours;
            }
            neighbours = neighbours.filter((value) => value != null && value != 0);
            var nextFound = false;
            for (var neighbour of neighbours) {
                if (neighbour.visited()) {
                    continue;
                }
                path.push(neighbour);
                nextFound = true;
                break;
            }
            if (!nextFound) {
                path.pop();
            }
        }
    }
}

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

//Used for Eller's and Kruskal's Algorithms to keep track of and merge groups of nodes
class SetManager {
    constructor() {
        this.sets = {};
    }
    push(node, set=null) {
        if (set == null) {
            set = 0;
            while (set in this.sets) {
                set++;
            }
        }
        node.setSet(set);
        if (!(set in this.sets)) {
            this.sets[set] = [];
        }
        if (this.sets[set].includes(node)) {
            return false;
        }
        else {
            this.sets[set].push(node);
            return true;
        }
    }
    getNodesFromSetAtHeight(set, height) {
        var nodesAt = [];
        for (var node of set) {
            if (node.getY() == height) {
                nodesAt.push(node);
            }
        }
        return nodesAt;
    }
    //Merge two different sets together and remove one
    merge(leftNode, rightNode) {
        var newset = leftNode.getSet();
        var oldset = rightNode.getSet();
        if (newset == oldset) {
            return false;
        }
        var mergeok = true;
        //If the "left" set is larger than the "right" set,
        //Merge the "right" set into the "left" set instead
        if (oldset in this.sets && this.sets[oldset].length > this.sets[newset].length) {
            let temp = newset;
            newset = oldset;
            oldset = temp;
            mergeok = this.push(rightNode, oldset);
        }
        else {
            mergeok = this.push(rightNode, newset);
        }
        if (mergeok && oldset in this.sets) {
            for (var node of this.sets[oldset]) {
                this.sets[newset].push(node);
                node.setSet(newset);
            }
            delete this.sets[oldset];//Set is empty no longer needed
        }
        return mergeok;
    }
    remove(set) {
        if (set in this.sets) {
            for (var node of this.sets[set]) {
                node.setSet(null);
            }
        }
        var removedSet = this.sets[set];
        delete this.sets[set];
        return removedSet;
    }
    //Make looping through sets possible
    //If a set is deleted during the looping process, it will be handled
    [Symbol.iterator]() {
        var _this = this;
        var keys = Object.keys(this.sets);
        return {
            next: function () {
                var done = keys.length == 0;
                var value = null;
                if (!done) {
                    var cur = keys.splice(0, 1)[0];
                    while (!(cur in _this.sets)) {
                        cur = keys.splice(0, 1)[0];
                    }
                    value = _this.sets[cur];
                }
                //To me setting done=true should be done when its the last loop item,
                //However, you pass in done=true when you have run out of items
                return {
                    value: value,
                    done: done
                }
            }
        };
    };
}

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
                "default": 70
            },
            {
                "type": "number",
                "text": "vertical Merge %",
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
        var horizontalMerge = options["horizontalMerge"] / 100 || 0.7;
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
                    if (sets.merge(leftNode, rightNode)) {
                        this.joinNeighbours(leftNode, rightNode);
                    }
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
                                sets.push(bottomNode, topNode.getSet());
                                this.joinNeighbours(topNode, bottomNode);
                                bottomNode.visit();
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

class PRIM extends MazeAlgorithm {
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
                    node1.setRight(null);
                    node2.setLeft(null);
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
                    node1.setBottom(null);
                    node2.setTop(null);
                }
                //Add the subsections to the areas array (at the beginining)
                areas.splice(0, 0, ...this.split(area["left"], area["position"] + 1, area["right"], area["bottom"]));
                areas.splice(0, 0, ...this.split(area["left"], area["top"], area["right"], area["position"] + 1));
            }
        }
    }
}

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
            sets.push(node1);
            var node2 = this.pickRandom(areaNodes, true);
            sets.push(node2);
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

class WallFollower extends MazeAlgorithm {
    solutionDescription() {
        return "The Wall Follower algorithm will continue to follow a left (or right) wall until it finds the end of the maze<br/>"
            + "In a non-looped maze, following a left (or right) wall will always eventually to the end<br/>"
            + "<br/>"
            + "From the start node, find the left wall<br/>"
            + "In the begining, the 'person' in the maze is facing south, so left/right is reversed<br/>"
            + "Each time it turns, keep track of the direction the 'person' is facing so you always choose their left<br/>"
    }
    //You can follow the right wall or left wall
    solutionOptions() {
        return [
            {
                "type": "select",
                "text": "Wall to Follow",
                "id": "wallToFollow",
                "options": [
                    { "value": "left", "text": "Left" },
                    { "value": "right", "text": "Right" }
                ]
            }
        ];
    }
    solveMaze(options) {
        var node = this.startNode;
        var path = [];
        //These mazes are either from top to bottom or left to right
        //Therefore the direction the imaginary person is facing is:
        //Top to Bottom: South
        //Left to Right: East
        var direction = "S";
        if (node.getY() != 0) {
            direction = "E";
        }
        //For each direction this is a map of turning left
        var directionToNum = {
            "N": [4, 1, 2, 3],
            "E": [1, 2, 3, 4],
            "S": [2, 3, 4, 1],
            "W": [3, 4, 1, 2]
        };
        //firection for turning rght
        if ("wallToFollow" in options && options["wallToFollow"] == "right") {
            directionToNum = {
                "N": [2, 1, 4, 3],
                "E": [3, 2, 1, 4],
                "S": [4, 3, 2, 1],
                "W": [1, 4, 3, 2]
            };
        }
        //Conversion of numbers to directions
        var numToDirection = {
            1: "N",
            2: "E",
            3: "S",
            4: "W"
        }
        //Conversion of numbers to node methods to call
        var directions = {
            1: { "has": "hasTop",       "get": "getTop"    },
            2: { "has": "hasRight",     "get": "getRight"  },
            3: { "has": "hasBottom",    "get": "getBottom" },
            4: { "has": "hasLeft",      "get": "getLeft"    }
        };
        while (true) {
            //If node is in the path already, we must have backtracked somewhere
            //Remove from path
            var index = path.indexOf(node);
            if (index >= 0) {
                path.splice(index);
            }
            path.push(node);
            node.visit();
            //We found the end! break
            if (node == this.endNode) {
                break;
            }
            //Get the possible turns
            var conv = directionToNum[direction];
            for (var i of conv) {
                //Take the first possible available turn
                if (node[directions[i]["has"]]()) {
                    node = node[directions[i]["get"]]();
                    direction = numToDirection[i];
                    break;
                }
            }
        }
        for (var i = 0; i < path.length; ++i) {
            path[i].setPathLength(i);
        }
    }
}

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
                    node.visit();
                    node.resetNextPath();
                    this.joinNeighbours(node, previous);
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
