
import { db, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from './firebase.js';

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

  const agora = new Date();
  const data = agora.toLocaleDateString();
  const hora = agora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  await addDoc(collection(db, "recados"), {
    texto, de: user, data, hora, timestamp: serverTimestamp()
  });

  input.value = "";
};

// Receber todas as mensagens entre Renato e Pir
onSnapshot(query(collection(db, "recados"), orderBy("timestamp", "asc")), snapshot => {
  const mensagens = [];
  snapshot.forEach(doc => {
    const r = doc.data();
    // Garantir que seja entre Renato e Pir apenas
    if ((r.de === "Renato" || r.de === "Pir")) {
      mensagens.push(r);
    }
  });
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
