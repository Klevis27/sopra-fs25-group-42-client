# Build image
FROM node:22.14.0 as build
WORKDIR /app
COPY package*.json ./
RUN npm config set cache /app/.npm-cache --global
RUN npm ci --loglevel=error
COPY . .
RUN npm run build
RUN npm prune --production

# Use small production image
FROM node:22.14.0-alpine
ENV NODE_ENV production
RUN npm config set cache /app/.npm-cache --global

# Use node user
USER node
WORKDIR /app

# Copy only required files
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/public ./public
COPY --chown=node:node --from=build /app/.next ./.next
COPY --chown=node:node --from=build /app/package.json ./package.json

# Expose port for Next.js
EXPOSE 3000

# Run Next.js app in production mode
CMD ["npx", "next", "start"]