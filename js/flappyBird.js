const Global = {};
let Container = null;
let WindowWidth;
let WindowHeight;
const BackgrounColor = 0x3e444c;

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

function setupInitGraphics(params) {
    const backgroud = new PIXI.Graphics();
    backgroud.beginFill(BackgrounColor);

    backgroud.drawRect(0, 0, WindowWidth, WindowHeight);
    backgroud.endFill();

    Container = new PIXI.Container();
    Global.app.stage.addChild(Container);
    Container.addChild(backgroud);
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