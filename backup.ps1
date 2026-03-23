$date = Get-Date -Format "yyyyMMdd_HHmm"
$root = $PSScriptRoot
$backupRoot = Join-Path $root "backups"
$backupDir = Join-Path $backupRoot "backup_$date"

if (-not (Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot
}

New-Item -ItemType Directory -Path $backupDir

$itemsToCopy = @(
    "frontend\src",
    "frontend\public",
    "frontend\package.json",
    "frontend\tsconfig.json",
    "frontend\vite.config.ts",
    "frontend\index.html",
    ".agent",
    "GEMINI.md"
)

foreach ($item in $itemsToCopy) {
    $sourcePath = Join-Path $root $item
    if (Test-Path $sourcePath) {
        $destPath = Join-Path $backupDir $item
        $parentDir = Split-Path $destPath
        if (-not (Test-Path $parentDir)) {
            New-Item -ItemType Directory -Path $parentDir
        }
        Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force
        Write-Host "Copiado: $item"
    } else {
        Write-Host "Não encontrado: $item" -ForegroundColor Yellow
    }
}

Write-Host "`nBackup concluído com sucesso em: $backupDir" -ForegroundColor Green
