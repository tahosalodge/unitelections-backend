import { unparse } from 'papaparse';
import {get} from 'lodash';
import {format} from 'date-fns';
import Candidate from 'candidate/model';
import Unit from 'unit/model';
import Election from 'election/model';
import Lodge from 'lodge/model';
import { HttpError } from 'utils/errors';
import { ICandidateModel } from 'candidate/model';


export const candidates = async (req, res) => {
  const { newOnly } = req.query;
  const params = {
    status: 'Elected',
    exported: newOnly ? { $exists: false } : null,
  };
  const candidates = await Candidate.find(params);
  const units = await Unit.find();
  const elections = await Election.find();
  const lodge = await Lodge.findOne();
  if (units.length === 0 || elections.length === 0 || !lodge) {
    throw new HttpError('An error has occured.', 400);
  }
  if (candidates.length === 0) {
    throw new HttpError('No candidates to export.', 400);
  }
  const { chapters } = lodge;
  const fields = [
    {
      label: 'First Name',
      value: 'fname',
    },
    {
      label: 'Last Name',
      value: 'lname',
    },
    {
      label: 'Date Of Birth',
      value: (candidate: ICandidateModel) => {
        const { dob } = candidate;
        return format(dob, 'MM/dd/yyyy');
      },
    },
    {
      label: 'BSA ID',
      value: 'bsaid',
    },
    {
      label: 'Home Street 1',
      value: 'address.address1',
    },
    {
      label: 'Home City',
      value: 'address.city',
    },
    {
      label: 'Home State',
      value: 'address.state',
    },
    {
      label: 'Home Zip Code',
      value: 'address.zip',
    },
    {
      label: 'Home Phone Number',
      value: 'parentPhone',
    },
    {
      label: 'Home Email Address',
      value: 'parentEmail',
    },
    {
      label: 'Mobile Phone Number',
      value: 'youthPhone',
    },
    {
      label: 'School Email Address',
      value: 'youthEmail',
    },
    {
      label: 'Chapter',
      value: (candidate: ICandidateModel) => {
        const { chapter } = candidate;
        const matchedChapter = chapters.find(c => c._id.toString() === chapter.toString());
        if (!matchedChapter) {
          throw new HttpError(`Chapter not found for candidate ${candidate._id}`, 400);
        }
        return matchedChapter.name;
      },
    },
    {
      label: 'Unit Number',
      value: (candidate: ICandidateModel) => {
        const { unit } = candidate;
        const matchedUnit = units.find(u => u._id.toString() === unit.toString() );
        if (!matchedUnit) {
          throw new HttpError(`Unit not found for candidate ${candidate._id}`, 400);
        }
        return `${matchedUnit.unitType} ${matchedUnit.number}`;
      },
    },
    {
      label: 'Election Date',
      value: (candidate: ICandidateModel) => {
        const { election } = candidate;
        const matchedElection = elections.find(e => e._id.toString() === election.toString());
        if (!matchedElection) {
          throw new HttpError(`Election not found for candidate ${candidate._id}`, 400);
        }
        return format(matchedElection.date, 'MM/dd/yyyy');
      },
    },
  ];
  const csv = await unparse({
    fields: fields.map(field => field.label),
    data: candidates.map(candidate => fields.map(field => {
      if (typeof field.value === 'string') {
        return get(candidate, field.value, '');
      }
      return field.value(candidate);
    }) ),
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
  if (newOnly) {
    candidates.forEach(({ _id }) => {
      Candidate.findOneAndUpdate(_id, { exported: new Date() });
    });
  }
}
