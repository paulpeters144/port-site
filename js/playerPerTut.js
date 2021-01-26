//-=-=-=-=-=-=-=-Tutorial & Settings-=-=-=-=-=-=-=-

let PageIndex = 0;
const PageCount = 2;

$( document ).ready(function() {
    updatePageIndex();
    document.getElementById('btnModal').click();
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
            document.getElementById('tutContent').innerHTML = `<br>
            <div class="row">
            <div class="col-3">
            <img src="img/nbaLogo.png"/>
            </div>
            <div class="col-lg-8">
              The player efficiency rating (PER) is John Hollinger's all-in-one basketball 
              rating, which attempts to boil down all of a player's contributions into one number. 
              Using a detailed formula, Hollinger developed a system that rates every player's statistical performance.
                <a href="https://en.wikipedia.org/wiki/Player_efficiency_rating" target="_blank">Wikipedia</a>
            </div>
        </div>`;
            break;
        case 1:
            document.getElementById('tutContent').innerHTML = 
            `<br>
            <div class="row">
            <div class="col-3">
            <img src="img/nbaLogo.png"/>
            </div>
            <div class="col-lg-8">
              In this project, you can add players to a line graph and compare their PER ratings over their careers. NOTE:
              Prior to the late 70s some stats were not recorded in the NBA making it impossible to get a PER rating during
              some periods.<br><br>
              Also, the list of players is not comprehenisve. The players chosen for this project were players who have been involeved in at
              least 1 all star game.
            </div>
        </div>`;
            break;
    }
    
}