import { extendType, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { UserType } from "../../types";
import { userValidationSchema } from "../../../utils/validations";
import { Role } from "@prisma/client";
import { resetCacheKeys } from "../../../redis/utils";

export const UserMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createUser", {
      type: UserType,
      description: "Create a new user",
      args: {
        email: nonNull(stringArg({
          description: "The email of the user (required)"
        })),
        name: nonNull(stringArg({
          description: "The name of the user (required)"
        })),
        password: nonNull(stringArg({
          description: "The password of the user (required)"
        })),
        role: stringArg({
          description: "The role of the user (optional)"
        }),
      },
      resolve: async (_parent, args, ctx: Context) => {
        await userValidationSchema.validate(args); // Validate the input arguments using a validation schema

        await resetCacheKeys(ctx, ["GET_ALL_USERS"]);

        // Create a new user in the database
        return ctx.prisma.user.create({
          data: {
            email: args.email,
            name: args.name,
            password: args.password,
            role: args.role as Role,
          },
        });
      },
    });

    t.field("updateUser", {
      type: UserType,
      description: "Update an existing user",
      args: {
        id: nonNull(stringArg({
          description: "The ID of the user to update (required)"
        })),
        email: nonNull(stringArg({
          description: "The updated email of the user (required)"
        })),
        name: nonNull(stringArg({
          description: "The updated name of the user (required)"
        })),
        password: nonNull(stringArg({
          description: "The updated password of the user (required)"
        })),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const user = await ctx.prisma.user.findUnique({
          where: { id: args.id },
        });
        if (!user) throw new Error("User not found");

        await resetCacheKeys(ctx, ["GET_ALL_USERS"]);

        // Update the user in the database
        return ctx.prisma.user.update({
          where: { id: args.id },
          data: {
            email: args.email || user.email,
            name: args.name || user.name,
            password: args.password || user.password,
          },
        });
      },
    });

    t.field("deleteUser", {
      type: "Boolean",
      description: "Delete an existing user",
      args: {
        id: nonNull(stringArg({
          description: "The ID of the user to delete (required)"
        })),
      },
      resolve: async (_parent, { id }, ctx: Context) => {
        // Delete the user from the database
        await ctx.prisma.user.delete({
          where: { id },
        });
        return true;
      },
    });
  },
});
