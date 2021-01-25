const Global = {};
let GameBoard;
let Container = null;
const BackgrounColor = 0xE8D2AE;
const LineColor = 0x2C3E50;
const ColorOfLine = 0xD1E8E2;
const RightNavColor = 0xD1E8E2;
const ColorPlayerSquare = 0x5EEE4A;
const ColorComputerSquare = 0xAF0069


const BlackFont = new PIXI.TextStyle({
    fontFamily: 'Trebuchet MS',
    fontSize: 20,
    fill: '#000000',
    wordWrap: true,
    wordWrapWidth: 340,
  });

  const WinnerFont = new PIXI.TextStyle({
    fontFamily: 'Trebuchet MS',
    fontSize: 24,
    fill: '#000000',
    wordWrap: true,
    wordWrapWidth: 340,
  });

  const WinnerText = new PIXI.Text("", WinnerFont);
  WinnerText.x = 1335;
  WinnerText.y = 50;

  const WhiteFont = new PIXI.TextStyle({
    fontFamily: 'Trebuchet MS',
    fontSize: 20,
    fill: '#FFFFFF',
    wordWrap: true,
    wordWrapWidth: 340,
  });

  const FontStyle = new PIXI.TextStyle({
    fontFamily: 'Trebuchet MS',
    fontSize: 26,
    fill: '#FFFFFF',
    wordWrap: true,
    wordWrapWidth: 340,
  });
  
const Stats = {
    branchesPruned: 0,
    movesExamined: 0,
    dephtExamined: 0,
    timeToFindMove: "",
    text: new PIXI.Text("", BlackFont),
    reset(){
        this.branchesPruned = 0;
        this.movesExamined = 0;
        this.timeToFindMove = 0;
    },
    updateText(){
        const gameOver = GameBoard.gameOver();
        if (gameOver) {
            if (ScoreKeeper.computer > ScoreKeeper.player) {
                WinnerText.text = "Computer Won";
            } else if (ScoreKeeper.computer < ScoreKeeper.player){
                WinnerText.text = "You Won!!!";
            } else {
                WinnerText.text = "It's a Tie";
            }
        }
        this.text.text = 
        `Your Score: ${ScoreKeeper.player}\n\n` + 
        `Computer Score: ${ScoreKeeper.computer}\n\n` + 
        `------------\n\n` +
        `Time Analyzed:\n${Stats.timeToFindMove} ms\n\n` + 
        `Moves examined:\n${Stats.movesExamined}\n\n` + 
        `Branches Pruned:\n${Stats.branchesPruned}\n\n` + 
        `Depth Seached:\n${Stats.dephtExamined}`;
    }
}

let MaxDepth = 0;
const ScoreKeeper = {
    playerTurn: true,
	computer: 0,
	player: 0,
};

const Turn = {
    Player: 0,
    Computer: 1
};

window.onload = function () {
    document.getElementById('btnModal').click();
    initGame();
};

function initGame() {
    setupGlobals();
    document.body.appendChild(Global.app.view);
    window.addEventListener('resize', resizeHandler, false);
    setupInitGraphics();
    resizeHandler();
}

function setupInitGraphics(){
    const windowWidth = parseInt(Global.app.view.clientWidth);
    const windowHeight = parseInt(Global.app.view.clientHeight);
    const backgroud = new PIXI.Graphics();
    backgroud.beginFill(BackgrounColor);

    backgroud.drawRect(0, 0, windowWidth, windowHeight);
    backgroud.endFill();

    Container = new PIXI.Container();
    Global.app.stage.addChild(Container);
    Container.addChild(backgroud);

    drawInitBoard();
    drawRightNav(windowWidth, windowHeight);
}

function drawRightNav(windowWidth, windowHeight) {
    const rightNav = new PIXI.Graphics();
    const rightNavWidth = 225;
    rightNav.lineStyle(3, LineColor, 1);
    rightNav.beginFill(RightNavColor);
    rightNav.drawRect(windowWidth - rightNavWidth, 0, rightNavWidth, windowHeight);
    rightNav.endFill();

    Container.addChild(rightNav);

    Stats.text.x = 1325;
    Stats.text.y = 100;
    Stats.text.style.fill = "#000000";
    Container.addChild(Stats.text);

    const resetBtn = new Btn(1375, 680, "Reset");
    resetBtn.addBtnToStage();
    resetBtn.graphic.on('pointerdown', e => {
       GameBoard.reset(); 
       WinnerText.text = "";
    });

    let settingsBtn = new Btn(1375, 740, "Settings");
    settingsBtn.text = new PIXI.Text("Settings", WhiteFont);
    settingsBtn.fontStyle = BlackFont;
    settingsBtn.addBtnToStage();
    settingsBtn.graphic.on('pointerdown', e => {
        document.getElementById('btnModal').click();
    });

    Container.addChild(WinnerText);
}

function drawInitBoard() {
    GameBoard = new Board();
    const boardDimensions = document.getElementById('GridSizes').value.split('x');
    GameBoard.DotsAcross =  boardDimensions[0];
    GameBoard.DotsDown = boardDimensions[1];
    GameBoard.createBoardGraphic();
    Container.addChild(GameBoard.Container);
}

class Board{
    constructor(){
        this.DotsAcross = 0;
        this.DotsDown = 0;
        this.spaceBetweenDots = 100;
        this.Lines = [];
        this.Dots = [];
        this.Squares = [];
        this.EndGameCount = 0;
        this.Container = new PIXI.Container();
        this.dotSelected = null;
    }
    createBoardGraphic(){
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < this.DotsDown; i++) {
            for (let x = 0; x < this.DotsAcross; x++) {
                const dot = new Dot(x, i, this.spaceBetweenDots);
                dot.name = letters[x] + i;
                setupDotButtonLogic(dot, this.Container);
                this.Dots.push(dot);
                this.Container.addChild(dot.smallGraphic);
            }
        }
        this.setUpPosition();
        this.getEndGameCount();
    }

    setUpPosition(){
        if (this.DotsAcross === 12 && this.DotsDown === 7) {
            this.Container.x = 120;
            this.Container.y = 120;
        } else if (this.DotsAcross === 8 && this.DotsDown === 5) {
            this.Container.x = 315;
            this.Container.y = 200;
        } else {
            this.Container.x = 425;
            this.Container.y = 225;
        }
    }
    getEndGameCount(){
        const result = this.getPossibleMoves();
        this.EndGameCount = result.length;
    }

    addLineBetween(dot1Name, dot2Name){
        const dot1Object = this.getDotByName(dot1Name);
        const dot2Object = this.getDotByName(dot2Name);
        if (dot1Object.xPos === dot2Object.xPos) {
            if (dot1Object.yPos > dot2Object.yPos) {
                this.addLine(
                        dot1Object.xPos - 7, 
                        dot2Object.yPos, 
                        15, 100, 
                        dot1Object, 
                        dot2Object
                    );
            } else {
                this.addLine(
                        dot2Object.xPos - 7, 
                        dot1Object.yPos, 
                        15, 100, 
                        dot1Object, 
                        dot2Object
                    );
            }
        } else {
            if (dot1Object.xPos > dot2Object.xPos) {
                this.addLine(
                        dot2Object.xPos, 
                        dot1Object.yPos - 7, 
                        100, 15, 
                        dot1Object, 
                        dot2Object
                    );
            } else {
                this.addLine(
                        dot1Object.xPos, 
                        dot2Object.yPos - 7, 
                        100, 15, 
                        dot1Object, 
                        dot2Object
                    );
            }
        }
    }

    addLine(xPos, yPos, width, height, dot1Object, dot2Object){
        const line = new PIXI.Graphics();
        line.lineStyle(3, LineColor, 1);
        line.beginFill(ColorOfLine);
        line.drawRect(xPos, yPos, width, height);
        line.endFill();
        this.removeAddGraphics(
                dot1Object.smallGraphic, 
                dot2Object.smallGraphic
            );
        const organizedLine = this.organizeLine(
                dot1Object.boardPosition, 
                dot2Object.boardPosition
            );
        const dotFrom = this.getDotByPosition(organizedLine[0]);
        const dotTo = this.getDotByPosition(organizedLine[1]);
        const lineToPush = new Line(dotFrom, dotTo);
        lineToPush.graphic = line;
        this.Lines.push(lineToPush);
    }

    organizeLine(point1, point2){
        const sumOfPoint1 = point1.reduce((a, b) => a + b, 0);
        const sumOfPoint2 = point2.reduce((a, b) => a + b, 0);
        return sumOfPoint1 < sumOfPoint2 ? 
        [point1, point2] : [point2, point1];
    }

    removeAddGraphics(graphic1, graphic2){
        GameBoard.Container.removeChild(graphic1);
        GameBoard.Container.removeChild(graphic2);
        GameBoard.Container.addChild(graphic1);
        GameBoard.Container.addChild(graphic2);
    }

    hasLine(point1, point2){
        for (let i = 0; i < this.Lines.length; i++) {
            const lineAssessing = {};
            lineAssessing.point1 = this.Lines[i].dotFrom.boardPosition;
            lineAssessing.point2 = this.Lines[i].dotTo.boardPosition;

            if (arraysEqual(lineAssessing.point1, point1.boardPosition) || 
                arraysEqual(lineAssessing.point2, point1.boardPosition))
                    if (arraysEqual(lineAssessing.point1, point2.boardPosition) || 
                        arraysEqual(lineAssessing.point2, point2.boardPosition))
                        return true;
        }
        return false;
    }

    boxCreated(point1Arg, point2Arg){
        const result = [];
        const organizedLine = this.organizeLine(
                point1Arg.boardPosition, 
                point2Arg.boardPosition
            );
        const point1 = organizedLine[0];
        const point2 = organizedLine[1];
        const lineInQuestion = [organizedLine[0], organizedLine[1]];
        const lineIsVert = lineInQuestion[0][0] === lineInQuestion[1][0];
        if (lineIsVert) {
            const lineRight1 = [ [point1[0], point1[1] ], [point2[0] + 1, point2[1] - 1] ];
            const lineRight2 = [ [point1[0] + 1, point1[1] ], [point2[0] + 1, point2[1]] ];
            const lineRight3 = [ [point1[0], point1[1] + 1], [point2[0] + 1, point2[1]] ];
            
            if (this.boardLinesContains(lineRight1) && 
                this.boardLinesContains(lineRight2) && 
                this.boardLinesContains(lineRight3)) {
                    const dotArr = [
                        point1Arg, point2Arg,
                        this.getDotByPosition(lineRight1[0]), this.getDotByPosition(lineRight1[1]),
                        this.getDotByPosition(lineRight2[0]), this.getDotByPosition(lineRight2[1]),
                        this.getDotByPosition(lineRight3[0]), this.getDotByPosition(lineRight3[1]),
                    ];
                    result.push(this.organizeSquare(dotArr));
                }
            
            const lineLeft1 = [ [point1[0] - 1, point1[1] ], [point2[0], point2[1] - 1] ];
            const lineLeft2 = [ [point1[0] - 1, point1[1] + 1 ], [point2[0], point2[1]] ];
            const lineLeft3 = [ [point1[0] - 1, point1[1] ], [point2[0] - 1, point2[1]] ];

            if (this.boardLinesContains(lineLeft1) && 
                this.boardLinesContains(lineLeft2) && 
                this.boardLinesContains(lineLeft3)) {
                    const dotArr = [
                        point1Arg, point2Arg,
                        this.getDotByPosition(lineLeft1[0]), this.getDotByPosition(lineLeft1[1]),
                        this.getDotByPosition(lineLeft2[0]), this.getDotByPosition(lineLeft2[1]),
                        this.getDotByPosition(lineLeft3[0]), this.getDotByPosition(lineLeft3[1]),
                    ];
                    result.push(this.organizeSquare(dotArr));
                }
        } else {
            const lineTop1 = [ [point1[0], point1[1] - 1 ], [point2[0], point2[1] - 1] ];
            const lineTop2 = [ [point1[0], point1[1] - 1], [point2[0] - 1, point2[1]] ];
            const lineTop3 = [ [point1[0] + 1, point1[1] - 1], [point2[0], point2[1]] ];
            
            if (this.boardLinesContains(lineTop1) && 
                this.boardLinesContains(lineTop2) && 
                this.boardLinesContains(lineTop3)) {
                    const dotArr = [
                        point1Arg, point2Arg,
                        this.getDotByPosition(lineTop1[0]), this.getDotByPosition(lineTop1[1]),
                        this.getDotByPosition(lineTop2[0]), this.getDotByPosition(lineTop2[1]),
                        this.getDotByPosition(lineTop3[0]), this.getDotByPosition(lineTop3[1]),
                    ];
                    result.push(this.organizeSquare(dotArr));
                }
            
            const lineBottom1 = [ [point1[0], point1[1] ], [point2[0] - 1, point2[1] + 1] ];
            const lineBottom2 = [ [point1[0], point1[1] + 1 ], [point2[0], point2[1] + 1] ];
            const lineBottom3 = [ [point1[0] + 1, point1[1] ], [point2[0], point2[1] + 1] ];

            if (this.boardLinesContains(lineBottom1) && 
                this.boardLinesContains(lineBottom2) && 
                this.boardLinesContains(lineBottom3)) {
                    const dotArr = [
                        point1Arg, point2Arg,
                        this.getDotByPosition(lineBottom1[0]), this.getDotByPosition(lineBottom1[1]),
                        this.getDotByPosition(lineBottom2[0]), this.getDotByPosition(lineBottom2[1]),
                        this.getDotByPosition(lineBottom3[0]), this.getDotByPosition(lineBottom3[1]),
                    ];
                    result.push(this.organizeSquare(dotArr));
                }
        }
        return result;
    }

    organizeSquare(dotArr){
        const result = [];
        const nameArr = [];
        dotArr.forEach( dot => {
            if (!result.includes(dot.name))
                result.push(dot.name);
        });
        result.sort();
        return [
            this.getDotByName(result[0]), this.getDotByName(result[1]), 
            this.getDotByName(result[2]), this.getDotByName(result[3])
        ];
    }

    boardLinesContains(line){
        
        for (let i = 0; i < this.Lines.length; i++) {
            const lineInQuestion = 
            this.organizeLine(
                    this.Lines[i].dotFrom.boardPosition, 
                    this.Lines[i].dotTo.boardPosition
                );
            const point1 = lineInQuestion[0];
            const point2 = lineInQuestion[1];
            if (line[0][0] === point1[0] && line[0][1] === point1[1] &&
                line[1][0] === point2[0] && line[1][1] === point2[1])
                return true;
        }
        return false;
    }

    getDotByName(str){
        for (let i = 0; i < this.Dots.length; i++)
            if (this.Dots[i].name === str)
                return this.Dots[i];

        return null;
    }

    getDotByPosition(posArr){
        for (let i = 0; i < this.Dots.length; i++) {
            if (this.Dots[i].boardPosition[0] === posArr[0] && 
                this.Dots[i].boardPosition[1] === posArr[1])
                return this.Dots[i];
        }
    }

    getPossibleMoves(){
        const result = [];
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < this.Dots.length; i++) {
            const dot = this.Dots[i];
            const eligibleMove1 = letters[dot.boardPosition[0] + 1] + dot.boardPosition[1];
            const eligibleMove2 = letters[dot.boardPosition[0] - 1] + dot.boardPosition[1];
            const eligibleMove3 = letters[dot.boardPosition[0]] + (dot.boardPosition[1] + 1);
            const eligibleMove4 = letters[dot.boardPosition[0]] + (dot.boardPosition[1] - 1);
            const moves = [eligibleMove1, eligibleMove2, eligibleMove3, eligibleMove4];
            moves.forEach( move => {
                if (move !== NaN) {
                    if (this.containsDot(move)) {
                        const organizedName = this.organizeName(`${dot.name},${move}`);
                        const move1 = organizedName.split(',')[0];
                        const move2 = organizedName.split(',')[1];
                        if (!this.containsLine(move1, move2)) {
                            if (!result.includes(organizedName)) {
                                result.push(organizedName);
                            }
                        }
                    }
                } 
            });
        }
        return result;
    }

    organizeName(str){
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        let result = "";
        const arr = str.split(',');
        const letter1 = arr[0].split('')[0];
        const number1 = parseInt(arr[0].split('')[1]);
        const letter2 = arr[1].split('')[0];
        const number2 = parseInt(arr[1].split('')[1]);

        if (number1 < number2 || letters.indexOf(letter1) < letters.indexOf(letter2))
            result = `${letter1}${number1},${letter2}${number2}`;
         else 
            result = `${letter2}${number2},${letter1}${number1}`;
        
        return result;
    }

    containsDot(dotName){
        for (let i = 0; i < this.Dots.length; i++) {
            const dotNameFromBoard = this.Dots[i].name;
            if (dotName === dotNameFromBoard) {
                return true;
            }
        }
        return false;
    }

    containsLine(fromDotName, toDotName){
        for (let i = 0; i < this.Lines.length; i++) {
            if (this.Lines[i].dotFrom.name === fromDotName && 
                this.Lines[i].dotTo.name === toDotName) {
                return true;
            }
        }

        return false;
    }

    createSquareAt(squareDots, whoScored){
        const xPos = squareDots[0].xPos;
        const yPos = squareDots[0].yPos;
        const width = this.spaceBetweenDots;
        const height = this.spaceBetweenDots;
        const square = new PIXI.Graphics();
        square.lineStyle(3, LineColor, 1);

        if (whoScored === "player")
            square.beginFill(ColorPlayerSquare);
         else
            square.beginFill(ColorComputerSquare);

        square.drawRect(xPos, yPos, width, height);
        square.endFill();
        const squareObject = new Square(
                squareDots[0],
                squareDots[1],
                squareDots[2],
                squareDots[3]
            );
        squareObject.graphic = square;
        const nameOfSquare = squareDots.reduce( 
                (a, e) => a + e.name + "," , ""
            ).slice(0, -1);
        squareObject.name = nameOfSquare;
        this.Squares.push(squareObject);
        this.redrawBoard();
    }

    redrawBoard() {
        for (let i = 0; i < this.Squares.length; i++) 
            this.Container.removeChild(this.Squares[i].graphic);
        
        for (let i = 0; i < this.Lines.length; i++) 
            this.Container.removeChild(this.Lines[i].graphic);
        
        for (let i = 0; i < this.Dots.length; i++)
            this.Container.removeChild(this.Dots[i].smallGraphic);
        
        for (let i = 0; i < this.Squares.length; i++)
            this.Container.addChild(this.Squares[i].graphic);
        
        for (let i = 0; i < this.Lines.length; i++)
            this.Container.addChild(this.Lines[i].graphic);

        for (let i = 0; i < this.Dots.length; i++)
            this.Container.addChild(this.Dots[i].smallGraphic);
    }

    reverseMove(moveToReverse){
        let objectIndex;
        for (let i = 0; i < this.Lines.length; i++) {
            if (this.Lines[i].name === moveToReverse) {
                objectIndex = i;
                break;
            }
        }
        this.Lines.splice(objectIndex, 1);
    }

    gameOver(){
        return this.Lines.length === this.EndGameCount;
    }

    reset(){
        for (let i = 0; i < this.Squares.length; i++) 
            this.Container.removeChild(this.Squares[i].graphic);

        for (let i = 0; i < this.Lines.length; i++) 
            this.Container.removeChild(this.Lines[i].graphic);

        this.Lines = [];
        this.Squares = [];
        Stats.reset();
        MaxDepth = 0;
        ScoreKeeper.playerTurn = true;
        ScoreKeeper.computer = 0;
        ScoreKeeper.player = 0;
    }
}

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    for (var i = 0; i < a.length; i++)
      if (a[i] !== b[i]) return false;

    return true;
  }

function setupDotButtonLogic(dot, container) {
    addLogicForNOTSelctedDots(dot, container);
    addLogicForSelctedDots(dot, container);
}

function addLogicForNOTSelctedDots(dot, container) {
    dot.smallGraphic.on('pointerdown', e => {
        
        if (!ScoreKeeper.playerTurn || GameBoard.gameOver())
            return;

        if (GameBoard.dotSelected){
            const selectedDot = GameBoard.dotSelected; 
            const nextDot = dot;
            if (eligibleLine(selectedDot, nextDot)) {
                if (!GameBoard.hasLine(selectedDot, nextDot)) {
                    GameBoard.addLineBetween(selectedDot.name, nextDot.name);
                    unselectDot(dot, container);
                    GameBoard.redrawBoard();
                    const boxCreated = GameBoard.boxCreated(selectedDot, nextDot);
                    if (boxCreated.length === 0) {
                        changeTurn();
                        const t0 = performance.now();
                        computerPlays();
                        Stats.dephtExamined = MaxDepth;
                        const t1 = performance.now();
                        Stats.timeToFindMove = parseFloat(t1 - t0).toFixed(1).toString();
                        Stats.updateText();
                        Stats.reset();
                    } else {
                        boxCreated.forEach(box => {
                            GameBoard.createSquareAt(box, "player");
                        });
                        ScoreKeeper.player += boxCreated.length;
                        Stats.reset();
                        Stats.updateText();
                    }
                }
            } else {
                
            }
        } else {
            selectDot(dot, container);
        }
    });
}

function computerPlays(){

    const bestMove = getBestMove();
    
    if (!bestMove)
        return;
    
    try {
        const dot1Name = bestMove.split(',')[0];
        const dot2Name = bestMove.split(',')[1];
        const dot1 = GameBoard.getDotByName(dot1Name);
        const dot2 = GameBoard.getDotByName(dot2Name);
        GameBoard.addLineBetween(dot1.name, dot2.name);
        GameBoard.redrawBoard();    
        const boxCreated = GameBoard.boxCreated(dot1, dot2);
        if (boxCreated.length === 0) {
            changeTurn();
        } else {
            boxCreated.forEach(box => {
                ScoreKeeper.computer++;
                GameBoard.createSquareAt(box, "computer");
            });
            computerPlays();
        }
    } catch (error) {
        var test = "";
    }

    
}

const tempScoreKeeper = {
    computer: 0,
	player: 0
};

function getBestMove() {
	let bestScore = -Infinity;
	let bestMove;
    let possibleMoves = GameBoard.getPossibleMoves();
    possibleMoves = shuffle(possibleMoves);
    bestMove = possibleMoves[0];
    MaxDepth = calulateMaxDepth(possibleMoves.length);
    for (let i = 0; i < possibleMoves.length; i++) {
        
        tempScoreKeeper.player = ScoreKeeper.player;
        tempScoreKeeper.computer = tempScoreKeeper.computer;

        const nextMoveArr = possibleMoves[i].split(',');
        GameBoard.addLineBetween(nextMoveArr[0], nextMoveArr[1]);
        let score = minimax(possibleMoves[i], 0, true, -Infinity, Infinity);
        GameBoard.reverseMove(possibleMoves[i]);

		if(score > bestScore && possibleMoves[i] !== undefined){
			bestScore = score;
			bestMove = possibleMoves[i];
		}
    }
	return bestMove;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }

function calulateMaxDepth(len){
    if (8 >= len) return 4;
    else if (15 >= len) return 3;
    else if (20 >= len) return 2;
    else if (25 >= len) return 2;
    else if (45 >= len) return 2;
    else return 1;
}

class EvaluateMove{
    constructor(move, isComputer){
        this.isComputer = isComputer;
        this.move = move;
        this.moveScore = 0;
        this.result = {
            computerScored:10,
            playerScored:-10,
            computerWin: Infinity,
            playerWin: -Infinity,
            nothing: 0
        }
    }
    
    run(){
        const nextMoveArr = this.move.split(',');
        const dot1 = GameBoard.getDotByName(nextMoveArr[0]);
        const dot2 = GameBoard.getDotByName(nextMoveArr[1]);
        const boxCreated = GameBoard.boxCreated(dot1, dot2);
        let result;
        if (this.isComputer) {
            if (GameBoard.gameOver()) {
                
                if (tempScoreKeeper.computer > tempScoreKeeper.player)
                    result = this.result.computerWin;
                else if (tempScoreKeeper.computer < tempScoreKeeper.player)
                    result = this.result.playerWin;
                else 
                    result = this.result.nothing;

            } else if (boxCreated.length > 0) {
                result = this.result.computerScored * boxCreated.length;
            } else {
                result = this.result.nothing;
            }
        } else {
            if (GameBoard.gameOver()) {

                if (tempScoreKeeper.computer > tempScoreKeeper.player)
                    result = this.result.computerWin;
                else if (tempScoreKeeper.computer < tempScoreKeeper.player)
                    result = this.result.playerWin;
                else 
                    result = this.result.nothing;
                
            } else if (boxCreated.length > 0) {
                result = this.result.playerScored * boxCreated.length;
            } else {
                result = this.result.nothing;
            }
        }
        if (result === undefined) {
            console.log(result);
        }
        return result;
    }
}

function minimax(move, depth, isComputer, alpha, beta){

    Stats.movesExamined++;

    const result = new EvaluateMove(move, isComputer).run();
	if (GameBoard.gameOver() || depth === MaxDepth) {
        return result;
    }

    depth++;

    const nextMoveArr = move.split(',');
    const dot1 = GameBoard.getDotByName(nextMoveArr[0]);
    const dot2 = GameBoard.getDotByName(nextMoveArr[1]);
    const boxCreated = GameBoard.boxCreated(dot1, dot2);
    
    if (boxCreated.length === 0)
        isComputer = isComputer ? false : true;    
    
        if (isComputer){
            let bestScore = -Infinity;
            const possibleMoves = GameBoard.getPossibleMoves();
            for (let i = 0; i < possibleMoves.length; i++) {

                const nextMoveArr = possibleMoves[i].split(',');
                GameBoard.addLineBetween(nextMoveArr[0], nextMoveArr[1]);
                let score = minimax(possibleMoves[i], depth, isComputer, alpha, beta);
                GameBoard.reverseMove(possibleMoves[i]);
                
                bestScore = score > bestScore ? score : bestScore;
                beta = beta > bestScore ? bestScore : beta;

                if (beta <= alpha){
                    Stats.branchesPruned++;
                    break;
                } 
            }
            return bestScore > result ? bestScore : result;
        } else {
            let bestScore = Infinity;
            const possibleMoves = GameBoard.getPossibleMoves();
            for (let i = 0; i < possibleMoves.length; i++) {

                const nextMoveArr = possibleMoves[i].split(',');
                GameBoard.addLineBetween(nextMoveArr[0], nextMoveArr[1]);
                let score = minimax(possibleMoves[i], depth, isComputer, alpha, beta);
                GameBoard.reverseMove(possibleMoves[i]);
                
                bestScore = score < bestScore ? score : bestScore;
                alpha = alpha > bestScore ? alpha : bestScore;

                if (beta <= alpha){
                    Stats.branchesPruned++;
                    break;
                }
            }
        return bestScore < result ? bestScore : result;
	}
}

function changeTurn() {
    if (ScoreKeeper.playerTurn) {
        ScoreKeeper.playerTurn = false;
    } else {
        ScoreKeeper.playerTurn = true;
    }
}

function selectDot(dot, container) {
    container.removeChild(dot.smallGraphic);
    container.addChild(dot.largeGraphic);
    GameBoard.dotSelected = dot;
}

function unselectDot(dot, container) {
    container.removeChild(GameBoard.dotSelected.largeGraphic);
    container.addChild(GameBoard.dotSelected.smallGraphic);
    GameBoard.dotSelected = null;
}

function eligibleLine(dot1, dot2) {
    const selectedDot = dot1.boardPosition;
    const nextDot = dot2.boardPosition;
    if (selectedDot[0] === nextDot[0] && 
        selectedDot[1] - 1 === nextDot[1])
        return true; // is north
    else if (selectedDot[0] + 1 === nextDot[0] && 
        selectedDot[1] === nextDot[1])
        return true; // is east
    else if (selectedDot[0] === nextDot[0] && 
        selectedDot[1] + 1 === nextDot[1])
        return true; // is south
    else if (selectedDot[0] - 1 === nextDot[0] && 
        selectedDot[1] === nextDot[1])
        return true; // is west

    return false;
}

function addLogicForSelctedDots(dot, container) {
    dot.largeGraphic.on('pointerdown', e => {
        
        if (GameBoard.dotSelected) {
            container.removeChild(dot.largeGraphic);
            container.addChild(dot.smallGraphic);
            GameBoard.dotSelected = null;
        } else {

        }
    });
}

class Square{
    constructor(dot1, dot2, dot3, dot4){
        this.dot1 = dot1;
        this.dot2 = dot2;
        this.dot3 = dot3;
        this.dot4 = dot4;
        this.graphic = null;
        this.pos;
    }
}

class Dot{
    constructor(xIndex, yIndex, spaceBetweenDots){
        this.lineColor = 0x2C3E50;
        this.color = 0x116466;
        this.boardPosition = [xIndex, yIndex];
        this.xPos = xIndex * spaceBetweenDots;
        this.yPos = yIndex * spaceBetweenDots;
        this.size = 25;
        this.lineSize = 3;
        this.sizeToIncrease = 1.35;
        this.smallGraphic = null;
        this.largeGraphic = null;
        this.createDotGraphics();
    }

    createDotGraphics(){
        this.createSmallGraphic();
        this.createLargeGraphic();
    }

    createSmallGraphic(){
        const circle = new PIXI.Graphics();
        circle.lineStyle(this.lineSize, this.lineColor, 1);
        circle.beginFill(this.color, 1);
        circle.drawCircle(this.xPos, this.yPos, this.size);
        circle.endFill();
        circle.interactive = true;
        circle.buttonMode = true;
        this.smallGraphic = circle;
    }

    createLargeGraphic(){
        const circle = new PIXI.Graphics();
        circle.lineStyle(
            this.lineSize * this.sizeToIncrease, 
            this.lineColor, 1
            );
        circle.beginFill(this.color, 1);
        circle.drawCircle(
            this.xPos, this.yPos, 
            this.size * this.sizeToIncrease
            );
        circle.endFill();
        circle.interactive = true;
        circle.buttonMode = true;
        this.largeGraphic = circle;
    }
}

class Line{
    constructor(from, to){
        this.name = from.name + "," + to.name;
        this.dotFrom = from;
        this.dotTo = to;
        this.graphic = null;
    }
}


function getWindowH(width) {
  let result = 1;
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