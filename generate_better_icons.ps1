Add-Type -AssemblyName System.Drawing

$sizes = @(16, 48, 128)
$fontSizes = @{ 16=7; 48=18; 128=46 }

$baseDir = "icons"
if (-Not (Test-Path $baseDir)) {
    New-Item -ItemType Directory -Path $baseDir | Out-Null
}

foreach ($s in $sizes) {
    # 1. Create a transparent bitmap
    $bitmap = New-Object System.Drawing.Bitmap($s, $s)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    
    # Enable high-quality anti-aliasing
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # 2. Draw a deep purple circle (Matches extension UI)
    $bgColor = [System.Drawing.Color]::FromArgb(255, 124, 58, 237)
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $graphics.FillEllipse($bgBrush, 0, 0, $s, $s)

    # 3. Draw the center "AI" text beautifully scaled
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSizes[$s], [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $rect = New-Object System.Drawing.RectangleF(0, 0, $s, $s)
    
    $graphics.DrawString("AI", $font, $textBrush, $rect, $format)
    
    # 4. Save the file matching Chrome requirements
    $outPath = Join-Path $baseDir "icon$s.png"
    $bitmap.Save((Join-Path (Get-Location).Path $outPath), [System.Drawing.Imaging.ImageFormat]::Png)
    
    Write-Host "Created high-quality premium icon: $outPath" -ForegroundColor Green
    
    # Cleanup memory
    $graphics.Dispose()
    $bitmap.Dispose()
    $font.Dispose()
    $bgBrush.Dispose()
    $textBrush.Dispose()
}

Write-Host "Done! Premium icons generated successfully." -ForegroundColor Cyan
