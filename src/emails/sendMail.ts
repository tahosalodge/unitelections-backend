import { createTransport, Transporter } from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import * as path from 'path';
import * as Sentry from '@sentry/node';
import * as Email from 'email-templates';
import config from 'utils/config';
import { IUser } from 'modules/user/model';

const mgAuth = {
  auth: config.mailgun,
};

const basePath = path.resolve(__dirname, './base.njk');

const transport = config.isDevelopment
  ? (createTransport(config.smtp) as Transporter)
  : (createTransport(mg(mgAuth)) as Transporter);

export const sendEmail = async (subject: string, to: string, html: string) => {
  const options = {
    to,
    subject,
    html,
    from: config.fromEmail,
  };
  try {
    await transport.sendMail(options);
  } catch (error) {
    Sentry.captureException(error);
  }
};

const createEmail = options =>
  new Email({
    transport,
    message: {
      from: config.fromEmail,
    },
    send: true,
    views: {
      root: path.resolve('src/emails'),
      options: {
        extension: 'nunjucks',
      },
    },
    subjectPrefix: 'Tahosa Lodge Elections | ',
    preview: false,
    ...options,
  });

/**
 * Send an email with a template
 */
export const templateSender = async (
  to: string,
  template: string,
  locals: object,
  emailConfig = {}
) => {
  try {
    const email = createEmail(emailConfig);
    await email.send({
      template,
      locals: {
        basePath,
        publicUrl: config.publicUrl,
        ...locals,
      },
      message: {
        to,
      },
    });
  } catch (error) {
    Sentry.captureException(error);
  }
};

/**
 * Send email to array of users
 * @param {Array} users Array of users
 * @param {String} template path to template
 * @param {Object} locals variables to pass to the template
 */
export const emailToUsers = (
  users: Array<IUser>,
  template: string,
  locals: object,
  emailConfig = {}
) => {
  if (!users || users.length === 0) {
    return;
  }
  users.forEach(user => {
    templateSender(user.email, template, locals, emailConfig);
  });
};

export default templateSender;
