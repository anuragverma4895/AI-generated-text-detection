@echo off
echo ============================================
echo   AI Text Detector - Icon Generator
echo ============================================
echo.

:: Create icons directory if it doesn't exist
if not exist "icons" mkdir icons

:: Generate icons using PowerShell + System.Drawing
powershell -ExecutionPolicy Bypass -Command ^
  "Add-Type -AssemblyName System.Drawing; ^
  function New-Icon([int]$sz, [string]$out) { ^
    $bmp = New-Object System.Drawing.Bitmap($sz, $sz); ^
    $g = [System.Drawing.Graphics]::FromImage($bmp); ^
    $g.SmoothingMode = 'AntiAlias'; ^
    $g.Clear([System.Drawing.Color]::FromArgb(124, 58, 237)); ^
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush( ^
      (New-Object System.Drawing.Point(0,0)), ^
      (New-Object System.Drawing.Point($sz,$sz)), ^
      [System.Drawing.Color]::FromArgb(124,58,237), ^
      [System.Drawing.Color]::FromArgb(59,130,246) ^
    ); ^
    $g.FillRectangle($brush, 0, 0, $sz, $sz); ^
    $fs = [Math]::Max(6, [int]($sz * 0.4)); ^
    $font = New-Object System.Drawing.Font('Segoe UI', $fs, [System.Drawing.FontStyle]::Bold); ^
    $sf = New-Object System.Drawing.StringFormat; ^
    $sf.Alignment = 'Center'; ^
    $sf.LineAlignment = 'Center'; ^
    $g.DrawString('AI', $font, [System.Drawing.Brushes]::White, ^
      (New-Object System.Drawing.RectangleF(0,0,$sz,$sz)), $sf); ^
    $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png); ^
    $g.Dispose(); $bmp.Dispose(); ^
    Write-Host \"  Created: $out\" ^
  }; ^
  New-Icon 128 'icons\icon128.png'; ^
  New-Icon 48 'icons\icon48.png'; ^
  New-Icon 16 'icons\icon16.png'; ^
  Write-Host ''; Write-Host '  All icons generated successfully!' -ForegroundColor Green"

echo.
echo ============================================
echo   Done! You can now load the extension.
echo ============================================
echo.
pause
