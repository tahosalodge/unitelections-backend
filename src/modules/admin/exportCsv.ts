import { unparse } from 'papaparse';
import { get } from 'lodash';
import { format } from 'date-fns';
import Unit from 'unit/model';
import Election from 'election/model';
import Lodge from 'lodge/model';
import { HttpError } from 'utils/errors';
import Candidate, { ICandidateModel } from 'candidate/model';
import Nomination, { INominationModel } from 'nomination/model';

interface ExportQueryParams {
  status: string;
  exported?: object;
}

export const candidates = async (req, res) => {
  const { newOnly } = req.query;
  const params: ExportQueryParams = {
    status: 'Elected',
  };
  if (newOnly) {
    params.exported = { $exists: false };
  }
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
      label: 'Gender',
      value: 'gender',
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
        const matchedChapter = chapters.find(
          c => c._id.toString() === chapter.toString()
        );
        if (!matchedChapter) {
          throw new HttpError(
            `Chapter not found for candidate ${candidate._id}`,
            400
          );
        }
        return matchedChapter.name;
      },
    },
    {
      label: 'Unit Type',
      value: (candidate: ICandidateModel) => {
        const { unit } = candidate;
        const matchedUnit = units.find(
          u => u._id.toString() === unit.toString()
        );
        if (!matchedUnit) {
          throw new HttpError(
            `Unit not found for candidate ${candidate._id}`,
            400
          );
        }
        return matchedUnit.unitType;
      },
    },
    {
      label: 'Unit Number',
      value: (candidate: ICandidateModel) => {
        const { unit } = candidate;
        const matchedUnit = units.find(
          u => u._id.toString() === unit.toString()
        );
        if (!matchedUnit) {
          throw new HttpError(
            `Unit not found for candidate ${candidate._id}`,
            400
          );
        }
        return matchedUnit.number;
      },
    },
    {
      label: 'Election Date',
      value: (candidate: ICandidateModel) => {
        const { election } = candidate;
        const matchedElection = elections.find(
          e => e._id.toString() === election.toString()
        );
        if (!matchedElection) {
          throw new HttpError(
            `Election not found for candidate ${candidate._id}`,
            400
          );
        }
        return format(matchedElection.date, 'MM/dd/yyyy');
      },
    },
  ];
  const csv = await unparse({
    fields: fields.map(field => field.label),
    data: candidates.map(candidate =>
      fields.map(field => {
        if (typeof field.value === 'string') {
          return get(candidate, field.value, '');
        }
        return field.value(candidate);
      })
    ),
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
  if (newOnly) {
    candidates.forEach(async ({ _id }) => {
      await Candidate.findOneAndUpdate({ _id }, { exported: new Date() });
    });
  }
};

export const nominations = async (req, res) => {
  const { newOnly } = req.query;
  const params: ExportQueryParams = {
    status: 'Pending Approval',
  };
  if (newOnly) {
    params.exported = { $exists: false };
  }
  const nominations = await Nomination.find(params);
  const units = await Unit.find();
  const elections = await Election.find();
  const lodge = await Lodge.findOne();
  if (units.length === 0 || elections.length === 0 || !lodge) {
    throw new HttpError('An error has occured.', 400);
  }
  if (nominations.length === 0) {
    throw new HttpError('No nominations to export.', 400);
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
      value: (nomination: INominationModel) => {
        const { dob } = nomination;
        return format(dob, 'MM/dd/yyyy');
      },
    },
    {
      label: 'Gender',
      value: 'gender',
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
      value: 'phone',
    },
    {
      label: 'Home Email Address',
      value: 'email',
    },
    {
      label: 'Chapter',
      value: (nomination: INominationModel) => {
        const { chapter } = nomination;
        const matchedChapter = chapters.find(
          c => c._id.toString() === chapter.toString()
        );
        if (!matchedChapter) {
          throw new HttpError(
            `Chapter not found for nomination ${nomination._id}`,
            400
          );
        }
        return matchedChapter.name;
      },
    },
    {
      label: 'Unit Type',
      value: (nomination: INominationModel) => {
        const { unit } = nomination;
        const matchedUnit = units.find(
          u => u._id.toString() === unit.toString()
        );
        if (!matchedUnit) {
          throw new HttpError(
            `Unit not found for nomination ${nomination._id}`,
            400
          );
        }
        return matchedUnit.unitType;
      },
    },
    {
      label: 'Unit Number',
      value: (nomination: INominationModel) => {
        const { unit } = nomination;
        const matchedUnit = units.find(
          u => u._id.toString() === unit.toString()
        );
        if (!matchedUnit) {
          throw new HttpError(
            `Unit not found for nomination ${nomination._id}`,
            400
          );
        }
        return matchedUnit.number;
      },
    },
    {
      label: 'Election Date',
      value: (nomination: INominationModel) => {
        const { election } = nomination;
        const matchedElection = elections.find(
          e => e._id.toString() === election.toString()
        );
        if (!matchedElection) {
          throw new HttpError(
            `Election not found for nomination ${nomination._id}`,
            400
          );
        }
        return format(matchedElection.date, 'MM/dd/yyyy');
      },
    },
  ];
  const csv = await unparse({
    fields: fields.map(field => field.label),
    data: nominations.map(nomination =>
      fields.map(field => {
        if (typeof field.value === 'string') {
          return get(nomination, field.value, '');
        }
        return field.value(nomination);
      })
    ),
  });
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
  if (newOnly) {
    nominations.forEach(async ({ _id }) => {
      await Nomination.findOneAndUpdate({ _id }, { exported: new Date() });
    });
  }
};
