"""Gera os .pa.yaml em canvas/AlmoxarifadoApp/src. Uso: python build.py <destino> [telas...]"""
import importlib
import pathlib
import shutil
import sys

HERE = pathlib.Path(__file__).parent
SCREENS = {
    "Menu": "scr_menu",
    "novaSolicitacao": "scr_nova",
    "minhasSolicitacoes": "scr_minhas",
    "filaAtendimento": "scr_fila",
    "cadastroEquipe": "scr_equipe",
    "Finalizada": "scr_finalizada",
}

dest = pathlib.Path(sys.argv[1])
wanted = sys.argv[2:] or list(SCREENS)
sys.path.insert(0, str(HERE))

shutil.copy(HERE / "App.pa.yaml", dest / "App.pa.yaml")
built = []
for name in wanted:
    try:
        yaml = importlib.import_module(SCREENS[name]).YAML
    except ModuleNotFoundError:
        # tela ainda não desenhada: stub vazio só para a navegação compilar
        yaml = f"Screens:\n  {name}:\n    Properties:\n      Fill: =corFundo\n"
    (dest / f"{name}.pa.yaml").write_text(yaml, encoding="utf-8")
    built.append(name)

order = [s for s in SCREENS if (dest / f"{s}.pa.yaml").exists()]
(dest / "_EditorState.pa.yaml").write_text(
    "EditorState:\n  ScreensOrder:\n" + "".join(f"    - {s}\n" for s in order), encoding="utf-8")
print("gerado:", ", ".join(built), "| ordem:", order)
