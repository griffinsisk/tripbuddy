# Step 1: Build the React app
FROM node:16 as build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Debug: List build files
RUN ls -la /app/build

# Step 2: Set up the Node.js server to serve the frontend
FROM node:16
WORKDIR /app
COPY --from=build /app/build /app/public

# Debug: List public files
RUN ls -la /app/public

COPY backend/package*.json ./
RUN npm install
COPY backend/ .

EXPOSE 8080  

CMD ["node", "index.js"]