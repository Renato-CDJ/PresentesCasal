
import { db, collection, addDoc, onSnapshot, serverTimestamp } from './firebase.js';

const user = localStorage.getItem("usuario");
if (!user) window.location.href = "login.html";

const chat = document.getElementById("chat");
const input = document.getElementById("mensagemInput");
const emojiMenu = document.getElementById("emojiMenu");
let lastEmojiTarget = null;

// Enviar mensagem
window.enviarMensagem = async function () {
  const texto = input.value.trim();
  if (!texto) return;

  const para = user === "Renato" ? "Pir" : "Renato";
  const agora = new Date();
  const data = agora.toLocaleDateString();
  const hora = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await addDoc(collection(db, "recados"), {
    texto, de: user, para, data, hora, timestamp: serverTimestamp()
  });

  input.value = "";
};

// Receber mensagens em tempo real
onSnapshot(collection(db, "recados"), snapshot => {
  const mensagens = [];
  snapshot.forEach(doc => {
    const r = doc.data();
    if ((r.para === user || r.de === user)) mensagens.push(r);
  });
  mensagens.sort((a, b) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
  renderizarMensagens(mensagens);
});

function renderizarMensagens(mensagens) {
  chat.innerHTML = "";
  mensagens.forEach(r => {
    const div = document.createElement("div");
    div.className = "message";
    div.style.alignSelf = r.de === user ? "flex-end" : "flex-start";
    div.innerHTML = `
      <div><strong>${r.de}</strong></div>
      <div>${r.texto}</div>
      <div style="font-size: 0.75rem; opacity: 0.6">${r.data} ${r.hora}</div>
    `;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

// Emojis
window.openEmojiMenu = function (event) {
  emojiMenu.style.display = "flex";
  lastEmojiTarget = input;
};

window.react = function (emoji) {
  emojiMenu.style.display = "none";
  if (lastEmojiTarget) {
    lastEmojiTarget.value += emoji;
  }
};
