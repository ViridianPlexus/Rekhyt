const TOGGLE_BTN = document.getElementById("toggleBtn")
const USER_VISUALIZER = document.getElementById("userVisualizer")
const CHAT_HISTORY = document.getElementById("chatHistory")
const chatSendbtn = document.getElementById("sendBtn")

const VOICE = window.speechSynthesis

let isChatting = false;
let speechObj = null;
// let context = new AudioContext();
let stream = null
let animationId = null
let currentlySpeaking = null

const chatHistory = [{
  role: "system",
  //edit here
  content: "You are a professor and give long indepth responses of no less than 3 sentences and you always cite the source of your responses."
}]

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition // SpeechRecognition | undefined

//this is called secondly after the button click from the user

//keep the start stop functionality but the submit button becomes the start and the stop button will be in the lower right hand corner


async function startChat() {
  TOGGLE_BTN.innerText = "Stop"
  speechObj = new SpeechRecognition()
  letUserSpeak()
}




// function stopChat() {
//   if (currentlySpeaking === "user") stopUserRecording()
//   if (VOICE.speaking) VOICE.cancel()
//   currentlySpeaking = null
//   speechObj = null
//   TOGGLE_BTN.innerText = "Start"
// }

function appendContent({ role, content }) {
  chatHistory.push({ role, content })
  const contentEl = document.createElement('p')
  contentEl.innerText = content;
  contentEl.classList.add('speechBubble', role)
  CHAT_HISTORY.append(contentEl)
}

// async function letUserSpeak() {
//   currentlySpeaking = "user"
//   const newStream = await navigator.mediaDevices.getUserMedia({
//     audio: true,
//   })
//   stream = newStream
//   const source = context.createMediaStreamSource(newStream)
//   const analyzer = context.createAnalyser()
//   source.connect(analyzer)
//   animationId = updateUserBubble(analyzer)
  
//   speechObj.start()
//   speechObj.onresult = function transcribe(e) { // e: SpeechRecognitionEvent
//     const { transcript } = e.results[0][0] // string
//     appendContent({ role: currentlySpeaking, content: transcript })
//     stopUserRecording()
//     letAISpeak()
//   }
// }

async function letUserType() {
  
  currentlySpeaking = "user"; // Set the role to user
  const inputField = document.getElementById('userInput'); // Input field for typing
  const sendButton = document.getElementById('sendBtn'); // Send button

  // Function to handle the user's input
  const handleUserInput = () => {
    const transcript = inputField.value.trim()  // Get the input value and trim whitespace
    console.log(transcript)
    if (transcript) {
      appendContent({ role: currentlySpeaking, content: transcript }); // Append the typed content
      inputField.value = ''; // Clear the input field after submitting
      // stopUserRecording(); // You can adjust this for typing if necessary
      letAISpeak(); // Proceed with AI's response
    }
  };

  // Add event listener to handle the 'Enter' key
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUserInput(); // Process the input when the user presses 'Enter'
    }
  });

  // Add event listener to handle the 'Send' button
  sendButton.addEventListener('click', handleUserInput);
}


async function letAISpeak() {
  currentlySpeaking = "assistant"
  const response = await (await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: chatHistory
    }),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    }
  })).json()
  const { content } = response.choices[0].message
  appendContent({ role: currentlySpeaking, content })

  // const spokenResponse = new SpeechSynthesisUtterance(content)
  // spokenResponse.onend = () => letUserSpeak()
  // VOICE.speak(spokenResponse)
}

function updateUserBubble(analyzer) {
  const fbcArray = new Uint8Array(analyzer.frequencyBinCount)
  analyzer.getByteFrequencyData(fbcArray)
  const level = fbcArray.reduce((accum, val) => accum + val, 0) / fbcArray.length

  USER_VISUALIZER.style.transform = `scale(${level / 10})`
  
  animationId = requestAnimationFrame(() => updateUserBubble(analyzer))
}

function stopUserRecording() {
  cancelAnimationFrame(animationId)
  animationId = null
  stream.getTracks().forEach(s => s.stop())
  stream = null
  USER_VISUALIZER.style.transform = 'scale(0)'
}


//first to execute, responds to user input click
// TOGGLE_BTN.addEventListener("click", () => {
//   isChatting = !isChatting;
//   isChatting ? startChat() : stopChat()
// })


chatSendbtn.addEventListener("click", () => {
  letUserType();
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    letUserType();   // Process the input when the user presses 'Enter'
  }
});


///start read text with highlight 


const sentence = localStorage.getItem("myValue")  // Text to be read aloud
const words = sentence.split(" ");  // Split the sentence into individual words
let utterance;  // SpeechSynthesisUtterance instance
let synth = window.speechSynthesis;  // Access to speechSynthesis API
let wordIndex = 0;  // Index to keep track of current word being spoken
let isPlaying = false;  // Boolean to track play state

// Display the words in the container
// function displayWords() {
//     const wordContainer = document.getElementById("word-container");
//     wordContainer.innerHTML = "";  // Clear previous words

//     words.forEach(word => {
//         const wordElement = document.createElement("span");
//         wordElement.className = "word";
//         wordElement.textContent = word;
//         wordContainer.appendChild(wordElement);
      
//     });
// }
function displayWords() {
  const wordContainer = document.querySelector("#word-container");
  const prevSlideArrow = document.getElementById('prevArrow');
const nextSlideArrow = document.getElementById('nextArrow');
let currentChunkIndex = 0;

// Initialize by showing the first chunk


  wordContainer.innerHTML = "";  // Clear previous content
let textChunks = 0
  const wordsPerDiv = 500;  // Number of words per div
  let currentDiv = document.createElement("div");  // Create the first div
  currentDiv.className = "word-group";  // Add a class for styling, if needed
  function showChunk(index) {
      wordContainer.style.transform = `translateX(-${index * 100}%)`;
    }
  words.forEach((word, i) => {
      const wordElement = document.createElement("span");
      wordElement.className = "word";  // Add class for each word
      wordElement.textContent = word;  // Set the word text

      currentDiv.appendChild(wordElement);  // Append the word to the current div

      // After every 500 words, append the current div to the container and create a new one
      if ((i + 1) % wordsPerDiv === 0) {
          textChunks++
          wordContainer.appendChild(currentDiv);  // Append the current div to the word container
          currentDiv = document.createElement("div");  // Create a new div for the next 500 words
          currentDiv.className = "word-group";  // Add the same class to the new div
      }
      
  });

  // Append the last div if it contains words
  if (currentDiv.childNodes.length > 0) {
      wordContainer.appendChild(currentDiv);
  }
  showChunk(currentChunkIndex);

  // Navigate to the previous chunk
  prevArrow.addEventListener('click', () => {
      if (currentChunkIndex > 0) {
          currentChunkIndex--;
          showChunk(currentChunkIndex);
      }
  });
  
  // Navigate to the next chunk
  nextArrow.addEventListener('click', () => {
      if (currentChunkIndex < textChunks) {
          currentChunkIndex++;
          showChunk(currentChunkIndex);
      }
  });
}
// Function to play or resume speech
function playSpeech() {
    if (!isPlaying) {
        startSpeaking(wordIndex);  // Start speech from the current word
        isPlaying = true;
        document.getElementById("playPauseIcon").className = "fa fa-pause";  // Update icon to pause
    } else {
        pauseSpeech();  // Pause if already playing
    }
}

// Function to pause speech
function pauseSpeech() {
    synth.pause();
    isPlaying = false;
    document.getElementById("playPauseIcon").className = "fa fa-play";  // Update icon to play
}

// Function to start speech synthesis and synchronize highlighting
function startSpeaking(startIndex) {
  if (!synth.speaking) {
    console.log("object")
    synth.cancel();  // Cancel any ongoing speech
      }
      else{
          synth.cancel();
      }
    wordIndex = startIndex;  // Set the word index to start speaking from

    // Create an utterance from the current word to the end
    utterance = new SpeechSynthesisUtterance(words.slice(wordIndex).join(" "));  

    utterance.onboundary = (event) => {
        if (event.name === "word") {
            const wordElements = document.getElementsByClassName("word");

            // Clear previous highlights
            if (wordIndex > 0) {
                wordElements[wordIndex - 1].classList.remove("highlight");  // Remove highlight from the previous word
                
            }
            if (wordIndex < wordElements.length) {
                wordElements[wordIndex].classList.add("highlight");  // Highlight the current word
                wordIndex++;
               
            }
        }
    };

    // Reset the word index when speech ends
    utterance.onend = () => {
        resetSpeech();  // Reset speech and highlighting
    };

    // Speak the utterance
    synth.speak(utterance);
}

// Reset the speech and text highlighting
function resetSpeech() {
    synth.cancel();  // Stop any current speech
    const wordElements = document.getElementsByClassName("word");
    for (let i = 0; i < wordElements.length; i++) {
        wordElements[i].classList.remove("highlight");  // Remove highlighting from all words
    }
    wordIndex = 0;
    isPlaying = false;
    document.getElementById("playPauseIcon").className = "fa fa-play";  // Reset play icon
}

// Move to the next word (Forward Button)
function moveForward() {
    if (wordIndex < words.length - 1) {
        wordIndex++;
        highlightWord();  // Highlight the new current word
        if (isPlaying) {
            startSpeaking(wordIndex);  // Continue speaking from the new word index
        }
    }
}

// Move to the previous word (Backward Button)
function moveBackward() {
    if (wordIndex > 0) {
        wordIndex--;
        highlightWord();  // Highlight the previous word
        if (isPlaying) {
            startSpeaking(wordIndex -1);  // Continue speaking from the new word index
        }
    }
}

// Highlight a specific word based on wordIndex
function highlightWord() {
    const wordElements = document.getElementsByClassName("word");
    for (let i = 0; i < wordElements.length; i++) {
        wordElements[i].classList.remove("highlight");  // Clear previous highlights
    }
    if (wordIndex < wordElements.length) {
        wordElements[wordIndex].classList.add("highlight");  // Highlight the current word
    }
}

// Event listeners for Play/Pause, Forward, and Backward buttons
document.getElementById("playPauseBtn").addEventListener("click", playSpeech);
document.getElementById("forwardBtn").addEventListener("click", moveForward);
document.getElementById("backwardBtn").addEventListener("click", moveBackward);

// Display words when the page loads
window.onload = function() {
    displayWords();
};

// 


// select work 



document.oncontextmenu =  (event) => {
  event.preventDefault();
  let selectedText = ""
  const activeEl = document.activeElement;
  const activeElTagName = activeEl ? activeEl.tagName.toLowerCase() : null;
      console.log(activeElTagName)
  if (
  (activeElTagName == "textarea") || (activeElTagName == "input" &&
  /^(?:text|search|password|tel|url)$/i.test(activeEl.type)) &&
  (typeof activeEl.selectionStart == "number")
  ) {
    selectedText = activeEl.value.slice(activeEl.selectionStart, activeEl.selectionEnd);
     
  } else if (window.getSelection) {
    selectedText = window.getSelection().toString();
  }
  if (selectedText) {
    selectedText = selectedText.replace(/[\r\n]+/g, " ").trim();
    
    // document.getElementById("userInput").value = selectedText;
    currentlySpeaking = "user"; // Set the role to user
    appendContent({ role: currentlySpeaking, content: selectedText}); // Append the typed content
    letAISpeak(); // Proceed with AI's response
    // Automatically send to AI after selection
}
  
}

document.getElementById("chat_history").addEventListener("click", () => {
  const aiChatContainer = document.getElementById("chatHistory").innerHTML.trim();
  console.log(aiChatContainer.length)
  const blob = new Blob([aiChatContainer], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "ai-chat-history.txt";
  link.click();
});