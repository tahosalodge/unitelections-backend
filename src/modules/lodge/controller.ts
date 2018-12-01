import { pick } from 'lodash';
import User from '../user/model';
import { HttpError } from '../../utils/errors';
import Lodge from './model';

export const create = async (req, res) => {
  const { body, userId } = req;
  const inputs = pick(body, ['council', 'name', 'chapters']);
  const lodge = new Lodge(inputs);
  await lodge.save();
  await User.findOneAndUpdate(userId, {
    belongsTo: [{ organization: lodge._id, canManage: true }],
  });
  res.json({ lodge });
};

export const get = async (req, res) => {
  const { lodgeId } = req.params;
  req.ability.throwUnlessCan('read', 'Lodge');
  const lodge = await Lodge.findById(lodgeId);
  res.json({ lodge });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Lodge');
  const lodges = await Lodge.find();
  res.json({ lodges });
};

export const update = async (req, res) => {
  const { lodgeId } = req.params;
  const { body } = req;
  const updates = pick(body, ['council', 'name', 'chapters']);
  const lodge = await Lodge.findById(lodgeId);
  if (!lodge) {
    throw new HttpError('Lodge not found', 404);
  }
  req.ability.throwUnlessCan('update', lodge);
  lodge.set({ ...updates });
  await lodge.save();
  res.json({ lodge });
};

export const remove = async (req, res) => {
  const { lodgeId } = req.params;
  const lodge = await Lodge.findById(lodgeId);
  if (!lodge) {
    throw new HttpError('Lodge not found', 404);
  }
  req.ability.throwUnlessCan('delete', lodge);
  await lodge.remove();
  res.status(202).send();
};
