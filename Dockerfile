FROM node:alpine

WORKDIR /app

# Копируем package.json / package-lock.json
COPY package.json package-lock.json ./
RUN npm install

# Копируем только backend и (опционально) init_db.sql
COPY backend ./backend
COPY init_db.sql ./

# Запускаем сервер
CMD ["node", "./backend/index.js"]
