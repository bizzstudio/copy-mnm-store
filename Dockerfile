# ============================================================================
#  mnm-store — Next.js 16 (SSR)
#  משתני NEXT_PUBLIC_* נצרבים בזמן ה-build (build args).
# ============================================================================

# ---------- שלב build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci || npm install

COPY . .

# build args → env בזמן build (Next צורב NEXT_PUBLIC_* לתוך הקוד הצד-לקוח)
ARG NEXT_PUBLIC_STORE_DOMAIN
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_CUSTOMER_SERVICE
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_API_SOCKET_URL
ENV NEXT_PUBLIC_STORE_DOMAIN=$NEXT_PUBLIC_STORE_DOMAIN \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_CUSTOMER_SERVICE=$NEXT_PUBLIC_CUSTOMER_SERVICE \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_API_SOCKET_URL=$NEXT_PUBLIC_API_SOCKET_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- שלב run ----------
FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["npm", "start"]
