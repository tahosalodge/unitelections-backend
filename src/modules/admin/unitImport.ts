import { Request, Response } from 'express';
import Unit, { IUnitModel } from 'unit/model';
import Lodge, { IChapter } from 'lodge/model';
import User, { IUserModel, addRelationship } from 'user/model';
import axios from 'axios';
import { HttpError } from 'utils/errors';
import sendMail from 'emails/sendMail';
import { resetData } from 'user/controller';

interface ImportUnit {
  _id: string;
  chapter: string;
  number: string;
}

let oldUnits = [] as Array<ImportUnit>;

const getOldUnits = async (token: string) => {
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

const createUnit = async (oldUnit: ImportUnit, chapters: Array<IChapter>) => {
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

const createOrReturnUser = async ({
  unitLeader,
  _id,
}: IUnitModel): Promise<IUserModel> => {
  const user = await User.findOne({ email: unitLeader.email });
  if (user) {
    await addRelationship(user.id, _id, 'Unit', true);
    return user;
  }

  const newUser = new User({ ...unitLeader, ...resetData() });
  await newUser.save();
  await addRelationship(newUser.id, _id, 'Unit', true);
  return newUser;
};

export const single = async (req: Request, res: Response) => {
  const { number, oldToken } = req.query;
  const unit = await Unit.findOne({ unitType: 'Troop', number });

  if (unit) {
    throw new HttpError('Unit already exists', 400);
  }
  await getOldUnits(oldToken);
  const { chapters } = await Lodge.findOne().lean();
  const oldUnit: ImportUnit | undefined = oldUnits.find(
    u => u.number === number
  );

  if (!oldUnit) {
    throw new HttpError('Unit not found', 400);
  }
  const newUnit = await createUnit(oldUnit, chapters);
  const user = await createOrReturnUser(newUnit);
  await sendMail(user.email, 'unit/import', { user, unit: newUnit });

  res.send({
    message: `Successfully imported Troop ${number}`,
    oldUnit,
    newUnit,
  });
};

export const all = async (req: Request, res: Response) => {
  const { oldToken, save = false } = req.query;
  await getOldUnits(oldToken);
  let successful = [] as any;
  let failed = [] as any;
  let exists = [] as any;
  const { chapters } = await Lodge.findOne().lean();
  await Promise.all(
    oldUnits.map(async (oldUnit: ImportUnit) => {
      try {
        const unit = await Unit.findOne({
          unitType: 'Troop',
          number: oldUnit.number,
        });
        if (unit) {
          throw new HttpError('Unit already exists', 400);
        }
        if (save) {
          const newUnit = await createUnit(oldUnit, chapters);
          successful.push(newUnit);
          const user = await createOrReturnUser(newUnit);
          await sendMail(user.email, 'unit/import', { user, unit: newUnit });
        } else {
          successful.push(oldUnit);
        }
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
