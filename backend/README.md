# Sistema Financeiro - Backend Django

Este é o backend do sistema financeiro desenvolvido em Django com PostgreSQL.

## 🚀 Configuração Inicial

### 1. Instalar PostgreSQL

**Windows:**
- Baixe e instale o PostgreSQL: https://www.postgresql.org/download/windows/
- Durante a instalação, defina senha para usuário `postgres`

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql
```

### 2. Configurar Banco de Dados

```bash
# Instalar dependências
pip install -r requirements.txt

# Configurar banco de dados (cria automaticamente se não existir)
python setup_database.py

# Executar migrations
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser
```

### 3. Executar Servidor

```bash
python manage.py runserver
```

O servidor estará disponível em: http://localhost:8000

## 📊 Estrutura do Banco de Dados

### Modelos Implementados:

1. **Pessoas** - Clientes, Fornecedores, Faturados
2. **Classificacao** - Tipos de Receitas e Despesas
3. **MovimentoContas** - Contas a Pagar e a Receber
4. **ParcelaContas** - Parcelas dos movimentos

## 🔌 APIs Disponíveis

### Extração de Dados
- `POST /api/extract/` - Extrai dados de PDF de nota fiscal

### Consultas de Verificação
- `GET /api/fornecedores/check/?cnpj={cnpj}` - Verifica fornecedor
- `GET /api/faturados/check/?cpf={cpf}` - Verifica faturado
- `GET /api/despesas/check/?descricao={descricao}` - Verifica despesa

### Criação de Registros
- `POST /api/fornecedores/` - Cria fornecedor
- `POST /api/faturados/` - Cria faturado
- `POST /api/despesas/` - Cria despesa
- `POST /api/movimentos/` - Cria movimento (conta a pagar)

## 🛠️ Configurações

### Banco de Dados (settings.py)
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'sistema_financeiro',
        'USER': 'postgres',
        'PASSWORD': 'postgres',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

### CORS (para frontend)
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default port
    "http://127.0.0.1:5173",
]
```

## 📝 Exemplo de Uso

### 1. Extrair dados da nota fiscal:
```bash
curl -X POST http://localhost:8000/api/extract/ \
  -F "pdf_file=@nota_fiscal.pdf"
```

### 2. Verificar fornecedor:
```bash
curl "http://localhost:8000/api/fornecedores/check/?cnpj=11.111.111/0001-00"
```

### 3. Criar movimento:
```bash
curl -X POST http://localhost:8000/api/movimentos/ \
  -H "Content-Type: application/json" \
  -d '{
    "fornecedor_id": 1,
    "faturado_id": 2,
    "despesa_id": 3,
    "valor": 100.00,
    "data_vencimento": "2024-02-15",
    "observacoes": "Nota fiscal 123"
  }'
```

## 🔧 Desenvolvimento

### Criar nova migration:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Acessar Django Admin:
http://localhost:8000/admin/

### Logs de Debug:
O Django está configurado com DEBUG=True para desenvolvimento.
