param(
  [string]$Root = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'
$word = $null
$doc = $null

function Export-Docx {
  param([string]$Docx, [string]$Pdf)

  Write-Host "A abrir $([System.IO.Path]::GetFileName($Docx))"
  $script:doc = $script:word.Documents.Open($Docx, $false, $false, $false)

  # Atualizar todos os campos (TOC, numeracao de paginas) antes de guardar.
  try { $script:doc.Fields.Update() | Out-Null } catch { Write-Warning "Fields.Update: $($_.Exception.Message)" }
  try {
    if ($script:doc.TablesOfContents.Count -gt 0) {
      for ($i = 1; $i -le $script:doc.TablesOfContents.Count; $i++) {
        $script:doc.TablesOfContents.Item($i).Update()
      }
    }
  } catch { Write-Warning "TOC.Update: $($_.Exception.Message)" }

  $script:doc.Repaginate()
  $script:doc.Save()

  $pages = $script:doc.ComputeStatistics(2)
  Write-Host "Paginas: $pages"

  $script:doc.ExportAsFixedFormat($Pdf, 17) | Out-Null

  Write-Host "PDF: $Pdf"
  $script:doc.Close($false)
  $script:doc = $null
  return $pages
}

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $word.Options.UpdateFieldsAtPrint = $false

  $technicalDocx = Join-Path $Root 'entrega\OrbitTrack_Documentacao_Tecnica.docx'
  $technicalPdf = Join-Path $Root 'entrega\OrbitTrack_Documentacao_Tecnica.pdf'
  $manualDocx = Join-Path $Root 'entrega\OrbitTrack_Manual_de_Utilizador.docx'
  $manualPdf = Join-Path $Root 'entrega\OrbitTrack_Manual_de_Utilizador.pdf'

  $tPages = Export-Docx -Docx $technicalDocx -Pdf $technicalPdf
  $mPages = Export-Docx -Docx $manualDocx -Pdf $manualPdf

  Write-Output "RESUMO"
  Write-Output "Documentacao tecnica: $tPages paginas"
  Write-Output "Manual de utilizador: $mPages paginas"
}
catch {
  Write-Error $_.Exception.Message
  exit 1
}
finally {
  if ($script:doc -ne $null) {
    try { $script:doc.Close($false) } catch {}
  }
  if ($word -ne $null) {
    try { $word.Quit() } catch {}
    try { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null } catch {}
  }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}

