.PHONY: help build start stop restart logs health backup restore cleanup deploy

COMPOSE := docker-compose -f docker-compose.prod.yml
COMPOSE_DEV := docker-compose

help:
	@echo "Production Docker Commands"
	@echo ""
	@echo "Usage: make [command]"
	@echo ""
	@echo "Production commands:"
	@echo "  make build           - Build production images"
	@echo "  make start           - Start all services"
	@echo "  make stop            - Stop all services"
	@echo "  make restart         - Restart all services"
	@echo "  make logs            - Show live logs"
	@echo "  make logs-backend    - Show backend logs"
	@echo "  make logs-frontend   - Show frontend logs"
	@echo "  make logs-nginx      - Show nginx logs"
	@echo "  make health          - Health check"
	@echo "  make backup          - Backup database"
	@echo "  make deploy          - Full deployment"
	@echo ""
	@echo "Development commands:"
	@echo "  make dev             - Start dev environment"
	@echo "  make dev-stop        - Stop dev environment"
	@echo ""

build:
	@echo "Building production images..."
	$(COMPOSE) build --no-cache

start:
	@echo "Starting services..."
	$(COMPOSE) up -d
	@sleep 5
	@echo "Waiting for services to be healthy..."
	@sleep 10

stop:
	@echo "Stopping services..."
	$(COMPOSE) down

restart:
	@echo "Restarting services..."
	$(COMPOSE) restart

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

logs-nginx:
	$(COMPOSE) logs -f nginx

health:
	@echo "Health check..."
	@echo ""
	@echo "Frontend:"
	@curl -s -w "HTTP Status: %{http_code}\n" http://localhost/ > /dev/null || echo "✗ Down"
	@echo ""
	@echo "API:"
	@curl -s -w "HTTP Status: %{http_code}\n" http://localhost/api/health > /dev/null || echo "✗ Down"
	@echo ""
	@echo "Nginx:"
	@curl -s -w "HTTP Status: %{http_code}\n" http://localhost/health > /dev/null || echo "✗ Down"
	@echo ""
	@echo "Container status:"
	@$(COMPOSE) ps

backup:
	@echo "Backing up database..."
	@mkdir -p backups
	@$(COMPOSE) exec -T postgres pg_dump -U sebastian sebastian_db > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup created"

deploy: build stop start health
	@echo "✓ Deployment complete"

dev:
	@echo "Starting development environment..."
	$(COMPOSE_DEV) up -d

dev-stop:
	@echo "Stopping development environment..."
	$(COMPOSE_DEV) down

dev-logs:
	$(COMPOSE_DEV) logs -f

.DEFAULT_GOAL := help
