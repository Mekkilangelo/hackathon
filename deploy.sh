#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if .env.prod exists
check_env() {
    print_header "Vérification de l'environnement"
    
    if [ ! -f .env.prod ]; then
        print_error ".env.prod not found"
        echo "Créer le fichier .env.prod avec:"
        echo "  cp .env.prod.example .env.prod"
        echo "  nano .env.prod"
        exit 1
    fi
    print_success ".env.prod found"
}

# Build images
build_images() {
    print_header "Construction des images Docker"
    docker-compose -f docker-compose.prod.yml build --no-cache
    print_success "Images construites"
}

# Start services
start_services() {
    print_header "Démarrage des services"
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Services démarrés"
}

# Stop services
stop_services() {
    print_header "Arrêt des services"
    docker-compose -f docker-compose.prod.yml down
    print_success "Services arrêtés"
}

# Show logs
show_logs() {
    print_header "Logs en temps réel"
    docker-compose -f docker-compose.prod.yml logs -f "${1:-.}"
}

# Health check
health_check() {
    print_header "Vérification de la santé des services"
    
    echo "Frontend: $(curl -s http://localhost/ > /dev/null && echo "✓" || echo "✗")"
    echo "API: $(curl -s http://localhost/api/health > /dev/null && echo "✓" || echo "✗")"
    echo "Nginx: $(curl -s http://localhost/health > /dev/null && echo "✓" || echo "✗")"
    
    docker-compose -f docker-compose.prod.yml ps
}

# Backup database
backup_db() {
    print_header "Sauvegarde de la base de données"
    
    BACKUP_FILE="backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p backups
    
    docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
        -U sebastian sebastian_db > "$BACKUP_FILE"
    
    print_success "Sauvegarde créée: $BACKUP_FILE"
}

# Restore database
restore_db() {
    if [ -z "$1" ]; then
        print_error "Usage: $0 restore <backup_file>"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        print_error "Fichier non trouvé: $1"
        exit 1
    fi
    
    print_warning "Restauration de la base de données depuis $1"
    read -p "Continuer? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.prod.yml exec -T postgres psql \
            -U sebastian sebastian_db < "$1"
        print_success "Base de données restaurée"
    fi
}

# Clean up
cleanup() {
    print_header "Nettoyage"
    
    print_warning "Ceci arrêtera les services et supprimera les conteneurs"
    read -p "Continuer? (y/n) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose -f docker-compose.prod.yml down
        docker system prune -f
        print_success "Nettoyage effectué"
    fi
}

# Restart services
restart_services() {
    print_header "Redémarrage des services"
    docker-compose -f docker-compose.prod.yml restart "${1:-.}"
    print_success "Services redémarrés"
}

# Main
case "${1:-help}" in
    build)
        check_env
        build_images
        ;;
    start)
        check_env
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    health)
        health_check
        ;;
    backup)
        backup_db
        ;;
    restore)
        restore_db "$2"
        ;;
    cleanup)
        cleanup
        ;;
    deploy)
        check_env
        build_images
        stop_services
        start_services
        sleep 10
        health_check
        ;;
    *)
        echo "Usage: $0 {command} [options]"
        echo ""
        echo "Commands:"
        echo "  build           Build Docker images"
        echo "  start           Start all services"
        echo "  stop            Stop all services"
        echo "  restart [svc]   Restart services (all if not specified)"
        echo "  logs [svc]      Show logs (all if not specified)"
        echo "  health          Health check"
        echo "  backup          Backup database"
        echo "  restore <file>  Restore database"
        echo "  cleanup         Remove all containers and volumes"
        echo "  deploy          Full deployment (build + stop + start + health check)"
        echo ""
        echo "Examples:"
        echo "  $0 deploy"
        echo "  $0 logs backend"
        echo "  $0 restart frontend"
        echo "  $0 restore backups/backup_20260424_120000.sql"
        ;;
esac
