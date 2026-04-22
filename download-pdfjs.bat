@echo off
echo ============================================
echo   Downloading PDF.js Library for Extension
echo ============================================
echo.

if not exist "lib" mkdir "lib"

echo Downloading pdf.min.js...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','lib\pdf.min.js')"

echo Downloading pdf.worker.min.js...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js','lib\pdf.worker.min.js')"

echo Downloading html2pdf.bundle.min.js...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js','lib\html2pdf.bundle.min.js')"

echo.
if exist "lib\pdf.min.js" (
    echo [SUCCESS] pdf.min.js downloaded!
) else (
    echo [ERROR] Failed to download pdf.min.js
)

if exist "lib\pdf.worker.min.js" (
    echo [SUCCESS] pdf.worker.min.js downloaded!
) else (
    echo [ERROR] Failed to download pdf.worker.min.js
)

if exist "lib\html2pdf.bundle.min.js" (
    echo [SUCCESS] html2pdf.bundle.min.js downloaded!
) else (
    echo [ERROR] Failed to download html2pdf.bundle.min.js
)

echo.
echo ============================================
echo   Done! You can close this window.
echo ============================================
pause
