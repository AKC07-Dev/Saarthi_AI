FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# This manually bypasses the library's OS check if possible, 
# but swapping to pdf-parse is 10x more reliable.
CMD ["node", "server.js"]
