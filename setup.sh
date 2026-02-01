#!/bin/bash

# ========================================
# SISTEMA CONEXA v1.0
# Setup Script - Development Environment
# ========================================

set -e

echo "🚀 SISTEMA CONEXA - Setup Automation"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Docker is installed
echo -e "${BLUE}📦 Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
echo ""

# Create .env file if it doesn't exist
echo -e "${BLUE}📝 Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file from template${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your actual values${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi
echo ""

# Install dependencies
echo -e "${BLUE}📚 Installing dependencies...${NC}"

if [ -f "package.json" ]; then
    echo "Installing root dependencies..."
    npm install || pnpm install || yarn install
fi

if [ -f "server/package.json" ]; then
    echo "Installing server dependencies..."
    cd server && (npm install || pnpm install || yarn install) && cd ..
fi

if [ -f "client/package.json" ]; then
    echo "Installing client dependencies..."
    cd client && (npm install || pnpm install || yarn install) && cd ..
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Start Docker containers
echo -e "${BLUE}🐳 Starting Docker containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Docker containers started${NC}"
echo ""

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
sleep 10
echo -e "${GREEN}✓ Database ready${NC}"
echo ""

# Run Prisma migrations
echo -e "${BLUE}🗄️  Running database migrations...${NC}"
cd server
npm run prisma:generate
npm run prisma:push
cd ..
echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Seed database (optional)
echo -e "${BLUE}🌱 Seeding database...${NC}"
cd server
npm run prisma:seed || echo -e "${YELLOW}⚠️  Seed skipped or failed${NC}"
cd ..
echo ""

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env with your configuration"
echo "2. Frontend is running at: http://localhost:5173"
echo "3. Backend API is running at: http://localhost:3001"
echo "4. Database is running at: localhost:5432"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  docker-compose logs -f          # View logs"
echo "  docker-compose down             # Stop containers"
echo "  docker-compose ps               # Check container status"
echo "  npm run dev                     # Start development server"
echo ""
