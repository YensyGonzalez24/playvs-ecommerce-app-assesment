import { rule, shield, and, allow } from "graphql-shield";
import { Context } from "../context";
import { AuthorizationError } from "./errors";

/**
 * Checks if the user is an admin.
 * @param _parent - The parent object.
 * @param _args - The arguments passed to the resolver.
 * @param ctx - The context object containing the user ID and Prisma client.
 * @returns A boolean indicating whether the user is an admin.
 * @throws AuthorizationError if the user is not an admin.
 */
const isAdmin = rule({ cache: "contextual" })(
  async (_parent, _args, ctx: Context) => {
    const userId = ctx.userId;

    if (!userId) {
      return false;
    }

    const user = await ctx.prisma.user.findUnique({ where: { id: userId } });

    if (user?.role !== "ADMIN") {
      return new AuthorizationError();
    }

    return true;
  }
);

export const permissions = shield({
  Query: {
    "*": allow,
    searchProducts: allow,
  },
  Mutation: {
    createUser: allow,
    updateUser: allow,
    deleteUser: allow,
    createProduct: isAdmin,
    updateProduct: isAdmin,
    deleteProduct: isAdmin,
    createCategory: isAdmin,
    updateCategory: isAdmin,
    deleteCategory: isAdmin,
  },
});
