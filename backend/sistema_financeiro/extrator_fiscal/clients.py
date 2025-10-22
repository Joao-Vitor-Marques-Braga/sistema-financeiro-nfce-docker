# apps/extrator_fiscal/clients.py

import os
import google.generativeai as genai

class GeminiClient:
    """
    Cliente para interagir com a API do Google Gemini.
    """
    def __init__(self):
        api_key = "AIzaSyA8bKUuPTuESQLRssVE4u-uLDPt8vlFCT8"
        if not api_key:
            raise ValueError("A variável de ambiente GEMINI_API_KEY não foi configurada.")
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analisar_nota_fiscal(self, conteudo_nota_fiscal: str) -> str:
        prompt = """
        Você é um especialista em processamento de notas fiscais brasileiras. Analise o texto da nota fiscal a seguir e extraia as seguintes informações obrigatórias, retornando a resposta SOMENTE em formato JSON válido:

        - [cite_start]Fornecedor[cite: 32]:
          - [cite_start]Razão Social [cite: 33]
          - [cite_start]Fantasia (se houver) [cite: 34]
          - [cite_start]CNPJ [cite: 35]
        - [cite_start]Faturado[cite: 41]:
          - [cite_start]Nome Completo [cite: 43]
          - [cite_start]CPF [cite: 43]
        - [cite_start]Número da Nota Fiscal [cite: 44]
        - [cite_start]Data de Emissão [cite: 45]
        - [cite_start]Descrição dos produtos [cite: 48] (liste os produtos em um array de strings)
        - [cite_start]Quantidade de Parcelas [cite: 50] (deve ser uma estrutura de array, mesmo que só encontre uma parcela)
        - [cite_start]Data de Vencimento [cite: 51] (coloque dentro do array de parcelas)
        - [cite_start]Valor Total [cite: 52]

        [cite_start]Além disso, interprete a lista de produtos e classifique a despesa em UMA das seguintes categorias[cite: 58]:
        - [cite_start]INSUMOS AGRÍCOLAS [cite: 60]
        - [cite_start]MANUTENÇÃO E OPERAÇÃO [cite: 63]
        - [cite_start]RECURSOS HUMANOS [cite: 69]
        - [cite_start]SERVIÇOS OPERACIONAIS [cite: 71]
        - [cite_start]INFRAESTRUTURA E UTILIDADES [cite: 85]
        - [cite_start]ADMINISTRATIVAS [cite: 91]
        - [cite_start]SEGUROS E PROTEÇÃO [cite: 94]
        - [cite_start]IMPOSTOS E TAXAS [cite: 98]
        - [cite_start]INVESTIMENTOS [cite: 100]

        A estrutura do JSON deve ser projetada para receber múltiplas parcelas e múltiplas classificações no futuro, mesmo que agora só precise preencher uma.
        Sua resposta deve ser apenas o JSON, sem nenhum texto ou explicação adicional.
        """

        response = self.model.generate_content([prompt, conteudo_nota_fiscal])
        return response.text