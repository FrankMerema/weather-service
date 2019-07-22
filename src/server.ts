/* tslint:disable */
import { CityRoutes, StatusRoutes, WeatherRoutes } from '@routes';
import { Request } from 'express';
import RateLimit = require('express-rate-limit');
import helmet = require('helmet');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const config = require('../service.config.json');

export function start() {
  const port = config.serverPort || 8080;

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(new RateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    onLimitReached(req: Request): void {
      console.error(`Received to many requests from ${req.ip}`);
    }
  }));

  app.use('/', new StatusRoutes().getRouter());
  app.use('/api/city', new CityRoutes().getRouter());
  app.use('/api/weather', new WeatherRoutes().getRouter());

  app.listen(port, () => {
    console.log(`Express app started at ${new Date()} and listening on port ${port}!`);
  });

  return app;
}
