import { pick } from 'lodash';
import { parseISO } from 'date-fns';
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

/**
 * Format meeting time to a readable time. Support old string values along with time in epoch
 * @param meetingTime
 */
export const formatMeetingTime = (meetingTime: string): string => {
  let formatted = meetingTime;
  try {
    const toNumber = Number(meetingTime);
    if (!Number.isNaN(toNumber)) {
      formatted = format(new Date(toNumber), 'h:mm b', { timeZone });
    }
  } catch (error) {
    formatted = meetingTime;
  }
  return formatted;
};

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
  res.json({ election });
  const dates = election.requestedDates.map((date: string) =>
    format(parseISO(date), 'MM/dd/yyyy', { timeZone })
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
      scheduledDate: format(parseISO(election.date.toJSON()), 'MM/dd/yyyy', {
        timeZone,
      }),
      meetingTime: formatMeetingTime(unit.meetingTime),
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
              value: format(parseISO(election.date.toJSON()), 'MM/dd/yyyy', {
                timeZone,
              }),
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
  await notifyElectionRequested({ election, unit, dates });
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
    scheduledDate: format(parseISO(election.date.toJSON()), 'MM/dd/yyyy', {
      timeZone,
    }),
    meetingTime: formatMeetingTime(unit.meetingTime),
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
            value: format(parseISO(election.date.toJSON()), 'MM/dd/yyyy'),
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
  res.status(202).send();
};
