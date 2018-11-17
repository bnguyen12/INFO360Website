// smooth scrolling to Apps section
$('.nav-link').click(function(event) {

  let targetHref = $(this).attr('href');
  $('html, body').animate({
    scrollTop: $(targetHref).offset().top - 75
  }, 1000);

  event.preventDefault();
});

// Statistics formulation
let state = { 
  category: `Children's`,
  currentArtist: '',
  currentYear: '1989',
  doughnutOrBar: 'doughnut'
};

// Fill up the dropdown menu bars
let categories = [`Children's`, 'Classical', 'Country', 'Jazz', 'New Age', 'Oldies', 'Other', 
                  'Pop', 'R&B and Urban', 'Rap and Hip-Hop', 'Religious', 'Rock', 'Soundtrack'];
let categoryPicker = $('#categoryPicker');
for (let i = 0; i < categories.length; i++) {
  let option = $('<option>');
  option.text(categories[i]);
  categoryPicker.append(option);
}

let years = Array(20).fill().map((e, i) => i + 1 + 1988 + '');
let timePicker = $('#timePicker');
for (let i = 0; i < years.length; i++) {
  let option = $('<option>');
  option.text(years[i]);
  timePicker.append(option);
}

// Create the intro charts and set the description text based on the current category
outputChart(`Children's`); 
let categoryDesc = $('#categoryDesc');
categoryPicker.change(function () {
  state.category = $(this).val();
  switch (state.category) {
    case `Children's`:
      categoryDesc.text(`Music catered towards children`);
      break;
    case 'Classical':
      categoryDesc.text('Music dating from early America');
      break;
    case 'Country':
      categoryDesc.text('Music originating from the rural South');
      break;
    case 'Jazz':
      categoryDesc.text('Music developed from ragtime and blues');
      break;
    case 'New Age':
      categoryDesc.text('Music characterized by light melodic harmonies');
      break;
    case 'Oldies':
      categoryDesc.text('Music relating to those before 2000');
      break;
    case 'Other':
      categoryDesc.text('Music without category');
      break;
    case 'Pop':
      categoryDesc.text('Music characterized by its upbeat rhythm');
      break;
    case 'R&B and Urban':
      categoryDesc.text('Music relating to rhythms and blues');
      break;
    case 'Rap and Hip-Hop':
      categoryDesc.text('Music developed by disc jockeys of the late 1970s');
      break;
    case 'Religious':
      categoryDesc.text('Music relating to religion');
      break;
    case 'Rock':
      categoryDesc.text('Music formed in the mid and late 1960s from rock and roll');
      break;
    default:
      categoryDesc.text('Music featured in movies, cartoons, television, etc.');
  }
  window.lineChart.destroy();
  outputChart(state.category);
});

// Makes outputs the chart onto the webpage given the category
function outputChart(category) {
  let wantedIndex = categories.indexOf(category) + 1; // +1 because the array I made doesn't account for the 'year' column in csv file
  let musicSales = [];
  fetch('./data/music_sales.csv')
    .then(data => {
      return data.text();
    })
    .then(text => {
      let lines = text.split('\n');
      for (let i = 1; i < lines.length; i++) { // lines[0] gives genre so we start at i = 1
        let line = lines[i];
        let columns = line.split(',');
        musicSales.push(columns[wantedIndex]);
      }
    }).then(() => {
      let myChart = $('#myChart');
      window.lineChart = new Chart(myChart, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: '% of total music sales in the U.S.',
            data: musicSales,
            borderColor: '#3cba9f',
            fill: false
          }]
        },
        options: {
          title: {
            display: true,
            text: 'Music Sales by Genre from 1989-2008'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    });
}

// Makes the initial comparison chart along with checking when the year in question changes
makeComparisonChart(state.currentYear, state.doughnutOrBar);
timePicker.change(function () {
  state.currentYear = $(this).val();
  window.comparisonChart.destroy();
  makeComparisonChart(state.currentYear, state.doughnutOrBar);
});

// Changes the chart type based on when the type button is toggled
$('#doughnutButton').click(() => {
  window.comparisonChart.destroy();
  state.doughnutOrBar = 'doughnut'
  makeComparisonChart(state.currentYear, state.doughnutOrBar);
});

$('#barButton').click(() => {
  window.comparisonChart.destroy();
  state.doughnutOrBar = 'bar';
  makeComparisonChart(state.currentYear, state.doughnutOrBar);
});

// Makes the comparison chart given a year
function makeComparisonChart(year, chartType) {
  let wantedIndex = years.indexOf(year) + 1; // +1 is because the first row of the dataset isn't made up of relevant data
  fetch('./data/music_sales.csv')
    .then(data =>{
      return data.text();
    })
    .then(text => {
      let lines = text.split('\n');
      let wantedData = lines[wantedIndex];
      let data = wantedData.split(',');
      return data.slice(1); // skips the first element because it doesn't contain data we need
    })
    .then(data => {
      let comparisonChart = $('#myComparisonChart');
      window.comparisonChart = new Chart(comparisonChart, {
        type: `${chartType}`,
        data: {
          labels: categories,
          datasets: [{
            label: 'Percentage (%)',
            backgroundColor: ['LIGHTGREEN', 'PALETURQUOISE', 'AQUAMARINE', 'TURQUOISE', 'CADETBLUE',
                              'STEELBLUE', 'LIGHTSTEELBLUE', 'LIGHTBLUE', 'DODGERBLUE', 'MEDIUMSLATEBLUE',
                              'MIDNIGHTBLUE', 'MEDIUMSEAGREEN', 'DARKOLIVEGREEN'],
            data
          }]
        },
        options: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Percentage of U.S. Music Sales by Genre'
          }
        }
      });
    });
}

// Getting songs from artists
let searchBtn = $('#searchBtn');
let artistInput = $('#artistInput');
searchBtn.click(() => {
  let artistName = artistInput.val();
  state.currentArtist = artistName;
  let itunesSearch = `https://itunes.apple.com/search?entity=song&limit=5&term=${artistName}`;
  fetch(itunesSearch)
    .then(response => {
      return response.json();
    })
    .then(json => {
      let songs = [];
      for (let i = 0; i < 5; i++) {
        if (json.results[i]) { // if this entity isn't null
          songs.push({
            title: json.results[i].trackName,
            cover: json.results[i].artworkUrl100
          });
        }
      }
      return songs;
    })
    .then(songs => {
      makeCarousel(songs);
    })
    .catch(err => console.log(err));
});

// Makes the carousel of song covers
function makeCarousel(songs) {
  let carouselContainer = $('#albumCarousel');
  carouselContainer.empty();
  let carouselInner = $('<div>').addClass('carousel-inner');
  for (let i = 0; i < songs.length; i++) {
    let carouselItem;
    if (i === 0) {
      carouselItem = $('<div>').addClass('carousel-item active');
    } else {
      carouselItem = $('<div>').addClass('carousel-item');
    }

    let img = $('<img>').addClass('d-block w-100');
    img.attr({ src: songs[i].cover, alt: songs[i].title});

    let captionItem = $('<div>').addClass('carousel-caption d-none d-md-block');
    captionItem.append($('<h5>').text(songs[i].title));
    carouselItem.append(captionItem);
    carouselItem.append(img);
    carouselInner.append(carouselItem);
  }

  carouselContainer.append(carouselInner);
  let prevButton = makeCarouselButton('Previous');
  let nextButton = makeCarouselButton('Next');
  carouselContainer.append(prevButton, nextButton);
}

function makeCarouselButton(type) {
  let button;
  let dataSlide;
  if (type === 'Previous') {
    button = $('<a>').addClass(`carousel-control-prev`);
    dataSlide = 'prev';
  } else {
    button = $('<a>').addClass(`carousel-control-next`);
    dataSlide = 'next';
  }
  button.attr({
    href: '#albumCarousel',
    role: 'button',
    'data-slide': `${dataSlide}`
  });

  let icon = $('<span>').addClass(`carousel-control-${dataSlide}-icon`);
  icon.attr({ 'aria-hidden': true});
  let buttonText = $('<span>').addClass('sr-only').text(`${type}`);

  button.append(icon, buttonText);
  return button;
}