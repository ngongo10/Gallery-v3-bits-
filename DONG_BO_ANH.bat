@echo off
chcp 65001 >nul
title Dong Bo Anh Portfolio 2 Chieu

echo ========================================================
echo        DONG BO ANH PORTFOLIO (LOCAL ^<--^> CLOUDINARY)
echo ========================================================
echo.

:: 1. Chay dong bo 2 dau bang Python
python sync_two_way.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [LOI] Co loi xay ra trong qua trinh dong bo.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo [GIT] Tu dong Commit va Push len GitHub? (Y/N)
set /p PUSH_CHOICE="Chon [Y/N] (Mac dinh Y): "
if /I "%PUSH_CHOICE%"=="N" goto finish

git add .
git commit -m "feat(portfolio): auto sync images from Cloudinary"
git push origin main
echo.
echo [THANH CONG] Da cap nhat va push len GitHub!

:finish
echo.
echo ========================================================
echo Hoan tat dong bo.
echo ========================================================
pause
