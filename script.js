// script.js atualizado com nome, data, checkbox posicionado e estilo melhorado
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

let presentes = JSON.parse(localStorage.getItem("presentes")) || [];
let recados = JSON.parse(localStorage.getItem("recados")) || [];
let notas = JSON.parse(localStorage.getItem("notas")) || {};
let diaSelecionado = null;

document.getElementById("form-presente").addEventListener("submit", function(e) {
  e.preventDefault();

  const imagemInput = document.getElementById("imagem");
  const reader = new FileReader();
  const file = imagemInput.files[0];

  reader.onloadend = function () {
    const novo = {
      quem: user,
      titulo: titulo.value,
      descricao: descricao.value,
      link: link.value,
      imagem: reader.result,
      data: new Date().toLocaleDateString(),
      ganhou: false
    };
    presentes.push(novo);
    salvar("presentes", presentes);
    renderizarPresentes();
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
  presentes.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "presente-card";
    div.innerHTML = `
      <div class="presente-topo">
        <strong>${p.quem} pediu:</strong> ${p.titulo}<br>
        <small>Publicado em: ${p.data || ""}</small>
      </div>
      <p>${p.descricao}</p>
      ${p.imagem ? `<img src="${p.imagem}" alt="Imagem do presente" />` : ""}
      ${p.link ? `<a href="${p.link}" target="_blank">Ver Link</a><br>` : ""}
      <div class="presente-footer">
        <label>
          <input type="checkbox" ${p.ganhou ? "checked" : ""} onchange="marcarRecebido(${i})" ${p.quem !== user ? "" : "disabled"}/> Recebido
        </label>
        ${p.quem === user ? `<button onclick="excluirPresente(${i})">Excluir</button>` : ""}
      </div>
    `;
    lista.appendChild(div);
  });
}

function marcarRecebido(i) {
  presentes[i].ganhou = !presentes[i].ganhou;
  salvar("presentes", presentes);
  renderizarPresentes();
}

function excluirPresente(i) {
  if (presentes[i].quem === user) {
    presentes.splice(i, 1);
    salvar("presentes", presentes);
    renderizarPresentes();
    notificar("Presente excluído!");
  }
}

document.getElementById("form-recado").addEventListener("submit", function(e) {
  e.preventDefault();
  const texto = document.getElementById("mensagem").value;
  const para = user === "Renato" ? "Pir" : "Renato";
  recados.unshift({ texto, para, data: new Date().toLocaleDateString() });
  salvar("recados", recados);
  this.reset();
  notificar("Recado enviado!");
});

function abrirRecado() {
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
}

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
  salvar("notas", notas);
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

function salvar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

gerarCalendario();
renderizarPresentes();

function logout() {
  localStorage.removeItem("usuario");
  window.location.href = "login.html";
}

