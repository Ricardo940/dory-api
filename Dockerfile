FROM node:14.17.3-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

ENV DB_HOST=${DB_HOST}
ENV DB_NAME=${DB_NAME}
ENV DB_PASSWORD=${DB_PASSWORD} 
ENV DB_USER=${DB_USER} 
ENV DORY_WEB_APP_URL=${DORY_WEB_APP_URL}
ENV GOOGLE_PASSWORD_APP=${GOOGLE_PASSWORD_APP}
ENV URL_LOGO=${URL_LOGO}
ENV OAUTH_CLIENT_ID_MOBILE=${OAUTH_CLIENT_ID_MOBILE}
ENV OAUTH_CLIENT_ID_WEB=${OAUTH_CLIENT_ID_WEB}

COPY . .
EXPOSE 3000

CMD [ "npm", "start" ]