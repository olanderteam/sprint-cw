@echo off
echo Setting up Jira Proxy Server...

echo Installing production dependencies...
call npm install express cors dotenv axios

echo Installing development dependencies...
call npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon @types/jest jest ts-jest

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit .env file with your Jira credentials
) else (
    echo .env file already exists
)

echo Setup complete! Next steps:
echo 1. Edit .env file with your Jira credentials
echo 2. Run 'npm run dev' to start the development server
pause
