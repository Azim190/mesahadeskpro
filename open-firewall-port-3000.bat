@echo off
echo ===================================================
echo   MesahaDesk Pro - Opening Firewall Port 3000
echo ===================================================
echo.
netsh advfirewall firewall add rule name="MesahaDesk Backend 3000" dir=in action=allow protocol=TCP localport=3000
echo.
if %errorlevel% equ 0 (
    echo [SUCCESS] Port 3000 has been successfully opened in Windows Firewall!
    echo [نجاح] تم فتح المنفذ 3000 في جدار الحماية بنجاح!
) else (
    echo [ERROR] Failed to open port. Please make sure you ran this script as Administrator.
    echo [خطأ] يرجى التأكد من تشغيل الملف كمسؤول (Run as administrator).
)
echo.
pause
