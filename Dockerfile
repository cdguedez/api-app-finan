# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps – instala solo dependencias de producción
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Instala yarn (viene incluido en node:20-alpine, pero lo fijamos)
RUN corepack enable && corepack prepare yarn@stable --activate

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile --production=false

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: builder – compila TypeScript
# ─────────────────────────────────────────────────────────────────────────────
FROM deps AS builder

COPY . .

# Genera el Prisma Client a partir del schema
RUN yarn prisma generate

# Compila la aplicación NestJS
RUN yarn build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: runner – imagen de producción mínima
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable && corepack prepare yarn@stable --activate

# Solo copiamos lo estrictamente necesario
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Instala únicamente dependencias de producción
RUN yarn install --frozen-lockfile --production=true

# Copia el cliente Prisma generado y el bundle compilado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Ejecuta migraciones pendientes y luego arranca la API
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/main"]
