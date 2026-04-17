# AI Text Detector - Icon Generator (PowerShell)
# Run this script to generate extension icons
# Usage: Right-click > "Run with PowerShell" or run in terminal: powershell -File setup-icons.ps1

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$iconsDir = Join-Path $scriptDir "icons"

Write-Host ""
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host "   AI Text Detector - Icon Generator" -ForegroundColor Cyan
Write-Host "  ========================================" -ForegroundColor Cyan
Write-Host ""

# Create icons directory
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
    Write-Host "  Created icons/ directory" -ForegroundColor Gray
}

Add-Type -AssemblyName System.Drawing

function New-ExtensionIcon {
    param([int]$Size, [string]$OutputPath)
    
    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    
    # Purple-to-blue gradient background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(124, 58, 237),
        [System.Drawing.Color]::FromArgb(59, 130, 246),
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    
    # Rounded rectangle path
    $radius = [int]($Size * 0.22)
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $gp.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
    $gp.AddArc($Size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
    $gp.AddArc($Size - $radius * 2, $Size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
    $gp.AddArc(0, $Size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
    $gp.CloseFigure()
    $g.FillPath($brush, $gp)
    
    # "AI" text centered
    $fontSize = [Math]::Max(5, [int]($Size * 0.35))
    $font = New-Object System.Drawing.Font("Segoe UI", $fontSize, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textRect = New-Object System.Drawing.RectangleF(0, 0, $Size, $Size)
    $g.DrawString("AI", $font, $textBrush, $textRect, $sf)
    
    # Save
    $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Cleanup
    $font.Dispose()
    $textBrush.Dispose()
    $brush.Dispose()
    $gp.Dispose()
    $sf.Dispose()
    $g.Dispose()
    $bmp.Dispose()
    
    Write-Host "  [OK] Created icon${Size}.png ($Size x $Size)" -ForegroundColor Green
}

try {
    New-ExtensionIcon -Size 128 -OutputPath (Join-Path $iconsDir "icon128.png")
    New-ExtensionIcon -Size 48 -OutputPath (Join-Path $iconsDir "icon48.png")
    New-ExtensionIcon -Size 16 -OutputPath (Join-Path $iconsDir "icon16.png")
    
    Write-Host ""
    Write-Host "  All icons generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Open chrome://extensions/ in Chrome" -ForegroundColor White
    Write-Host "  2. Enable 'Developer Mode' (top right)" -ForegroundColor White
    Write-Host "  3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "  4. Select this folder" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Alternative: Open 'generate-icons.html' in browser," -ForegroundColor Yellow
    Write-Host "  click 'Download All Icons', and move files to icons/ folder" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "  Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
