import { pick } from 'lodash';
import { format } from 'date-fns';
import * as Sentry from '@sentry/node';
import User from 'user/model';
import Unit from 'unit/model';
import { HttpError } from 'utils/errors';
import sendEmail from 'emails/sendMail';
import { notifyElectionRequested } from 'emails/notifyChapter';
import Election from './model';

export const create = async (req, res) => {
  const { body, userId } = req;
  const inputs = pick(body, ['unitId', 'requestedDates', 'status']);
  const unit = await Unit.findById(inputs.unitId);
  let election = new Election({
    ...inputs,
    season: '2019',
    chapter: unit.chapter,
    status: 'Requested',
  });
  await election.save();
  const user = await User.findOneAndUpdate(userId, {
    belongsTo: [
      { organization: election._id, canManage: true, model: 'Election' },
    ],
  });
  const dates = election.requestedDates.map((date: string) =>
    format(date, 'MM/dd/yyyy')
  );
  election = election.toObject();
  sendEmail(user.email, 'unit/requestElection', {
    election,
    user,
    dates,
    unit,
  });
  res.json({ election });
  try {
    notifyElectionRequested({ election, unit, dates });
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const get = async (req, res) => {
  const { electionId } = req.params;
  req.ability.throwUnlessCan('read', 'Election');
  const election = await Election.findById(electionId);
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
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
