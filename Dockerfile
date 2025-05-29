FROM node:22

# Gerekli sistem kütüphaneleri (canvas için)
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    build-essential \
    && apt-get clean

# Çalışma dizini
WORKDIR /app

# Bağımlılık tanımlarını kopyala
COPY package*.json ./

# Bağımlılıkları indir (Linux ortamında!)
RUN npm install

# Diğer tüm dosyaları kopyala (ama node_modules dahil değil!)
COPY . .

# Port aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["node", "index.js"]