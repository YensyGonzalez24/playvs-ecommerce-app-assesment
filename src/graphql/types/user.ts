import { objectType } from "nexus";
import { User } from "nexus-prisma";
import { Role } from "./enums";

/**
 * Represents the GraphQL object type for a user.
 */
export const UserType = objectType({
  name: User.$name,
  definition(t) {
    t.field(User.id);
    t.nonNull.field(User.email);
    t.nonNull.field(User.name);
    t.nonNull.field(User.password);
    t.field("role", {
      type: Role,
    });
  },
});
