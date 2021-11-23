/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/first */
import elasticApmAgent from 'elastic-apm-node';

elasticApmAgent.start({
  serviceName: process.env.npm_package_name,
  serverUrl: process.env.ELASTIC_APM_SERVER_URLS,
  active: process.env.ELASTIC_APM_ENABLED === 'true',
  environment: process.env.ELASTIC_APM_ENVIRONMENT,
});

import './libs/dotenv';
import ExpressServer from './core/express';
import mongodb from './libs/mongodb';
import Logger from './libs/logger';

const logger = Logger.create('index.ts');
const run = (async () => {
  mongodb();
  ExpressServer();
})();
