FROM node:26-bookworm-slim

WORKDIR /app

COPY app/backend/package.json app/backend/package-lock.json ./
RUN npm ci --include=dev

COPY app/backend/prisma.config.ts ./prisma.config.ts
COPY app/backend/tsconfig.json ./tsconfig.json
COPY app/backend/src ./src
COPY app/backend/prisma ./prisma

RUN npm run db:generate

RUN npm run build

EXPOSE 3000

USER node

CMD ["npm", "start"]