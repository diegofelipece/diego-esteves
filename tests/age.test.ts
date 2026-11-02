import assert from 'node:assert/strict';
import { test } from 'node:test';
import profile from '../content/profile/diego-esteves.json' with { type: 'json' };
import { ageInfo } from '../utils/ageHelper.ts';

test('calendar age and birthday change at the local date boundary, including leap years', () => {
  const [birthYear, month, day] = profile.basics.birthDate.split('-').map(Number);
  for (const year of [2040, 2041]) {
    assert.deepEqual(ageInfo(new Date(year, month - 1, day - 1, 23, 59, 59)), { age: year - birthYear - 1, birthday: false });
    assert.deepEqual(ageInfo(new Date(year, month - 1, day)), { age: year - birthYear, birthday: true });
    assert.deepEqual(ageInfo(new Date(year, month - 1, day + 1)), { age: year - birthYear, birthday: false });
  }
  assert.equal(ageInfo(new Date(2041, 0, 1)).age, 2040 - birthYear);
});

test('build snapshot age uses UTC calendar components explicitly', () => {
  const [birthYear, month, day] = profile.basics.birthDate.split('-').map(Number);
  const birthday = Date.UTC(2040, month - 1, day);
  assert.deepEqual(ageInfo(new Date(birthday - 1), true), { age: 2040 - birthYear - 1, birthday: false });
  assert.deepEqual(ageInfo(new Date(birthday), true), { age: 2040 - birthYear, birthday: true });
});
