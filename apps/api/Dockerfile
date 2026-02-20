# Production Dockerfile for NestJS API
FROM node:20-alpine AS builder

# Add libc6-compat for some node packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Generate Prisma Client
RUN cd apps/api && npx prisma generate

# Build the NestJS application
RUN npm run build -w apps/api

# ─── Production stage ────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Add libraries needed by Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy root package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/

# Install ONLY production dependencies (now includes prisma)
RUN npm install --omit=dev

# Copy the built output and Prisma schema
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Generate Prisma Client in the final stage to ensure runtime compatibility
RUN npx prisma generate --schema=apps/api/prisma/schema.prisma

EXPOSE 5555

# Run the app
CMD ["node", "apps/api/dist/src/main.js"]
