import { Role, User } from '@prisma/client';

type convertUserToResponseType = User & {
  role: Role;
};

export function convertUserToResponse(user: convertUserToResponseType) {
  const role = user.role.name ?? '';

  return {
    username: user.username,
    email: user.email,
    role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
