# Set Bun and Node version
ARG BUN_VERSION=1.1.13
ARG NODE_VERSION=20.12.2
FROM imbios/bun-node:${BUN_VERSION}-${NODE_VERSION}-slim

# Set production environment
ENV NODE_ENV="production"

# Bun app lives here
WORKDIR /app

# Copy app files to app directory
COPY . .

# Install node modules
RUN bun install

# Generate Prisma Client
RUN bun prisma generate

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "bun", "run", "index.ts" ]
#FROM node:latest AS base
#
#WORKDIR /app
#
#RUN npm install -g bun
#
#COPY bun.lockb .
#COPY package.json .
#
#COPY prisma ./prisma
#COPY src ./src
#COPY index.ts .
#
#RUN npx prisma generate
#
#RUN bun build ./index.ts --compile --outfile cli
#
#FROM node:latest AS production
#
#WORKDIR /app
#
#COPY --from=base /app/cli /app/cli
#
#CMD ["/app/cli" ]
