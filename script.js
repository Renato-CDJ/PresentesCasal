
import { db, collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from './firebase.js';

const user = localStorage.getItem("usuario");
if (!user) {
  window.location.href = "login.html";
}

document.body.classList.toggle("tema-escuro", localStorage.getItem("tema") === "escuro");

function alternarTema() {
  const modoEscuro = document.body.classList.toggle("tema-escuro");
  localStorage.setItem("tema", modoEscuro ? "escuro" : "claro");
}

const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const modalRecado = document.getElementById("modal-recado");
const notaDia = document.getElementById("nota-dia");
const calendario = document.getElementById("calendario");
const notificacao = document.getElementById("notificacao");

let presentes = [];
let diaSelecionado = null;

// 🔄 Escuta em tempo real os presentes
onSnapshot(collection(db, "presentes"), (snapshot) => {
  presentes = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
  renderizarPresentes();
});

document.getElementById("form-presente").addEventListener("submit", async function(e) {
  e.preventDefault();

  const imagemInput = document.getElementById("imagem");
  const reader = new FileReader();
  const file = imagemInput.files[0];

  reader.onloadend = async function () {
    const novo = {
      quem: user,
      titulo: titulo.value,
      descricao: descricao.value,
      link: link.value,
      imagem: reader.result,
      data: new Date().toLocaleDateString(),
      ganhou: false
    };
    await addDoc(collection(db, "presentes"), novo);
    notificar("Presente salvo!");
    e.target.reset();
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    reader.onloadend();
  }
});

function renderizarPresentes() {
  const lista = document.getElementById("lista-presentes");
  lista.innerHTML = '';
  presentes.forEach((p) => {
    const div = document.createElement("div");
    div.className = "presente-card";
    div.innerHTML = `
      <div class="presente-topo">
        <strong>${p.quem} pediu:</strong> ${p.titulo}<br>
        <small>Publicado em: ${p.data || ""}</small>
      </div>
      <p>${p.descricao}</p>
      ${p.imagem ? `<img src="${p.imagem}" alt="Imagem do presente" />` : ""}
      ${p.link ? `<a href="${p.link}" target="_blank" class="link">Ver Link</a><br>` : ""}
      <div class="presente-footer">
        <label>
          <input type="checkbox" ${p.ganhou ? "checked" : ""} onchange="marcarRecebido('${p.id}', ${!p.ganhou})" ${p.quem !== user ? "" : "disabled"}/> Recebido
        </label>
        ${p.quem === user ? `<button onclick="excluirPresente('${p.id}')">Excluir</button>` : ""}
      </div>
    `;
    lista.appendChild(div);
  });
}

window.marcarRecebido = async function(id, status) {
  const ref = doc(db, "presentes", id);
  await updateDoc(ref, { ganhou: status });
}

window.excluirPresente = async function(id) {
  const ref = doc(db, "presentes", id);
  await deleteDoc(ref);
  notificar("Presente excluído!");
}

// Temporário: recados, calendário e outros continuam com localStorage até integração
let notas = JSON.parse(localStorage.getItem("notas")) || {};
function gerarCalendario() {
  calendario.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const dia = document.createElement("div");
    dia.className = "dia";
    if (notas[i] && notas[i].trim() !== "") {
      dia.classList.add("dia-date");
    }
    dia.textContent = i;
    dia.onclick = () => abrirModal(i);
    calendario.appendChild(dia);
  }
}

function abrirModal(dia) {
  diaSelecionado = dia;
  notaDia.value = notas[dia] || "";
  overlay.style.display = "block";
  modal.style.display = "block";
}

function salvarNota() {
  notas[diaSelecionado] = notaDia.value;
  localStorage.setItem("notas", JSON.stringify(notas));
  overlay.style.display = "none";
  modal.style.display = "none";
  gerarCalendario();
  notificar("Nota salva!");
}

function notificar(texto) {
  notificacao.textContent = texto;
  notificacao.style.display = "block";
  setTimeout(() => notificacao.style.display = "none", 3000);
}

overlay.onclick = () => {
  overlay.style.display = "none";
  modal.style.display = "none";
  modalRecado.style.display = "none";
};

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

gerarCalendario();
