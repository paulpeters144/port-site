const Global = {};
const BackgrounColor = 0xE8D2AE;
const LineColor = 0x2C3E50;
const ColorDarkBlue = 0x466D94;
const ColorOfLine = 0xD1E8E2;
const RightNavColor = 0xD1E8E2;
const ColorGreen = 0x5EEE4A;
const ColorRed = 0x9e475a;
const ColorDarkGreen = 0x116466;
let Container = null;
let LineContainer = null;
let WindowWidth;
let WindowHeight;
let MainArray = [];
let IsSorting = false;
let IsSorted = false;
let StatsText;

const Stats = {
    Text: null,
    Rearrangements: 0,
    Time: 0,
    NumSorted: 90,
    update(rearrangements, t0, t1){
        let timeSeached = parseFloat(t1 - t0).toFixed(0).toString();
        timeSeached = formatTime(timeSeached); 
        this.Rearrangements = rearrangements;
        this.Time = timeSeached;
        this.Text.text = 
        `Elements to Sort:\n${this.NumSorted}\n\n` +
        `Elements Moved:\n${this.Rearrangements}\n\n` + 
        `Seconds:\n${this.Time}`;
    },
    reset(){
        QuickSortStats.reset();
    }
}

function formatTime(time) {
    if (time === "0")
        return time;
    else if (time.length < 4)
        return "0." + time.slice(1);

    let result = [];
    const arr = time.split('');
    for (let i = 0; i < arr.length - 1; i++) {
        
        if (i === arr.length - 3)
            result.push('.');

        result.push(arr[i]);
    }

    return result.join('');
}

const WhatToSort = {
    checkBoxes: [],

    setAllToFalse(){
        for (let i = 0; i < this.checkBoxes.length; i++)
            this.checkBoxes[i].unselectBox();
    },

    runSelectSort(){
        
        if (IsSorted)
            return;
        else Stats.reset();
        for (let i = 0; i < this.checkBoxes.length; i++) {
            if (this.checkBoxes[i].isSelected) {
                this.checkBoxes[i].runSort();
                finalSort();
                break;
            }            
        }
    }
}

let lastTime = 0;
function finalSort() {
    setTimeout(() => {
        if (Stats.Time !== lastTime) {
            lastTime = Stats.Time;
            finalSort();
        } else {
            setTimeout(() => {
                lastRound();
                IsSorted = true;
                IsSorting = false;  
            },50);
        }
    }, 250);  
}

const FontStyle = new PIXI.TextStyle({
    fontFamily: 'consolas',
    fontSize: 22,
    fill: '#FFFFFF',
    wordWrap: true,
    wordWrapWidth: 340,
  });

  const BlackFont = new PIXI.TextStyle({
    fontFamily: 'consolas',
    fontSize: 20,
    fill: '#000000',
    wordWrap: true,
    wordWrapWidth: 340,
  });

window.onload = function () {
    initGame();
};

function initGame() {
    setupGlobals();
    document.body.appendChild(Global.app.view);
    WindowWidth = parseInt(Global.app.view.clientWidth);
    WindowHeight = parseInt(Global.app.view.clientHeight);
    window.addEventListener('resize', resizeHandler, false);
    setupInitGraphics();
    resizeHandler();
}

function shuffle(array, shuffles) {
	
	if (shuffles < 1)
		return array;
	
	shuffles--;
	
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    while (0 !== currentIndex) {
  
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return shuffle(array, shuffles);
  }

function setupInitGraphics(){
    
    const backgroud = new PIXI.Graphics();
    backgroud.beginFill(BackgrounColor);

    backgroud.drawRect(0, 0, WindowWidth, WindowHeight);
    backgroud.endFill();

    Container = new PIXI.Container();
    Global.app.stage.addChild(Container);
    Container.addChild(backgroud);
    
    setupLineContain(10, 130, 5);
    drawRightNav();
}

function drawStats(){
    Stats.Text = new PIXI.Text('', BlackFont); 
    Stats.Text.x = 1320;
    Stats.Text.y = 325;
    Container.addChild(Stats.Text);
    Stats.update(0,0,0);
}

function setupLineContain(lineWidth, numberOfLines, heightDiff) {
    MainArray = [];
    LineContainer = new PIXI.Container();
    LineContainer.x = 5;
    Global.app.stage.addChild(LineContainer);
    for (let i = 0; i < numberOfLines; i++) {
        const line = new Line(lineWidth, 50 + (i * heightDiff), i);
        MainArray.push(line);
    }
    shuffelMainArray();
}

function shuffelMainArray() {
    MainArray = shuffle(MainArray, 3);
    
    for (let i = 0; i < MainArray.length; i++) {
        MainArray[i].changeIndex(i);
        MainArray[i].changeDefaultColor();
    }

    IsSorted = false;
}

class Line{
    constructor(width, height, index){
        this.xPos = index * width;
        this.yPos = WindowHeight - height;
        this.width = width;
        this.height = height;
        this.index = index;
        this.graphic = new PIXI.Graphics();
        this.defaultColor = true;
        this.createGraphic();
    }
    
    changeIndex(newIndex){
        this.index = newIndex;
        this.xPos = this.index * this.width;
        this.graphic.x = this.xPos;
    }

    changeDefaultColor(){
        this.defaultColor = true;
        LineContainer.removeChild(this.graphic);
        this.createGraphic();
    }

    changeMoveColor(){
        LineContainer.removeChild(this.graphic);
        this.graphic = new PIXI.Graphics();
        this.graphic.lineStyle(2, LineColor, 1);
        this.graphic.beginFill(ColorGreen);
        this.graphic.drawRect(
                this.xPos, this.yPos, 
                this.width, this.height
            );
        this.graphic.endFill();
        LineContainer.addChild(this.graphic);
        this.defaultColor = false;
    }

    createGraphic(){
        this.graphic = new PIXI.Graphics();
        this.graphic.lineStyle(2, LineColor, 1);
        this.graphic.beginFill(ColorRed);
        this.graphic.drawRect(
                this.xPos, this.yPos, 
                this.width, this.height
            );
        this.graphic.endFill();
        LineContainer.addChild(this.graphic);
    }
}

function changeToDefaultColors() {
    for (let i = 0; i < MainArray.length; i++) {
        if (!MainArray[i].defaultColor) {
            MainArray[i].changeDefaultColor();
        }        
    }
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

function drawRightNav() {
    const rightNav = new PIXI.Graphics();
    const rightNavWidth = 220;
    rightNav.lineStyle(3, LineColor, 1);
    rightNav.beginFill(RightNavColor);
    const rightNavXPos = WindowWidth - rightNavWidth;
    rightNav.drawRect(rightNavXPos, 0, rightNavWidth, WindowHeight);
    rightNav.endFill();

    Container.addChild(rightNav);

    const resetBtn = new Btn(1375, 680, "Shuffle");
    resetBtn.addBtnToStage();
    resetBtn.graphic.on('pointerdown', e => {
        if (IsSorting) 
            return;

        shuffelMainArray();
    });

    const sortBtn = new Btn(1375, 735, "Sort");
    sortBtn.addBtnToStage();
    sortBtn.graphic.on('pointerdown', e => {

        if (IsSorting) 
            return;
            
        WhatToSort.runSelectSort();
        IsSorted = true;
    });

    drawStats();

    let baseYPos = 100;
    const bubbleSortBox = new CheckBox("Bubble Sort", bubbleSort, BlackFont, rightNavXPos + 20, baseYPos, 13, 100, 7);
    
    const insertionsSortBox = new CheckBox("Insertion Sort", insertionSort, BlackFont, rightNavXPos + 20, baseYPos += 35, 13, 100, 7);
    insertionsSortBox.unselectBox();

    const selectSortBox = new CheckBox("Select Sort", selectSort, BlackFont, rightNavXPos + 20, baseYPos += 35, 13, 100, 7);
    selectSortBox.unselectBox();

    

    const quickSortBox = new CheckBox("Quick Sort", quickSort, BlackFont, rightNavXPos + 20, baseYPos += 35, 13, 100, 7);
    quickSortBox.unselectBox();

    const countingSortBox = new CheckBox("Counting Sort", countingSort, BlackFont, rightNavXPos + 20, baseYPos += 35, 13, 100, 7);
    countingSortBox.unselectBox();

    bubbleSortBox.selectCheckBox();
    
    WhatToSort.checkBoxes.push(bubbleSortBox);
    WhatToSort.checkBoxes.push(selectSortBox) 
    WhatToSort.checkBoxes.push(insertionsSortBox);
    WhatToSort.checkBoxes.push(quickSortBox);
    WhatToSort.checkBoxes.push(countingSortBox);
}

class CheckBox {
    constructor(label, sortAlgo, fontSyle, x, y, lineWidth, numberOfLines, lineHeightDiff){
        this.label = label;
        this.runSort = sortAlgo;
        this.FontStyle = fontSyle;
        this.lineWidth = lineWidth;
        this.numberOfLines = numberOfLines;
        this.lineHeightDiff = lineHeightDiff;
        this.x = x;
        this.y = y;
        this.isSelected = false;
        this.boxWidth = 20;
        this.boxHeight = 20;
        this.boxGraphic = this.getInitialBox(LineColor);
        this.text = new PIXI.Text(this.label, BlackFont);
        this.text.x = this.x + 25;
        this.text.y = this.y;
        Container.addChild(this.text);
    }

    selectCheckBox(){

        if (IsSorting) 
            return;

        Container.removeChild(this.boxGraphic);
        Global.app.stage.removeChild(LineContainer);
        LineContainer = null;
        WhatToSort.setAllToFalse();
        this.isSelected = true;
        setupLineContain(
                this.lineWidth, 
                this.numberOfLines, 
                this.lineHeightDiff
            );
        this.boxGraphic.on('pointerdown', e => {
            this.unselectBox();
        });
        Container.addChild(this.boxGraphic);
        Stats.NumSorted = this.numberOfLines;
        Stats.update(0,0,0);
    }
    unselectBox(){

        if (IsSorting) 
            return;

        this.isSelected = false;
        Container.removeChild(this.boxGraphic);
        Global.app.stage.removeChild(LineContainer);
        LineContainer = null;
        this.graphic = this.getInitialBox(RightNavColor);
        this.graphic.on('pointerdown', e => {
            this.selectCheckBox();
        });
        Container.addChild(this.graphic);
    }
    getInitialBox(fillColor){
        const result = new PIXI.Graphics();
        result.interactive = true;
        result.buttonMove = true;
        result.lineStyle(3, LineColor, 1);
        result.beginFill(fillColor);
        result.drawRect(this.x, this.y, this.boxWidth, this.boxHeight);
        result.endFill();
        return result;
    }
}

//-=-=-=-=-=-=-Bubble Sort Algorithm-=-=-=-=-=-=-
async function bubbleSort(){
    let rearrangement = 0;
    const t0 = performance.now();
 
    IsSorting = true;
    for (let i = 0; i < MainArray.length - 1; i++) {
        for (let x = 0; x < MainArray.length - 1 - i; x++) {
            if (MainArray[x].height > MainArray[x + 1].height) {
                rearrangement++;
                changeToDefaultColors();
                const temp = MainArray[x];
                MainArray[x] = MainArray[x +  1];
                MainArray[x + 1] = temp;
                MainArray[x].changeIndex(x);
                MainArray[x].changeDefaultColor();
                MainArray[x + 1].changeIndex(x + 1);
                MainArray[x + 1].changeMoveColor();
                await sleep(5);
                // const t1 = performance.now();
                // let timeSeached = parseFloat(t1 - t0).toFixed(0).toString();
                // timeSeached = formatTime(timeSeached); 
                Stats.update(rearrangement, t0, performance.now());
            }
        }
    }
    changeToDefaultColors();
    IsSorting = false;
}

//-=-=-=-=-=-=-Insertion Sort Algorithm-=-=-=-=-=-=-
async function insertionSort(){
    let rearrangement = 0;
    const t0 = performance.now();
    IsSorting = true;

    for (let i = 1; i < MainArray.length; i++) {
		for (let x = i; x > 0; x--) {
			if (MainArray[x].height < MainArray[x - 1].height) {

                rearrangement++;
                changeToDefaultColors();
                const tempLine1 = MainArray[x];
                const tempLine2 = MainArray[x - 1];
                tempLine1.changeIndex(x - 1);
                tempLine1.changeMoveColor();
                tempLine2.changeIndex(x);
                tempLine2.changeMoveColor();                
                
                const temp = MainArray[x];
				MainArray[x] = MainArray[x - 1];
				MainArray[x - 1] = temp;
                await sleep(5);
                Stats.update(rearrangement, t0, performance.now());
			} else {
				break;
			}
		}
    }
    changeToDefaultColors();
}

//-=-=-=-=-=-=-Selection Sort Algorithm-=-=-=-=-=-=-
async function selectSort() {
    let rearrangement = 0;
    const t0 = performance.now();
    IsSorting = true;
    for (let i = 0; i < MainArray.length - 1; i++) {
		let minIndex = i;
        for (let x = i + 1; x < MainArray.length; x++) {
            if (MainArray[x].height < MainArray[minIndex].height) {
                rearrangement++;
                changeToDefaultColors();
                minIndex = x;
                MainArray[x].changeMoveColor();
                await sleep(5);
                Stats.update(rearrangement, t0, performance.now());
            }
        }
		changeToDefaultColors();
        MainArray[i].changeIndex(minIndex);
        MainArray[i].changeMoveColor();
        MainArray[minIndex].changeIndex(i);
        MainArray[minIndex].changeMoveColor();
        const temp = MainArray[i];
        MainArray[i] = MainArray[minIndex];
        MainArray[minIndex] = temp;
    }
    changeToDefaultColors();
}

function lastRound() {
    for (let i = 0; i < MainArray.length - 1; i++) {
		let minIndex = i;
        for (let x = i + 1; x < MainArray.length; x++) {
            if (MainArray[x].height < MainArray[minIndex].height) {
                minIndex = x;
            }
        }
        MainArray[i].changeIndex(minIndex);
        MainArray[i].changeMoveColor();
        MainArray[minIndex].changeIndex(i);
        MainArray[minIndex].changeMoveColor();
        const temp = MainArray[i];
        MainArray[i] = MainArray[minIndex];
        MainArray[minIndex] = temp;
    }
    changeToDefaultColors();
}

//-=-=-=-=-=-=-Quick Sort Algorithm-=-=-=-=-=-=-
const QuickSortStats = {
    Started: false,
    Rearrangements: Stats.Rearrangements,
    Time: Stats.Time,
    NumSorted: Stats.NumSorted,
    update(){
        Stats.update( this.Rearrangements++, this.Time, performance.now())
    },
    reset(){
        this.Started = false;
        this.Rearrangements = 0;
        this.Time = performance.now();
        this.NumSorted = 0;

    }
};
async function quickSort(array){

    if (!QuickSortStats.Started) {
        QuickSortStats.reset();
        QuickSortStats.Started = true;
        IsSorting = true;
    }

    if (!array)
        array = MainArray;

	if (array.length === 1){
        changeToDefaultColors();
        return array;
    }
		
	const mapToChange = [];
	const pivot = array[array.length - 1];
	const leftArray = [];
	const rightArray = [];
	for (let i = 0; i < array.length - 1; i++) {
		if (array[i].height < pivot.height) {
            leftArray.push(array[i]);
            mapToChange.push(array[i]);
		} else {
            rightArray.push(array[i]);
            mapToChange.push(array[i]);
		}
    }
    mapToChange.push(pivot);
    //-=-=-=-=-=-=-=Create Animation-=-=-=-=-=-=-=-=-=-
    const leftIndexMin = array[0].index;
    const pivIndexToChange = leftIndexMin + leftArray.length;
    const rightIndexMin = leftIndexMin + leftArray.length + 1;
    const sleepTime = 5;
    
    for (let i = 0; i < array.length; i++) {
        
        const leftLine = leftArray.filter(e => { return e.height === array[i].height});
        const rightLine = rightArray.filter(e => { return e.height === array[i].height});
        changeToDefaultColors();
        if (leftLine.length === 1) {
            const indexToChangeTo = leftArray.indexOf(array[i]) + leftIndexMin;
            const toSwap = array[indexToChangeTo];
            const toSwapIndex = array[i].index;
            changeIndexEqualHeights(array[i], indexToChangeTo);
            await sleep(sleepTime);
            var test = "";
        } else if (rightLine.length === 1) {
            const indexToChangeTo = rightArray.indexOf(array[i]) + rightIndexMin;
            const toSwap = array[indexToChangeTo];
            const toSwapIndex = array[i].index;
            changeIndexEqualHeights(array[i], indexToChangeTo);
            await sleep(sleepTime);
            var test = "";
        } else {
            changeIndexEqualHeights(array[i], pivIndexToChange);
            await sleep(sleepTime);
            var test = "";
        }
        QuickSortStats.update();
    }
    //-=-=-=-=-=-=-=Create Animation-=-=-=-=-=-=-=-=-=-
    let result;
	if (leftArray.length > 0 && rightArray.length > 0)
        result = [...await Promise.all([quickSort(leftArray)]), pivot, ...await Promise.all([quickSort(rightArray)])];
	else if (leftArray.length > 0)
        result = [...await Promise.all([quickSort(leftArray)]), pivot];
	else
        result = [pivot, ...await Promise.all([quickSort(rightArray)])];
    
    return result;
}

function changeIndexEqualHeights(lineInArr, indexToChangeTo){
    const leftHeight = lineInArr.height;
    for (let x = 0; x < MainArray.length; x++) {
        if (MainArray[x].height === leftHeight) {
            MainArray[x].changeIndex(indexToChangeTo);
            MainArray[x].changeMoveColor();
            break;
        }
    }
}

//-=-=-=-=-=-=-Count Sort Algorithm-=-=-=-=-=-=-
async function countingSort() {
    let rearrangement = 0;
    const t0 = performance.now();
    IsSorting = true;
    const min = getMin();
    const max = getMax();
    let i = min,
        j = 0,
        len = MainArray.length,
        count = [];
    for (i; i <= max; i++) {
        count[i] = 0;
    }
    for (i = 0; i < len; i++) {
        count[MainArray[i].height] += 1;
        MainArray[i].changeMoveColor();
        await sleep(10);
        changeToDefaultColors();
        Stats.update(rearrangement++, t0, performance.now());
    }
    LineContainer.removeChildren();
    for (i = min; i <= max; i++) {
        while (count[i] > 0) {
            changeToDefaultColors(); 
            MainArray[j] = new Line(13, 50 + (j * 7), j)
            MainArray[j].height = i;
            MainArray[j].changeMoveColor();
            j++;
            count[i]--;
            await sleep(5);
            
            Stats.update(rearrangement++, t0, performance.now());
        }
    }
    changeToDefaultColors();
};

function getMax() {
    let result = -Infinity;
    for (let i = 0; i < MainArray.length; i++) {
        if (MainArray[i].height > result) {
            result = MainArray[i].height;
        }
    }
    return result;
}

function getMin() {
    let result = Infinity;
    for (let i = 0; i < MainArray.length; i++) {
        if (MainArray[i].height < result) {
            result = MainArray[i].height;
        }
    }
    return result;
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