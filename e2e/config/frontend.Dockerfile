FROM node:18-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy application files
COPY . .

# Build the Next.js application
RUN pnpm run build

# Expose port
EXPOSE 3000

# Start the Next.js application on port 3000
CMD ["pnpm", "run", "start", "-p", "3000"]