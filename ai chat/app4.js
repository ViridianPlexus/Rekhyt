const TOGGLE_BTN = document.getElementById("toggleBtn")
const USER_VISUALIZER = document.getElementById("userVisualizer")
const CHAT_HISTORY = document.getElementById("chatHistory")
const chatSendbtn = document.getElementById("sendBtn")

const VOICE = window.speechSynthesis

let isChatting = false;
let speechObj = null;
let stream = null
let animationId = null
let currentlySpeaking = null

const chatHistory = [{
    role: "system",
    content: "you respond in the same language as the language used in the given material. You are a professor and give long indepth responses of no less than 3 sentences and you always cite the source of your responses."
  }, {
    role: "system",
    content: "you respond in the same language that the professor speaks in. You are a bit contrarian and often disagree with the professor and even the user, you provide alternative viewpoints. also you are a bit of a grammar nazi, whenever the user makes a spelling or gramatical error, you explain their mistake"
  }]

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

let nextAIBot = "assistant";

async function startChat() {
  TOGGLE_BTN.innerText = "Stop"
  speechObj = new SpeechRecognition()
  letUserSpeak()
}

function appendContent({ role, content }) {
  chatHistory.push({ role, content })
  const contentEl = document.createElement('p')
  contentEl.innerText = content;
  contentEl.classList.add('speechBubble', role === "ai-bot2" ? "ai-bot2" : (role === "user" ? "user" : "assistant"))
  CHAT_HISTORY.append(contentEl)
}

async function letUserType() {
  currentlySpeaking = "user";
  const inputField = document.getElementById('userInput');
  const sendButton = document.getElementById('sendBtn');

  const handleUserInput = () => {
    const transcript = inputField.value.trim();
    if (transcript) {
      appendContent({ role: currentlySpeaking, content: transcript });
      inputField.value = '';
      letAISpeak();
    }
  };

  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  });

  sendButton.addEventListener('click', handleUserInput);
}

async function letAISpeak() {
    try {
      for (let i = 0; i < 2; i++) {
        currentlySpeaking = nextAIBot;
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: chatHistory.map(msg => ({
              role: msg.role === "ai-bot2" ? "assistant" : msg.role,
              content: msg.content
            }))
          }),
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          }
        });
  
        const data = await response.json();
        console.log("Raw API Response:", data);
  
        if (data.choices && data.choices[0] && data.choices[0].message) {
          const { content } = data.choices[0].message;
          appendContent({ role: currentlySpeaking, content });
        } else {
          console.error("Unexpected API response structure:", data);
          appendContent({ role: "system", content: "An error occurred while generating the AI response." });
        }
  
        nextAIBot = (nextAIBot === "assistant") ? "ai-bot2" : "assistant";
      }
      currentlySpeaking = "user";
      nextAIBot = "assistant";
    } catch (error) {
      console.error("Error in AI response:", error);
      appendContent({ role: "system", content: "An error occurred while generating the AI response." });
    }
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

TOGGLE_BTN.addEventListener("click", () => {
  isChatting = !isChatting;
  isChatting ? startChat() : stopChat()
})

chatSendbtn.addEventListener("click", () => {
  letUserType();
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    letUserType();
  }
});
