#!/bin/bash

# Test Suite for Production Docker Setup
# Valide la configuration avant le déploiement

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Functions
test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

test_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Header
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Docker Production Setup - Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Check Docker
echo "🐳 Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | awk '{print $3}' | sed 's/,//')
    test_pass "Docker installed: $DOCKER_VERSION"
else
    test_fail "Docker not installed"
fi

# 2. Check Docker Compose
echo ""
echo "📦 Checking Docker Compose..."
if command -v docker-compose &> /dev/null; then
    DC_VERSION=$(docker-compose --version | awk '{print $4}' | sed 's/,//')
    test_pass "Docker Compose installed: $DC_VERSION"
else
    test_fail "Docker Compose not installed"
fi

# 3. Check Docker daemon
echo ""
echo "🔧 Checking Docker daemon..."
if docker ps > /dev/null 2>&1; then
    test_pass "Docker daemon is running"
else
    test_fail "Docker daemon is not running"
fi

# 4. Check required files
echo ""
echo "📁 Checking required files..."

files=(
    "docker-compose.prod.yml"
    "backend/Dockerfile.prod"
    "frontend/Dockerfile.prod"
    ".env.prod.example"
    "nginx/nginx.conf"
    "nginx/conf.d/default.conf"
    "Makefile"
    "deploy.sh"
)

for file in "${files[@]}"; do
    if [ -f "$file" ] || [ -d "$file" ]; then
        test_pass "Found: $file"
    else
        test_fail "Missing: $file"
    fi
done

# 5. Check .env.prod
echo ""
echo "🔐 Checking environment configuration..."
if [ -f ".env.prod" ]; then
    test_pass ".env.prod exists"
    
    # Check for required variables
    required_vars=("DB_PASSWORD" "LLM_API_KEY" "ADMIN_TOKEN")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.prod; then
            value=$(grep "^$var=" .env.prod | cut -d= -f2)
            if [ -z "$value" ]; then
                test_fail "$var is not set"
            else
                test_pass "$var is configured"
            fi
        else
            test_fail "$var is missing"
        fi
    done
else
    test_info ".env.prod not found - using defaults from .env.prod.example"
fi

# 6. Check network connectivity
echo ""
echo "🌐 Checking network..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    test_pass "Internet connectivity"
else
    test_fail "No internet connectivity"
fi

# 7. Validate docker-compose file
echo ""
echo "✔️  Validating docker-compose..."
if docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1; then
    test_pass "docker-compose.prod.yml is valid"
else
    test_fail "docker-compose.prod.yml has syntax errors"
fi

# 8. Check disk space
echo ""
echo "💾 Checking disk space..."
available=$(df . | awk 'NR==2 {print $4}')
required=$((5 * 1024 * 1024))  # 5GB

if [ "$available" -gt "$required" ]; then
    available_gb=$((available / 1024 / 1024))
    test_pass "Sufficient disk space: ${available_gb}GB available"
else
    test_fail "Insufficient disk space: ${available_gb}GB (need 5GB)"
fi

# 9. Check RAM
echo ""
echo "🧠 Checking memory..."
available_mem=$(free -m | awk 'NR==2 {print $7}')
required_mem=1024  # 1GB

if [ "$available_mem" -gt "$required_mem" ]; then
    test_pass "Sufficient RAM: ${available_mem}MB available"
else
    test_fail "Insufficient RAM: ${available_mem}MB (need 1GB)"
fi

# 10. Check ports
echo ""
echo "🔌 Checking ports..."
ports=(80 443 3000 3001 5432)
for port in "${ports[@]}"; do
    if ! netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        test_pass "Port $port is available"
    else
        test_fail "Port $port is already in use"
    fi
done

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed! Ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. make deploy"
    echo "  2. make health"
    echo "  3. Open http://localhost"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed. Please fix them before deploying.${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Docker not running: sudo systemctl start docker"
    echo "  - Ports in use: sudo lsof -i :80"
    echo "  - Missing .env.prod: cp .env.prod.example .env.prod"
    echo "  - Insufficient disk space: Free up at least 5GB"
    echo ""
    exit 1
fi
