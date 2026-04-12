@echo off
echo ========================================
echo 重启 Node.js 服务器
echo ========================================
echo.

echo 正在停止可能运行的服务器...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 正在启动服务器...
echo.
npm start
