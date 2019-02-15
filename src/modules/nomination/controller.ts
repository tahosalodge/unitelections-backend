import { pick } from 'lodash';
import { HttpError } from 'utils/errors';
import Nomination, { INomination } from './model';

export const create = async ({ body, user: { userId }, ability }, res) => {
  const inputs = pick(body, [
    'bsaid',
    'dob',
    'fname',
    'lname',
    'phone',
    'email',
    'address',
    'position',
    'election',
    'unit',
    'chapter',
    'gender',
    'unitType',
  ]) as INomination;
  const nomination = new Nomination({
    ...inputs,
    status: 'Pending Approval',
  });
  await nomination.save();
  res.send({ nomination });
};

export const get = async (req, res) => {
  const { nominationId } = req.params;
  const nomination = await Nomination.findById(nominationId)
    .accessibleBy(req.ability)
    .exec();
  if (!nomination) {
    throw new HttpError('Nomination not found', 404);
  }
  res.json({ nomination });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Nomination');
  const nominations = await Nomination.accessibleBy(req.ability).exec();
  res.json({ nominations });
};

export const update = async (
  { body, user: { userId }, ability, params: { nominationId } },
  res
) => {
  const updates = pick(body, []);
  const nomination = await Nomination.findById(nominationId)
    .accessibleBy(ability)
    .exec();
  if (!nomination) {
    throw new HttpError('Nomination not found', 404);
  }
  ability.throwUnlessCan('update', nomination);
  nomination.set({ ...updates });
  await nomination.save();
  res.json({ nomination });
};

export const remove = async ({ params: { nominationId }, ability }, res) => {
  const nomination = await Nomination.findById(nominationId)
    .accessibleBy(ability)
    .exec();
  if (!nomination) {
    throw new HttpError('Nomination not found', 404);
  }
  await nomination.remove();
  res.status(202).send();
};
