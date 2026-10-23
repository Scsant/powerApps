"""Converte telas .pa.yaml (sincronizadas do Studio) em templates do MCP, com prefixo 'tpl' trocável.

Uso: python importar_telas.py <pasta-origem> <Tela>=<nome-template>=<NovoNomeTela>="<descrição>" [...]
Ex.: python importar_telas.py C:/sync Screen9=padrao-mestre-detalhe=tplTelaMestreDetalhe="Mestre-detalhe..."
"""
import pathlib
import re
import sys

TEMPLATES = pathlib.Path(__file__).resolve().parent.parent / "templates"


def importar(origem: pathlib.Path, tela: str, nome: str, nova_tela: str, descricao: str) -> int:
    texto = (origem / f"{tela}.pa.yaml").read_text(encoding="utf-8")
    nomes = set(re.findall(r"^\s*-\s+([A-Za-z_]\w*):\s*$", texto, re.M))
    # mais longos primeiro para não trocar "Card1" dentro de "Card10"
    for n in sorted(nomes, key=len, reverse=True):
        texto = re.sub(rf"\b{n}\b", "tpl" + n[0].upper() + n[1:], texto)
    texto = re.sub(rf"^  {tela}:", f"  {nova_tela}:", texto, flags=re.M)
    cabecalho = (f"# {descricao}\n"
                 "# Tela inteira: salve como <tela>.pa.yaml (ou obter_template com prefixo). "
                 "Troque os dados de exemplo (Table(...)) pela sua fonte.\n")
    (TEMPLATES / f"{nome}.yaml").write_text(cabecalho + texto, encoding="utf-8")
    return len(nomes)


if __name__ == "__main__":
    origem = pathlib.Path(sys.argv[1])
    for arg in sys.argv[2:]:
        tela, nome, nova_tela, descricao = arg.split("=", 3)
        print(f"{nome}: {importar(origem, tela, nome, nova_tela, descricao)} controles")
