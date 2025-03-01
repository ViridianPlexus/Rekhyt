const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const fileContent = document.querySelector(".content_Text")

// detectText
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener("change", showFile);

function showFile() {

    const file = fileInput.files[0];

    if (!file) {
        console.error("No file selected");
        return;
    }


    const reader = new FileReader();
    if (file.type.match(/text.*/)) {
        reader.onload = function(event) {
            // fileContent.innerHTML = event.target.result;
            localStorage.setItem('myValue', event.target.result);
            fetch('../../design/pages3.html', { method: 'HEAD' })
            .then(response=>{
                if (response.ok) {
                    // If the first file exists, navigate to it
                    window.location.href = '../../design/pages3.html';
                }
                
            })
            .catch(error => {
                window.location.href = "../../rekhyt%20compiling/design/pages3.html"
            });
           
            // window.location.href = "../../design/pages3.html" || "../../rekhyt%20compiling/design/pages3.html"
           
            console.log(window.location.href)
            
            console.log("File content loaded:", event.target.result);
        }
        reader.readAsText(file);
    } else {
        fileContent.innerHTML = "<span class='error'>Please select a valid text file!</span>";
        console.error("Selected file is not a text file");
    }
}
// detectText

// Adjust the canvas size to fit the container
const container = document.querySelector('.container');
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;

// Characters to display (only "REKHYT")
const characters = "REKHYT";
const charArray = characters.split("");

// Font size and number of columns and rows
const fontSize = 26;
const columns = Math.floor(canvas.width / fontSize);
const rows = Math.floor(canvas.height / fontSize);

// Matrix to track characters on the canvas and their change times
let matrix = Array.from({ length: rows }, () => Array(columns).fill(''));
let changeTimers = Array.from({ length: rows }, () => Array(columns).fill(0)); // For individual change times
let colorMatrix = Array.from({ length: rows }, () => Array(columns).fill('#4e4d4f')); // Colors for letters

// Time interval to change letters (in milliseconds)
const minChangeTime = 2000; // Minimum time before changing a letter
const maxChangeTime = 5000; // Maximum time before changing a letter

// Central row where the word "LIBRARY" will be displayed
const centerRow = Math.floor(rows / 2);
let showLibrary = false; // Variable to control the display of "LIBRARY"
let libraryColor = "#fff"; // Initial color of "LIBRARY"

// Load thunder sounds
const thunderSounds = [
    new Audio('Assets/thunder1.mp3'),
    new Audio('Assets/thunder2.mp3'),
    new Audio('Assets/thunder3.mp3'),
    new Audio('Assets/thunder4.mp3')
];

// Function to play a random thunder sound
function playRandomThunderSound() {
    const randomIndex = Math.floor(Math.random() * thunderSounds.length);
    thunderSounds[randomIndex].play();
}

// Function to get a random character from the list
function getRandomCharacter() {
    return charArray[Math.floor(Math.random() * charArray.length)];
}

// Function to update only a percentage of letters (for more gradual change)
function updateRandomLetters() {
    // Calculate how many letters to change, about 5% of the letters on the screen
    const lettersToChange = Math.floor(columns * rows * 0.05);

    for (let i = 0; i < lettersToChange; i++) {
        const randomX = Math.floor(Math.random() * columns);
        const randomY = Math.floor(Math.random() * rows);

        // Change only if enough time has passed for that letter
        if (Date.now() > changeTimers[randomY][randomX]) {
            matrix[randomY][randomX] = getRandomCharacter();
            // Set a new random time for the next change
            changeTimers[randomY][randomX] = Date.now() + Math.random() * (maxChangeTime - minChangeTime) + minChangeTime;
        }
    }
}

// Function to search for "REKHYT" in the matrix and mark it in red
function findAndMarkREKHYT() {
    const word = "REKHYT";
    const wordLength = word.length;
    let soundPlayed = false; // Ensure the sound plays only once per update

    // Reset colorMatrix to normal letters
    colorMatrix = Array.from({ length: rows }, () => Array(columns).fill('#4e4d4f'));

    // Search adjacent neighbors (up, down, left, right)
    function searchFrom(x, y, wordIndex) {
        if (wordIndex === wordLength) {
            return true; // The entire word was found
        }
        if (x < 0 || x >= columns || y < 0 || y >= rows || matrix[y][x] !== word[wordIndex]) {
            return false; // Out of bounds or letter doesn't match
        }

        // Mark this letter in red
        colorMatrix[y][x] = '#f00';

        // Search in four adjacent directions
        const directions = [
            { dx: 1, dy: 0 },  // Right
            { dx: -1, dy: 0 }, // Left
            { dx: 0, dy: 1 },  // Down
            { dx: 0, dy: -1 }  // Up
        ];

        for (const { dx, dy } of directions) {
            const nextX = x + dx;
            const nextY = y + dy;

            // If the next letter is found in a direction, continue searching from there
            if (searchFrom(nextX, nextY, wordIndex + 1)) {
                return true;
            }
        }

        // If the word wasn't found, unmark the current letter
        colorMatrix[y][x] = '#4e4d4f';
        return false;
    }

    // Search for the word "REKHYT" starting from each position in the matrix
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            if (matrix[y][x] === word[0]) {  // Look for the first letter
                if (searchFrom(x, y, 0)) {  // If the word is found from this position
                    libraryColor = "#f00";  // Change the color of "LIBRARY" to red
                    if (!soundPlayed) {
                        playRandomThunderSound();  // Play sound if it hasn't been done yet
                        soundPlayed = true;
                    }
                    return;  // Exit the function once the word is found
                }
            }
        }
    }

    // If no instance of "REKHYT" was found, reset the color to white
    if (!soundPlayed) {
        libraryColor = "#fff";
    }
}

// Main function to draw the letters
function draw() {
    // Clear the canvas on each animation frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // White background with transparency for fade effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the characters
    ctx.font = `${fontSize}px monospace`;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            // If it's the central row and the mouse is over the canvas, show "LIBRARY"
            if (y === centerRow && showLibrary) {
                const word = "LIBRARY";
               
                const wordLength = word.length;
                const startX = Math.floor((columns - wordLength) / 2); // Calculate the starting point for centering

                if (x >= startX && x < startX + wordLength) {
                    const letter = word[x - startX];

                    // Black background behind each letter
                    ctx.fillStyle = "black";
                    ctx.fillRect(x * fontSize, y * fontSize, fontSize, fontSize);

                    // White or red text if "REKHYT" was found
                    ctx.fillStyle = libraryColor;
                    
                    ctx.font = `bold ${fontSize}px monospace`;
                    ctx.fillText(letter, x * fontSize, (y + 1) * fontSize);
                } else {
                    // Draw the rest of the letters with the corresponding color
                    ctx.fillStyle = colorMatrix[y][x]; // Letter color
                    ctx.font = `${fontSize}px monospace`; // Normal text
                    ctx.fillText(matrix[y][x], x * fontSize, (y + 1) * fontSize);
                }
            } else {
                // Draw normal letters on other rows
                ctx.fillStyle = colorMatrix[y][x]; // Letter color
                ctx.fillText(matrix[y][x], x * fontSize, (y + 1) * fontSize);
            }
        }
        
    }

    // Search and mark "REKHYT" in the matrix after each update
    findAndMarkREKHYT();
    
    // Gradually update letters
    updateRandomLetters();
}

// Initialize the matrix with random characters
function initializeMatrix() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            matrix[y][x] = getRandomCharacter();
            changeTimers[y][x] = Date.now() + Math.random() * (maxChangeTime - minChangeTime) + minChangeTime;
        }
    }
}

// Initialize the canvas and initial values
initializeMatrix();

// Set an interval to constantly repeat the drawing
setInterval(draw, 50);

// Ensure the canvas adjusts if the container size changes
window.addEventListener('resize', () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    matrix = Array.from({ length: rows }, () => Array(columns).fill(''));
    changeTimers = Array.from({ length: rows }, () => Array(columns).fill(0)); // Reset change timers
    initializeMatrix(); // Reset the matrix
});
// detect library text--
canvas.addEventListener('click', (e) => {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    const clickX = Math.floor(mouseX / fontSize);
    const clickY = Math.floor(mouseY / fontSize);
    const centerRow = Math.floor(rows / 2);
    const word = "LIBRARY";
    const startX = Math.floor((columns - word.length) / 2);

    if (clickY === centerRow && clickX >= startX && clickX < startX + word.length) {
        fileInput.click(); // Trigger file input click
    }
});
// detect library text--
// Show "LIBRARY" when the mouse is over the canvas
canvas.addEventListener('mouseenter', () => {
    showLibrary = true;
});

// Hide "LIBRARY" when the mouse leaves the canvas
canvas.addEventListener('mouseleave', () => {
    showLibrary = false;
});