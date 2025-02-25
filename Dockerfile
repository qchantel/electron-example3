FROM --platform=linux/arm64 node:18

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    make \
    gcc \
    g++ \
    libx11-dev \
    libxkbfile-dev \
    libsecret-1-dev \
    fakeroot \
    rpm \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
CMD ["npm", "run", "build"] 