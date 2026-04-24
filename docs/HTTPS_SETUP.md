# Configuration HTTPS / SSL

## 🔐 Activer HTTPS avec Let's Encrypt

### Prérequis
- Domaine valide pointant vers votre serveur
- Port 80 accessible (pour la validation)
- Nginx déjà en cours d'exécution

### Étapes

#### 1. Installer Certbot
```bash
# Sur Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# Sur Alpine (dans le conteneur)
apk add --no-cache certbot
```

#### 2. Générer le certificat
```bash
# Arrêter nginx temporairement (optionnel si utilisant standalone)
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com \
  --email contact@your-domain.com \
  --agree-tos \
  --non-interactive

# Ou avec webroot (nginx en cours d'exécution)
sudo certbot certonly --webroot \
  -w /path/to/webroot \
  -d your-domain.com \
  --email contact@your-domain.com \
  --agree-tos \
  --non-interactive
```

#### 3. Copier les certificats
```bash
# Créer le répertoire ssl
mkdir -p nginx/ssl

# Copier les fichiers
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Permissions
sudo chown $USER:$USER nginx/ssl/*
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem
```

#### 4. Décommenter la configuration HTTPS
Ouvrir `nginx/conf.d/default.conf` et décommenter le bloc HTTPS:

```nginx
# ─── HTTPS Server Block ───────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... reste de la configuration ...
}

# ─── Redirect HTTP to HTTPS ───────────────────────────────
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

#### 5. Redémarrer Nginx
```bash
make restart

# Ou
docker-compose -f docker-compose.prod.yml restart nginx
```

#### 6. Vérifier
```bash
# HTTPS fonctionne
curl https://your-domain.com

# HTTP redirige vers HTTPS
curl -I http://your-domain.com

# Vérifier le certificat
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Vérifier avec SSL Labs
https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## 🔄 Renouvellement automatique

### Option 1: Cron job
```bash
# Éditer le crontab
sudo crontab -e

# Ajouter cette ligne (renouvellement tous les jours à 2h du matin)
0 2 * * * certbot renew --quiet && docker-compose -f docker-compose.prod.yml restart nginx
```

### Option 2: Systemd timer (recommandé)
```bash
# Vérifier si certbot.timer existe
sudo systemctl status certbot.timer

# Activer
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Tester
sudo systemctl start certbot.service
```

### Option 3: Certbot hook
```bash
# Créer un script de renouvellement
cat > /usr/local/bin/renew-ssl.sh << 'EOF'
#!/bin/bash
cd /path/to/hackathon
certbot renew --quiet
# Copier les nouveaux certificats
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
# Redémarrer nginx
docker-compose -f docker-compose.prod.yml restart nginx
EOF

chmod +x /usr/local/bin/renew-ssl.sh

# Ajouter à crontab
0 2 * * * /usr/local/bin/renew-ssl.sh
```

---

## 🔍 Vérification des certificats

### Voir la date d'expiration
```bash
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep -A 2 "Validity"

# Ou
openssl x509 -enddate -noout -in nginx/ssl/cert.pem
```

### Certificats valides pour 90 jours
```bash
# Vérifier les jours restants
echo $(( ($(date -d "$(openssl x509 -enddate -noout -in nginx/ssl/cert.pem | cut -d= -f2)" +%s) - $(date +%s)) / 86400 )) days left
```

---

## 🚨 Troubleshooting HTTPS

### Erreur: "Connection refused" sur le port 443
```bash
# Vérifier que Docker expose le port
docker-compose -f docker-compose.prod.yml ps

# Vérifier le firewall
sudo ufw allow 443/tcp
sudo ufw allow 80/tcp
```

### Erreur: "File not found" pour les certificats
```bash
# Vérifier les fichiers
ls -la nginx/ssl/

# Vérifier les permissions
chmod 600 nginx/ssl/key.pem
chmod 644 nginx/ssl/cert.pem

# Vérifier les chemins dans default.conf
cat nginx/conf.d/default.conf | grep ssl_certificate
```

### Erreur: "SSL: CERTIFICATE_VERIFY_FAILED"
```bash
# Tester le certificat
openssl s_client -connect your-domain.com:443 -servername your-domain.com

# Vérifier la chaîne complète
openssl s_client -connect your-domain.com:443 -showcerts

# Renouveler si expiré
certbot renew --force-renewal
```

### Erreur: Certbot: "Unable to locate certificate"
```bash
# Lister les certificats disponibles
sudo certbot certificates

# Créer un nouveau si manquant
sudo certbot certonly --standalone -d your-domain.com
```

### HTTPS fonctionne mais le navigateur affiche une erreur
```bash
# Vérifier que tous les certificats intermédiaires sont inclus
openssl s_client -connect your-domain.com:443 -showcerts | grep "issuer="

# Le fichier doit inclure:
# 1. Leaf certificate
# 2. Intermediate certificates
# 3. Root certificate
```

---

## 📋 Configuration d'exemple complète

Voir le fichier décommentées dans `nginx/conf.d/default.conf`:

```nginx
# ─── HTTP to HTTPS Redirect ────────────────────────────────
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# ─── HTTPS Server Block ────────────────────────────────────
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ... reste de la configuration (proxy_pass, etc.) ...
}
```

---

## ✅ Checklist final

- [ ] Domaine configuré et pointe vers le serveur
- [ ] Ports 80 et 443 accessibles
- [ ] Certificats générés avec Certbot
- [ ] Fichiers copiés dans `nginx/ssl/`
- [ ] Configuration HTTPS décommentée dans `default.conf`
- [ ] Nginx redémarré
- [ ] HTTPS fonctionne: `curl https://your-domain.com`
- [ ] HTTP redirige vers HTTPS
- [ ] Renouvellement automatique configuré
- [ ] Certificat valide pendant 90 jours

---

## 🎯 Commandes rapides

```bash
# Générer certificat
sudo certbot certonly --standalone -d your-domain.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Redémarrer Nginx
make restart

# Vérifier
curl https://your-domain.com
```

Voilà! 🔐
