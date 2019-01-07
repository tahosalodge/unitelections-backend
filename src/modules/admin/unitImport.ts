import Unit from 'unit/model';
import Lodge from 'lodge/model';
import User from 'user/model';
import axios from 'axios';
import { HttpError } from 'utils/errors';

let oldUnits = [] as any;

const getOldUnits = async token => {
  if (oldUnits.length) {
    return;
  }
  const response = await axios(
    'https://election-backend-qxgxbeeput.now.sh/api/units',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status === 200) {
    oldUnits = response.data;
  }
};

const createUnit = async (oldUnit, chapters) => {
  const chapter = chapters.find(
    c =>
      c.name.toUpperCase() ===
      oldUnit.chapter
        .split('-')
        .join(' ')
        .toUpperCase()
  );
  if (!chapter) {
    throw new HttpError('Chapter does not exist', 400);
  }
  const newUnit = new Unit({
    ...oldUnit,
    unitType: 'Troop',
    chapter: chapter._id,
  });
  await newUnit.save();
  return newUnit;
};

const createOrReturnUser = async ({ unitLeader }) => {
  const user = await User.findOne({ email: unitLeader.email });
  if (user) {
    return user;
  }

  const newUser = new User({ ...unitLeader });
};

export const single = async (req, res) => {
  const { number, oldToken } = req.query;
  const unit = await Unit.findOne({ unitType: 'Troop', number });
  if (unit) {
    throw new HttpError('Unit already exists', 400);
  }
  await getOldUnits(oldToken);
  const { chapters } = await Lodge.findOne().lean();
  const oldUnit = oldUnits.find(u => u.number === number);
  const newUnit = await createUnit(oldUnit, chapters);
  res.send({
    message: `Successfully imported Troop ${number}`,
    oldUnit,
    newUnit,
  });
};

export const all = async (req, res) => {
  const { oldToken } = req.query;
  await getOldUnits(oldToken);
  let successful = [] as any;
  let failed = [] as any;
  let exists = [] as any;
  const { chapters } = await Lodge.findOne().lean();
  await Promise.all(
    oldUnits.map(async oldUnit => {
      try {
        const unit = await Unit.findOne({
          unitType: 'Troop',
          number: oldUnit.number,
        });
        if (unit) {
          throw new HttpError('Unit already exists', 400);
        }
        const newUnit = await createUnit(oldUnit, chapters);
        successful.push(newUnit);
      } catch (error) {
        if (error.message === 'Unit already exists') {
          exists.push({ oldUnit });
        } else {
          failed.push({ oldUnit, error: error.message });
        }
      }
    })
  );
  res.send({
    message: `Import ran: ${successful.length} successful, ${
      failed.length
    } failed, ${exists.length} already exist`,
    successful,
    failed,
  });
};
