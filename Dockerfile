FROM node:22.3.0-bullseye-slim AS build

WORKDIR /app

COPY . .

RUN npx prisma generate

RUN npm ci

RUN npm run build 

FROM node:22.3.0-bullseye-slim

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

CMD [ "node", "dist/index.js" ]