import {API_KEY, HASH_KEY, TIME_STAMP, URL_ENDPOINT} from "./apikey.js";

const spinner = document.getElementById('loading');
const message = document.getElementById('message');



// Functionality for the search bar and search button to fetch hero bio

const searchHero = document.getElementById('search_bttn').addEventListener('click', async function() {
    clearRow()
    showSpinner()
    const heroName = document.getElementById('userInput').value;
    checkBlank(heroName)
    headingDisplay("Events ", heroName)
    const charData = await fetchCharacter(heroName);
    const images = await fetchImages(charData);
    const charName = await fetchCharName(charData);
});



function capitalizeLetter(name) {
    const firstLetter = name.charAt(0).toUpperCase();
    const newName =  name.replace(name.charAt(0), firstLetter);
    return newName
}


function showSpinner() {
    spinner.style.visibility = "visible";
    message.textContent = 'Loading comics....';
}

// Grab JSON for Character bio by Name
async function fetchCharacter(heroName) {
    const response = await fetch(`${URL_ENDPOINT}/characters?name=${heroName}&${TIME_STAMP}&apikey=${API_KEY}&hash=${HASH_KEY}`);
    if(response.status === 200) {
        const jsonData =  await response.json();
        return await jsonData
    } 
}

// Fetch Character Bio Image and Description

async function fetchImages(charData){
    try {
    const charBioImg = document.getElementById('charBioImg');
    const charImgPath = charData.data.results[0].thumbnail.path + "." + charData.data.results[0].thumbnail.extension;
    const charBio = charData.data.results[0].description;
    const charID = charData.data.results[0].id;
    charBioImg.src=charImgPath;
    checkBioValue(charBio)
    const eventURL =  createEventURL(charID)
    fetchComics(eventURL)
    } catch (e) {
        alert("Sever Error, character could not be found.");
        console.log(e.message);
    }

}


// Store and display character name in heading
async function fetchCharName(charData) {
    const bioBox = document.getElementById('bioBox').style.display = "block";
    const charName = charData.data.results[0].name;
    let character = document.getElementById('heading-content').textContent = charName;
}


// Fetch Specific Character Events
async function fetchComics(eventURL) {
    const response = await fetch(eventURL);
    const json =  await response.json();
    grabComicData(json)
    return await json
}

let count = 0;

// Store Comic Images and Descriptions
async function grabComicData(json){
    const comicResults = json.data.results;
    const array = [];
    comicResults.forEach(comic => {
        array.push(comic.id);
        const marvelAttribURL = comic.urls[0].url;
        const comicTitle = comic.title;
        let comicDescription = comic.description;
        if(comicDescription === null) {
            comicDescription = "No Description Available";
        }
        const comicImgPath = comic.thumbnail.path + "." + comic.thumbnail.extension;
        insertData(comicImgPath, comicTitle, comicDescription, marvelAttribURL)
        if(count === 0) {
            imgClick(array)
        }
    })

}
// Add click events to all images of events with the character in it
// When an event is clicked, a complete list of comics covering that event is displayed

function imgClick(array) {

    const comicImgClick = document.getElementsByClassName('comic-img');
        for(let i=0; i< array.length; i++) {
            comicImgClick[i].addEventListener('click', function() {
                clearRow()
                const uniqueEventID = array[i];
                const seriesURL = createSeriesURL(uniqueEventID);
                fetchSeries(seriesURL)
                count ++ 
            })
        }
}


// When image is clicked, load the series that make that event up
async function fetchSeries(seriesURL) { 
    headingDisplay("Series ", "Chosen Event");
    const response = await fetch(seriesURL);
    const json =  await response.json();
    grabComicData(json)
    return await json
}



// Functions

// Clear previous listings and data
const clearRow = function() {
    document.querySelector('.comic-row').innerHTML=" ";
}

// API Calls

const createSeriesURL =  (uniqueEventID) => {
    const seriesURL = `${URL_ENDPOINT}/events/${uniqueEventID}/series?${TIME_STAMP}&apikey=${API_KEY}&hash=${HASH_KEY}`;
    return seriesURL
}

const createEventURL =  (charID) => {
    const eventURL = `${URL_ENDPOINT}/characters/${charID}/events?${TIME_STAMP}&apikey=${API_KEY}&hash=${HASH_KEY}`;
    return eventURL
}

// Check if fetch request returns a null bio or not

const checkBioValue = function(charBio) {
    if(charBio===""){
        const charDescription = document.getElementById('charDescription').textContent = "No bio available...";
    } else{
        const charDescription = document.getElementById('charDescription').textContent = charBio;
    }
}

// Check if user doesn't enter input in the search box

function checkBlank (heroName) {
    if(heroName === "") {
        message.textContent = "Character resources could not be found...";
        spinner.style.visibility = "hidden";
    }
}

// Updates the headings to the required text

function headingDisplay(category, heroName) {
    const bio_heading = document.getElementById('bio-heading');
    const list_heading = document.getElementById('list-heading');
    const upperName = capitalizeLetter(heroName);
    bio_heading.textContent = "Character Bio";
    list_heading.textContent =  category + "Containing " + upperName;
}

// Insert listings to the page

const insertData = function (comicImgPath, comicTitle, comicDescription, marvelAttribURL) {
    const comicRow = document.querySelector('.comic-row');
    comicRow.innerHTML += `<div class="col my-col">
                    <div class="card" style="width: 18rem;">
                        <img class="comic-img hover" tabindex="0" src="${comicImgPath}" class="card-img-top" alt="an image of comics for BLANK">
                        <div class="card-body">
                        <h3 class="comic-title">${comicTitle}</h3>
                        <p class="comic-description">${comicDescription}</p>
                        <a href="${marvelAttribURL}"><div class="attribution">Data provided by Marvel. © 2014 Marvel</div></a>
                        </div>
                    </div>
                </div>`
                spinner.style.display = "none";
                message.style.display = "none";
}