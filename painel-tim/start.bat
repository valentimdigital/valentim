@echo off
echo Iniciando Painel TIM...

REM Iniciar todos os serviços
echo Iniciando todos os serviços...
set NODE_ENV=development
call npm start

echo.
echo Servidor iniciado com sucesso!
echo Acesse: http://localhost:3000
echo.
echo Pressione qualquer tecla para encerrar o servidor...
pause > nul

REM Encerrar os processos
taskkill /F /IM node.exe
echo Servidor encerrado. 