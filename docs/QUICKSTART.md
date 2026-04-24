# Quick Start Guide - Production Deployment

## ⚡ 5 minutes pour déployer en production

### 1️⃣ Préparation
```bash
# Clone et navigue dans le répertoire
cd /path/to/hackathon

# Crée le fichier de configuration
cp .env.prod.example .env.prod

# ✏️ Édite avec tes valeurs (voir section Secrets)
nano .env.prod
```

### 2️⃣ Déploiement
```bash
# Option A: Avec make (recommandé)
make deploy

# Option B: Avec script bash
chmod +x deploy.sh
./deploy.sh deploy

# Option C: Avec docker-compose directement
docker-compose -f docker-compose.prod.yml up -d
```

### 3️⃣ Vérification
```bash
# Vérifier la santé des services
make health

# Ou manuellement:
curl http://localhost/health  # Nginx
curl http://localhost/        # Frontend
curl http://localhost/api/health  # API
```

### 4️⃣ Logs en temps réel
```bash
make logs

# Ou un service spécifique:
make logs-backend
make logs-frontend
make logs-nginx
```

---

## 🔑 Secrets à configurer dans `.env.prod`

### Essentiels (⚠️ À remplir OBLIGATOIREMENT):
```env
DB_PASSWORD=your_secure_password_here
LLM_API_KEY=your_llm_api_key
ADMIN_TOKEN=your_admin_token
```

### Recommandés:
```env
FRONTEND_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Optionnels (garder par défaut si possible):
```env
DB_USER=sebastian
DB_NAME=sebastian_db
LLM_PROVIDER=groq
LLM_MODEL=llama-3.3-70b-versatile
ADMIN_USERNAME=admin
```

---

## 📊 Vérification post-déploiement

### Tests fonctionnels:
```bash
# Frontend accessible
curl -I http://localhost/

# API fonctionnelle
curl http://localhost/api/health

# Nginx en reverse proxy
curl -v http://localhost/
```

### Performance:
```bash
# Temps de réponse
curl -w "Response time: %{time_total}s\n" http://localhost/

# Compression gzip active
curl -I http://localhost/ | grep -i encoding
```

### État des conteneurs:
```bash
docker-compose -f docker-compose.prod.yml ps

# Ressources utilisées
docker stats
```

---

## 🔄 Commandes courantes

```bash
# Démarrer
make start

# Arrêter
make stop

# Redémarrer tout
make restart

# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart backend

# Voir les logs
make logs

# Sauvegarde BD
make backup

# Full deploy (recommandé après mise à jour)
make deploy

# Cleanup complet
docker-compose -f docker-compose.prod.yml down
docker system prune
```

---

## 🆘 Troubleshooting rapide

### Les services ne démarrent pas
```bash
# Voir les erreurs
docker-compose -f docker-compose.prod.yml logs

# Relancer en debug
docker-compose -f docker-compose.prod.yml up (sans -d pour voir les logs)
```

### Frontend retourne 502 Bad Gateway
```bash
# Vérifier que backend est running
docker-compose -f docker-compose.prod.yml ps

# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Base de données ne répond pas
```bash
# Vérifier la connexion
docker-compose -f docker-compose.prod.yml exec postgres psql -U sebastian -d sebastian_db

# Redémarrer postgres
docker-compose -f docker-compose.prod.yml restart postgres
```

### Images trop grandes
```bash
# Nettoyer les layers non utilisés
docker system prune -a

# Rebuild
make build
```

---

## 📈 Monitoring

### Ressources
```bash
# Vue en temps réel
docker stats --no-stream

# Logs structurés
docker-compose -f docker-compose.prod.yml logs --tail=50
```

### Health checks
```bash
# Vérifier tous les services
make health

# Watch continu
watch 'make health'
```

---

## 🔐 Sécurité essentielles

✅ **Fait:**
- Images multi-stage (petites et légères)
- Utilisateurs non-root
- Réseau Docker isolé
- Headers de sécurité Nginx
- Rate limiting activé

⚠️ **À faire:**
- [ ] Activer HTTPS (voir DOCKER_PRODUCTION.md)
- [ ] Configurer backups automatiques
- [ ] Mettre en place le monitoring
- [ ] Rotationner les tokens régulièrement

---

## 📚 Documentation complète

- [DOCKER_PRODUCTION.md](./DOCKER_PRODUCTION.md) - Guide complet
- [DOCKER_ANALYSIS.md](./DOCKER_ANALYSIS.md) - Analyse dev vs prod
- [nginx/nginx.conf](./nginx/nginx.conf) - Configuration Nginx
- [docker-compose.prod.yml](./docker-compose.prod.yml) - Services

---

**Prêt à déployer?**
```bash
make deploy
make health
```

Voilà! 🚀
