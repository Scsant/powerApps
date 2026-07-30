$pacDll = Join-Path $PSScriptRoot "..\.tools\pac\tools\net10.0\any\pac.dll"
$pacDll = [System.IO.Path]::GetFullPath($pacDll)

if (-not (Test-Path $pacDll)) {
    Write-Error "PAC CLI nao encontrado em $pacDll"
    exit 1
}

dotnet $pacDll @args
exit $LASTEXITCODE
