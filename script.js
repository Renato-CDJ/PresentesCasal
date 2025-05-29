
import {
  db, collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc
} from './firebase.js';

const user = localStorage.getItem("usuario");
if (!user) {
  window.location.href = "login.html";
}

document.body.classList.toggle("tema-escuro", localStorage.getItem("tema") === "escuro");

window.alternarTema = function () {
  const modoEscuro = document.body.classList.toggle("tema-escuro");
  localStorage.setItem("tema", modoEscuro ? "escuro" : "claro");
};

window.logout = function () {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
};

const overlay = document.getElementById("overlay");
const modal = document.getElementById("modal");
const modalRecado = document.getElementById("modal-recado");
const notaDia = document.getElementById("nota-dia");
const calendario = document.getElementById("calendario");
const notificacao = document.getElementById("notificacao");

let diaSelecionado = null;
let presentes = [];
let recados = [];
let notas = {};

// -------- Presentes --------
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
  await updateDoc(doc(db, "presentes", id), { ganhou: status });
};

window.excluirPresente = async function(id) {
  await deleteDoc(doc(db, "presentes", id));
  notificar("Presente excluído!");
};

// -------- Recados --------
onSnapshot(collection(db, "recados"), (snapshot) => {
  recados = snapshot.docs.map(doc => doc.data());
});

document.getElementById("form-recado").addEventListener("submit", async function(e) {
  e.preventDefault();
  const texto = document.getElementById("mensagem").value;
  const para = user === "Renato" ? "Pir" : "Renato";
  const dado = { texto, para, data: new Date().toLocaleDateString() };
  await addDoc(collection(db, "recados"), dado);
  this.reset();
  notificar("Recado enviado!");
});

window.abrirRecado = function () {
  const lista = document.getElementById("lista-recados");
  lista.innerHTML = "";
  const meus = recados.filter(r => r.para === user);
  meus.forEach(r => {
    const div = document.createElement("div");
    div.innerHTML = `<p>${r.texto}<br><small>${r.data}</small></p>`;
    lista.appendChild(div);
  });
  overlay.style.display = "block";
  modalRecado.style.display = "block";
};

// -------- Calendário --------
onSnapshot(collection(db, "notas"), (snapshot) => {
  notas = {};
  snapshot.docs.forEach(doc => notas[doc.id] = doc.data().texto);
  gerarCalendario();
});

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

window.salvarNota = async function () {
  const texto = notaDia.value;
  await updateDoc(doc(db, "notas", String(diaSelecionado)), { texto }).catch(async () => {
    await addDoc(collection(db, "notas"), { texto, id: String(diaSelecionado) });
  });
  overlay.style.display = "none";
  modal.style.display = "none";
  notificar("Nota salva!");
};

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

gerarCalendario();
