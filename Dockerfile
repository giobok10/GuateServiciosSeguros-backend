# Fase G: Dockerfile para el Backend

# 1. Usar una imagen base de Node.js LTS
FROM node:18-alpine

# 2. Establecer el directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar los archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# 4. Instalar pnpm y las dependencias
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

# 5. Copiar el resto del código de la aplicación
COPY . .

# 6. Exponer el puerto en el que correrá la aplicación
EXPOSE 3000

# 7. Comando para iniciar la aplicación en producción
CMD [ "pnpm", "start" ]
