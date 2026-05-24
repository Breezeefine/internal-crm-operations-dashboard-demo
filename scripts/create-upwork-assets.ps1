Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
$output = Join-Path $root "upwork-assets"
New-Item -ItemType Directory -Force -Path $output | Out-Null

function New-Canvas {
  param([int] $Width = 1000, [int] $Height = 750)

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#EDF1F5"))

  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Draw-Text {
  param(
    [System.Drawing.Graphics] $Graphics,
    [string] $Text,
    [int] $X,
    [int] $Y,
    [int] $Size,
    [string] $Color,
    [System.Drawing.FontStyle] $Style = [System.Drawing.FontStyle]::Regular
  )

  $font = New-Object System.Drawing.Font("Segoe UI", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($Color))
  $Graphics.DrawString($Text, $font, $brush, $X, $Y)
  $brush.Dispose()
  $font.Dispose()
}

function Draw-Pill {
  param(
    [System.Drawing.Graphics] $Graphics,
    [string] $Text,
    [int] $X,
    [int] $Y,
    [int] $Width,
    [string] $Fill,
    [string] $TextColor
  )

  $rect = New-Object System.Drawing.Rectangle($X, $Y, $Width, 34)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($Fill))
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml("#D7E0E8"), 1)
  $Graphics.FillRectangle($brush, $rect)
  $Graphics.DrawRectangle($pen, $rect)
  Draw-Text -Graphics $Graphics -Text $Text -X ($X + 13) -Y ($Y + 7) -Size 14 -Color $TextColor -Style ([System.Drawing.FontStyle]::Bold)
  $pen.Dispose()
  $brush.Dispose()
}

function Draw-FitImage {
  param(
    [System.Drawing.Graphics] $Graphics,
    [string] $Source,
    [int] $X,
    [int] $Y,
    [int] $MaxWidth,
    [int] $MaxHeight
  )

  $image = [System.Drawing.Image]::FromFile((Resolve-Path $Source))
  try {
    $scale = [Math]::Min($MaxWidth / $image.Width, $MaxHeight / $image.Height)
    $width = [int] [Math]::Round($image.Width * $scale)
    $height = [int] [Math]::Round($image.Height * $scale)
    $target = New-Object System.Drawing.Rectangle($X, $Y, $width, $height)
    $Graphics.DrawImage($image, $target)
  }
  finally {
    $image.Dispose()
  }
}

function Save-Asset {
  param(
    [System.Drawing.Bitmap] $Bitmap,
    [System.Drawing.Graphics] $Graphics,
    [string] $Path
  )

  $Graphics.Dispose()
  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $Bitmap.Dispose()
}

function New-DesktopAsset {
  param(
    [string] $Source,
    [string] $Destination,
    [string] $Title,
    [string] $Subtitle
  )

  $canvas = New-Canvas
  $g = $canvas.Graphics
  $headerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.FillRectangle($headerBrush, 0, 0, 1000, 118)
  $headerBrush.Dispose()
  Draw-Text -Graphics $g -Text $Title -X 28 -Y 24 -Size 30 -Color "#16222C" -Style ([System.Drawing.FontStyle]::Bold)
  Draw-Text -Graphics $g -Text $Subtitle -X 30 -Y 65 -Size 16 -Color "#536371"
  Draw-Pill -Graphics $g -Text "React + TypeScript" -X 642 -Y 34 -Width 154 -Fill "#F8FAFC" -TextColor "#16222C"
  Draw-Pill -Graphics $g -Text "Mock REST API" -X 812 -Y 34 -Width 130 -Fill "#F8FAFC" -TextColor "#16222C"
  Draw-FitImage -Graphics $g -Source $Source -X 18 -Y 132 -MaxWidth 964 -MaxHeight 600
  Save-Asset -Bitmap $canvas.Bitmap -Graphics $g -Path $Destination
}

function New-MobileAsset {
  param(
    [string] $Source,
    [string] $Destination
  )

  $canvas = New-Canvas
  $g = $canvas.Graphics
  $leftBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $g.FillRectangle($leftBrush, 0, 0, 1000, 750)
  $leftBrush.Dispose()

  Draw-Text -Graphics $g -Text "Responsive CRM Dashboard" -X 58 -Y 78 -Size 34 -Color "#16222C" -Style ([System.Drawing.FontStyle]::Bold)
  Draw-Text -Graphics $g -Text "A business operations tool that works across" -X 60 -Y 132 -Size 19 -Color "#45535F"
  Draw-Text -Graphics $g -Text "desktop and mobile workflows." -X 60 -Y 160 -Size 19 -Color "#45535F"
  Draw-Pill -Graphics $g -Text "Customer records" -X 60 -Y 224 -Width 154 -Fill "#E4F1FB" -TextColor "#235B80"
  Draw-Pill -Graphics $g -Text "Pipeline" -X 230 -Y 224 -Width 94 -Fill "#DCF3EB" -TextColor "#16644F"
  Draw-Pill -Graphics $g -Text "Task queue" -X 340 -Y 224 -Width 116 -Fill "#FFF0CE" -TextColor "#7A511E"
  Draw-Text -Graphics $g -Text "Real project options:" -X 60 -Y 322 -Size 20 -Color "#16222C" -Style ([System.Drawing.FontStyle]::Bold)
  Draw-Text -Graphics $g -Text "Backend API and database" -X 86 -Y 372 -Size 18 -Color "#344554"
  Draw-Text -Graphics $g -Text "Authentication and user roles" -X 86 -Y 414 -Size 18 -Color "#344554"
  Draw-Text -Graphics $g -Text "CRM, Slack, Airtable, or Sheets integration" -X 86 -Y 456 -Size 18 -Color "#344554"
  Draw-Text -Graphics $g -Text "Reporting, CSV export, and workflow automation" -X 86 -Y 498 -Size 18 -Color "#344554"

  $phoneShadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 23, 32, 38))
  $g.FillRectangle($phoneShadow, 640, 52, 324, 660)
  $phoneShadow.Dispose()
  $phoneFrame = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#152330"))
  $g.FillRectangle($phoneFrame, 625, 38, 324, 660)
  $phoneFrame.Dispose()
  Draw-FitImage -Graphics $g -Source $Source -X 637 -Y 52 -MaxWidth 300 -MaxHeight 636

  Save-Asset -Bitmap $canvas.Bitmap -Graphics $g -Path $Destination
}

New-DesktopAsset `
  -Source (Join-Path $screenshots "desktop.png") `
  -Destination (Join-Path $output "01-cover-internal-crm-dashboard.png") `
  -Title "Internal CRM & Operations Dashboard" `
  -Subtitle "Full-stack style business tool with customers, pipeline, tasks, notes, and audit log."

New-DesktopAsset `
  -Source (Join-Path $screenshots "desktop.png") `
  -Destination (Join-Path $output "02-pipeline-and-metrics.png") `
  -Title "Pipeline, Metrics, and Tasks" `
  -Subtitle "Operational dashboard for account health, pipeline value, task queue, and SLA risk."

New-DesktopAsset `
  -Source (Join-Path $screenshots "desktop.png") `
  -Destination (Join-Path $output "03-customer-records-and-detail.png") `
  -Title "Customer Records and Detail Panel" `
  -Subtitle "Searchable account table, customer status updates, task state changes, and activity history."

New-MobileAsset `
  -Source (Join-Path $screenshots "mobile.png") `
  -Destination (Join-Path $output "04-mobile-responsive-dashboard.png")

Write-Host "Created Upwork assets in $output"
