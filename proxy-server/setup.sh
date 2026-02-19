#!/bin/bash

echo "🚀 Setting up Jira Proxy Server..."

# Install production dependencies
echo "📦 Installing production dependencies..."
npm install express cors dotenv axios

# Install dev dependencies
echo "🛠️  Installing development dependencies..."
npm install --save-dev typescript @types/node @types/express @types/cors ts-node nodemon @types/jest jest ts-jest

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Jira credentials"
else
    echo "✅ .env file already exists"
fi

echo "✨ Setup complete! Next steps:"
echo "1. Edit .env file with your Jira credentials"
echo "2. Run 'npm run dev' to start the development server"
