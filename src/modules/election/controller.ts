import { pick } from 'lodash';
import User from 'modules/user/model';
import Unit from 'modules/unit/model';
import { HttpError } from 'utils/errors';
import Election from './model';

export const create = async (req, res) => {
  const { body, userId } = req;
  const inputs = pick(body, ['unitId', 'requestedDates', 'status']);
  const { chapter } = await Unit.findById(inputs.unitId);
  const election = new Election({
    ...inputs,
    season: '2019',
    chapter,
    status: 'Requested',
  });
  await election.save();
  await User.findOneAndUpdate(userId, {
    belongsTo: [
      { organization: election._id, canManage: true, model: 'Election' },
    ],
  });
  res.json({ election });
};

export const get = async (req, res) => {
  const { electionId } = req.params;
  req.ability.throwUnlessCan('read', 'Election');
  const election = await Election.findById(electionId);
  res.json({ election });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Election');
  const elections = await Election.find();
  res.json({ elections });
};

export const update = async (req, res) => {
  const { electionId } = req.params;
  const { body } = req;
  const updates = pick(body, ['council', 'name', 'chapters']);
  const election = await Election.findById(electionId);
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
  req.ability.throwUnlessCan('update', election);
  election.set({ ...updates });
  await election.save();
  res.json({ election });
};

export const remove = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId);
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
  req.ability.throwUnlessCan('delete', election);
  await election.remove();
  res.status(202).send();
};
