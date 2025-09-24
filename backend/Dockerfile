# Build stage
FROM python:3.10-slim AS builder
WORKDIR /app
# Set stable Debian repositories
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list \
    && echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list \
    && echo "deb http://deb.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list
# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    g++ \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools==69.0.0 wheel cython>=0.29.24
RUN pip wheel --no-cache-dir --wheel-dir=/app/wheels -r requirements.txt

# Final stage
FROM python:3.10-slim
WORKDIR /app
# Set stable Debian repositories
RUN echo "deb http://deb.debian.org/debian bullseye main" > /etc/apt/sources.list \
    && echo "deb http://deb.debian.org/debian bullseye-updates main" >> /etc/apt/sources.list \
    && echo "deb http://deb.debian.org/debian-security bullseye-security main" >> /etc/apt/sources.list
# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*
# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs
# Copy and install Node.js dependencies
COPY package*.json ./
RUN npm install
# Install Python dependencies from wheels
COPY --from=builder /app/wheels /wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt
# Copy application code
COPY . .
# Create data directories
RUN mkdir -p data/{raw,processed,models,references}
# Expose ports
EXPOSE 3001 8000
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1
# Start both Node.js and Python services
CMD ["sh", "-c", "node src/server.js & python dna/kb/api.py & wait"]