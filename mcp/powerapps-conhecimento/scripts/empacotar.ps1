# Gera powerapps-conhecimento-mcp.zip pronto para levar (OneDrive, e-mail, pendrive).
# Contém só o necessário para rodar com "node dist/server.js" — sem node_modules.
$ErrorActionPreference = "Stop"
$raiz = Split-Path -Parent $PSScriptRoot
$destino = Join-Path $raiz "powerapps-conhecimento-mcp.zip"
$temp = Join-Path $env:TEMP "powerapps-conhecimento-mcp"
if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
New-Item -ItemType Directory $temp | Out-Null
foreach ($item in "dist", "conhecimento", "templates", "data", "exemplos-config", "README.md", "package.json") {
    Copy-Item (Join-Path $raiz $item) -Destination $temp -Recurse
}
if (Test-Path $destino) { Remove-Item $destino -Force }
Compress-Archive -Path (Join-Path $temp "*") -DestinationPath $destino
Remove-Item $temp -Recurse -Force
Write-Host "Pacote gerado: $destino"
