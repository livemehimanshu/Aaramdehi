import test from 'node:test';
import assert from 'node:assert/strict';
import { mapUserForAdmin, getUserDisplayStatus } from '../utils/adminUserUtils.js';

test('maps users to admin-friendly data and marks blocked users correctly', () => {
  const user = {
    _id: 'abc123',
    name: 'Ali Khan',
    email: 'ali@example.com',
    role: 'USER',
    isVerified: true,
    isBlocked: true,
    password: 'secret',
    createdAt: '2025-01-10T00:00:00.000Z'
  };

  const result = mapUserForAdmin(user, 4);

  assert.equal(result.id, 'abc123');
  assert.equal(result.name, 'Ali Khan');
  assert.equal(result.email, 'ali@example.com');
  assert.equal(result.orders, 4);
  assert.equal(result.status, 'Blocked');
  assert.equal(result.isBlocked, true);
  assert.equal(result.role, 'USER');
  assert.equal(result.isVerified, true);
  assert.equal(result.password, undefined);
});

test('returns active status when no block flag exists', () => {
  assert.equal(getUserDisplayStatus({}), 'Active');
  assert.equal(getUserDisplayStatus({ isBlocked: false }), 'Active');
  assert.equal(getUserDisplayStatus({ isBlocked: true }), 'Blocked');
});
