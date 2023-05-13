# Base image
FROM node:16-alpine

# Set working directory
RUN mkdir -p /var/app/logs
WORKDIR /var/app

# Copy dependency definitions
COPY package*.json yarn.lock ./
COPY prisma/ ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Install Prisma CLI
RUN yarn global add prisma

# Copy source code
COPY . .

# Build app
RUN yarn build

RUN ls -l

RUN pwd

# Copy dist folder
COPY ./dist ./dist/

# Install PM2 globally
RUN yarn global add pm2

# Expose the listening port
EXPOSE 3000

# Start the app
CMD ["yarn", "start:pm2"]