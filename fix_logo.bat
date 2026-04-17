@echo off
set "SRC=C:\Users\anura\.gemini\antigravity\brain\854be82f-59d5-474b-922c-908872d3b531\premium_ai_logo_1776458324567.png"
set "DEST_DIR=%~dp0icons"

echo Creating icons directory...
if not exist "%DEST_DIR%" mkdir "%DEST_DIR%"

echo Copying premium logos...
copy /Y "%SRC%" "%DEST_DIR%\logo128.png" >nul
copy /Y "%SRC%" "%DEST_DIR%\logo48.png" >nul
copy /Y "%SRC%" "%DEST_DIR%\logo16.png" >nul

echo ==============================================
echo SUCCESS! Premium AI Logo has been applied.
echo You can now reload your extension in Chrome!
echo ==============================================
pause
