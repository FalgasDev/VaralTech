# VaralTech — Full Stack

React + Flask + PostgreSQL + Docker

## 🚀 Como rodar (qualquer PC com Docker)

### Pré-requisito único
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando

### Iniciar o projeto completo

```bash
docker compose up --build
```

Aguarde os containers subirem (pode levar ~1-2 min na primeira vez).

### Acessar

| Serviço    | URL                       |
|------------|---------------------------|
| Frontend   | http://localhost:3000     |
| Backend API| http://localhost:5000     |
| Banco      | localhost:5432 (postgres) |

---

## 📁 Estrutura

```
varaltech/
├── docker-compose.yml
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Loja com todos os produtos
│   │   │   ├── ProductPage.jsx   # Página do produto + carrinho
│   │   │   ├── LoginPage.jsx     # Login com OTP
│   │   │   ├── RegisterPage.jsx  # Cadastro
│   │   │   └── AdminPage.jsx     # Painel admin
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── CartDrawer.jsx    # Carrinho lateral
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   └── services/api.js
└── backend/               # Flask + SQLAlchemy
    ├── app.py
    ├── config/database.py
    ├── models/
    │   ├── user_model.py   # User com campo is_admin
    │   ├── product_model.py
    │   └── otp_model.py
    ├── controllers/
    │   ├── user_controller.py    # Auth + Admin endpoints
    │   └── product_controller.py
    └── requirements.txt
```

---

## 🔑 API Endpoints

### Autenticação
| Método | Rota          | Descrição                    |
|--------|---------------|------------------------------|
| POST   | /register     | Criar conta                  |
| POST   | /login        | Login → retorna OTP code     |
| POST   | /verify-otp   | Verificar OTP → retorna JWT  |
| GET    | /me           | Dados do usuário (JWT req.)  |

### Produtos (públicos)
| Método | Rota              | Descrição          |
|--------|-------------------|--------------------|
| GET    | /products         | Listar produtos    |
| GET    | /products/:id     | Detalhe do produto |

### Admin (JWT + is_admin=true)
| Método | Rota                                | Descrição              |
|--------|-------------------------------------|------------------------|
| GET    | /admin/stats                        | Estatísticas           |
| GET    | /admin/users                        | Listar usuários        |
| POST   | /admin/users/:id/make-admin         | Tornar admin           |
| POST   | /admin/users/:id/remove-admin       | Remover admin          |
| DELETE | /admin/users/:id                    | Deletar usuário        |
| GET    | /admin/products                     | Listar todos produtos  |
| POST   | /admin/products                     | Criar produto          |
| PUT    | /admin/products/:id                 | Editar produto         |
| DELETE | /admin/products/:id                 | Desativar produto      |

---

## 👤 Criar primeiro admin

Após rodar, registre uma conta pelo frontend e depois use psql para torná-la admin:

```bash
docker exec -it varaltech_db psql -U varaltech -d varaltech
UPDATE users SET is_admin = true WHERE email = 'seu@email.com';
\q
```

---

## 🛑 Parar o projeto

```bash
docker compose down
```

Para apagar os dados do banco também:
```bash
docker compose down -v
```
