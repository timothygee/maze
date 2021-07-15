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
        this._sendUpdatesQueue = {};
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
            this.handleEvent(this._onUpdate, Object.values(this._sendUpdatesQueue));
            this._sendUpdatesQueue = {};
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
                            this._sendUpdatesQueue[node.getX()+":"+node.getY()] = node;//If a node is already in the dict overwrite it
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
            case "Prim":
                return new Prim(this);
            case "RecursiveDivision":
                return new RecursiveDivision(this);
            case "RandomRecursiveDivision":
                return new RandomRecursiveDivision(this);
            case "Wilson":
                return new Wilson(this);
            case "DFSPrim":
                return new DFSPrim(this);
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
            case "LabRat":
                return new LabRat(this);
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
