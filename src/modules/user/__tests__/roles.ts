import { regularUser, adminUser, lodge1, lodge2 } from 'utils/mocks';
import { ANONYMOUS, defineAbilitiesFor } from 'user/roles';

test('Anonymous users can register or view a lodge', () => {
  expect(ANONYMOUS.can('create', 'User')).toBeTruthy();
  expect(ANONYMOUS.can('read', 'Lodge')).toBeTruthy();
  expect(ANONYMOUS.can('create', 'Lodge')).toBeFalsy();
  expect(ANONYMOUS.can('create', 'Unit')).toBeFalsy();
});

test('Users can manage their lodge', () => {
  const ability = defineAbilitiesFor(regularUser);
  expect(ability.can('update', regularUser)).toBeTruthy();
  expect(ability.can('update', adminUser)).toBeFalsy();
  expect(ability.can('update', lodge1)).toBeTruthy();
  expect(ability.can('update', lodge2)).toBeFalsy();
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
