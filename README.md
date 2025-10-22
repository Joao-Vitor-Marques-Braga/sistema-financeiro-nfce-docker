Como rodar com Docker:
1) Instale o Docker Desktop
2) Na raiz do projeto:
   - docker compose up -d --build
3) Acesse:
   - Frontend: http://localhost:5173

Serviços:
- db: Postgres 16 (host interno: db, porta 5432)
- backend: Django (usa host=db para o Postgres)
- frontend: Vite (aponta para http://localhost:8000/api/extrator)
