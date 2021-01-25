const PlayerNames = [];
let labelsArr = [];
const dataArr = [];
const dataArr2 = [];
let DataSets = [
];
const Colors = {
    blue: '#2e3dc7',
    red: '#c72245',
    green: '##c72245',
    darkGreen: '#266930',
    orange: '#ffa600',
    colorsUsed: 0,
    getNextColor(){
        return "#" + Math.floor(Math.random()*16777215).toString(16);

    }
};
window.onload = function () {
    drawChart();
    setupEventListeners();
    setupPlayerNames();
}

function setupPlayerNames() {
    Object.keys(Players).forEach( key => {
        PlayerNames.push(key);
    });
}


$( function() {
    $( "#tags" ).autocomplete({
      source: PlayerNames
    });
  } );

class Player{
    constructor(name){
        this.name = name;
        this.years = [];
        this.pers = [];
        this.ages = [];
        this.yearsPlayed = [];
        this.color;
        this.dataset;
        this.create();
    }
    create(){
        this.color = Colors.getNextColor();
        let hasfirstYears = false;
        Object.keys(Players[this.name]).forEach( key => {
            if (key !== "href") {

                if (!hasfirstYears) {
                    let yearOne = Players[this.name][key].yearsplayed;
                    while (yearOne !== 1) {
                        this.years.push(null);
                        this.pers.push(null);
                        this.ages.push(null);
                        this.yearsPlayed.push(null);
                        yearOne--;
                    }
                    hasfirstYears = true;
                }
                
                this.years.push(key);
                this.pers.push(Players[this.name][key].per);
                this.ages.push(Players[this.name][key].age);
                this.yearsPlayed.push(Players[this.name][key].yearsplayed);
            }
        });

        this.dataset = {
            label: this.name,
            backgroundColor: this.color, // dots
            borderColor: this.color, // lins to dots
            fill: false,
            data: this.pers
        }
    }
    createdata(){
        let result = [];
        const min = this.yearsPlayed[0];
        const max = this.yearsPlayed[this.yearsPlayed.length - 1];
        
        for (let i = 1; i < min; i++)
            if (i < min) result.push(null);

        result.push.apply(result, this.pers);
        return result;
    }
}

function readJsonFile() {
    const path = "";
}

var options = {
    
};

let chart;
function drawChart() {
    var ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            //labels: [...labelsArr],
            datasets: DataSets
        },

        options: {
            responsive: true,
            title: {
                display: true,
                position: "top",
                text: 'Basketball PER',
                fontSize: 18,
                fontColor: "#111"
            },
            tooltips: {
                    enabled: true,
                    mode: 'single',
                    callbacks: {
                        label: function(tooltipItem, data) { 
                            const index = tooltipItem.datasetIndex;
                            var label = data.datasets[index].label;
                            var val = data.datasets[index].data[tooltipItem.index];
                            const player = PlayerData.filter(e => { return e.name === label})[0];
                            const multistringText = [];
                            multistringText.push(label);
                            multistringText.push('PER: ' + val);
                            multistringText.push('Season: ' + player.years[tooltipItem.index]);
                            multistringText.push('Age: ' + player.ages[tooltipItem.index]);
                            return multistringText;
                        }
                    }
                },
            legend: {
                display: true,
                position: "top",
                labels: {
                    fontColor: "#333",
                    fontSize: 16
                }
            },
            scales:{
                yAxes:[{
                    ticks:{
                        min:0

                    }
                }]

            }
        }
    });
}

class CareerStats{
    constructor(){
        this.header = `<thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Seasons</th>
          <th scope="col">Points</th>
          <th scope="col">Rebounds</th>
          <th scope="col">Assists</th>
          <th scope="col">Steals</th>
          <th scope="col">Blocks</th>
          <th scope="col">Missed FG</th>
          <th scope="col">Missed FT</th>
          <th scope="col">PER</th>
          <th scope="col">Action</th>
        </tr>
      </thead>`;
        this.players = [];
    }

    addPlayer(name){
        const ppg = this.getStatsFor(name, "ppg");
        const rpg = this.getStatsFor(name, "rpg");
        const apg = this.getStatsFor(name, "apg");
        const spg = this.getStatsFor(name, "spg");
        const bpg = this.getStatsFor(name, "bpg");
        const missedFg = (this.getStatsFor(name, "attemptfg") - this.getStatsFor(name, "madefg")).toFixed(1);
        const missedFt = (this.getStatsFor(name, "attemptft") - this.getStatsFor(name, "madeft")).toFixed(1);
        const per = this.getStatsFor(name, "per");
        const newPlayer = `<tr>
        <th scope="row">${name}</th>
         <td>${this.getTotalSeasons(name)}</td>
        <td>${ppg}</td>
        <td>${rpg}</td>
        <td>${apg}</td>
        <td>${spg}</td>
        <td>${bpg}</td>
        <td>${missedFg}</td>
        <td>${missedFt}</td>
        <td>${per}</td>
        <td>
            <button class="btn btn-primary" onclick='carrerStats.remove(\"${name}\")'>Remove</button>
        </td>
      </tr>`;
      this.players.push(newPlayer);
    }

    getTotalSeasons(name){
        let result = 0;
        Object.keys(Players[name]).forEach( key => {
            if (key !== "href") {
                result = Players[name][key]["yearsplayed"];
            }
        });
        return result;
    }

    getStatsFor(name, prop){
        let count = 0;
        let total = 0;
        Object.keys(Players[name]).forEach( key => {
            if (key !== "href") {
                total += Players[name][key][prop];
                count++;
            }
        });
        const result = (total / count).toFixed(1);
        return result;
    }

    displayTable(){
        if (this.players.length === 0){
            document.getElementById('careerTable').innerHTML = '';
            return;
        }
            

        let rows = "<tbody>";
        this.players.forEach( p => {
            rows += p;
        });
        rows += "</tbody>";

        const result = this.header + rows;
        document.getElementById('careerTable').innerHTML = result;
    }
    remove(name){
        const result = [];
        this.players.forEach( p => {
            if (!p.includes(name)) {
                result.push(p);
            }
        });
        this.players = result;

        const newDataSet = [];
        DataSets.forEach( ds => {
            if (ds.label !== name) {
                newDataSet.push(ds);
            }
        });

        DataSets = newDataSet;

        chart.data.datasets = DataSets;

        chart.data.labels = getRangeOfYearsPlayed();
        chart.update();
        this.displayTable();
    }
}

const PlayerData = [];

let num = 0;
const carrerStats = new CareerStats();
function setupEventListeners() {
    document.getElementById('addData').addEventListener('click', function() {
        const typed = document.getElementById('tags').value;
        document.getElementById('tags').value = '';

        if (!Players.hasOwnProperty(typed) || playerAlreadyInDataSet(typed))
            return;

        const player = new Player(typed);
        DataSets.push(player.dataset);
        
        carrerStats.addPlayer(typed);
        carrerStats.displayTable();
        PlayerData.push(player);
        chart.data.labels = getRangeOfYearsPlayed();
        chart.update();
    });
}

function playerAlreadyInDataSet(name){
    let result = false;
    DataSets.forEach( p => {
        if (p.label === name)
            result = true;
    });
    return result;
}

function getRangeOfYearsPlayed() {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < PlayerData.length; i++) {
        const playerAtIndex = PlayerData[i];
        const minYear = playerAtIndex.yearsPlayed[0];
        const maxIndex = playerAtIndex.yearsPlayed.length - 1;
        const maxYear = playerAtIndex.yearsPlayed[maxIndex];
        
        if (minYear < min)
            min = minYear;

        if (maxYear > max)
            max = maxYear;
    }
    const result = [...Array(max).keys()].map(i => "Year " + (i + min).toString());
    return result;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}