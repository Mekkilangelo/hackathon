#!/usr/bin/env bash

# Welcome Script - Production Docker Setup for Sebastian
# This script helps you get started with the production Docker configuration

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Functions
print_title() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}➜${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Main
print_title "Sebastian - Production Docker Setup"

echo "Bienvenue! Ce script vous aide à démarrer avec la configuration Docker de production."
echo ""

# Show what's new
print_step "Fichiers créés pour vous:"
echo ""
echo "📄 Documentation (7 fichiers):"
echo "   • README_DOCKER.md - Vue d'ensemble"
echo "   • QUICKSTART.md - Démarrer en 5 min"
echo "   • DOCKER_PRODUCTION.md - Guide complet"
echo "   • DOCKER_ANALYSIS.md - Analyse dev vs prod"
echo "   • HTTPS_SETUP.md - Configuration SSL/TLS"
echo "   • COMMANDS.md - Référence complète"
echo "   • FILES_CREATED.md - Liste complète"
echo ""
echo "🐳 Docker Configuration (5 fichiers):"
echo "   • docker-compose.prod.yml"
echo "   • backend/Dockerfile.prod"
echo "   • frontend/Dockerfile.prod"
echo "   • backend/.dockerignore.prod"
echo "   • frontend/.dockerignore.prod"
echo ""
echo "🛠️  Nginx Configuration (2 fichiers):"
echo "   • nginx/nginx.conf"
echo "   • nginx/conf.d/default.conf"
echo ""
echo "⚙️  Scripts & Configuration (4 fichiers):"
echo "   • Makefile - Commandes simplifiées"
echo "   • deploy.sh - Script de déploiement"
echo "   • test-setup.sh - Validation"
echo "   • .env.prod.example - Variables"
echo ""

# Check Docker
print_step "Vérification des prérequis..."
echo ""

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker installé: $DOCKER_VERSION"
else
    echo -e "${RED}✗${NC} Docker n'est pas installé"
    echo "  Téléchargez-le sur https://www.docker.com/products/docker-desktop"
    exit 1
fi

if command -v docker-compose &> /dev/null; then
    DC_VERSION=$(docker-compose --version)
    print_success "Docker Compose installé: $DC_VERSION"
else
    echo -e "${RED}✗${NC} Docker Compose n'est pas installé"
    exit 1
fi

echo ""

# Check if .env.prod exists
print_step "Vérification de la configuration..."
echo ""

if [ -f .env.prod ]; then
    print_success ".env.prod existe"
else
    print_info ".env.prod n'existe pas - création en cours..."
    cp .env.prod.example .env.prod
    print_success "Fichier créé: .env.prod"
    echo ""
    echo "⚠️  Vous DEVEZ éditer .env.prod et remplir les variables:"
    echo "   • DB_PASSWORD - Mot de passe PostgreSQL"
    echo "   • LLM_API_KEY - Clé API du provider LLM"
    echo "   • ADMIN_TOKEN - Token d'authentification admin"
    echo ""
    echo "Éditer avec:"
    echo "   nano .env.prod"
    echo ""
fi

echo ""

# Quick start options
print_title "Prochaines étapes"

echo "Option 1: Déploiement rapide (recommandé)"
echo "   $ make deploy"
echo ""
echo "Option 2: Lire le guide complet"
echo "   $ cat QUICKSTART.md"
echo ""
echo "Option 3: Exécuter les tests"
echo "   $ ./test-setup.sh"
echo ""
echo "Option 4: Voir toutes les commandes"
echo "   $ make help"
echo ""

# Suggest next step
read -p "Voulez-vous continuer? [oui/non] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_step "Édition du fichier .env.prod..."
    echo ""
    echo "Remplissez les variables obligatoires (marquées ⚠️):"
    echo ""
    nano .env.prod
    
    echo ""
    print_step "Exécution des tests..."
    ./test-setup.sh
    
    if [ $? -eq 0 ]; then
        echo ""
        print_success "Tous les tests sont passés!"
        echo ""
        
        read -p "Lancer le déploiement maintenant? [oui/non] " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            print_step "Déploiement en cours..."
            make deploy
            
            echo ""
            print_step "Vérification de la santé..."
            make health
            
            echo ""
            print_success "Déploiement terminé!"
            echo ""
            echo "Accédez à votre application sur:"
            echo "   http://localhost"
            echo ""
        fi
    fi
else
    echo ""
    print_info "À bientôt! Quand vous êtes prêt(e), lancez:"
    echo "   $ make deploy"
    echo ""
fi

echo ""
print_title "Documentation utile"

echo "📖 Guides principaux:"
echo "   • README_DOCKER.md - Vue d'ensemble complète"
echo "   • QUICKSTART.md - Démarrer en 5 minutes"
echo "   • COMMANDS.md - Toutes les commandes"
echo ""
echo "🛠️  Guides avancés:"
echo "   • DOCKER_PRODUCTION.md - Configuration complète"
echo "   • DOCKER_ANALYSIS.md - Analyse dev vs prod"
echo "   • HTTPS_SETUP.md - Configuration SSL/HTTPS"
echo ""
echo "💡 Commandes rapides:"
echo "   make deploy        - Déployer"
echo "   make health        - Vérifier l'état"
echo "   make logs          - Voir les logs"
echo "   make backup        - Sauvegarder BD"
echo "   ./deploy.sh help   - Voir toutes les options"
echo ""

print_success "Configuration Docker Production prête à l'emploi!"
echo ""
