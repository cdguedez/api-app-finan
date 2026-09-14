# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: deps – instala todas las dependencias
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Instala OpenSSL necesario para Prisma en Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: builder – compila TypeScript y genera Prisma Client
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

# Instala OpenSSL en la imagen final para que Prisma CLI / Client pueda ejecutarse
RUN apk add --no-cache openssl libc6-compat

# Solo copiamos lo estrictamente necesario
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Instala dependencias de producción
RUN yarn install --frozen-lockfile --production

# Copia los paquetes generados por Prisma y el bundle compilado
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Ejecuta migraciones pendientes y luego arranca la API
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/main"]
