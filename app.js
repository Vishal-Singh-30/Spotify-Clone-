// curr song  // global variable 
let currentSong = new Audio();
let currfolder; // currfolder
let songs;
// sec to min:sec format function 
function formatSeconds(seconds) {
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format seconds to always be two digits
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;

    // Return the formatted string
    return `${minutes}:${formattedSeconds}`;
}






async function getSongs(folder) {
    currfolder = folder;
    // console.log(currfolder);
    let a = await fetch(`http://localhost:8000/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            // hard code !
            // songs.push(`${element.href.slice(0,21)}/songs${element.href.slice(21)}`);
            // console.log(element.href);
            element.href = element.href.replace("0/", `0/${currfolder}/`);
            // console.log(element.href);
            // element.href = `${element.href.slice(0,21)}/songs${element.href.slice(21)}`;
            element.href = element.href.split(`/${folder}/`)[1];

            element.href = element.href.split("8000/")[1].replace(".mp3", "");
            songs.push(element.href.split("8000/")[1].replace(".mp3", ""));
        }
    }
    // console.log(songs);
    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML
            + `<li>
                <div class="logo_info">
                    <div class="music-logo">
                        <i style="color: white;" class="fa-solid fa-music"></i>
                    </div>
                    <div class="info">
                        <div>${song.replaceAll("%20", " ").replaceAll("%28", " ").replaceAll("%29", " ").replaceAll("%2C", " ")}</div>
                        <div>VS</div>
                    </div>
                </div>
                <div class="play-option">
                    <div class="play_now"> Play Now</div>
                    <div class="play_logo"><i class="fa-solid fa-play"></i></div>
                                
                </div>
        </li>`;


    }


    // attach and event listener to each song!
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", (element) => {
            // console.log(element.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })
    return songs;
}

getSongs(currfolder);

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track+ ".mp3");
    // console.log(track);
    currentSong.src = `/${currfolder}/` + track + ".mp3";
    if (!pause) {
        currentSong.play();
        play.src = "./images/pause_new.svg";
    }


    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function displayAlbum() {
    let a = await fetch(`http://localhost:8000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchros = div.getElementsByTagName("a");
    let array = Array.from(anchros)
        for(let index = 0; index < array.length; index++){
        const e = array[index];
        
        let folder_name = e.href.split("/")[3];
        // get the meta deta of the folder
        let a = await fetch(`http://localhost:8000/songs/${folder_name}/info.json`);
        let response = await a.json();
        console.log(response);
        let cardContainer = document.querySelector(".card-container");
        cardContainer.innerHTML = cardContainer.innerHTML + `
                        <div data-folder="${folder_name}" class="card">
                        <div  class="play"><i class="fa-solid fa-play"></i></div>
                        <img src="/songs/${folder_name}/cover.jpg" alt="card1_image">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>
                    `
    }

    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
        // console.log(e);
        e.addEventListener("click", async (item) => {
            console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {




    // get list of all songs
    let songs = await getSongs("songs/seedheMaut");
    playMusic(songs[1], true);

    // display all the album on the page
    displayAlbum()

    // attach event listener to play, next and previous (playbar btns)


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./images/pause_new.svg";

        } else {
            currentSong.pause();
            play.src = "./images/play_new.svg";
        }

    })


    // listen for time update event !
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = Math.floor((e.offsetX / e.target.getBoundingClientRect().width) * 100);
        let left_move = document.querySelector(".circle").style.left = `${percent}%`;
        // console.log("left move -> "+left_move);
        // console.log( "currTime before ->"+currentSong.currentTime);
        let currentTime = currentSong.duration * percent;
        // console.log("currTime break 1st ->" + currentTime);
        currentSong.currentTime = currentTime / 100;
        // console.log("currTime after -> "+ currentSong.currentTime);
    });

    //  add event listener for hamburger -> to open  
    let hamburger_open = document.querySelector(".hamburger");
    hamburger_open.addEventListener("click", () => {
        let sidebar = document.querySelector(".sidebar");
        sidebar.style.left = "0";
    })


    // event listener to close the hamburger
    let hamburger_close = document.querySelector(".close-sidebar");
    hamburger_close.addEventListener("click", () => {
        let sidebar = document.querySelector(".sidebar");
        sidebar.style.left = "-1800px";
    })


    // event  listener for prev and next button 

    // next
    let next = document.querySelector("#next");
    next.addEventListener("click", () => {
        console.log("next clicked");
        //  console.log(currentSong.src.split("/").slice(-1)[0].split(".")[0]);
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].split(".")[0]);
        // console.log(songs, index);
        console.log(index);
        console.log(songs.length);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }

    })

    // previous
    let previous = document.querySelector("#previous");
    previous.addEventListener("click", () => {
        console.log("previous clicked");

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0].split(".")[0]);
        console.log(songs, index);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    // add and event to volume
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log(e, e.target, e.target.value);
        // set volume 
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    // add event listener to mute the volume 
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        console.log(e.target);
        if(e.target.src.includes("volume_new.svg")){
            e.target.src = e.target.src.replace("volume_new.svg", "mute_new.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        }else{
            e.target.src = e.target.src.replace("mute_new.svg", "volume_new.svg");
            currentSong.volume = 0.3;
            document.querySelector(".range input").value = 30;
        }
    })
    



}





main();  
