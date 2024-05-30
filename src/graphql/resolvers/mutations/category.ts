import { extendType, nonNull, stringArg, intArg, floatArg } from "nexus";
import { UserInputError } from "../../../utils/errors";
import { categoryValidationSchema } from "../../../utils/validations";
import { resetCacheKeys } from "../../../redis/utils";
import { cacheKeys } from "../../../utils/constants";

export const CategoryMutations = extendType({
  type: "Mutation",
  definition(t) {
    // Create a new category
    t.field("createCategory", {
      type: "Category",
      description: "Create a new category",
      args: {
      name: nonNull(stringArg({ description: "The name of the category" })),
      },
      resolve: async (_parent, args, ctx) => {
      // Validate the input arguments using the categoryValidationSchema
      await categoryValidationSchema.validate(args, { abortEarly: false });

      // Reset cache keys related to categories
      await resetCacheKeys(ctx, [cacheKeys.GET_ALL_CATEGORIES]);

      // Create a new category in the database using the provided arguments
      return ctx.prisma.category.create({
        data: args,
      });
      },
    });

    t.field("updateCategory", {
      type: "Category",
      description: "Update an existing category",
      args: {
      id: nonNull(stringArg({ description: "The ID of the category" })),
      name: stringArg({ description: "The new name of the category" }),
      },
      resolve: async (_parent, args, ctx) => {
      // Find the category in the database based on the provided ID
      const category = await ctx.prisma.category.findUnique({
        where: { id: args.id },
      });

      // If the category does not exist, throw an error
      if (!category) throw new UserInputError("Category not found");

      // Reset cache keys related to categories
      await resetCacheKeys(ctx, [cacheKeys.GET_ALL_CATEGORIES]);

      // Update the category in the database with the new name
      return ctx.prisma.category.update({
        where: { id: args.id },
        data: {
        name: args.name || category.name, // Use the new name if provided, otherwise keep the existing name
        },
      });
      },
    });

    // Delete a category
    t.field("deleteCategory", {
      type: "Boolean",
      description: "Delete a category",
      args: {
      id: nonNull(stringArg({ description: "The ID of the category" })),
      },
      resolve: async (_parent, { id }, ctx) => {
      // Delete all products associated with the category
      await ctx.prisma.$transaction([
        ctx.prisma.product.deleteMany({
        where: { categoryId: id },
        }),
        
        // Delete the category itself
        ctx.prisma.category.delete({
        where: { id },
        }),
      ]);

      // Reset cache keys related to categories
      await resetCacheKeys(ctx, [cacheKeys.GET_ALL_CATEGORIES]);

      // Return true to indicate successful deletion
      return true;
      },
    });
  },
});
