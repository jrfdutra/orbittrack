$ErrorActionPreference = "Stop"
$root = "C:\Users\devel\Downloads\Orbitdev\orbittrack"
$pptx = Join-Path $root "entrega\OrbitTrack_Apresentacao_Comercial.pptx"
$pdf = Join-Path $root "entrega\OrbitTrack_Apresentacao_Comercial.pdf"
$pngDir = Join-Path $root "entrega\qa-slides"

if (Test-Path $pngDir) { Remove-Item $pngDir -Recurse -Force }
New-Item -ItemType Directory -Path $pngDir | Out-Null

$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open($pptx, $true, $false, $false)
$pres.SaveAs($pdf, 32)
$pres.Export($pngDir, "PNG", 1600, 900)
$count = $pres.Slides.Count
$pres.Close()
$ppt.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($pres) | Out-Null
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ppt) | Out-Null

Write-Output "PDF=$pdf"
Write-Output "SLIDES=$count"
Get-ChildItem $pdf | Select-Object Name, Length | Format-Table -AutoSize
Get-ChildItem $pngDir | Select-Object -First 5 Name, Length | Format-Table -AutoSize
