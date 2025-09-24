FROM node:22-alpine

WORKDIR /app

# Install Python for ML scripts
RUN apk add --no-cache python3 py3-pip python3-dev build-base

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Install Python dependencies for ML scripts (if requirements.txt exists)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt || echo "No requirements.txt found"

# Expose port
EXPOSE 8000

# Start the Node.js server
CMD ["npm", "start"]