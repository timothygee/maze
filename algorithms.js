class Maze {
    constructor(w, h) {
        this.width = w || 10;
        this.height = h || 10;
        this.start = null;
        this.end = null;
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
    }
    /****************************************\
                Initialise Methods
    \****************************************/
    initialiseMaze(w, h) {
        this.handleEvent(this._onBeforeInitialise);
        performance.mark("start");
        this.width = w || this.width;
        this.height = h || this.height;
        this.graph = new Array(this.width);
        let startPos = [Math.floor(Math.random() * (this.width)), 0];
        let endPos = [Math.floor(Math.random() * (this.width)), this.height - 1];
        for (var i = 0; i < this.width; ++i) {
            this.graph[i] = new Array(this.height);
            for (var j = 0; j < this.height; ++j) {
                let node = new Node(i, j);
                if (j == startPos[1] && i == startPos[0]) {
                    this.start = node;
                }
                if (j == endPos[1] && i == endPos[0]) {
                    this.end = node;
                }
                if (j == 0) { node.setTop(0); }
                if (i == this.width-1) { node.setRight(0); }
                if (j == this.height-1) { node.setBottom(0); }
                if (i == 0) { node.setLeft(0); }
                this.graph[i][j] = node;
                node.onUpdate(((function () {
                    return function (node) {
                        this.handleEvent(this._onUpdate, node);
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
            case "DFS":
                return new DFS(this);
            case "PRIM":
                return new PRIM(this);
            case "Kruskal":
                return new Kruskal(this);
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
            case "DFS":
                return new DFS(this);
            case "BFS":
                return new BFS(this);
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
    getStart() {
        return this.start;
    }
    getEnd() {
        return this.end;
    }
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
        for (var i = 0; i < this.getWidth(); ++i) {
            for (var j = 0; j < this.getHeight(); ++j) {
                nodes.push(this.getNode(i, j));
            }
        }
        return nodes;
    }
    getHeight() {
        return this.height;
    }
    getWidth() {
        return this.width;
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
    beforeGenerate() {}
    afterGenerate() {}
    generationDescription() {
        return "No description supplied";
    }
    generationOptions() {
        return [];
    }
    beforeSolve() {}
    afterSolve() {}
    solutionDescription() {
        return "No description supplied";
    }
    solutionOptions() {
        return [];
    }
    pickRandom(array, remove) {
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
        if (x != this.maze.getWidth() - 1) {
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
        if (y != this.maze.getHeight() - 1) {
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
        var start = this.maze.getStart();
        var end = this.maze.getEnd();
        var toSearch = [start];
        var paths = [[start]];
        while (toSearch.length > 0) {
            var node = toSearch.shift();
            var path = paths.shift();
            node.visit();
            if (node == end) {
                path.push(node);
                for (var i = 0; i < path.length; ++i) {
                    path[i].setPathLength(i);
                }
                return;
            }
            let neighbours = this.getNeighbours(node, { connected: true });
            for (var i = 0; i < neighbours.length; ++i) {
                if (!neighbours[i].visited()) {
                    var p = path.slice();
                    p.push(neighbours[i]);
                    paths.push(p);
                    toSearch.push(neighbours[i]);
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
    generateMaze(options) {
        var path = [this.maze.getStart()];
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
    solveMaze(options) {
        let mapping = { "L": 0, "R": 1, "B": 2, "T": 3 };
        let end = this.maze.getEnd();
        var path = [this.maze.getStart()];
        while (path.length > 0) {
            var node = path[path.length - 1];
            node.visit();
            if (path.includes(node)) {
                path.splice(path.indexOf(node));
            }
            path.push(node);
            if (node == end) {
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
        var node = this.maze.getStart();
        var selectRandom = (100 - options["selectRandom"]) / 100;
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
        var sets = [];
        for (var i = 0; i < this.maze.getWidth(); ++i) {
            for (var j = 0; j < this.maze.getHeight(); ++j) {
                var node = this.maze.getNode(i, j);
                if (node.getX()+1 < this.maze.getWidth()) {
                    walls.push({
                        node1: node,
                        node2: this.maze.getNode(i+1, j)
                    });
                }
                if (node.getY()+1 < this.maze.getHeight()) {
                    walls.push({
                        node1: node,
                        node2: this.maze.getNode(i, j+1)
                    });
                }
                sets.push([node]);
            }
        }
        while (walls.length > 0) {
            var wall = this.pickRandom(walls, true);
            var joinSets = true;
            var set1 = null;
            var set2 = null;
            for (var i = 0; i < sets.length; ++i) {
                for (var j = 0; j < sets[i].length; ++j) {
                    if (sets[i][j] == wall["node1"]) {
                        set1 = sets[i];
                        for (var k = 0; k < sets[i].length; ++k) {
                            if (sets[i][k] == wall["node2"]) {
                                joinSets = false;
                                break;
                            }
                        }
                    }
                    if (sets[i][j] == wall["node2"]) {
                        set2 = sets[i];
                    }
                }
            }
            if (joinSets) {
                var i = sets.indexOf(set2);
                sets.splice(i, 1);
                for (var i = 0; i < set2.length; ++i) {
                    set1.push(set2[i]);
                }
                wall["node1"].visit();
                wall["node2"].visit();
                if (wall["node1"].getX() == wall["node2"].getX()) {
                    if (wall["node1"].getY() < wall["node2"].getY()) {
                        wall["node1"].setBottom(wall["node2"]);
                        wall["node2"].setTop(wall["node1"]);
                    }
                    else {
                        wall["node1"].setTop(wall["node2"]);
                        wall["node2"].setBottom(wall["node1"]);
                    }
                }
                else {
                    if (wall["node1"].getX() > wall["node2"].getX()) {
                        wall["node1"].setLeft(wall["node2"]);
                        wall["node2"].setRight(wall["node1"]);
                    }
                    else {
                        wall["node1"].setRight(wall["node2"]);
                        wall["node2"].setLeft(wall["node1"]);
                    }
                }
                
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
    generateMaze(options) {
        var walls = [];
        function addWalls(maze, node) {
            if (node !== null) {
                if (node.getTop() !== 0) {
                    if (node.getY()-1 >= 0) {
                        walls.push({
                            x:node.getX(),
                            y:node.getY(),
                            pos: "top"
                        });
                    }
                }
                if (node.getRight() !== 0) {
                    if (node.getX()+1 < maze.getWidth()) {
                        walls.push({
                            x:node.getX(),
                            y:node.getY(),
                            pos: "right"
                        });
                    }
                }
                if (node.getBottom() !== 0) {
                    if (node.getY()+1 < maze.getHeight()) {
                        walls.push({
                            x:node.getX(),
                            y:node.getY(),
                            pos: "bottom"
                        });
                    }
                }
                if (node.getTop() !== 0) {
                    if (node.getX()-1 >= 0) {
                        walls.push({
                            x:node.getX(),
                            y:node.getY(),
                            pos: "left"
                        });
                    }
                }
                node.visit();
            }
        }
        addWalls(this.maze, this.maze.getStart());
        while (walls.length > 0) {
            var newnode = this.pickRandom(walls, true);
            var node1 = this.maze.getNode(newnode.x, newnode.y);
            var node2;
            switch (newnode.pos) {
                case "left":
                    node2 = this.maze.getNode(newnode.x - 1, newnode.y);
                    break;
                case "right":
                    node2 = this.maze.getNode(newnode.x + 1, newnode.y);
                    break;
                case "bottom":
                    node2 = this.maze.getNode(newnode.x, newnode.y + 1);
                    break;
                case "top":
                    node2 = this.maze.getNode(newnode.x, newnode.y - 1);
                    break;
            }
            if (node1.visited() && !node2.visited()) {
                switch (newnode.pos) {
                    case "left":
                        node1.setLeft(node2);
                        node2.setRight(node1);
                        break;
                    case "right":
                        node1.setRight(node2)
                        node2.setLeft(node1)
                        break;
                    case "bottom":
                        node1.setBottom(node2)
                        node2.setTop(node1)
                        break;
                    case "top":
                        node1.setTop(node2)
                        node2.setBottom(node1)
                        break;
                }
                addWalls(this.maze, node2);
            }
        }
    }
}
