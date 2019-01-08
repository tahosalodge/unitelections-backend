import { createToken, sendUserInfo, resetData } from '../controller';
import User from 'user/model';
import * as jwt from 'jsonwebtoken';
import config from 'utils/config';

const user = new User({
  fname: 'Kevin',
  lname: 'McKernan',
  phone: '3037480249',
  email: 'kevin@mckernan.in',
  password: 'hashedbrowns',
  belongsTo: [],
  isAdmin: true,
  resetPasswordToken: null,
  resetPasswordExpires: null,
});

describe('User Controller', () => {
  test('createToken()', () => {
    const token = createToken(user);
    expect(token).toBeTruthy();
    expect(jwt.verify(token, config.jwtSecret)).toHaveProperty('userId');
    expect(jwt.verify(token, config.jwtSecret)).toHaveProperty('belongsTo');
    expect(jwt.verify(token, config.jwtSecret)).toHaveProperty('isAdmin');
  });

  test('sendUserInfo()', () => {
    const userInfo = sendUserInfo(user);
    expect(userInfo).toBeTruthy();
    expect(jwt.verify(userInfo.token, config.jwtSecret)).toHaveProperty(
      'userId'
    );
    expect(jwt.verify(userInfo.token, config.jwtSecret)).toHaveProperty(
      'belongsTo'
    );
    expect(jwt.verify(userInfo.token, config.jwtSecret)).toHaveProperty(
      'isAdmin'
    );
  });

  test('resetData()', () => {
    expect(resetData()).toHaveProperty('resetPasswordToken');
    expect(resetData()).toHaveProperty('resetPasswordExpires');
  });
});
