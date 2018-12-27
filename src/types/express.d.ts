import { Request } from 'express';
import { TokenUser } from 'user/model';

export interface Request {
  user: TokenUser;
}
