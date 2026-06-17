/// Roles are ordered from most permissions to least permissions
export enum CompareType {
  Exact,
  Ordered,
  Not,
}
export enum Role {
  INVITED = 0,
  VIEWER = 1,
  MEMBER = 2,
  EDITOR = 3,
  ADMIN = 4,
  OWNER = 5,
}

export type Policy = {
  role: Role;
  compareType?: CompareType;
};

/// Checks if the role returned by the result of a database fetch matches the
/// given role. Notice that the `userRole` is a string, this makes it harder to
/// get the two roles switched up.
export function canAccess(userRole: string, policy: Policy): boolean {
  const parsedRole = Role[userRole as keyof typeof Role];
  if (policy.compareType === undefined) {
    policy.compareType = CompareType.Ordered;
  }
  switch (policy.compareType) {
    case CompareType.Exact:
      return parsedRole === policy.role;
    case CompareType.Ordered:
      return parsedRole >= policy.role;
    case CompareType.Not:
      return parsedRole !== policy.role;
  }
}
