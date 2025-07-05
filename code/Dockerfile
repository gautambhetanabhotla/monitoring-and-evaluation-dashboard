# Stage 1: Build the entire project
FROM node:20 AS builder
WORKDIR /app

# Copy all package.json and package-lock.json files
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies
RUN npm install --workspaces

# Copy the rest of the source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Final image
FROM node:20-slim
WORKDIR /app

# Copy the entire project from the builder stage
COPY --from=builder /app .

WORKDIR /app/backend
EXPOSE 5011

# Start the backend server
CMD ["npm", "run", "start"]
