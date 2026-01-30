@echo off
echo Обновляем сайт...
git add .
git commit -m "Update site"
git push
vercel --prod --yes
echo.
echo Готово! Сайт обновлен на https://site-chi-silk-95.vercel.app
pause
