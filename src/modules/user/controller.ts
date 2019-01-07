import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as generatePassword from 'xkpasswd/generate';
import * as Sentry from '@sentry/node';
import { pick } from 'lodash';
import { isBefore, addDays } from 'date-fns';
import * as randomstring from 'random-string';

import Lodge from 'lodge/model';
import Election from 'election/model';
import Unit from 'unit/model';
import { defineAbilitiesFor, ANONYMOUS } from 'user/roles';
import { HttpError } from 'utils/errors';
import config from 'utils/config';
import sendMail from 'emails/sendMail';
import User, { IUserModel } from './model';
import slack from 'utils/slack';

const models = {
  Lodge,
  Election,
  Unit,
  User,
};

export interface Token {
  userId: string;
  belongsTo: Array<Object>;
  isAdmin: boolean;
}

/**
 * Authentication Methods
 */

export const createToken = (user: IUserModel) => {
  const { id: userId, belongsTo, isAdmin } = user;
  const tokenVars: Token = { userId, belongsTo, isAdmin };
  return jwt.sign(tokenVars, config.jwtSecret, { expiresIn: 86400 });
};

export const sendUserInfo = (user: IUserModel) => {
  const { fname, lname, belongsTo, email, isAdmin, id } = user;
  const token = createToken(user);
  const userInfo = {
    id,
    token,
    fname,
    lname,
    belongsTo,
    email,
    isAdmin,
  };
  return userInfo;
};

export const resetData = () => ({
  resetPasswordToken: randomstring(),
  resetPasswordExpires: addDays(Date.now(), 7),
});

export const login = async (req, res) => {
  const { email, password } = pick(req.body, ['email', 'password']);
  if (!email || !password) {
    throw new HttpError('Missing parameters.', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  if (!user.password || user.password === '') {
    throw new HttpError(
      'Check your email to set your password before logging in.',
      400
    );
  }
  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    throw new HttpError('Password Incorrect', 401);
  }
  const lodge = await Lodge.findOne();
  res.json({ user: sendUserInfo(user), lodge });
};

export const register = async (req, res) => {
  try {
    const { email, fname, lname, password } = pick(req.body, [
      'email',
      'fname',
      'lname',
      'password',
    ]) as any;

    const toCreate = {
      email,
      fname,
      lname,
      password: bcrypt.hashSync(password, 8),
    };
    const user = await User.create(toCreate);
    const lodge = await Lodge.findOne();
    await sendMail(email, 'auth/register', { fname });
    await slack.send(`${fname} ${lname} registered ${email}`);
    res.json({ user: sendUserInfo(user), lodge });
  } catch ({ message }) {
    throw new HttpError(message, 400);
  }
};

export const verify = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  const lodge = await Lodge.findOne();
  res.json({ user: sendUserInfo(user), lodge });
};

export const tokenMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new HttpError('No token provided.', 403);
  }
  const [, token] = req.headers.authorization.split(' ');
  if (!token) {
    throw new HttpError('No token provided.', 403);
  }
  try {
    const { userId, belongsTo, isAdmin } = jwt.verify(
      token,
      config.jwtSecret
    ) as Token;
    req.user = {
      userId,
      belongsTo,
      isAdmin,
    };
    Sentry.configureScope(scope => {
      scope.setUser({
        userId,
      });
    });
    req.ability = req.user ? defineAbilitiesFor(req.user) : ANONYMOUS;
    return next();
  } catch (error) {
    throw new HttpError('Failed to authenticate token.', 403);
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new HttpError('Unauthorized', 403);
  }
  return next();
};

export const resetPassword = async (req, res) => {
  const { email, token, password } = pick(req.body, [
    'email',
    'token',
    'password',
  ]);
  const user = await User.findOne({ email });
  if (
    !user ||
    !user.resetPasswordToken ||
    user.resetPasswordToken !== token ||
    !isBefore(Date.now(), user.resetPasswordExpires)
  ) {
    throw new HttpError(`Unable to reset password for ${email}`, 400);
  }
  const hashedPass = bcrypt.hashSync(password, 8);
  await user.update({
    password: hashedPass,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
  res.send(`Password reset successfully.`);
};

export const createResetToken = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOneAndUpdate(
    { email },
    { ...resetData() },
    { new: true }
  );
  if (!user) {
    throw new HttpError('Bad request.', 400);
  }
  await sendMail(email, 'auth/resetPassword', { user });
  res.send(`Check ${email} to finish setting your password.`);
};

/**
 * User CRUD
 */

export const create = async (req, res) => {
  req.ability.throwUnlessCan('administer', 'User');
  const data = pick(req.body, [
    'email',
    'fname',
    'lname',
    'belongsTo',
    'isAdmin',
  ]);
  const user = await User.create({ ...data, ...resetData() });
  await sendMail(data.email, 'auth/createdUser', {
    user,
  });
  res.json({ user });
};

export const get = async (req, res) => {
  req.ability.throwUnlessCan('manage', 'User');
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.json({ user });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('administer', 'User');
  const users = await User.find().lean();
  const lodge = await Lodge.findOne().lean();
  const fullUsers = await Promise.all(
    users.map(async user => {
      const belongsTo = await Promise.all(
        user.belongsTo.map(async ({ model, organization, canManage }) => {
          let details;
          if (model === 'Chapter') {
            details = lodge.chapters.find(c => c.id === organization);
          } else {
            details = await models[model].findById(organization).lean();
          }
          return {
            model,
            organization,
            canManage,
            details,
          };
        })
      );

      return {
        ...user,
        status: user.resetPasswordToken ? 'Invited' : 'Registered',
        belongsTo,
      };
    })
  );
  res.json({ users: fullUsers });
};

export const update = async (req, res) => {
  const { userId } = req.params;
  const { body } = req;
  const user = await User.findById(userId);
  const updates = pick(body, ['fname', 'lname', 'email', 'belongsTo']);
  if (!user) {
    throw new HttpError('User not found', 404);
  }
  req.ability.throwUnlessCan('update', user);
  user.set({ ...updates });
  await user.save();
  res.json({ user });
};

export const remove = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError(`Could not find user with id "${userId}"`, 404);
  }
  req.ability.throwUnlessCan('delete', user);
  await user.remove();
  res.status(202).send();
};
