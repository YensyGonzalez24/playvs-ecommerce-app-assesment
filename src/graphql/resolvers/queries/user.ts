import { extendType, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { UserType } from "../../types";
import { cacheKeys } from "../../../utils/constants";

export const UserQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.field("getAllUsers", {
      type: UserType,
      description: "Get all users",
      resolve: async (_parent, _args, ctx: Context) => {
        // Check if data is cached
        const cachedData = await ctx.redis.get(cacheKeys.GET_ALL_USERS);

        if (cachedData) {
          // Return cached data if available
          return JSON.parse(cachedData);
        }

        // Fetch users from the database
        const users = await ctx.prisma.user.findMany();

        // Cache the fetched data for future use
        await ctx.redis.set(cacheKeys.GET_ALL_USERS, JSON.stringify(users), {
          EX: 60,
        });

        return users;
      },
    });

    t.field("getUserById", {
      type: UserType,
      description: "Get a user by ID",
      args: {
        id: nonNull(stringArg({
          description: "The ID of the user",
        })),
      },
      resolve: (_parent, { id }, ctx: Context) => {
        return ctx.prisma.user.findUnique({
          where: { id },
        });
      },
    });
  },
});
