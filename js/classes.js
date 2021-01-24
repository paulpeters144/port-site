class Btn{
    constructor(xCord, yCord, text){
        this.xCord = xCord;
        this.yCord = yCord;
        this.text = new PIXI.Text(text, FontStyle);
        this.width = 100;
        this.height = 50;
        this.curveAngle = 15;
        this.graphic = new PIXI.Graphics();
        this.fontStyle = FontStyle;
        this.lineColor = 0x2C3531;
        this.buttonColor = 0x116466;
    }
    createBtn(){
        this.graphic.lineStyle(2, this.lineColor, 1);
        this.graphic.beginFill(this.buttonColor);
        this.graphic.drawRoundedRect(
                this.xCord, 
                this.yCord, 
                this.width, 
                this.height, 
                this.curveAngle
            );
        this.graphic.endFill();
        this.graphic.interactive = true;
        this.graphic.buttonMode = true;

        const textMetrics = PIXI.TextMetrics.measureText(
                this.text.text, this.fontStyle
            );
        const textWidth = Math.floor(textMetrics.width);
        const textHeight = Math.floor(textMetrics.height);
        this.text.x = this.xCord + 
        (Math.floor((this.width / 2)) - 
        (Math.floor(textWidth / 2)));
        this.text.y = this.yCord + 
        (Math.floor((this.height / 2)) - 
        (Math.floor(textHeight / 2)));
    }
    addBtnToStage(){
        this.createBtn();
        Container.addChild(this.graphic);
        Container.addChild(this.text);
    }
}