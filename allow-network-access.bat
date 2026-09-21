@echo off
:: Batch script to allow inbound access on port 3000 for MesahaDesk Pro
chcp 65001 >nul
echo ======================================================================
echo   مساحة ديسك برو - فتح المنفذ 3000 في جدار الحماية (Windows Firewall)
echo   MesahaDesk Pro - Opening Port 3000 in Windows Firewall
echo ======================================================================
echo.

net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] تنبيه: يجب تشغيل هذا الملف كمسؤول (Run as administrator)
    echo [!] WARNING: Please right-click this file and select 'Run as administrator'
    echo.
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo [*] جاري إضافة قاعدة جدار الحماية...
echo [*] Adding firewall rule for TCP port 3000...
netsh advfirewall firewall delete rule name="MasahaDesk Backend Server (Port 3000)" >nul 2>&1
netsh advfirewall firewall add rule name="MasahaDesk Backend Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [✓] تم فتح المنفذ 3000 بنجاح! يمكن الآن لجميع الأجهزة في الشبكة الاتصال بالخادم.
    echo [✓] Port 3000 opened successfully! Other devices can now connect to this PC.
    echo.
    echo يمكنك الآن في الجهاز الآخر إدخال العنوان:
    echo Enter this URL in the other device:
    echo    http://192.168.1.14:3000
) else (
    echo.
    echo [X] تعذر فتح المنفذ تلقائياً.
)

echo.
pause
