import { IncomingWebhook } from '@slack/client';
import config from 'utils/config';

if (!config.slackUrl) {
  throw new Error('Missing Slack webhook url.');
}
const slack = new IncomingWebhook(config.slackUrl);

export default slack;
