# Commandes utiles - Production Docker Setup

## 🚀 Déploiement rapide

### Première fois
```bash
# Préparer l'environnement
cp .env.prod.example .env.prod
nano .env.prod

# Tester la configuration
./test-setup.sh

# Déployer
make deploy

# Vérifier
make health
```

### Déploiements suivants
```bash
# Mise à jour simple
make deploy

# Ou manuellement
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Commandes Makefile

### Gestion des services
```bash
make build              # Construire les images Docker
make start              # Démarrer tous les services
make stop               # Arrêter tous les services
make restart            # Redémarrer tous les services
make deploy             # Build + Stop + Start + Health check
```

### Monitoring
```bash
make health             # Vérifier l'état de tous les services
make logs               # Afficher les logs en temps réel (tous)
make logs-backend       # Logs backend
make logs-frontend      # Logs frontend
make logs-nginx         # Logs Nginx
```

### Maintenance
```bash
make backup             # Sauvegarder la base de données
make cleanup            # Arrêter et supprimer tous les conteneurs
```

---

## 🎯 Commandes Docker Compose directes

### Status
```bash
# Voir les conteneurs en cours
docker-compose -f docker-compose.prod.yml ps

# Voir les détails d'un service
docker-compose -f docker-compose.prod.yml ps backend

# Voir les ressources utilisées
docker stats

# Voir les images construites
docker images | grep sebastian
```

### Logs
```bash
# Tous les logs
docker-compose -f docker-compose.prod.yml logs

# Logs avec pagination
docker-compose -f docker-compose.prod.yml logs --tail=50

# Logs en temps réel d'un service
docker-compose -f docker-compose.prod.yml logs -f backend

# Logs avec timestamps
docker-compose -f docker-compose.prod.yml logs -f --timestamps
```

### Gestion des services
```bash
# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Arrêter un service
docker-compose -f docker-compose.prod.yml stop frontend

# Démarrer un service
docker-compose -f docker-compose.prod.yml start postgres

# Rebuild une image
docker-compose -f docker-compose.prod.yml build --no-cache backend
```

---

## 🐛 Debugging

### Accéder à un conteneur
```bash
# Shell du backend
docker-compose -f docker-compose.prod.yml exec backend sh

# Shell de la base de données
docker-compose -f docker-compose.prod.yml exec postgres bash

# Shell de Nginx
docker-compose -f docker-compose.prod.yml exec nginx sh
```

### Vérifier les logs
```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Frontend logs
docker-compose -f docker-compose.prod.yml logs frontend

# Nginx error logs
docker exec sebastian_nginx_prod tail -f /var/log/nginx/error.log

# Nginx access logs
docker exec sebastian_nginx_prod tail -f /var/log/nginx/access.log
```

### Tester la connectivité
```bash
# Ping un service depuis un autre
docker-compose -f docker-compose.prod.yml exec backend ping frontend

# Tester l'API du backend
docker-compose -f docker-compose.prod.yml exec backend curl http://backend:3001/api/health

# Tester depuis Nginx
docker-compose -f docker-compose.prod.yml exec nginx curl http://frontend:3000
```

---

## 💾 Gestion des données

### Sauvegarde
```bash
# Backup simple
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
  -U sebastian sebastian_db > backup.sql

# Backup avec compression
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
  -U sebastian sebastian_db | gzip > backup.sql.gz

# Backup avec date
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump \
  -U sebastian sebastian_db > "backup_$(date +%Y%m%d_%H%M%S).sql"

# Utiliser le script
make backup
```

### Restauration
```bash
# Restaurer depuis un backup
docker-compose -f docker-compose.prod.yml exec -i postgres psql \
  -U sebastian sebastian_db < backup.sql

# Restaurer depuis un backup compressé
gunzip -c backup.sql.gz | \
  docker-compose -f docker-compose.prod.yml exec -i postgres psql \
  -U sebastian sebastian_db
```

### Accéder à la base de données
```bash
# Connexion interactice
docker-compose -f docker-compose.prod.yml exec postgres psql \
  -U sebastian -d sebastian_db

# Commandes utiles une fois connecté:
# \dt              - Lister les tables
# \l               - Lister les bases
# \du              - Lister les utilisateurs
# \x               - Toggle mode expansé
# SELECT * FROM users; - Requête SQL
```

---

## 🔍 Test des services

### Frontend
```bash
# Statut
curl -I http://localhost/

# Avec les headers
curl -v http://localhost/

# Mesurer le temps
curl -w "Time: %{time_total}s\n" http://localhost/

# Vérifier la compression
curl -I http://localhost/ | grep -i content-encoding
```

### API
```bash
# Health check
curl http://localhost/api/health

# Réponse formatée
curl -s http://localhost/api/health | jq .

# Avec les headers
curl -I http://localhost/api/health

# POST request
curl -X POST http://localhost/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'
```

### Nginx
```bash
# Vérifier la configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Afficher la config
docker-compose -f docker-compose.prod.yml exec nginx nginx -T

# Recharger (graceful)
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Test de rate limiting
for i in {1..20}; do curl http://localhost/api/health; done
```

---

## 📊 Performance

### Ressources
```bash
# Vue en temps réel
docker stats

# Arrêter le watch
# Ctrl+C

# Avec filtrage
docker stats backend frontend postgres

# Format personnalisé
docker stats --no-stream

# Export pour analyse
docker stats --no-stream > stats.txt
```

### Taille des images
```bash
# Taille des images
docker images | grep sebastian

# Taille d'un conteneur
docker ps -s

# Espace disque Docker
docker system df

# Nettoyer les images non utilisées
docker image prune -a
```

### Vitesse
```bash
# Benchmark frontend
ab -n 100 -c 10 http://localhost/

# Benchmark API
ab -n 100 -c 10 http://localhost/api/health

# Avec curl
time curl http://localhost/api/health
```

---

## 🔐 Sécurité

### Vérifier les ports exposés
```bash
docker-compose -f docker-compose.prod.yml ps

# Doit montrer:
# - nginx: 80:80, 443:443 (seul exposé)
# - backend: expose 3001 (pas d'exposition)
# - frontend: expose 3000 (pas d'exposition)
```

### Vérifier les utilisateurs
```bash
# Backend
docker-compose -f docker-compose.prod.yml exec backend whoami
# Résultat attendu: nodejs (pas root!)

# Frontend
docker-compose -f docker-compose.prod.yml exec frontend whoami
# Résultat attendu: nodejs
```

### Vérifier les capabilities
```bash
# Lister les capabilities
docker inspect sebastian_backend_prod | grep -A 20 "CapAdd"
docker inspect sebastian_backend_prod | grep -A 20 "CapDrop"
```

### Vérifier les networks
```bash
# Lister les networks
docker network ls

# Inspecter le network
docker network inspect sebastian_network

# Tester l'isolation
# Les services ne peuvent pas se pinguer depuis l'extérieur
```

---

## 🛠️ Script deploy.sh

```bash
# Afficher l'aide
./deploy.sh help

# Déployer complètement
./deploy.sh deploy

# Construire les images
./deploy.sh build

# Démarrer les services
./deploy.sh start

# Arrêter les services
./deploy.sh stop

# Redémarrer
./deploy.sh restart

# Voir les logs
./deploy.sh logs
./deploy.sh logs backend

# Vérifier la santé
./deploy.sh health

# Sauvegarder la BD
./deploy.sh backup

# Restaurer la BD
./deploy.sh restore backups/backup_20260424_120000.sql

# Nettoyer complètement
./deploy.sh cleanup
```

---

## 📝 Variables d'environnement

### Afficher les variables actuelles
```bash
cat .env.prod

# Ou depuis un conteneur
docker-compose -f docker-compose.prod.yml exec backend env | sort
```

### Modifier les variables
```bash
# Éditer le fichier
nano .env.prod

# Redémarrer les services pour appliquer
make restart
```

### Ajouter des variables
```bash
# Ajouter une nouvelle ligne au fichier
echo "NEW_VAR=value" >> .env.prod

# Redémarrer
make restart
```

---

## 🎓 Exemples avancés

### Build manuel avec logs détaillés
```bash
docker-compose -f docker-compose.prod.yml build --progress=plain backend
```

### Pull les images de base avant build
```bash
docker pull node:20-alpine
docker pull postgres:16-alpine
docker pull nginx:alpine
docker-compose -f docker-compose.prod.yml build
```

### Build sur une architecture spécifique
```bash
docker-compose -f docker-compose.prod.yml build \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  backend
```

### Exécuter un script dans un conteneur
```bash
# Exécuter une commande
docker-compose -f docker-compose.prod.yml exec backend npm test

# Exécuter depuis un fichier
docker-compose -f docker-compose.prod.yml exec backend bash < script.sh
```

### Copier des fichiers
```bash
# Depuis le conteneur
docker-compose -f docker-compose.prod.yml exec backend cat /app/package.json

# Vers le conteneur
docker cp file.txt sebastian_backend_prod:/app/

# Depuis le conteneur
docker cp sebastian_backend_prod:/app/logs . -r
```

---

## 🔄 Mise à jour des dépendances

### Backend
```bash
# Entrer dans le conteneur
docker-compose -f docker-compose.prod.yml exec backend sh

# À l'intérieur:
npm update
npm audit fix
npm run build

# Quitter
exit

# Redémarrer
docker-compose -f docker-compose.prod.yml restart backend
```

### Frontend
```bash
# Même processus
docker-compose -f docker-compose.prod.yml exec frontend sh

npm update
npm run build

exit

docker-compose -f docker-compose.prod.yml restart frontend
```

---

Besoin d'aide? Voir les fichiers:
- 📖 [README_DOCKER.md](./README_DOCKER.md) - Vue d'ensemble
- 🚀 [QUICKSTART.md](./QUICKSTART.md) - Démarrage rapide
- 📋 [DOCKER_PRODUCTION.md](./DOCKER_PRODUCTION.md) - Configuration complète
- 📊 [DOCKER_ANALYSIS.md](./DOCKER_ANALYSIS.md) - Analyse technique
- 🔐 [HTTPS_SETUP.md](./HTTPS_SETUP.md) - Configuration SSL/TLS
