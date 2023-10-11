import appConfig from './app.config';
import authConfig from './auth.config';
import smtpConfig from './smtp.config';
import serviceConfig from './service.config';
import openApiConfig from './open-api.config';
import databaseConfig from './database.config';
import httpClientConfig from './http-client.config';

export default [appConfig, databaseConfig, httpClientConfig, openApiConfig, authConfig, smtpConfig, serviceConfig];
