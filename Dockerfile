FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV POSTGRES_HOST=__REQUIRED__
ENV POSTGRES_PORT=5432
ENV POSTGRES_DB=__REQUIRED__
ENV POSTGRES_USER=__REQUIRED__
ENV POSTGRES_PASSWORD=__REQUIRED__
ENV RA_USERNAME=__REQUIRED__
ENV RA_API_KEY=__REQUIRED__

COPY package*.json ./
RUN npm ci --include=dev

COPY . .
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x ./docker/entrypoint.sh

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["npm", "start"]
