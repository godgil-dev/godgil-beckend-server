cd /var/www/imojumo
yarn install --immutable --immutable-cache --check-cache
pm2 stop imojumo || true
pm2 start main.js ecosystem.config