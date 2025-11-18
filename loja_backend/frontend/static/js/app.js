const API_BASE = "/api";
const TOKEN_KEY = "loja_token";

const estado = {
  token: localStorage.getItem(TOKEN_KEY),
  categorias: [],
  editandoId: null,
};

const statusUsuarioEl = document.getElementById("statusUsuario");
const botaoLogout = document.getElementById("botaoLogout");
const listaCategoriasEl = document.getElementById("listaCategorias");
const listaFerramentasEl = document.getElementById("listaFerramentas");
const loginForm = document.getElementById("loginForm");
const ferramentaForm = document.getElementById("ferramentaForm");
const cancelarEdicaoBtn = document.getElementById("cancelarEdicao");
const camposFormulario = ferramentaForm.querySelectorAll(
  "input, textarea, select, button"
);

const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

init();

function init() {
  atualizarInterfaceAutenticacao();
  carregarCategorias();
  carregarFerramentas();
  registrarEventos();
}

function registrarEventos() {
  loginForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const username = document.getElementById("loginUsuario").value;
    const password = document.getElementById("loginSenha").value;

    try {
      const resposta = await fetch("/api-token-auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!resposta.ok) {
        throw new Error("Usuario ou senha invalidos.");
      }

      const dados = await resposta.json();
      estado.token = dados.token;
      localStorage.setItem(TOKEN_KEY, estado.token);
      mostrarStatus("Login realizado com sucesso.");
      atualizarInterfaceAutenticacao();
    } catch (erro) {
      mostrarStatus(erro.message, true);
    }
  });

  botaoLogout.addEventListener("click", () => {
    estado.token = null;
    localStorage.removeItem(TOKEN_KEY);
    limparFormulario();
    atualizarInterfaceAutenticacao();
    mostrarStatus("Sessao encerrada.");
  });

  ferramentaForm.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    if (!estado.token) {
      mostrarStatus("Faca login para salvar.", true);
      return;
    }

    const payload = coletarDadosFormulario();
    const metodo = estado.editandoId ? "PUT" : "POST";
    const endpoint = estado.editandoId
      ? `${API_BASE}/ferramentas/${estado.editandoId}/`
      : `${API_BASE}/ferramentas/`;

    try {
      const resposta = await fetch(endpoint, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${estado.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!resposta.ok) {
        throw new Error("Nao foi possivel salvar os dados.");
      }

      await resposta.json().catch(() => ({}));
      mostrarStatus("Ferramenta salva.");
      limparFormulario();
      carregarFerramentas();
    } catch (erro) {
      mostrarStatus(erro.message, true);
    }
  });

  cancelarEdicaoBtn.addEventListener("click", () => {
    limparFormulario();
  });
}

function atualizarInterfaceAutenticacao() {
  const logado = Boolean(estado.token);
  statusUsuarioEl.textContent = logado
    ? "Usuario autenticado com permissoes de escrita."
    : "Visitante navegando em modo leitura.";
  botaoLogout.classList.toggle("oculto", !logado);
  loginForm.classList.toggle("oculto", logado);
  camposFormulario.forEach((campo) => {
    campo.disabled = !logado && campo.type !== "button";
  });
}

function mostrarStatus(mensagem, erro = false) {
  statusUsuarioEl.textContent = mensagem;
  statusUsuarioEl.style.color = erro ? "#b42318" : "#16a34a";
  setTimeout(() => {
    statusUsuarioEl.style.color = "";
    atualizarInterfaceAutenticacao();
  }, 3000);
}

async function carregarCategorias() {
  try {
    const resposta = await fetch(`${API_BASE}/categorias/`);
    const dados = await resposta.json();
    estado.categorias = dados;
    renderizarCategorias();
    popularSelectCategorias();
  } catch (erro) {
    mostrarStatus("Falha ao buscar categorias.", true);
  }
}

async function carregarFerramentas() {
  try {
    const resposta = await fetch(`${API_BASE}/ferramentas/`);
    const dados = await resposta.json();
    renderizarFerramentas(dados);
  } catch (erro) {
    mostrarStatus("Falha ao buscar ferramentas.", true);
  }
}

function renderizarCategorias() {
  listaCategoriasEl.innerHTML = "";
  estado.categorias.forEach((categoria) => {
    const item = document.createElement("li");
    item.textContent = categoria.destaque
      ? `${categoria.nome} • destaque`
      : categoria.nome;
    listaCategoriasEl.appendChild(item);
  });
}

function popularSelectCategorias() {
  const select = document.getElementById("categoriaSelect");
  select.innerHTML = "";
  estado.categorias.forEach((categoria) => {
    const option = document.createElement("option");
    option.value = categoria.id;
    option.textContent = categoria.nome;
    select.appendChild(option);
  });
}

function renderizarFerramentas(ferramentas) {
  listaFerramentasEl.innerHTML = "";
  const template = document.getElementById("ferramenta-card-template");

  ferramentas.forEach((ferramenta) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".categoria").textContent = ferramenta.categoria_nome;
    clone.querySelector(".nome").textContent = ferramenta.nome;
    clone.querySelector(".marca").textContent = `Marca: ${ferramenta.marca}`;
    clone.querySelector(".preco").textContent = formatadorMoeda.format(
      ferramenta.preco
    );
    clone.querySelector(".descricao").textContent =
      ferramenta.descricao || "Sem descricao.";
    clone.querySelector(
      ".estoque"
    ).textContent = `Estoque: ${ferramenta.estoque} unidades`;
    clone
      .querySelector(".promocao")
      .textContent = ferramenta.em_promocao
        ? "Oferecida em promocao"
        : "Preco regular";
    clone.querySelector(
      ".atualizado"
    ).textContent = `Atualizado em ${new Date(
      ferramenta.atualizado_em
    ).toLocaleString("pt-BR")}`;

    const botaoEditar = clone.querySelector(".editar");
    const botaoRemover = clone.querySelector(".remover");
    const habilitarAcoes = Boolean(estado.token);
    botaoEditar.disabled = !habilitarAcoes;
    botaoRemover.disabled = !habilitarAcoes;

    botaoEditar.addEventListener("click", () => {
      preencherFormulario(ferramenta);
    });

    botaoRemover.addEventListener("click", () => {
      removerFerramenta(ferramenta.id);
    });

    listaFerramentasEl.appendChild(clone);
  });
}

function coletarDadosFormulario() {
  return {
    categoria: document.getElementById("categoriaSelect").value,
    nome: document.getElementById("ferramentaNome").value,
    marca: document.getElementById("ferramentaMarca").value,
    preco: document.getElementById("ferramentaPreco").value,
    estoque: document.getElementById("ferramentaEstoque").value,
    descricao: document.getElementById("ferramentaDescricao").value,
    em_promocao: document.getElementById("ferramentaPromocao").checked,
  };
}

function preencherFormulario(ferramenta) {
  estado.editandoId = ferramenta.id;
  document.getElementById("ferramentaId").value = ferramenta.id;
  document.getElementById("categoriaSelect").value = ferramenta.categoria;
  document.getElementById("ferramentaNome").value = ferramenta.nome;
  document.getElementById("ferramentaMarca").value = ferramenta.marca;
  document.getElementById("ferramentaPreco").value = ferramenta.preco;
  document.getElementById("ferramentaEstoque").value = ferramenta.estoque;
  document.getElementById("ferramentaDescricao").value =
    ferramenta.descricao || "";
  document.getElementById("ferramentaPromocao").checked =
    ferramenta.em_promocao;
  mostrarStatus("Edite os campos e salve a ferramenta.");
}

function limparFormulario() {
  estado.editandoId = null;
  ferramentaForm.reset();
  document.getElementById("ferramentaId").value = "";
}

async function removerFerramenta(id) {
  if (!estado.token) {
    mostrarStatus("Faca login para remover.", true);
    return;
  }

  if (!confirm("Confirmar exclusao definitiva?")) {
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/ferramentas/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${estado.token}`,
      },
    });

    if (!resposta.ok) {
      throw new Error("Nao foi possivel excluir a ferramenta.");
    }

    mostrarStatus("Ferramenta removida.");
    carregarFerramentas();
  } catch (erro) {
    mostrarStatus(erro.message, true);
  }
}
