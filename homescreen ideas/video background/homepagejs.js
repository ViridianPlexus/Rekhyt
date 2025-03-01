console.log("from hopepagejs.JS")

const video = document.getElementById("videoBackground")
const sound = document.getElementById("sound");
const links = document.querySelectorAll("ul a");


const audioClick = document.getElementById("audioClick");
const audioHover = document.getElementById("audioHover");

// Function to play the startup audio
function playStartupAudio() {
    audioStart.play().catch(error => {
        console.log("Autoplay prevented or error occurred:", error);
    });
}


sound.addEventListener("click", ()=>{
    sound.classList.toggle("fa-volume-up");

    if(video.muted ===false){
        video.muted = true;

    }else {
        video.muted = false;
    }

    clickSound();

})

sound.addEventListener("mouseenter", hoverSound);

links.forEach(link => { // Use forEach for simplicity
    link.addEventListener("click", clickSound);
    link.addEventListener("mouseenter", hoverSound);
});

function clickSound(){
    audioClick.play();
}

function hoverSound(){
    audioHover.play();
}