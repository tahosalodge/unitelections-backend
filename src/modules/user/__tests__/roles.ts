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
} from 'utils/mocks';
import { ANONYMOUS, defineAbilitiesFor } from 'user/roles';

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

test('Admins can manage all lodges and update other users', () => {
  const ability = defineAbilitiesFor(adminUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeTruthy();
  expect(ability.can('update', lodge1)).toBeTruthy();
  expect(ability.can('update', lodge2)).toBeTruthy();
});

test('Chapter users can manage elections and units in their chapter', () => {
  const ability = defineAbilitiesFor(chapterUser);
  expect(ability.can('manage', unit1)).toBeTruthy();
  expect(ability.can('manage', election1)).toBeTruthy();
  expect(ability.can('manage', unit2)).toBeFalsy();
  expect(ability.can('manage', election2)).toBeFalsy();
});
