set -euo pipefail

cd /home/ubuntu/<your-repository-folder>
git pull
docker-compose pull
docker-compose up -d --build