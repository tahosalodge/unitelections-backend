import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as generatePassword from 'xkpasswd/generate';
import { pick } from 'lodash';
import { defineAbilitiesFor, ANONYMOUS } from '../user/roles';
import { HttpError } from '../../utils/errors';
import User, { UserI } from './model';
import config from '../../utils/config';

export interface Token {
  userId: string;
  belongsTo: Array<Object>;
  isAdmin: boolean;
}

/**
 * Authentication Methods
 */

export const createToken = (user: UserI) => {
  const { _id: userId, belongsTo, isAdmin } = user;
  const tokenVars: Token = { userId, belongsTo, isAdmin };
  return jwt.sign(tokenVars, config.jwtSecret, { expiresIn: 86400 });
};

export const sendUserInfo = (user: UserI) => {
  const { fname, lname, belongsTo, email, isAdmin, _id } = user;
  const token = createToken(user);
  const userInfo = {
    _id,
    token,
    fname,
    lname,
    belongsTo,
    email,
    isAdmin,
  };
  return userInfo;
};

export const login = async (req, res) => {
  const { email, password } = pick(req.body, ['email', 'password']);
  if (!email || !password) {
    throw new HttpError('Missing parameters.', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  const passwordIsValid = bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    throw new HttpError('Password Incorrect', 401);
  }
  res.json(sendUserInfo(user));
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
    // templateSender(email, 'auth/register', { fname });
    res.json(sendUserInfo(user));
  } catch ({ message }) {
    throw new HttpError(400, message);
  }
};

export const verify = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw new HttpError('No user found.', 404);
  }
  res.json(sendUserInfo(user));
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
    req.ability = req.user ? defineAbilitiesFor(req.user) : ANONYMOUS;
    return next();
  } catch (error) {
    throw new HttpError('Failed to authenticate token.', 403);
  }
};

export const resetPassword = async (req, res) => {
  const { email } = req.body;
  const plainPassword = generatePassword({ separators: '-' });
  const password = bcrypt.hashSync(plainPassword, 8);
  await User.findOneAndUpdate({ email }, { password });
  // templateSender(email, 'auth/resetPassword', { password: plainPassword });
  res.send(
    `Password reset successfully, a new password has been emailed to you at ${email}`
  );
};

/**
 * User CRUD
 */

export const create = async (req, res) => {
  const data = pick(req.body, [
    'email',
    'fname',
    'lname',
    'chapter',
    'capability',
  ]);
  const password = generatePassword({ separators: '-' });
  const hashedPassword = bcrypt.hashSync(password, 8);
  console.log({ data, password });
  const user = await User.create({ ...data, password: hashedPassword });
  // TODO trigger invite email
  res.json(user);
};

export const get = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Users');
  const { userId } = req.params;
  const user = await User.findById(userId);
  res.json({ user });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Users');
  const users = await User.find();
  res.json({ users });
};

export const update = async (req, res) => {
  const { userId } = req.params;
  const { body } = req;
  const user = await User.findById(userId);
  const updates = pick(body, ['fname', 'lname', 'email']);
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
    return res
      .status(404)
      .send({ message: `Could not find user with id "${userId}"` });
  }
  req.ability.throwUnlessCan('delete', user);
  await user.remove();
  return res.status(202).send();
};
