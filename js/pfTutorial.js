let PageIndex = 0;
const PageCount = 4;

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
            document.getElementById('tutContent').innerHTML = `<p>A* (pronounced "A-star") is a graph traversal and path search algorithm, 
            which is often used in many fields of computer science due to its completeness, 
            optimality, and optimal efficiency. Read full Wikipedia article <a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank">here</a>.
         </p>
         <br/>
         <center>
             <img src="img/Astar_progress_animation.gif">
         </center>`;
            break;
        case 1:
            document.getElementById('tutContent').innerHTML = 
            `<p>
                To create different paths for the A*, you can select the start and end points and then move them. 
            </p>
            <br/>
            <center>
                <img src="img/startMove.png">
                <img src="img/endMove.png">
            </center>`;
            break;
        case 2:
            document.getElementById('tutContent').innerHTML =
            `<p>
                Also, you can add and remove traversable and non-traversable nodes. Do this to remove or add
                objects for the A* to navigate around.
            </p>
            <br/>
            <center>
               
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