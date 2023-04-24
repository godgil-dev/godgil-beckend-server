FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./

# RUN yarn install --production
# development dependencies도 설치
RUN yarn install --frozen-lockfile

COPY . .

# 환경 변수를 설정하는 ARG 명령 추가
ARG DATABASE_URL
ARG ACCESS_TOKEN_EXPIRATION_TIME
ARG REFRESH_TOKEN_EXPIRATION_TIME
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_PASSWORD
ARG SECRET_KEY

# generate-env.sh 파일을 복사하고 실행
COPY generate-env.sh /app/
RUN chmod +x /app/generate-env.sh
RUN /app/generate-env.sh

RUN yarn build

# 빌드가 완료된 후에 필요없는 development dependencies를 제거
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

EXPOSE 3000

# PM2 설치
RUN yarn global add pm2

CMD ["pm2-runtime", "start", "ecosystem.config", ]