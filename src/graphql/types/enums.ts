import { enumType } from "nexus";

export const Role = enumType({
    name: 'Role',
    members: ['USER', 'ADMIN'],
  });