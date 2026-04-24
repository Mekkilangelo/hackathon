# Docker Production Setup - Sebastian

## 📋 Overview

Cette configuration Docker est optimisée pour la **production** avec :
- ✅ **Multi-stage builds** - Images légères et sécurisées
- ✅ **Nginx reverse proxy** - Gestion du trafic et cache
- ✅ **Non-root users** - Conteneurs sécurisés
- ✅ **Health checks** - Surveillance automatique
- ✅ **Compression gzip** - Performance optimisée
- ✅ **Rate limiting** - Protection contre les abus
- ✅ **Security headers** - Protection XSS, Clickjacking, etc.

## 🚀 Démarrage rapide

### 1. Préparer l'environnement

```bash
# Copier le fichier d'environnement
cp .env.prod.example .env.prod

# Remplir les valeurs confidentielles
nano .env.prod
```

### 2. Lancer les conteneurs

```bash
# Démarrer tous les services
docker-compose -f docker-compose.prod.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.prod.yml logs -f

# Vérifier la santé des services
docker-compose -f docker-compose.prod.yml ps
```

### 3. Tester la configuration

```bash
# Frontend
curl http://localhost

# API
curl http://localhost/api/health

# Nginx health
curl http://localhost/health
```

## 📊 Structure

```
├── docker-compose.prod.yml      # Configuration production
├── .env.prod.example             # Variables d'environnement
├── backend/
│   └── Dockerfile.prod          # Backend optimisé
├── frontend/
│   └── Dockerfile.prod          # Frontend optimisé
└── nginx/
    ├── nginx.conf               # Configuration nginx principale
    └── conf.d/
        └── default.conf         # Virtual host
```

## 🔒 Optimisations de sécurité

### Backend & Frontend
- ✅ Utilisateurs non-root (`nodejs:1001`)
- ✅ Multi-stage builds (aucune dépendance de dev)
- ✅ Alpine Linux (image minimale)
- ✅ dumb-init pour la gestion des signaux
- ✅ Capabilities restrictives (`CAP_DROP`)
- ✅ `no-new-privileges` activé

### Nginx
- ✅ Headers de sécurité (X-Frame-Options, CSP, etc.)
- ✅ Rate limiting par IP
- ✅ Refus des fichiers sensibles (`.env`, `~`)
- ✅ Gzip compression
- ✅ Timeouts configurés
- ✅ Buffering d'upstream

### Base de données
- ✅ Volumes persistants chiffrés
- ✅ Réseau Docker isolé
- ✅ Health checks

## 📈 Performance

### Taille des images

**Backend:**
- Avant: ~500MB (dépendances dev)
- Après: ~150-200MB (optimisé)

**Frontend:**
- Avant: ~600MB (dépendances dev)
- Après: ~100-150MB (standalone)

### Compression & Cache

```
- Gzip compression: 60-80% de réduction de taille
- Cache statique: 30 jours
- Rate limiting: 10 req/s API, 30 req/s Frontend
```

## 🔧 Configuration avancée

### SSL/HTTPS (Optional)

Pour activer HTTPS, décommenter dans `nginx/conf.d/default.conf`:

```bash
# 1. Générer certificats (Let's Encrypt)
certbot certonly -d your-domain.com

# 2. Copier dans nginx/ssl/
mkdir -p nginx/ssl
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# 3. Décommenter les blocs HTTPS dans default.conf
```

### Logs

```bash
# Backend logs
docker-compose -f docker-compose.prod.yml logs backend

# Nginx access logs
docker exec sebastian_nginx_prod tail -f /var/log/nginx/access.log

# Nginx error logs
docker exec sebastian_nginx_prod tail -f /var/log/nginx/error.log
```

### Scaling

Pour scaler le backend:

```yaml
# Dans docker-compose.prod.yml
  backend:
    deploy:
      replicas: 3
```

## 🛡️ Bonnes pratiques

### Secrets sensibles
- ❌ Ne JAMAIS commiter `.env.prod`
- ✅ Utiliser des secrets Docker/Kubernetes en production
- ✅ Rotationner les tokens régulièrement

### Mises à jour
```bash
# Mettre à jour les images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Backups
```bash
# Backup de la base de données
docker exec sebastian_postgres_prod pg_dump -U sebastian sebastian_db > backup.sql

# Restaurer
docker exec -i sebastian_postgres_prod psql -U sebastian sebastian_db < backup.sql
```

## 📝 Variables d'environnement

Voir `.env.prod.example` pour la liste complète. Les variables essentielles:

| Variable | Description | Défaut |
|----------|-------------|--------|
| `DB_PASSWORD` | Mot de passe PostgreSQL | ✅ Requis |
| `LLM_API_KEY` | Clé API du provider LLM | ✅ Requis |
| `ADMIN_TOKEN` | Token d'authentification admin | ✅ Requis |
| `FRONTEND_URL` | URL du frontend | https://your-domain.com |
| `NEXT_PUBLIC_API_URL` | URL de l'API publique | https://your-domain.com/api |

## 🐛 Dépannage

### Les conteneurs ne démarrent pas
```bash
docker-compose -f docker-compose.prod.yml logs
docker-compose -f docker-compose.prod.yml logs backend
```

### Problèmes de connexion à la base de données
```bash
docker-compose -f docker-compose.prod.yml exec postgres psql -U sebastian -d sebastian_db
```

### Nginx renvoie 502 Bad Gateway
```bash
# Vérifier les upstreams
docker-compose -f docker-compose.prod.yml exec nginx nginx -T

# Redémarrer Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## 📚 Ressources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [Node.js Production](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Dernière mise à jour:** April 2026
