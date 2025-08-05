FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies
RUN pnpm install || npm install

# Copy application files
COPY . .

# Build the Next.js application
RUN pnpm run build || npm run build

# Expose port
EXPOSE 3000

# Start the Next.js application
CMD ["pnpm", "run", "start"]