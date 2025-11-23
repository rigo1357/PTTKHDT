@echo off
echo ================================
echo Smart Bus - Setup Database
echo ================================
echo.

echo Creating database schema...
psql -U postgres -d smartbus -f database/schema.sql

echo.
echo Loading sample data...
psql -U postgres -d smartbus -f database/seed.sql

echo.
echo ================================
echo Database setup complete!
echo ================================
pause
