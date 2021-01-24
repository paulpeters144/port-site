//-=-=-=-=-=-=-=-Tutorial & Settings-=-=-=-=-=-=-=-

let PageIndex = 0;
const PageCount = 3;

$( document ).ready(function() {
    updatePageIndex();
});

function tutLeftBtn() {
    if (PageIndex > 0) {
        document.getElementById("btnRight").disabled = false;
        PageIndex = PageIndex - 1;    
        updatePageIndex();
    }

    if (PageIndex === 0)
        document.getElementById("btnLeft").disabled = true;

    displayPage(PageIndex);
}

function tutRightBtn() {
    if (PageIndex < PageCount) {
        document.getElementById("btnLeft").disabled = false;
        PageIndex = PageIndex + 1;
        updatePageIndex();
    }

    if (PageIndex === (PageCount - 1))
        document.getElementById("btnRight").disabled = true;

    displayPage(PageIndex);
}

function updatePageIndex() {
    document.getElementById("PageIndex").innerText = 
    `Page ${PageIndex + 1} 0f ${PageCount}`;
}

function displayPage(pageIndex) {
    switch (pageIndex) {
        case 0:
            document.getElementById('tutContent').innerHTML = `
            <label for="GridSizes">Choose a Grid Size:</label>
            <select id="GridSizes" name="GridSizes" onchange="updateBoardSize()">
              <option value="6x4">6x4</option>
              <option value="8x5">8x5</option>
              <option value="12x7">12x7</option>
            </select>
            <br/>
            <a href="https://en.wikipedia.org/wiki/Dots_and_Boxes" target="_blank">Dots and Boxes</a> 
            is the classic game where players draw lines to make boxes for points. 
            In this project, you can play against a computer that uses the minimax algorithm to make decisions. 
            It's not impossible to beat the computer... if you don't make simple mistakes.
            <br/><br/>
            <center>
             <img src="img/dotsAndBoxesW.png">
         </center>`;
            break;
        case 1:
            document.getElementById('tutContent').innerHTML = 
            `<p>Minimax is generally a recursive funtion that ` + 
            `examines moves placed by a maximizing player (the artificial intelligence) or the minimizing player (the human user). ` + 
            `The depth examined by the alrgorithm is the number of moves ahead that are being examined on the descision tree of ` + 
            `possible moves. Read full Wikipedia article <a href="https://en.wikipedia.org/wiki/minimax" target="_blank">here</a>. ` + 
         `
         <center>
             <img src="img/minimax.png">
         </center>`;
            break;
        case 2:
            document.getElementById('tutContent').innerHTML =
            `The alrgorithm's depth is the number of moves ahead that are examined. 
            However, the time to analyze more depths grows expotentailly. 
            An addition to the minimax that can help prune descision branches is called 
            Alpha-Beta Pruning. The addition prunes branches based on move evaluations, potentially saving 
            the minimax time searching for the best move. Read full Wikipedia article 
            <a href="https://en.wikipedia.org/wiki/Alpha–beta_pruning" target="_blank">here</a>.
            <center>
            <img src="img/abPruning.png">
            </center>`;
            break;
        case 3:
            document.getElementById('tutContent').innerHTML =
            `<p>
                Or just simply hit the 'Random' button to create
                different envoirments.
            </p>
            <br/>
            <center>

            </center>
            `;
            break;
    }
    
}

function ddlBtn() {
    const selected = document.getElementById("GridSizes");
    console.log(selected.value);
}

function updateBoardSize() {
    Container.removeChild(GameBoard.Container);
    GameBoard.reset();
    WinnerText.text = "";
    GameBoard = new Board();
    const boardDimensions = document.getElementById('GridSizes').value.split('x');
    GameBoard.DotsAcross = parseInt(boardDimensions[0]);
    GameBoard.DotsDown = parseInt(boardDimensions[1]);
    GameBoard.createBoardGraphic();
    Container.addChild(GameBoard.Container);
}