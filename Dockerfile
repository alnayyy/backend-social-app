# production-ready minimal image
FROM node:18-alpine AS build

WORKDIR /app

# copy package files first (cache npm install)
COPY package*.json ./
RUN npm ci --only=production

# copy source and produce build (if build step needed)
COPY . .

# if your project needs build (nestjs), uncomment these lines:
RUN npm run build

# final runtime image
FROM node:18-alpine AS runtime
WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --only=production

# copy compiled build (dist) & other runtime files
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main.js"]
