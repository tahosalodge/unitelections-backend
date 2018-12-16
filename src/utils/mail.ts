import { createTransport, Transporter } from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import * as path from 'path';
import Email from 'email-templates';
import * as Sentry from '@sentry/node';
import config from 'utils/config';
import { IUser } from 'modules/user/model';

const mgAuth = {
  auth: config.mailgun,
};

const transport = config.isDevelopment
  ? (createTransport(config.smtp) as Transporter)
  : (createTransport(mg(mgAuth)) as Transporter);

export const sendEmail = async (subject, to, html) => {
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
      locals,
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

// const base = `// html
// <div className="email" style="
//     font-family: sans-serif;
//     line-height: 2;
//     font-size: 20px;
//     background: #e5e5e5;
//   ">
//   <div style="
//     background: #E31837;
//     color: white;
//     padding: 10px 20px;
//     max-width: 500px;
//     margin: 0 auto;
//     ">
//     <h2 style="margin: 0;">${title}</h2>
//   </div>
//   <div style="
//   padding: 0.25em 0.5em; max-width: 500px; margin: 0 auto; background: white; width: 100%;">
//     ${body}
//   </div>
// </div>`;
