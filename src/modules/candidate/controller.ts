import { pick } from 'lodash';
<<<<<<< HEAD
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
=======
import { format } from 'date-fns-tz';
import * as Sentry from '@sentry/node';
import User from 'user/model';
import Unit from 'unit/model';
import { HttpError } from 'utils/errors';
import sendEmail from 'emails/sendMail';
import { notifyElectionRequested } from 'emails/notifyChapter';
import slack from 'utils/slack';
import config from 'utils/config';
import Election from './model';

const { timeZone } = config;

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
  const election = new Election({
    ...inputs,
    season: '2019',
    chapter: unit.chapter,
  });
  await election.save();
  const dates = election.requestedDates.map((date: string) =>
    format(date, 'MM/dd/yyyy', { timeZone })
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
    await slack.send({
      text: 'Election Requested',
      attachments: [
        {
          fields: [
            {
              title: 'Unit',
              value: `${unit.unitType} ${unit.number}`,
            },
            {
              title: 'Dates',
              value: dates.join(', '),
            },
            {
              title: 'URL',
              value: `${config.publicUrl}/elections/${election.id}`,
            },
          ],
        },
      ],
    });
  } else if (inputs.status === 'Scheduled') {
    // Election created by chapter or admin
    await sendEmail(unit.unitLeader.email, 'unit/scheduleElection', {
      election,
      user: unit.unitLeader,
      unit,
      scheduledDate: format(election.date, 'MM/dd/yyyy', { timeZone }),
      meetingTime: format(unit.meetingTime, 'hh:mm b', { timeZone }),
    });
    await slack.send({
      text: 'Election Scheduled',
      attachments: [
        {
          fields: [
            {
              title: 'Unit',
              value: `${unit.unitType} ${unit.number}`,
            },
            {
              title: 'Date',
              value: format(election.date, 'MM/dd/yyyy', { timeZone }),
            },
            {
              title: 'URL',
              value: `${config.publicUrl}/elections/${election.id}`,
            },
          ],
        },
      ],
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
    scheduledDate: format(election.date, 'MM/dd/yyyy', { timeZone }),
    meetingTime: format(unit.meetingTime, 'hh:mm b', { timeZone }),
  });
  await slack.send({
    text: 'Election Scheduled',
    attachments: [
      {
        fields: [
          {
            title: 'Unit',
            value: `${unit.unitType} ${unit.number}`,
          },
          {
            title: 'Date',
            value: format(election.date, 'MM/dd/yyyy'),
          },
          {
            title: 'URL',
            value: `${config.publicUrl}/elections/${election.id}`,
          },
        ],
      },
    ],
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
>>>>>>> 13adf9789a47cd88ece29ae512abd03dd5e4398e
  res.status(202).send();
};
