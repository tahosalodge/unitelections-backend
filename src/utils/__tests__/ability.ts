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
} from 'utils/mocks';
import { ANONYMOUS, defineAbilitiesFor } from 'utils/ability';

test('Anonymous user permissions', () => {
  expect(ANONYMOUS.can('create', 'User')).toBeTruthy();
  expect(ANONYMOUS.can('read', 'Lodge')).toBeTruthy();
  expect(ANONYMOUS.can('create', 'Lodge')).toBeFalsy();
  expect(ANONYMOUS.can('create', 'Unit')).toBeFalsy();
});

test('Regular user permissions', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeFalsy();
  expect(ability.can('read', lodge1)).toBeTruthy();
});

test('Users can create a unit', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', 'Unit')).toBeTruthy();
});

test('Users can create an election', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', 'Election')).toBeTruthy();
});

test('Users can create a candidate', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('create', 'Candidate')).toBeTruthy();
});

test('Admins can manage all lodges and update other users', () => {
  const ability = defineAbilitiesFor(adminUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeTruthy();
  expect(ability.can('update', lodge1)).toBeTruthy();
  expect(ability.can('update', lodge2)).toBeTruthy();
});

test('Chapter users can manage elections, units, and candidates in their chapter', () => {
  const ability = defineAbilitiesFor(chapterUser);
  expect(ability.can('manage', unit1)).toBeTruthy();
  expect(ability.can('manage', election1)).toBeTruthy();
  expect(ability.can('manage', candidate1)).toBeTruthy();
  expect(ability.can('manage', unit2)).toBeFalsy();
  expect(ability.can('manage', election2)).toBeFalsy();
  expect(ability.can('manage', candidate2)).toBeFalsy();
});
