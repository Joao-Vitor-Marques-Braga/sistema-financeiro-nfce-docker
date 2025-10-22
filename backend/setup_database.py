#!/usr/bin/env python
"""
Script para configurar o banco de dados PostgreSQL
Execute este script após instalar o PostgreSQL
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    """Cria o banco de dados se não existir"""
    try:
        # Conecta ao PostgreSQL (banco padrão)
        conn = psycopg2.connect(
            host='localhost',
            user='postgres',
            password='postgres',
            database='postgres'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        cursor = conn.cursor()
        
        # Verifica se o banco já existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'sistema_financeiro'")
        exists = cursor.fetchone()
        
        if not exists:
            # Cria o banco de dados
            cursor.execute('CREATE DATABASE sistema_financeiro')
            print("✅ Banco de dados 'sistema_financeiro' criado com sucesso!")
        else:
            print("✅ Banco de dados 'sistema_financeiro' já existe!")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao criar banco de dados: {e}")
        print("\n📋 Instruções para configurar PostgreSQL:")
        print("1. Instale o PostgreSQL")
        print("2. Configure usuário 'postgres' com senha 'postgres'")
        print("3. Execute este script novamente")
        return False
    
    return True

if __name__ == "__main__":
    print("🚀 Configurando banco de dados PostgreSQL...")
    if create_database():
        print("\n✅ Setup concluído! Agora execute:")
        print("python manage.py migrate")
    else:
        print("\n❌ Setup falhou. Verifique as instruções acima.")
