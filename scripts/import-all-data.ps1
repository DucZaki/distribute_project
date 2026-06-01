# Import monolith dump into per-service MySQL databases (Docker bt-mysql on port 3307)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Dump = Join-Path $Root "scripts\Dump20260601.sql"

if (-not (Test-Path $Dump)) {
    $found = Get-ChildItem -Path "$env:USERPROFILE\OneDrive" -Recurse -Filter "Dump20260601.sql" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        Copy-Item -LiteralPath $found.FullName -Destination $Dump -Force
        Write-Host "Copied dump from $($found.FullName)"
    } else {
        throw "Dump not found. Place Dump20260601.sql in scripts\ or OneDrive\dumps\"
    }
}

$python = Get-Command python -ErrorAction SilentlyContinue
if ($python) {
    & python "$Root\scripts\import_monolith_dump.py" $Dump
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "Python not found locally; using Docker..."
    docker run --rm -v "${Root}:/work" -w /work python:3.12-alpine python scripts/import_monolith_dump.py scripts/Dump20260601.sql
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

$Gen = Join-Path $Root "scripts\generated"
$files = @(
    @{ Db = "bookingtour_identity"; File = "bookingtour_identity.sql" },
    @{ Db = "bookingtour_tour"; File = "bookingtour_tour.sql" },
    @{ Db = "bookingtour_booking"; File = "bookingtour_booking.sql" },
    @{ Db = "bookingtour_review"; File = "bookingtour_review.sql" },
    @{ Db = "bookingtour_payment"; File = "bookingtour_payment.sql" }
)

foreach ($item in $files) {
    $path = Join-Path $Gen $item.File
    $containerFile = "/tmp/$($item.File)"
    Write-Host "Importing $($item.Db) (UTF-8 via docker cp)..."
    docker cp $path "bt-mysql:${containerFile}"
    if ($LASTEXITCODE -ne 0) { throw "docker cp failed for $($item.Db)" }
    docker exec bt-mysql mysql -uroot -proot --default-character-set=utf8mb4 $item.Db -e "source ${containerFile}"
    if ($LASTEXITCODE -ne 0) { throw "Import failed for $($item.Db)" }
    docker exec bt-mysql rm -f $containerFile | Out-Null
}

Write-Host "Done. Demo users password (bcrypt): same as monolith sample users."
Write-Host "Default admin: admin@bookingtour.com / admin123"
