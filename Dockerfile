FROM hub.saobang.vn/nextpay-common/node:12.22.6-alpine3.11
RUN mkdir /app
WORKDIR /app


COPY package*.json ./

RUN npm ci 

COPY . .

RUN npm run build && npm prune --production

ENV NODE_ENV=production
CMD ["npm", "start"]