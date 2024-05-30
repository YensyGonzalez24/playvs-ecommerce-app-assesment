import { extendType, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { CategoryType } from "../../types";
import { UserInputError } from "../../../utils/errors";
import { cacheKeys } from "../../../utils/constants";

export const CategoryQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.field("getAllCategories", {
      type: CategoryType,
      description: "Returns all categories",
      resolve: async (_parent, _args, ctx: Context) => {
        // Check if data is cached
        const cachedData = await ctx.redis.get(cacheKeys.GET_ALL_CATEGORIES);

        if (cachedData) {
          // Return cached data if available
          return JSON.parse(cachedData);
        }

        // Fetch categories from the database
        const categories = await ctx.prisma.category.findMany();

        // Cache the fetched data for future use
        await ctx.redis.set(
          cacheKeys.GET_ALL_CATEGORIES,
          JSON.stringify(categories),
          {
            EX: 60,
          }
        );

        return categories;
      },
    });

    t.field("getCategoryById", {
      type: CategoryType,
      description: "Returns a single category by its ID",
      args: {
        id: nonNull(stringArg({ description: "The ID of the category" })),
      },
      resolve: async (_parent, { id }, ctx: Context) => {
        // Find the category in the database
        const category = await ctx.prisma.product.findUnique({
          where: { id },
        });

        // Throw an error if category is not found
        if (!category) {
          throw new UserInputError("Product not found");
        }

        return category;
      },
    });
  },
});
