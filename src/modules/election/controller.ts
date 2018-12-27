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
  const {
    body,
    user: { userId },
  } = req;
  req.ability.throwUnlessCan('create', 'Election');
  const inputs = pick(body, ['unit', 'requestedDates', 'status']);
  const unit = await Unit.findById(inputs.unit).lean();
  if (!unit) {
    throw new HttpError('Unit not found.', 400);
  }
  let election = new Election({
    ...inputs,
    season: '2019',
    chapter: unit.chapter,
  });
  await election.save();
  const dates = election.requestedDates.map((date: string) =>
    format(date, 'MM/dd/yyyy')
  );
  if (inputs.status === 'Requested') {
    // Election created by a unit
    const user = await User.findByIdAndUpdate(userId, {
      $push: {
        belongsTo: [
          { organization: election.id, canManage: true, model: 'Election' },
        ],
      },
    });
    if (!user) {
      throw new HttpError('User not found.', 400);
    }
    await sendEmail(user.email, 'unit/requestElection', {
      election,
      user,
      dates,
      unit,
    });
  } else if (inputs.status === 'Scheduled') {
    // Election created by chapter or admin
    await sendEmail(unit.unitLeader.email, 'unit/scheduleElection', {
      election,
      user: unit.unitLeader,
      unit,
    });
  }
  res.json({ election });
  try {
    await notifyElectionRequested({ election, unit, dates });
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const get = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId)
    .accessibleBy(req.ability)
    .exec();
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
  res.json({ election });
};

export const list = async (req, res) => {
  req.ability.throwUnlessCan('read', 'Election');
  const elections = await Election.accessibleBy(req.ability)
    .populate('unit')
    .exec();
  res.json({ elections });
};

export const update = async (req, res) => {
  const { electionId } = req.params;
  const { body } = req;
  const updates = pick(body, ['status', 'date']);
  const election = await Election.findById(electionId)
    .accessibleBy(req.ability)
    .exec();
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
  req.ability.throwUnlessCan('update', election);
  election.set({ ...updates });
  await election.save();
  const unit = await Unit.findById(election.unit).lean();
  await sendEmail(unit.unitLeader.email, 'unit/scheduleElection', {
    election,
    user: unit.unitLeader,
    unit,
    scheduledDate: format(election.date, 'MM/dd/yyyy'),
    meetingTime: format(unit.meetingTime, 'hh:mm b'),
  });
  res.json({ election });
};

export const remove = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId)
    .accessibleBy(req.ability)
    .exec();
  if (!election) {
    throw new HttpError('Election not found', 404);
  }
  await election.remove();
  res.status(202).send();
};
