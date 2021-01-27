const Global = {};
let Grid = [];
let SearchedNodes = [];
let Container = null;
let MouseDown = false;
const OpenListColor = 0xE8D2AE;
const BackgrounColor = OpenListColor;
const ClosedListColor = 0x0C0A3E;
const PathColor = 0x5EEE4A;
const BoxLineColor = 0x2C3531;
const TraverseColor = 0xD1E8E2;
const NonTraverseColor = 0x116466;
const EndFillColor = 0xDC143C;
const StartFillColor = 0x1A508B;
const ButtonColor = 0x116466;
const White = 0xFFFFFF;
let CreatingTraverse = false;
const BoxWidth = 25;
const BoxHeight = 25;
let start = [2, 2];
let end = [28, 45];
const timeBetweenEvents = 2;
let StartSelected = false;
let EndSelected = false;
let AStarStarted = false;
let WindowWidth;
let WindowHeight;
let HasSeached = false;

const SearchStats = {
    totalSeaches: 0,
    timeSeached: "",
    graphic: null

};

const SearchType = {
    Open: 0,
    Closed: 1,
    AStar: 2
};

const FontStyle = new PIXI.TextStyle({
    fontFamily: 'Trebuchet MS',
    fontSize: 26,
    fill: '#ffffff', // gradient
    stroke: '#4a1850',
    wordWrap: true,
    wordWrapWidth: 340,
  });

window.onload = function () {
    document.getElementById('btnModal').click();
    initGame();  
    document.body.onmousedown = function() { 
        MouseDown = true;
      }
      document.body.onmouseup = function() {
        MouseDown = false;
      }
};

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

function initGame() {
  setupGlobals();
  document.body.appendChild(Global.app.view);
  WindowWidth = parseInt(Global.app.view.clientWidth);
  WindowHeight = parseInt(Global.app.view.clientHeight);
  window.addEventListener('resize', resizeHandler, false);
  setupInitGraphics();
  createRandomNodes();
  resizeHandler();
}

function createRandomNodes() {
    for (let i = 0; i < Grid.length; i++) {
        for (let x = 0; x < Grid[0].length; x++) {
            
            if (i === end[0] && x === end[1])
                continue;
        
            if (i === start[0] && x === start[1])
                continue;
            
            const randomNum = getRandom(0, 5);
            if (randomNum === 0){
                Grid[i][x].isTraversable = false;
                makeTraversable(false, i, x, BoxWidth, BoxHeight); 
            }
        }
    }
}

function setupInitGraphics(){

    Grid = [];
    SearchedNodes = [];
    
    const backgroud = new PIXI.Graphics();
    backgroud.beginFill(BackgrounColor);

    backgroud.drawRect(0, 0, WindowWidth, WindowHeight);
    backgroud.endFill();

    Container = new PIXI.Container();
    Global.app.stage.addChild(Container);
    Container.addChild(backgroud);
    setupBtns();

    setupInitialGrid(WindowWidth, WindowHeight);
    drawNewGrid();

}

function setupBtns() {
    const runBtn = new Btn(1375, 660, "Search");
    runBtn.addBtnToStage();
    runBtn.graphic.on('pointerdown', (e) => {
        if (AStarStarted || HasSeached)
            return;
        
        AStarStarted = true;
        HasSeached = true;
        drawNewGrid();
        SearchedNodes = [];

        const t0 = performance.now();
        runAStar(start, end);
        const t1 = performance.now();
        SearchStats.timeSeached = parseFloat(t1 - t0).toFixed(1).toString();
        SearchStats.totalSeaches = SearchedNodes.length;
        displayStats();
      });

    const randomBtn = new Btn(1375, 720, "Random");
    randomBtn.addBtnToStage();
    randomBtn.graphic.on('pointerdown', (e) => {
        if (AStarStarted)
            return;

        HasSeached = false;
        CreatingTraverse = false;
        Global.app.stage.removeChild(Container);
        setupInitGraphics();
        createRandomNodes();
        
    });

    const clear = new Btn(1375, 780, "Clear");
    clear.addBtnToStage();
    clear.graphic.on('pointerdown', (e) => {
        if (AStarStarted)
            return;
        
        HasSeached = false;
        cleanGrid();
        drawNewGrid();
    });
}

function displayStats() {
    try { Container.removeChild(SearchStats.graphic); } 
    catch (error) {}
    const statStyle = new PIXI.TextStyle({
        fontFamily: 'Trebuchet MS',
        fontSize: 20,
        fill: '#000000', // gradient
        stroke: '#4a1850',
        wordWrap: true,
        wordWrapWidth: 500,
    });
    const searches = SearchStats.totalSeaches;
    const timeSearched = SearchStats.timeSeached;
    const stats = `Nodes examined:\n${searches}\n\nTime searched:\n${timeSearched} ms`
    const searchStats = new PIXI.Text(stats, statStyle);
    searchStats.x = 1335;
    searchStats.y = 100;
    SearchStats.graphic = searchStats;
    Container.addChild(SearchStats.graphic);
}

function cleanGrid() {
    for (let i = 0; i < Grid.length; i++) {
        for (let x = 0; x < Grid[0].length; x++) {
            const gridPoint = Grid[i][x];
            if (gridPoint.isTraversable) {
                if (!isNotStartOrEnd( gridPoint )) {
                    replaceGridPoint(gridPoint, x, i);
                }
            }
        }
    }

    for (let i = 0; i < Grid.length; i++) {
        for (let x = 0; x < Grid[0].length; x++) {
            Container.removeChild(Grid[i][x].graphic);
        }        
    }
}

function createGridPoint(x, i) {
    const graphic = new PIXI.Graphics();
    graphic.lineStyle(3, BoxLineColor, 1);
    graphic.beginFill(TraverseColor);
    graphic.on('pointerdown', (e) => {
        CreatingTraverse = false;
        if (i === start[0] && x === start[1]) {
        } else if (i === end[0] && x === end[1]) {
        } else {
            Grid[i][x].isTraversable = false;
            makeTraversable(false, i,x, BoxWidth, BoxHeight);    
        }
    });
    
    graphic.on('pointerover', (e) => {
        if (!CreatingTraverse && MouseDown) {
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = false;
                makeTraversable(false, i,x, BoxWidth, BoxHeight);    
            }
        }
    });

    graphic.drawRect(x * (BoxWidth + 2), i * (BoxHeight + 2), BoxWidth, BoxHeight);
    graphic.endFill();
    Grid[i][x].graphic = graphic;
    Container.addChild(graphic);
}

function replaceGridPoint(gridPoint, x, i) {
    Container.removeChild(gridPoint.graphic)
    const graphic = new PIXI.Graphics();
    graphic.lineStyle(3, BoxLineColor, 1);
    graphic.beginFill(TraverseColor);
    graphic.on('pointerdown', (e) => {
        CreatingTraverse = false;
        if (i === start[0] && x === start[1]) {
        } else if (i === end[0] && x === end[1]) {
        } else {
            Grid[i][x].isTraversable = false;
            makeTraversable(false, i,x, BoxWidth, BoxHeight);    
        }
    });
    
    graphic.on('pointerover', (e) => {
        if (!CreatingTraverse && MouseDown) {
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = false;
                makeTraversable(false, i,x, BoxWidth, BoxHeight);    
            }
        }
    });

    graphic.drawRect(x * (BoxWidth + 2), i * (BoxHeight + 2), BoxWidth, BoxHeight);
    graphic.endFill();
    Grid[i][x].graphic = graphic;
    Container.addChild(graphic);
}

function isNotStartOrEnd(gridPoint) {

    if (gridPoint.x === start[1] && gridPoint.y === start[0])
        return true;
    else if (gridPoint.x === end[1] && gridPoint.y === end[0])
        return true;

    return false;
}

function runAStar(start, end){
    const openList = [];
    const closedList = [];
    const startNode = new Node(start[1], start[0]);

    closedList.push(startNode);
    addSurroundingNodes(openList, closedList, startNode, end);
    while(openList.length > 0){
        const nextNode = getLestExspensiveNode(openList);
        if (isEnd(nextNode)) {
            let prevParent = nextNode;
            const aStarPath = [];
            while (prevParent.x !== startNode.x || 
                prevParent.y !== startNode.y) {
                prevParent.SearchType = SearchType.AStar;
                aStarPath.push(prevParent);
                prevParent = prevParent.parent;
            }

            aStarPath.reverse();

            for (let i = 0; i < aStarPath.length; i++)
                SearchedNodes.push(aStarPath[i]);
                
            showPaths(aStarPath);
            break;
        } else if (!arrContains(closedList, nextNode)){
            const index = openList.indexOf(nextNode);

            if (index > -1) 
                openList.splice(index, 1);

            closedList.push(nextNode);
            nextNode.SearchType = SearchType.Closed;
            SearchedNodes.push(nextNode);
            addSurroundingNodes(openList, closedList, nextNode, end);
        } else {
            console.log("something went wrong");
            throw Error("oops. We should not be in this part of the logic.");
        }
    }
}

async function showPaths(aStarPath) {

    for (let i = 0; i < SearchedNodes.length; i++) {
        const nextPathNode = SearchedNodes[i];
        if (nextPathNode.x !== start[1] || nextPathNode.y !== start[0]) {
            if (nextPathNode.x !== end[1] || nextPathNode.y !== end[0]) {

                await sleep(timeBetweenEvents);

                if (nextPathNode.SearchType === SearchType.Open) {
                    colorNode(nextPathNode, OpenListColor);
                } else {
                    colorNode(nextPathNode, OpenListColor);
                }
                
                if (i === SearchedNodes.length - 1) {
                    startAStartPath = true;
                }
            }
        }
    }

    for (let x = 0; x < aStarPath.length; x++) {
        const nextPathNode = aStarPath[x];
        if (nextPathNode.x !== start[1] || nextPathNode.y !== start[0]) {
            if (nextPathNode.x !== end[1] || nextPathNode.y !== end[0]) {
                await sleep(timeBetweenEvents);
                colorNode(nextPathNode, PathColor);
            }
        }
    }
    AStarStarted = false;
}

function colorNode(node, color) {
    Container.removeChild(node.graphic);
    const newGraphic = new PIXI.Graphics();
    newGraphic.lineStyle(3, BoxLineColor, 1);
    newGraphic.beginFill(color);

    newGraphic.drawRect(
            node.x * (BoxWidth + 2), 
            node.y * (BoxHeight + 2), 
            BoxWidth, 
            BoxHeight
        );

    newGraphic.endFill();
    node.graphic = newGraphic;
    Container.addChild(newGraphic);
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

function isEnd(node) {

    if (node.x === end[1] && node.y === end[0])
        return true

    return false;
}

function getLestExspensiveNode(openList) {
    const bestFCosts = [];
    let bestFCost = openList[0];
    let bestHCost = openList[0];
    for (let i = 0; i < openList.length; i++) {
        if (openList[i].fCost < bestFCost.fCost)
            bestFCost = openList[i];
    }
    for (let i = 0; i < openList.length; i++) {
        if (openList[i].fCost === bestFCost.fCost)
            bestFCosts.push(openList[i]);
    }
    for (let i = 0; i < bestFCosts.length; i++) {
        if (bestFCosts[i].hCost < bestHCost.hCost)
        bestHCost = bestFCosts[i];        
    }
    return bestHCost;
}

function addSurroundingNodes(openList, closedList, parent, end) {

    if (parent.y - 1 >= 0) {
        const northOfParent = Grid[parent.y - 1][parent.x];
        if (!arrContains(closedList, northOfParent)) {
            if (northOfParent.isTraversable) {
                if (arrContains(openList, northOfParent)) {
                    const index = openList.indexOf(northOfParent);
                    openList[index].gCost = parent.gCost + 10;
                    openList[index].fCost = openList[index].gCost + openList[index].hCost;
                    openList[index].parent = parent;
                } else {
                    northOfParent.parent = parent;
                    northOfParent.gCost = calculateCostG(parent);
                    northOfParent.hCost = calculateCostH(northOfParent, end);
                    northOfParent.fCost = northOfParent.gCost + northOfParent.hCost;
                    northOfParent.SearchType = SearchType.Open;
                    SearchedNodes.push(northOfParent);
                    openList.push(northOfParent);
                }
            }
        }
    }

    if (parent.x + 1 <= Grid[0].length - 1) {
        const eastOfParent = Grid[parent.y][parent.x + 1];
        if (!arrContains(closedList, eastOfParent)) {
            if (eastOfParent.isTraversable) {
                if (arrContains(openList, eastOfParent)) {
                    const index = openList.indexOf(eastOfParent);
                    openList[index].gCost = parent.gCost + 10;
                    openList[index].fCost = openList[index].gCost + openList[index].hCost;
                    openList[index].parent = parent;
                } else {
                    eastOfParent.parent = parent;
                    eastOfParent.gCost = calculateCostG(parent);
                    eastOfParent.hCost = calculateCostH(eastOfParent, end);
                    eastOfParent.fCost = eastOfParent.gCost + eastOfParent.hCost;
                    eastOfParent.SearchType = SearchType.Open;
                    SearchedNodes.push(eastOfParent);
                    openList.push(eastOfParent);
                }
            }
        }
    }

    if (parent.y + 1 <= Grid.length - 1) {
        const southOfParent = Grid[parent.y + 1][parent.x];
        if (!arrContains(closedList, southOfParent)) {
            if (southOfParent.isTraversable) {
                if (arrContains(openList, southOfParent)) {
                    const index = openList.indexOf(southOfParent);
                    openList[index].gCost = parent.gCost + 10;
                    openList[index].fCost = openList[index].gCost + openList[index].hCost;
                    openList[index].parent = parent;
                } else {
                    southOfParent.parent = parent;
                    southOfParent.gCost = calculateCostG(parent);
                    southOfParent.hCost = calculateCostH(southOfParent, end);
                    southOfParent.fCost = southOfParent.gCost + southOfParent.hCost;
                    southOfParent.SearchType = SearchType.Open;
                    SearchedNodes.push(southOfParent);
                    openList.push(southOfParent);
                }
            }
        }
    }

    if (parent.x - 1 >= 0) {
        const westOfParent = Grid[parent.y][parent.x - 1];
        if (!arrContains(closedList, westOfParent)) {
            if (westOfParent.isTraversable) {
                if (arrContains(openList, westOfParent)) {
                    const index = openList.indexOf(westOfParent);
                    openList[index].gCost = parent.gCost + 10;
                    openList[index].fCost = openList[index].gCost + openList[index].hCost;
                    openList[index].parent = parent;
                } else {
                    westOfParent.parent = parent;
                    westOfParent.gCost = calculateCostG(parent);
                    westOfParent.hCost = calculateCostH(westOfParent, end);
                    westOfParent.fCost = westOfParent.gCost + westOfParent.hCost;
                    westOfParent.SearchType = SearchType.Open;
                    SearchedNodes.push(westOfParent);
                    openList.push(westOfParent);
                }
            }
        }
    }
}

async function changeOpenListGraphic(node) {
    if (node.x === end[1] && node.y === end[0])
        return;

    await sleep(timeBetweenEvents);
    Container.removeChild(node.graphic);
    const newGraphic = new PIXI.Graphics();
    newGraphic.lineStyle(3, BoxLineColor, 1);
    newGraphic.beginFill(OpenListColor);

    newGraphic.drawRect(
            node.x * (BoxWidth + 2), 
            node.y * (BoxHeight + 2), 
            BoxWidth, 
            BoxHeight
        );

    newGraphic.endFill();
    node.graphic = newGraphic;
    Container.addChild(newGraphic);
    
}

async function changeClosedListGraphic(node) {
    if (node.x === end[1] && node.y === end[0])
        return;

    await sleep(timeBetweenEvents);
    
    Container.removeChild(node.graphic);
    const newGraphic = new PIXI.Graphics();
    newGraphic.lineStyle(3, BoxLineColor, 1);
    newGraphic.beginFill(ClosedListColor);

    newGraphic.drawRect(
            node.x * (BoxWidth + 2), 
            node.y * (BoxHeight + 2), 
            BoxWidth, 
            BoxHeight
        );

    newGraphic.endFill();
    node.graphic = newGraphic;
    Container.addChild(newGraphic);
}

function arrContains(arr, node) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].x === node.x && arr[i].y === node.y)
            return true;
    }
    return false;
}

function calculateCostH(node, endPoint) {
    const xDistance = Math.abs(node.x - endPoint[1]);
    const yDistane = Math.abs(node.y - endPoint[0]);
    const result = (xDistance + yDistane) * 10;
    return result;
}

function calculateCostG(node) {
    const result = node.gCost + 10;
    return result;
}

function setupInitialGrid(windowWidth, windowHeight) {
    const outerLength = Math.floor(windowHeight * .94/ BoxHeight);
    for (let i = 0; i < outerLength; i++) {
        const innerGrid = [];
        const innerLength = Math.floor((windowWidth * .8) / BoxWidth);
        for (let x = 0; x < innerLength; x++) {
            const node = new Node(x, i);
            innerGrid.push(node);
        }
        Grid.push(innerGrid);
    }    
}

function drawNewGrid() {
    cleanGrid();
    const BoxWidth = 25;
    const BoxHeight = 25;
    for (let i = 0; i < Grid.length; i++) {
        for (let x = 0; x < Grid[0].length; x++) {
            const graphics = new PIXI.Graphics();
            graphics.interactive = true;
            graphics.buttonMode = true;

            if (i === start[0] && x === start[1]) {
                graphics.lineStyle(3, BoxLineColor, 1);
                graphics.beginFill(StartFillColor);
                setupStartPointSelected(graphics, x, i);
            } else if (i === end[0] && x === end[1]){
                graphics.lineStyle(3, BoxLineColor, 1);
                graphics.beginFill(EndFillColor);
                setupEndPointSelected(graphics, x, i);
            } else if (Grid[i][x].isTraversable) {
                graphics.lineStyle(3, BoxLineColor, 1);
                graphics.beginFill(TraverseColor);
                setupGridPointChanges(graphics, i, x);
            } else {
                graphics.lineStyle(3, BoxLineColor, 1);
                graphics.beginFill(NonTraverseColor);
                setupGridPointChanges(graphics, i, x);
            }

            graphics.drawRect(x * (BoxWidth + 2), i * (BoxHeight + 2), BoxWidth, BoxHeight);
            graphics.endFill();
            Grid[i][x].graphic = graphics;
            Container.addChild(graphics);
        }
    }
}

function setupStartPointSelected(graphic, x, i){
    if (HasSeached)
        return;
    
    graphic.on('pointerdown', (e) => {
        if (!StartSelected) {
            Container.removeChild(graphic);
            const selectedStart = new PIXI.Graphics();
            selectedStart.on('pointerdown', e => {
                drawNewGrid();
                setupStartPointNOTSelected(selectedStart, x, i);
                
            });

            selectedStart.interactive = true;
            selectedStart.buttonMode = true;

            selectedStart.lineStyle(3, White, 1);
            selectedStart.beginFill(StartFillColor);

            selectedStart.drawRect(start[1] * (BoxWidth + 2), start[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
            selectedStart.endFill();
            Grid[i][x].graphic = selectedStart;

            Container.addChild(selectedStart);

            EndSelected = false;
            StartSelected = true;
        }
    });
}

function setupEndPointSelected(graphic, x, i){
    if (HasSeached)
        return;

    graphic.on('pointerdown', (e) => {
        if (!EndSelected) {
            Container.removeChild(graphic);
            const selectedEnd = new PIXI.Graphics();
            selectedEnd.on('pointerdown', e => {
                drawNewGrid();
                setupEndPointNOTSelected(selectedEnd, x, i);
            });

            selectedEnd.interactive = true;
            selectedEnd.buttonMode = true;

            selectedEnd.lineStyle(3, White, 1);
            selectedEnd.beginFill(EndFillColor);

            selectedEnd.drawRect(end[1] * (BoxWidth + 2), end[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
            selectedEnd.endFill();
            Grid[i][x].graphic = selectedEnd;

            Container.addChild(selectedEnd);
            
            StartSelected = false;
            EndSelected = true;
        }
    });
}

function setupEndPointNOTSelected(graphic, x, i) {
        Container.removeChild(graphic);
        const selectedStart = new PIXI.Graphics();

        selectedStart.interactive = true;
        selectedStart.buttonMode = true;

        selectedStart.lineStyle(3, BoxLineColor, 1);
        selectedStart.beginFill(EndFillColor);
        selectedStart.drawRect(end[1] * (BoxWidth + 2), end[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
        selectedStart.endFill();
        Grid[i][x].graphic = selectedStart;
        Container.addChild(selectedStart);
        setupEndPointSelected(selectedStart, x, i);
        
        StartSelected = false;
        EndSelected = false;
}

function setupStartPointNOTSelected(graphic, x, i) {
        Container.removeChild(graphic);
        const selectedStart = new PIXI.Graphics();

        selectedStart.interactive = true;
        selectedStart.buttonMode = true;

        selectedStart.lineStyle(3, BoxLineColor, 1);
        selectedStart.beginFill(EndFillColor);
        selectedStart.drawRect(start[1] * (BoxWidth + 2), start[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
        selectedStart.endFill();
        Grid[i][x].graphic = selectedStart;
        Container.addChild(selectedStart);
        setupStartPointSelected(selectedStart, x, i);
        
        StartSelected = false;
        EndSelected = true;
}

function setupGridPointChanges(graphic, i, x) {
    if (HasSeached)
        return;

    graphic.on('pointerdown', (e) => {
        if (StartSelected) {
            start = [i, x];

            const graphics = new PIXI.Graphics();
            graphics.interactive = true;
            graphics.buttonMode = true;

            graphics.lineStyle(3, BoxLineColor, 1);
            graphics.beginFill(StartFillColor);

            graphics.drawRect(start[1] * (BoxWidth + 2), start[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
            graphics.endFill();
            Grid[i][x].graphic = graphics;
            Container.addChild(graphics);

            drawNewGrid();
            StartSelected = false;
            EndSelected = false;
        } else if (EndSelected) {
            end = [i, x];

            const graphics = new PIXI.Graphics();
            graphics.interactive = true;
            graphics.buttonMode = true;

            graphics.lineStyle(3, BoxLineColor, 1);
            graphics.beginFill(EndFillColor);

            graphics.drawRect(end[1] * (BoxWidth + 2), end[0] * (BoxHeight + 2), BoxWidth, BoxHeight);
            graphics.endFill();
            Grid[i][x].graphic = graphics;
            Container.addChild(graphics);

            drawNewGrid();
            StartSelected = false;
            EndSelected = false;
        } else {
            CreatingTraverse = false;
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = false;
                makeTraversable(false, i, x, BoxWidth, BoxHeight);    
            }
        }
    });
    
    graphic.on('pointerover', (e) => {
        if (!CreatingTraverse && MouseDown) {
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = false;
                makeTraversable(false, i, x, BoxWidth, BoxHeight);    
            }
        }
    });
}

function makeTraversable(isTraversable, i, x, BoxWidth, BoxHeight) {
    if (HasSeached)
        return;

    Container.removeChild(Grid[i][x].graphic);
    const graphic = new PIXI.Graphics();
    graphic.buttonMode = true;
    graphic.interactive = true;
    if (!isTraversable) {
        
        if (CreatingTraverse)
            return;
        
        graphic.lineStyle(3, BoxLineColor, 1);
        graphic.beginFill(NonTraverseColor);
        graphic.drawRect(x * (BoxWidth + 2), i * (BoxHeight + 2), BoxWidth, BoxHeight);
        graphic.endFill();

        graphic.on('pointerdown', (e) => {
            CreatingTraverse = true;
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = false;
                makeTraversable(true, i, x, BoxWidth, BoxHeight);    
            }
        });

        graphic.on('pointerover', (e) => {
            if (CreatingTraverse && MouseDown) {
                if (i === start[0] && x === start[1]) {
                } else if (i === end[0] && x === end[1]) {
                } else {
                    Grid[i][x].isTraversable = false;
                    makeTraversable(true, i, x, BoxWidth, BoxHeight);    
                }
            }
        });


    } else {
        if (!CreatingTraverse)
            return;

        graphic.lineStyle(3, BoxLineColor, 1);
        graphic.beginFill(TraverseColor);
        graphic.drawRect(x * (BoxWidth + 2), i * (BoxHeight + 2), BoxWidth, BoxHeight);
        graphic.endFill();

        graphic.on('pointerover', (e) => {
            if (MouseDown) {
                if (i === start[0] && x === start[1]) {
                } else if (i === end[0] && x === end[1]) {
                } else {
                    Grid[i][x].isTraversable = true;
                    makeTraversable(false, i, x, BoxWidth, BoxHeight);    
                }
            }
        });

        graphic.on('pointerdown', (e) => {
            if (i === start[0] && x === start[1]) {
            } else if (i === end[0] && x === end[1]) {
            } else {
                Grid[i][x].isTraversable = true;
                makeTraversable(false, i, x, BoxWidth, BoxHeight);    
            }
        });
    }

    Container.addChild(graphic);
}

function getWindowH(width) {
  let result = 1;
  // 1.78 or less keeps a close 16:9 aspect ratio
  while (width / result > 1.78) {
    result += 1;
  }
  return result;
}

function setupGlobals() {
  Global.windowW = 1920 * 0.8;
  Global.windowH = getWindowH(Global.windowW);
  Global.imgScale = Global.windowW / 1280;
  Global.virtualW = 1280;
  Global.virtualH = 720;

  Global.app = new PIXI.Application({
    width: Global.windowW,
    height: Global.windowH,
    autoResize: true,
    resolution: devicePixelRatio,
  });
}

function resizeHandler() {
  const scaleFactor = Math.min(
    window.innerWidth / Global.virtualW,
    window.innerHeight / Global.virtualH
  );
  const newWidth = Math.ceil(Global.virtualW * scaleFactor * 0.9);
  const newHeight = Math.ceil(Global.virtualH * scaleFactor * 0.9);

  Global.app.view.style.width = `${newWidth}px`;
  Global.app.view.style.height = `${newHeight}px`;
  Global.imgScale = newWidth / 1280;
  Global.app.resize(newWidth, newHeight);
}

class Node {
    constructor(x, y){
        // if there are more than one lowest fCost node, take the one with the lowest hCost
        this.gCost = 0; //distance from start node
        this.fCost = 0; //gCost + hCost
        this.hCost = 0; //distance from end node
        this.x = x;
        this.y = y;
        this.SearchType = null;
        this.isTraversable = true;
        this.parent = null;
    }
}