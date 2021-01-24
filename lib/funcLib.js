//= ==================A* Algo===================
(function (definition) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
    define([], definition);
  } else {
    const exports = definition();
    window.astar = exports.astar;
    window.Graph = exports.Graph;
  }
})(function () {
  function pathTo(node) {
    let curr = node;
    const path = [];
    while (curr.parent) {
      const { x } = curr;
      const { y } = curr;
      curr.x = y;
      curr.y = x;
      path.unshift(curr);
      curr = curr.parent;
    }
    return path;
  }

  function getHeap() {
    return new BinaryHeap(function (node) {
      return node.f;
    });
  }

  var astar = {
    search(graph, start, end, options) {
      graph.cleanDirty();
      options = options || {};
      const heuristic = options.heuristic || astar.heuristics.manhattan;
      const closest = options.closest || false;

      const openHeap = getHeap();
      let closestNode = start;

      start.h = heuristic(start, end);
      graph.markDirty(start);

      openHeap.push(start);

      while (openHeap.size() > 0) {
        const currentNode = openHeap.pop();

        if (currentNode === end) {
          return pathTo(currentNode);
        }

        currentNode.closed = true;

        const neighbors = graph.neighbors(currentNode);

        for (let i = 0, il = neighbors.length; i < il; ++i) {
          const neighbor = neighbors[i];

          if (neighbor.closed || neighbor.isWall()) {
            continue;
          }

          const gScore = currentNode.g + neighbor.getCost(currentNode);
          const beenVisited = neighbor.visited;

          if (!beenVisited || gScore < neighbor.g) {
            neighbor.visited = true;
            neighbor.parent = currentNode;
            neighbor.h = neighbor.h || heuristic(neighbor, end);
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
            graph.markDirty(neighbor);
            if (closest) {
              if (
                neighbor.h < closestNode.h ||
                (neighbor.h === closestNode.h && neighbor.g < closestNode.g)
              ) {
                closestNode = neighbor;
              }
            }

            if (!beenVisited) {
              openHeap.push(neighbor);
            } else {
              openHeap.rescoreElement(neighbor);
            }
          }
        }
      }

      if (closest) {
        return pathTo(closestNode);
      }

      return [];
    },
    heuristics: {
      manhattan(pos0, pos1) {
        const d1 = Math.abs(pos1.x - pos0.x);
        const d2 = Math.abs(pos1.y - pos0.y);
        return d1 + d2;
      },
      diagonal(pos0, pos1) {
        const D = 1;
        const D2 = Math.sqrt(2);
        const d1 = Math.abs(pos1.x - pos0.x);
        const d2 = Math.abs(pos1.y - pos0.y);
        return D * (d1 + d2) + (D2 - 2 * D) * Math.min(d1, d2);
      },
    },
    cleanNode(node) {
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    },
  };

  function Graph(gridIn, options) {
    options = options || {};
    this.nodes = [];
    this.diagonal = !!options.diagonal;
    this.grid = [];
    for (let x = 0; x < gridIn.length; x++) {
      this.grid[x] = [];

      for (let y = 0, row = gridIn[x]; y < row.length; y++) {
        const node = new GridNode(x, y, row[y]);
        this.grid[x][y] = node;
        this.nodes.push(node);
      }
    }
    this.init();
  }

  Graph.prototype.init = function () {
    this.dirtyNodes = [];
    for (let i = 0; i < this.nodes.length; i++) {
      astar.cleanNode(this.nodes[i]);
    }
  };

  Graph.prototype.cleanDirty = function () {
    for (let i = 0; i < this.dirtyNodes.length; i++) {
      astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
  };

  Graph.prototype.markDirty = function (node) {
    this.dirtyNodes.push(node);
  };

  Graph.prototype.neighbors = function (node) {
    const ret = [];
    const { x } = node;
    const { y } = node;
    const { grid } = this;

    // West
    if (grid[x - 1] && grid[x - 1][y]) {
      ret.push(grid[x - 1][y]);
    }

    // East
    if (grid[x + 1] && grid[x + 1][y]) {
      ret.push(grid[x + 1][y]);
    }

    // South
    if (grid[x] && grid[x][y - 1]) {
      ret.push(grid[x][y - 1]);
    }

    // North
    if (grid[x] && grid[x][y + 1]) {
      ret.push(grid[x][y + 1]);
    }

    if (this.diagonal) {
      // Southwest
      if (grid[x - 1] && grid[x - 1][y - 1]) {
        ret.push(grid[x - 1][y - 1]);
      }

      // Southeast
      if (grid[x + 1] && grid[x + 1][y - 1]) {
        ret.push(grid[x + 1][y - 1]);
      }

      // Northwest
      if (grid[x - 1] && grid[x - 1][y + 1]) {
        ret.push(grid[x - 1][y + 1]);
      }

      // Northeastx
      if (grid[x + 1] && grid[x + 1][y + 1]) {
        ret.push(grid[x + 1][y + 1]);
      }
    }

    return ret;
  };

  Graph.prototype.toString = function () {
    const graphString = [];
    const nodes = this.grid;
    for (let x = 0; x < nodes.length; x++) {
      const rowDebug = [];
      const row = nodes[x];
      for (let y = 0; y < row.length; y++) {
        rowDebug.push(row[y].weight);
      }
      graphString.push(rowDebug.join(' '));
    }
    return graphString.join('\n');
  };

  function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
  }

  GridNode.prototype.toString = function () {
    return `[${this.x} ${this.y}]`;
  };

  GridNode.prototype.getCost = function (fromNeighbor) {
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
      return this.weight * 1.41421;
    }
    return this.weight;
  };

  GridNode.prototype.isWall = function () {
    return this.weight === 0;
  };

  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push(element) {
      this.content.push(element);

      this.sinkDown(this.content.length - 1);
    },
    pop() {
      const result = this.content[0];
      const end = this.content.pop();
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },
    remove(node) {
      const i = this.content.indexOf(node);

      const end = this.content.pop();

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    },
    size() {
      return this.content.length;
    },
    rescoreElement(node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown(n) {
      const element = this.content[n];

      while (n > 0) {
        const parentN = ((n + 1) >> 1) - 1;
        const parent = this.content[parentN];
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          n = parentN;
        } else {
          break;
        }
      }
    },
    bubbleUp(n) {
      const { length } = this.content;
      const element = this.content[n];
      const elemScore = this.scoreFunction(element);

      while (true) {
        const child2N = (n + 1) << 1;
        const child1N = child2N - 1;
        let swap = null;
        var child1Score;
        if (child1N < length) {
          const child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        if (child2N < length) {
          const child2 = this.content[child2N];
          const child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        } else {
          break;
        }
      }
    },
  };

  return {
    astar,
    Graph,
  };
});
//= ==================A* Algo===================
