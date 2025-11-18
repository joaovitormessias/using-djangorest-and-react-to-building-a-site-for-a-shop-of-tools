# Loja de Ferramentas Full Stack

Aplicacao desenvolvida para atender a atividade 3 de Programacao Web II.
O backend usa Django + Django REST Framework e o frontend e uma pagina
HTML/CSS/JS servida pela propria aplicacao.

## Estrutura do projeto

- `loja_backend/loja_backend`: configuracoes globais do Django, roteamento
  e template inicial.
- `loja_backend/estoque`: app responsavel pelos modelos, serializers,
  viewsets e permissoes customizadas.
- `loja_backend/frontend`: arquivos do cliente web (template, CSS, JS).
- `db.sqlite3`: banco leve adotado em desenvolvimento.

## Como executar

1. **Criar ambiente (opcional mas recomendado)**
   ```bash
   cd loja_backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   ```
2. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```
3. **Preparar banco e usuario**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
4. **Rodar o servidor**
   ```bash
   python manage.py runserver
   ```
5. **Acessar o frontend** em `http://127.0.0.1:8000/` e realizar login
   com o usuario criado para liberar a parte de CRUD.

## Fluxo ponta a ponta

1. Visitantes carregam `/` e recebem o HTML do `frontend/index.html`,
   junto com `styles.css` e `app.js`.
2. O JavaScript executa dois GET: `/api/categorias/` e
   `/api/ferramentas/`, ambos publicos.
3. Usuarios autenticados enviam um POST para `/api-token-auth/` com
   usuario e senha. A resposta retorna o Token.
4. O token e guardado em `localStorage`. Todas as operacoes de POST, PUT,
   PATCH e DELETE enviam o cabecalho `Authorization: Token <valor>`.
5. O viewset valida o token, carrega as permissoes do usuario
   (leitura/edicao/exclusao) e executa a acao de CRUD solicitada.
6. A cada alteracao a API responde com JSON e o frontend re-renderiza as
   listas para manter tudo sincronizado.

## Explicacao por arquivo principal

- `estoque/models.py`: define `Categoria` e `Ferramenta`, com relacionamento
  `ForeignKey` e campos usados na vitrine.
- `estoque/serializers.py`: converte os modelos para JSON e expande o nome
  da categoria para ser exibido diretamente no cliente.
- `estoque/permissions.py`: cria a classe `PermissaoPorAcao`, separando
  claramente os niveis de leitura, edicao e exclusao.
- `estoque/views.py`: usa `ModelViewSet` com filtros de busca/ordenacao,
  aplica o serializer e as permissoes customizadas.
- `loja_backend/urls.py`: registra as rotas da API, endpoint de token e a
  pagina inicial do frontend.
- `frontend/index.html`: marca a estrutura da pagina web, formularios e
  template visual para as ferramentas.
- `frontend/static/css/styles.css`: responsavel pelo visual responsivo e
  pelos cards da vitrine.
- `frontend/static/js/app.js`: controla autenticacao, requisicoes para a
  API e atualizacao dinamica do DOM.

## Observacoes uteis

- As permissoes padrao do Django (`add`, `change`, `delete`) sao usadas
  para representar os tres niveis exigidos.
- O throttling anonimo limita abusos em rotas publicas.

