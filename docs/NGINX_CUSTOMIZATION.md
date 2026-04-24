# Configuration Nginx - Guide de personnalisation

## 📋 Structure actuelle

```
nginx/
├── nginx.conf           # Configuration principale
└── conf.d/
    └── default.conf     # Virtual hosts
```

## 🎯 Fichiers inclus

### `nginx.conf` - Configuration principale

```nginx
# Paramètres de performance
worker_processes auto;          # Utiliser tous les CPU cores
worker_connections 1024;        # Max connexions par worker

# Gzip compression
gzip on;
gzip_min_length 1000;           # Compresser seulement > 1KB
gzip_types text/plain ...       # Types à compresser

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;

# Upstreams (load balancing)
upstream backend { ... }
upstream frontend { ... }
```

### `conf.d/default.conf` - Virtual hosts

```nginx
# Routes API
location /api/ {
    proxy_pass http://backend;
    # Gestion des headers
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Routes Frontend
location / {
    proxy_pass http://frontend;
}

# Caching statique
location ~* \.(js|css|png|jpg) {
    add_header Cache-Control "public, max-age=2592000";
}
```

---

## 🔧 Personnalisations courantes

### 1. Changer les limites de rate limiting

**Avant:**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=30r/s;
```

**Après (plus restrictif):**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=5r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=15r/s;
```

**Après (moins restrictif):**
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=20r/s;
limit_req_zone $binary_remote_addr zone=general_limit:10m rate=50r/s;
```

### 2. Ajouter un virtual host pour un sous-domaine

Dans `conf.d/default.conf`:
```nginx
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

server {
    listen 80;
    server_name www.your-domain.com;
    
    location / {
        proxy_pass http://frontend;
        proxy_set_header Host $host;
    }
}
```

### 3. Ajouter des headers personnalisés

```nginx
add_header X-Custom-Header "value";
add_header Content-Security-Policy "default-src 'self'";
add_header Permissions-Policy "camera=(), microphone=()";
```

### 4. Configurer les timeouts

```nginx
# Dans `http` (nginx.conf)
proxy_connect_timeout 30s;
proxy_send_timeout 30s;
proxy_read_timeout 30s;

# Ou pour un location spécifique (default.conf)
location /api/ {
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

### 5. Activer HTTP/2

```nginx
server {
    listen 443 ssl http2;  # Ajouter http2
    listen 80 http2;
    # ...
}
```

### 6. Personnaliser les logs

```nginx
# Format personnalisé
log_format detailed '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    'upstream: $upstream_addr '
                    'response_time: $upstream_response_time';

# Utiliser le format
access_log /var/log/nginx/access.log detailed;
```

### 7. Redirect HTTP vers HTTPS

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 8. Bloc les bots/scrapers

```nginx
# Bloquer User-Agents spécifiques
if ($http_user_agent ~* (bot|crawler|spider)) {
    return 403;
}

# Bloquer les requêtes sans User-Agent
if ($http_user_agent = "") {
    return 403;
}
```

### 9. Ajouter du caching pour les réponses API

```nginx
location /api/data/ {
    proxy_pass http://backend;
    
    # Cacher les réponses 200
    proxy_cache_valid 200 60m;
    
    # Bypass le cache si le client demande (Cache-Control: no-cache)
    proxy_cache_bypass $http_pragma $http_authorization;
    
    # Ajouter un header pour voir si c'est un cache hit/miss
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 10. Compression personnalisée

```nginx
# Compresser aussi les fichiers plus petits
gzip on;
gzip_min_length 500;  # Au lieu de 1000

# Ajouter d'autres types
gzip_types text/plain text/css text/xml text/javascript 
            application/json application/javascript 
            application/xml+rss application/atom+xml image/svg+xml;
```

---

## 🔐 Sécurité avancée

### Headers de sécurité complets

```nginx
# Clickjacking protection
add_header X-Frame-Options "SAMEORIGIN" always;

# Prevent MIME type sniffing
add_header X-Content-Type-Options "nosniff" always;

# XSS Protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer Policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions Policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Content Security Policy (strict)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

# HSTS (si SSL)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### IP Whitelisting

```nginx
# Autoriser seulement certaines IPs
location /admin/ {
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}
```

### Authentification basique

```nginx
location /admin/ {
    auth_basic "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}
```

---

## 📊 Monitoring

### Activer le status endpoint (optionnel)

```nginx
# Dans nginx.conf (http block)
server {
    listen 8080;
    location /nginx_status {
        stub_status;
        access_log off;
    }
}
```

Alors accédez via:
```bash
curl http://localhost:8080/nginx_status
```

---

## 🧪 Test & Validation

### Tester la configuration

```bash
# Valider la syntaxe
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Voir la configuration complète
docker-compose -f docker-compose.prod.yml exec nginx nginx -T
```

### Recharger après modification

```bash
# Graceful reload (sans interruption)
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Ou redémarrer complètement
docker-compose -f docker-compose.prod.yml restart nginx
```

### Test de performance

```bash
# Benchmark simple
ab -n 1000 -c 100 http://localhost/

# Avec curl
time curl http://localhost/

# Voir les headers
curl -I http://localhost/api/health
```

---

## 📁 Exemples de configurations complètes

### Configuration minimale (default actuelle)

```nginx
server {
    listen 80;
    
    location /api/ {
        proxy_pass http://backend;
    }
    
    location / {
        proxy_pass http://frontend;
    }
}
```

### Configuration avec SSL + Redirects

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location /api/ {
        proxy_pass http://backend;
    }
    
    location / {
        proxy_pass http://frontend;
    }
}
```

### Configuration multi-domaine

```nginx
# API subdomain
server {
    listen 80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://backend;
    }
}

# Frontend
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://frontend;
    }
}

# Admin panel (sur un port différent)
server {
    listen 8080;
    
    auth_basic "Admin";
    auth_basic_user_file /etc/nginx/.htpasswd;
    
    location / {
        proxy_pass http://backend:3001;
    }
}
```

---

## 🔄 Workflow de modification

1. **Éditer le fichier**
   ```bash
   nano nginx/conf.d/default.conf
   ```

2. **Valider la syntaxe**
   ```bash
   docker-compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

3. **Recharger (graceful)**
   ```bash
   docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
   ```

4. **Tester**
   ```bash
   curl http://localhost/
   ```

5. **Vérifier les logs si besoin**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f nginx
   ```

---

## 📚 Ressources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Nginx Module Reference](https://nginx.org/en/docs/http/ngx_http_core_module.html)
- [HTTP Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [Security Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)

---

**Besoin d'aide?**
```bash
# Voir tous les fichiers Nginx
ls -la nginx/

# Voir la configuration actuelle
cat nginx/conf.d/default.conf

# Redémarrer Nginx après modification
make restart
```
