import {
  regularUser,
  adminUser,
  chapterUser,
  lodge1,
  lodge2,
  election1,
  election2,
  unit1,
  unit2,
  candidate1,
  candidate2,
  nomination1,
  nomination2,
} from 'utils/mocks';
import {
  ANONYMOUS,
  defineAbilitiesFor,
  LODGE,
  USER,
  UNIT,
  ELECTION,
  CANDIDATE,
  NOMINATION,
} from 'utils/ability';

test('Anonymous user permissions', () => {
  expect(ANONYMOUS.can('create', USER)).toBeTruthy();
  expect(ANONYMOUS.can('read', LODGE)).toBeTruthy();
  expect(ANONYMOUS.can('create', LODGE)).toBeFalsy();
  expect(ANONYMOUS.can('create', UNIT)).toBeFalsy();
});

test('Regular user permissions', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeFalsy();
  expect(ability.can('read', lodge1)).toBeTruthy();
});

test('Users can create a unit', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', UNIT)).toBeTruthy();
});

test('Users can create an election', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', ELECTION)).toBeTruthy();
});

test('Users can create a candidate', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', CANDIDATE)).toBeTruthy();
});

test('Users can create a nomination', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', NOMINATION)).toBeTruthy();
});

test('Admins can manage all lodges and update other users', () => {
  const ability = defineAbilitiesFor(adminUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeTruthy();
  expect(ability.can('update', lodge1)).toBeTruthy();
  expect(ability.can('update', lodge2)).toBeTruthy();
});

test('Chapter users can manage elections, units, candidates, and nominations in their chapter', () => {
  const ability = defineAbilitiesFor(chapterUser);
  expect(ability.can('manage', unit1)).toBeTruthy();
  expect(ability.can('manage', unit2)).toBeFalsy();
  expect(ability.can('manage', election1)).toBeTruthy();
  expect(ability.can('manage', election2)).toBeFalsy();
  expect(ability.can('manage', candidate1)).toBeTruthy();
  expect(ability.can('manage', candidate2)).toBeFalsy();
  expect(ability.can('manage', nomination1)).toBeTruthy();
  expect(ability.can('manage', nomination2)).toBeFalsy();
});
