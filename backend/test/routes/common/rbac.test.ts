import { canAccess, Role, CompareType } from "#common/rbac.js";

import { test } from 'node:test'
import assert from 'node:assert'


test("RBAC Ordered", () => {
  assert.equal(canAccess("VIEWER", { role: Role.ADMIN }), false);
  assert.equal(canAccess("VIEWER", { role: Role.MEMBER }), false);
  assert.equal(canAccess("VIEWER", { role: Role.EDITOR }), false);
  assert.equal(canAccess("VIEWER", { role: Role.VIEWER }), true);
  assert.equal(canAccess("OWNER", { role: Role.ADMIN }), true);
});

test("RBAC NOT", () => {
  assert.equal(canAccess("OWNER", { role: Role.OWNER, compareType: CompareType.Not }), false);
  assert.equal(canAccess("OWNER", { role: Role.MEMBER, compareType: CompareType.Not }), true);
});
