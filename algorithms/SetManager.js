//Used for Eller's, Kruskal's and Random Recursive Division Algorithms to keep track of and merge groups of nodes
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