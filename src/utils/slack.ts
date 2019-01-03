import { IncomingWebhook } from '@slack/client';
import config from 'utils/config';
const slack = new IncomingWebhook(config.slackUrl);

export default slack;
