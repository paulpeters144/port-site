const Global = {};
let Container = null;
let WindowWidth;
let WindowHeight;
let GroundSprites;
const TimeKeeper = {};
const BackgrounColor = 0x3e444c;
const Loader = new PIXI.Loader();
const ObstacleSpeed = 2;
const ObstacleTime = 10;
let Flappy;
let GameOver = false;
let b;

let PipeSet1;
let PipeSet2;

window.onload = function () {
    initGame();
};

function initGame() {
    setupGlobals();
    document.body.appendChild(Global.app.view);
    WindowWidth = parseInt(Global.app.view.clientWidth);
    WindowHeight = parseInt(Global.app.view.clientHeight);
    b = new Bump(Global.app)
    window.addEventListener('resize', resizeHandler, false);
    setupInitGraphics();
    resizeHandler();
}

function setupInitGraphics() {
    loadAssetsAndRun();
}

function animationController() {
  GroundSprites.animate();
  Flappy.animate();
  PipeSet1.animate();
  PipeSet2.animate();
}

function loadAssetsAndRun() {
    Loader.baseUrl = '/img/flappyBird/';
    Loader
      .add('fbBackground', 'background.png')
      .add('flappy','bird.png')
      .add('ground','ground.png')
      .add('pipe', 'pipe.png')
      .add('pipeTop', 'pipeTop.png');

    Loader.onProgress.add(showProgress);
    Loader.onComplete.add(doneLoading);
    Loader.onError.add(reportError);
    Loader.load();

}

function showProgress(e) {
  
}

function doneLoading(e) {
  initTextures();
}

function initTextures(){

  GroundSprites = new Ground();
  const backgroud = new PIXI.Graphics();
  backgroud.beginFill(BackgrounColor);

  backgroud.drawRect(0, 0, WindowWidth * 1.1, WindowHeight * 1.1);
  backgroud.endFill();

  Container = new PIXI.Container();
  Global.app.stage.addChild(backgroud);
  Global.app.stage.addChild(Container);

  const backgroundSprite = PIXI.Sprite.from(Loader.resources.fbBackground.texture);
  backgroundSprite.width = WindowWidth * 1.01;
  backgroundSprite.height = WindowHeight * 1.01;

  Container.interactive = true;
  Container.on('pointerdown', function (e) {

    if (GameOver)
      return;

    Flappy.clicked();

    if (!GroundSprites.moving)
      GroundSprites.moving = true;

    if (!PipeSet1.moving) {
      PipeSet1.moving = true;
      PipeSet2.moving = true;
    }

  });

  Container.addChild(backgroundSprite);
  const startXPos = 450;
  PipeSet1 = new PipeSet();
  PipeSet1.setXPos(startXPos);
  PipeSet2 = new PipeSet();
  PipeSet2.setXPos(PipeSet1.pipeTop.x + 350);
  PipeSet1.getRandomYPositions();
  PipeSet2.getRandomYPositions();
  setupFlappy();
  GroundSprites.setupGround();

  Global.app.animationUpdate = function (delta) {
    animationController();
  };

  Global.app.ticker.add(Global.app.animationUpdate);
}

function setupFlappy() {
  Flappy = new Bird();
}

function stopAnimations(){
    GameOver = true;
    Flappy.animation.gotoAndStop(0);
    GroundSprites.moving = false;
    PipeSet1.moving = false;
    PipeSet2.moving = false;
}

class Bird {
  constructor(){
    this.hitTexture;
    this.lastYClick;
    this.gameStarted = false;
    this.animPlaying = false;
    this.nextRisePoint = 0;
    this.roteIncrease = .15;
    this.animationPoints = {
      rising: true
    };
    this.centerY = 395;
    this.flapClicked = false;
    const flappySprite = PIXI.Sprite.from(Loader.resources.flappy.texture);

    const sheet = PIXI.BaseTexture.from(
      Loader.resources.flappy.url
    );

    flappySprite.anim = [];
    for (let i = 0; i < 3; i++) {
      flappySprite.anim.push(
        new PIXI.Texture(sheet, new PIXI.Rectangle(i * (sheet.width / 3), 0, sheet.width / 3, sheet.height))
      );
    }

    

    this.animation = new PIXI.AnimatedSprite(flappySprite.anim);
    this.animation.rotation = 0;
    this.animation.scale.set(.65,.65);
    this.animation.x = 190;
    this.animation.y = this.centerY;
    this.animation.anchor.set(0.5);
    this.animation.animationSpeed = 0.1;
    this.animation.loop = true;
    Container.addChild(this.animation);
    TimeKeeper.flappy = 0;
    this.moveUp = true;

    this.hitTexture = new PIXI.Sprite.from(flappySprite.anim[0]);
    this.hitTexture.anchor.set(0.5);
    this.hitTexture.scale.set(.6,.6);

  }
  bounce(){
    TimeKeeper.flappy += Math.round(Global.app.ticker.elapsedMS);
    if (TimeKeeper.flappy > 12) {
        TimeKeeper.flappy = 0;        
        
        if (this.moveUp) {
          
          if (this.animation.y >= (this.centerY - 8)) {

            if (this.animation.y >= (this.centerY - .65)) {
              this.animation.y -= .7;
            } else if (this.animation.y >= (this.centerY - .2)) {
              this.animation.y -= .5;
            } else {
              this.animation.y -= .4;
            }


          } else {
            this.moveUp = false;
          }
        } else {

          if (this.animation.y <= (this.centerY + 8)) {


            if (this.animation.y <= (this.centerY + .65)) {
              this.animation.y += .7;
            } else if (this.animation.y <= (this.centerY + .2)){
              this.animation.y += .5;
            } else {
              this.animation.y += .4;
            }


            
          } else {
            this.moveUp = true;
          }
        }
    }
  }
  flap(){

    if (!this.gameStarted)
      return;

    TimeKeeper.flappy += Math.round(Global.app.ticker.elapsedMS);
    if (TimeKeeper.flappy > 12) {
        TimeKeeper.flappy = 0
      if (this.animationPoints.rising)
        this.riseFlappy();
      else this.fallFlappy();

      this.moveFlappy();
      this.hitTexture.x = this.animation.x + 5;
      this.hitTexture.y = this.animation.y + 5;
    }
  }

  riseFlappy() {
    if (this.animation.rotation > -.05) {
      this.animation.rotation -= .5;
    } else if (this.animation.y > this.nextRisePoint) {
      
    } else {
      this.animationPoints.rising = false
    }
  }
  
  moveFlappy(){
    if (this.animationPoints.rising) {

      if (this.animation.y >= -100)
          this.moveFlappyUp();
      else this.animationPoints.rising = false;

    } else {

      if (this.animation.y >= 620)
        return;

      this.moveFlappyDown();

    }
  }

  moveFlappyUp(){

    if (this.animation.y > this.nextRisePoint + 75) {
      this.animation.y -= 8;
    } else if (this.animation.y > this.nextRisePoint + 50) {
      this.animation.y -= 7;
    } else if (this.animation.y > this.nextRisePoint + 25) {
      this.animation.y -= 6;
    } else if (this.animation.y > this.nextRisePoint + 15) {
      this.animation.y -= 4;
    } else {
      this.animation.y -= 2;
    }
  }

  moveFlappyDown(){
    if (this.animation.y < this.nextRisePoint + 5) {
      this.animation.y += 2;
    } else if (this.animation.y < this.nextRisePoint + 15) {
      this.animation.y += 2;
    } else if (this.animation.y < this.nextRisePoint + 25) {
      this.animation.y += 4;
    } else if (this.animation.y < this.nextRisePoint + 50) {
      this.animation.y += 6;
    } else if (this.animation.y < this.nextRisePoint + 75) {
      this.animation.y += 7;
    } else {
      this.animation.y += 8;
    }
  }

  clicked(){
    if (!this.gameStarted){
      this.gameStarted = true;
      this.animPlaying = true;
      this.animation.play();
    }
      

    this.animationPoints.rising = true;
    this.nextRisePoint = this.animation.y - 100;
  }

  fallFlappy() {
    if (this.animation.rotation < 1.5)
      this.animation.rotation += this.roteIncrease;
  }
  animate(){

    if (!this.gameStarted) {
      this.bounce();    
    }

      this.flap();

      if (this.hitObject()) {
      
      }
  }
  hitObject() {
    if (this.animation.y >= 621) {
      console.log("hit ground");
    }

    if (b.hit(this.hitTexture, PipeSet1.pipeBottom)) {
      stopAnimations();
    }

    if (b.hit(this.hitTexture, PipeSet2.pipeBottom)) {
      stopAnimations();
    }

    if (b.hit(this.hitTexture, PipeSet1.pipeTop)) {
      stopAnimations();
    }

    if (b.hit(this.hitTexture, PipeSet2.pipeTop)) {
      stopAnimations();
    }
    
  }
  hitBottomPipe(pipe){
    const leftOfSprite = this.animation.x - (Math.floor(this.animation.width / 2));
    const topOfSprite = this.animation.y - (Math.floor(this.animation.height / 2));
    const rightOfPipe = pipe.x + pipe.width;
    //if (topOfSprite + this.animation.height >= pipe.y ) {
      if (leftOfSprite <= pipe.x && 
        leftOfSprite + this.animation.width >= rightOfPipe) {
        return true;
      }
    //}  
    return false;
  }
  hitTopPipe(){
    return false;
  }
}

class PipeSet {
  constructor(){
    this.distanceBetweenPipes = 200;
    this.timeKeeper = 0
    this.moving = false;
    this.pipeTop = PIXI.Sprite
    .from(Loader.resources.pipeTop.texture);
    this.pipeTop.height = 475;
    this.pipeTop.width = 85;
    
    this.pipeBottom = PIXI.Sprite
    .from(Loader.resources.pipe.texture);
    this.pipeBottom.height = 475;
    this.pipeBottom.width = 85;

    this.pipeBottom.anchor.set(.5);
    this.pipeTop.anchor.set(.5);

    Container.addChild(this.pipeTop);
    Container.addChild(this.pipeBottom);
  }
  getRandomYPositions(){
    const randPos = Math.floor(Math.random() * 300);
    this.pipeTop.y = randPos - (this.pipeTop.height * .4);
    this.pipeBottom.y = this.pipeTop.height + 
    this.distanceBetweenPipes + this.pipeTop.y;
  }
  setXPos(xPos){
    this.pipeTop.x = xPos;
    this.pipeBottom.x = this.pipeTop.x;
  }
  animate(){
    if (!this.moving)
      return;

    this.timeKeeper += Math.round(Global.app.ticker.elapsedMS);
    if (this.timeKeeper > ObstacleTime) {
      this.timeKeeper = 0;
      this.pipeTop.x -= ObstacleSpeed;
      this.pipeBottom.x -= ObstacleSpeed;

      if (this.pipeBottom.x <= (this.pipeTop.width) * -1) {
        this.getRandomYPositions();
        this.setXPos(600);
      }
    }
  }
}

class Ground{
  constructor(){
    this.arr = [];
    TimeKeeper.groundTimer = 0;
    this.moving = false;
  }
  addSpriteToEnd(){
    const groundSprite = PIXI.Sprite.from(Loader.resources.ground.texture);
    groundSprite.width = 25;
    groundSprite.height = 65;
    groundSprite.y = 635;

    const arrLen = this.arr.length;

    if (arrLen > 0) {
      const prevSprite = this.arr[arrLen - 1];
      groundSprite.x = prevSprite.x + prevSprite.width;
    } else {
      groundSprite.x = (Math.floor(groundSprite.width) * this.arr.length);
    }
    
    this.arr.push(groundSprite);
    Container.addChild(groundSprite);
  }
  removeFirstSprite(){
    Container.removeChild(this.arr[0]);
    this.arr.shift();
  }
  animate(){

    if (!this.moving)
      return;

      TimeKeeper.groundTimer += Math.round(Global.app.ticker.elapsedMS);
    if (TimeKeeper.groundTimer > ObstacleTime) {
      TimeKeeper.groundTimer = 0;

      if (this.arr.length > 0) {
        if (this.arr[0].x <= (this.arr[0].width * -1)) {
          this.removeFirstSprite();
          this.addSpriteToEnd();
        }
      }
      
      for (let i = 0; i < this.arr.length; i++) {
        this.arr[i].x -= ObstacleSpeed;
      }
    }
  }
  setupGround(){
  
    for (let i = 0; i < 22; i++) {
      this.addSpriteToEnd();
    }
  }
}

function reportError(e){

}

function scale(sprite) {
  sprite.scale.set(Global.imgScale * 2.45, Global.imgScale);
}

function getWindowH(width) {
  let result = 1;
  while (width / result > 1.78) {
    result += 1;
  }
  return result;
}

function setupGlobals() {
  Global.windowW = 500;
  Global.windowH = 700;
  Global.imgScale = Global.windowW / 500;
  Global.virtualW = Global.windowW;
  Global.virtualH = Global.windowH;

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
  Global.imgScale = newWidth / Global.virtualW;
  Global.app.resize(newWidth, newHeight);
}