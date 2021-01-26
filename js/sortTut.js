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
            <img src="img/sortAlgo.png"/>
            </div>
            <div class="col-lg-8">
                From the beginning of computing, the sorting problem has attracted a great deal of research, 
                due to the complexity of solving it efficiently.
                <a href="https://en.wikipedia.org/wiki/Sorting_algorithm" target="_blank">Wikipedia</a>
            </div>
        </div>`;
            break;
        case 1:
            document.getElementById('tutContent').innerHTML = 
            `<br><div class="row">
            <div class="col-3">
            <img src="img/sortAlgo.png"/>
            </div>
            <div class="col-lg-8">
                <p>For this project, you can look through some of the alogrithms discovered to solve the issue.
                So give each algorithm a try and see which one you like best.</p>
            </div>
        </div>`;
            break;
    }
    
}