import { pick } from 'lodash';
import User from 'modules/user/model';
import { HttpError } from 'utils/errors';
import Unit from './model';

export const create = async (req, res) => {
  const { body, userId } = req;
  const inputs = pick(body, [
    'unitLeader',
    'activeMembers',
    'meetingLocation',
    'number',
    'meetingTime',
    'unitType',
    'chapter',
  ]);
  const existingUnit = await Unit.findOne({
    number: inputs.number,
    unitType: inputs.unitType,
  });
  if (existingUnit) {
    throw new HttpError('Unit already exists', 400);
  }
  const unit = new Unit(inputs);
  await unit.save();
  await User.findOneAndUpdate(userId, {
    belongsTo: [{ organization: unit._id, canManage: true, model: 'Unit' }],
  });
  res.json({ unit });
};

export const get = async (req, res) => {
  const { unitId } = req.params;
  req.ability.throwUnlessCan('read', 'Unit');
  const unit = await Unit.findById(unitId);
  res.json({ unit });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Unit');
  const units = await Unit.find();
  res.json({ units });
};

export const update = async (req, res) => {
  const { unitId } = req.params;
  const { body } = req;
  const updates = pick(body, ['council', 'name', 'chapters']);
  const unit = await Unit.findById(unitId);
  if (!unit) {
    throw new HttpError('Unit not found', 404);
  }
  req.ability.throwUnlessCan('update', unit);
  unit.set({ ...updates });
  await unit.save();
  res.json({ unit });
};

export const remove = async (req, res) => {
  const { unitId } = req.params;
  const unit = await Unit.findById(unitId);
  if (!unit) {
    throw new HttpError('Unit not found', 404);
  }
  req.ability.throwUnlessCan('delete', unit);
  await unit.remove();
  res.status(202).send();
};
