import { extendType, nonNull, stringArg, intArg, floatArg } from "nexus";
import { Context } from "../../../context";
import { ProductType } from "../../types";
import { UserInputError } from "../../../utils/errors";
import { productValidationSchema } from "../../../utils/validations";
import { cacheKeys } from "../../../utils/constants";
import { resetCacheKeys } from "../../../redis/utils";

export const ProductMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createProduct", {
      type: ProductType,
      description: "Create a new product",
      args: {
        name: nonNull(stringArg({ description: "The name of the product" })),
        description: nonNull(
          stringArg({ description: "The description of the product" })
        ),
        price: nonNull(floatArg({ description: "The price of the product" })),
        categoryId: nonNull(
          stringArg({
            description: "The ID of the category the product belongs to",
          })
        ),
      },
      resolve: async (_parent, args, ctx: Context) => {
        // Validate the input arguments
        await productValidationSchema.validate(args, { abortEarly: false });

        const { categoryId, ...otherArgs } = args;

        // Find the category by ID
        const category = await ctx.prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          throw new UserInputError("Category not found");
        }

        // Create the product
        const product = await ctx.prisma.product.create({
          data: {
            ...otherArgs,
            category: { connect: { id: categoryId } },
          },
        });

        if (product) {
          // Index the product in Elasticsearch
          await ctx.elasticsearch
            .index({
              index: "products",
              id: product.id,
              body: product,
            })
            .catch((error) => {
              console.error("Elasticsearch error:", error);
            });
        }

        // Reset cache keys
        await resetCacheKeys(ctx, [
          cacheKeys.GET_PRODUCTS_BY_CATEGORY,
          cacheKeys.SEARCH_PRODUCTS,
        ]);

        return product;
      },
    });

    t.field("updateProduct", {
      type: ProductType,
      description: "Update an existing product",
      args: {
        id: nonNull(
          stringArg({ description: "The ID of the product to update" })
        ),
        name: stringArg({ description: "The updated name of the product" }),
        description: stringArg({
          description: "The updated description of the product",
        }),
        price: floatArg({ description: "The updated price of the product" }),
        categoryId: stringArg({
          description: "The updated ID of the category the product belongs to",
        }),
      },
      resolve: async (_parent, args, ctx: Context) => {
        const product = await ctx.prisma.product.findUnique({
          where: { id: args.id },
        });

        if (!product) throw new UserInputError("Product not found");

        const updatedData: any = { ...args };
        delete updatedData.id;

        if (args.categoryId) {
          // Find the category by ID
          const category = await ctx.prisma.category.findUnique({
            where: { id: args.categoryId },
          });
          if (!category) {
            throw new UserInputError("Category not found");
          }
          updatedData.category = { connect: { id: args.categoryId } };
        }

        // Reset cache keys
        await resetCacheKeys(ctx, [
          cacheKeys.GET_PRODUCTS_BY_CATEGORY,
          cacheKeys.SEARCH_PRODUCTS,
        ]);

        return ctx.prisma.product.update({
          where: { id: args.id },
          data: updatedData,
        });
      },
    });

    t.field("deleteProduct", {
      type: "Boolean",
      description: "Delete a product",
      args: {
        id: nonNull(
          stringArg({ description: "The ID of the product to delete" })
        ),
      },
      resolve: async (_parent, { id }, ctx: Context) => {
        const product = await ctx.prisma.product.findUnique({
          where: { id },
        });

        if (!product) {
          throw new UserInputError("Product not found");
        }

        // Delete the product
        await ctx.prisma.product.delete({
          where: { id },
        });

        // Reset cache keys
        await resetCacheKeys(ctx, [
          cacheKeys.GET_PRODUCTS_BY_CATEGORY,
          cacheKeys.SEARCH_PRODUCTS,
        ]);

        return true;
      },
    });
  },
});
