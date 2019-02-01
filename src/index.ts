if (process.env.NODE_ENV === 'production') {
  require('module-alias/register');
}
import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as cors from 'cors';
import * as Sentry from '@sentry/node';
import { accessibleRecordsPlugin } from '@casl/mongoose';
import config from 'utils/config';

Sentry.init({
  dsn: config.sentry,
  release: process.env.CIRCLE_SHA1,
});

mongoose.connect(
  config.mongoUrl,
  { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false }
);
mongoose.plugin(accessibleRecordsPlugin);

import * as errors from 'utils/errors';
import lodgeRoutes from 'lodge/routes';
import userRoutes from 'user/routes';
import unitRoutes from 'unit/routes';
import electionRoutes from 'election/routes';
import adminRoutes from 'admin/routes';
import candidateRoutes from 'candidate/routes';

const app = express();
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
app.use(morgan('dev'));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('port', config.port);
app.get('/', (req, res) => res.send('OK'));
app.use('/api/v1/lodge', lodgeRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/unit', unitRoutes);
app.use('/api/v1/election', electionRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/candidate', candidateRoutes);

app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
app.use(errors.notFound);
app.use(errors.mongoValidationErrors);
if (config.env === 'development') {
  app.use(errors.developmentErrors);
}

app.use(errors.productionErrors);
try {
  app.listen(app.get('port'), () => console.log('Have you seen the arrow?'));
} catch (error) {
  console.log(error);
}
