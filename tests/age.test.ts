import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateAge } from '../utils/ageHelper.ts';

test('age changes on the UTC birthday, including after a leap day', (t) => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2028-07-25T23:59:59Z') });
  assert.equal(calculateAge(), 37);
  t.mock.timers.setTime(new Date('2028-07-26T00:00:00Z').getTime());
  assert.equal(calculateAge(), 38);
  t.mock.timers.setTime(new Date('2029-01-01T00:00:00Z').getTime());
  assert.equal(calculateAge(), 38);
  t.mock.timers.setTime(new Date('2029-07-26T04:17:00Z').getTime());
  assert.equal(calculateAge(), 39);
});
