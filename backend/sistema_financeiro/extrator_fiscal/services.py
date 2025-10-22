# apps/extrator_fiscal/services.py

from .clients import GeminiClient
import json

from PyPDF2 import PdfReader

class ExtratorFiscalService:
    """
    Serviço com a lógica de negócio para extrair dados de notas fiscais.
    """
    def extrair_dados_do_pdf(self, pdf_file):
        reader = PdfReader(pdf_file)
        conteudo_texto = ""
        for page in reader.pages:
            conteudo_texto += page.extract_text()

        if not conteudo_texto:
            raise ValueError("Não foi possível extrair texto do PDF. O arquivo pode ser uma imagem.")

        gemini_client = GeminiClient()

        json_response_text = gemini_client.analisar_nota_fiscal(conteudo_texto)

        try:
            clean_json_text = json_response_text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_json_text)
        except json.JSONDecodeError:
            raise ValueError("A resposta da IA não é um JSON válido.")