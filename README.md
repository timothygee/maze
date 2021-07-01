# Maze Generator and Solver
This project implements some different maze generation and solution techniques, briefly describes how they work and visualises the generation/solution process.

## Generation Methods:
* Randomised [Depth-first Search](https://en.wikipedia.org/wiki/Depth-first_search)
* Randomised [Kruskal's Algorithm](https://en.wikipedia.org/wiki/Kruskal%27s_algorithm)
* Randomised [Prim's Algorithm](https://en.wikipedia.org/wiki/Prim%27s_algorithm)
* [Wilson's Algorithm](https://en.wikipedia.org/wiki/Loop-erased_random_walk#Uniform_spanning_tree)
* Randomised Depth-first Search/Prim's Algorithm hybrid (DFS/PRIM)

## Solution Methods:
* [Breadth-first Search](https://en.wikipedia.org/wiki/Breadth-first_search)
* [Depth-first Search](https://en.wikipedia.org/wiki/Depth-first_search)

**To run, simply open Maze.html in your browser**

All of the algorithms are implemented in JavaScript without using recursion.
This is due to some algorithms running into a "too much recurion" error.

## Maze Generation Options
There are 4 main maze generation options.
1. Generation Algorithm
2. Maze Width
3. Maze Height
4. Maze Start/End Points (top/bottom or left/right)
5. Generate Button

Algorithm specific generation options
* Wilson's Algorithm
  * Next Node Selection: Which node should be selected to start the next path from
* Randomised DFS/PRIM
  * Select Random %: Allows you to define how often to choose a random node from where to continue the algorithm from

### Solution Options
There are 2 main maze solution options.
1. Solution Algorithm
2. Solution Button

Algorithm specific solution options
* DFS
  * Bias: Allows you to tell the algorithm which route direction to preference when multiple route options are available


