import { pick } from 'lodash';
import { HttpError } from 'utils/errors';
import Candidate from './model';

export const create = async ({ body, user: { userId }, ability }, res) => {
  const inputs = pick(body, []);
  const candidate = new Candidate({
    ...inputs,
    status: 'Eligible',
  });
  await candidate.save();
  res.send({ candidate });
};
export const get = async (req, res) => {
  const { candidateId } = req.params;
  const candidate = await Candidate.findById(candidateId)
    .accessibleBy(req.ability)
    .exec();
  if (!candidate) {
    throw new HttpError('Candidate not found', 404);
  }
  res.json({ candidate });
};
export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Candidate');
  const candidates = await Candidate.accessibleBy(req.ability).exec();
  res.json({ candidates });
};
export const update = async (
  { body, user: { userId }, ability, params: { candidateId } },
  res
) => {
  const updates = pick(body, []);
  const candidate = await Candidate.findById(candidateId)
    .accessibleBy(ability)
    .exec();
  if (!candidate) {
    throw new HttpError('Candidate not found', 404);
  }
  ability.throwUnlessCan('update', candidate);
  candidate.set({ ...updates });
  await candidate.save();
  res.json({ candidate });
};
export const remove = async ({ params: { candidateId }, ability }, res) => {
  const candidate = await Candidate.findById(candidateId)
    .accessibleBy(ability)
    .exec();
  if (!candidate) {
    throw new HttpError('Candidate not found', 404);
  }
  await candidate.remove();
  res.status(202).send();
};
