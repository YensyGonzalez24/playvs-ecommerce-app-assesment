import { extendType, nonNull, stringArg } from "nexus";
import { Context } from "../../../context";
import { ProductType } from "../../types";
import { UserInputError } from "../../../utils/errors";
import { cacheKeys } from "../../../utils/constants";

export const ProductQueries = extendType({
  type: "Query",
  definition(t) {
    t.list.field("productsByCategory", {
      type: ProductType,
      args: {
        categoryId: nonNull(stringArg()),
      },
      resolve: async (_parent, { categoryId }, ctx: Context) => {
        // Check if the data is cached
        const cachedData = await ctx.redis.get(
          `${cacheKeys.GET_PRODUCTS_BY_CATEGORY}:${categoryId}`
        );

        if (cachedData) {
          return JSON.parse(cachedData);
        }

        // Fetch products from the database
        const products = await ctx.prisma.product.findMany({
          where: { categoryId },
        });

        // Cache the fetched products for future use
        await ctx.redis.set(
          `${cacheKeys.GET_PRODUCTS_BY_CATEGORY}:${categoryId}`,
          JSON.stringify(products),
          {
            EX: 60,
          }
        );

        return products;
      },
    });

    t.list.field("searchProducts", {
      type: ProductType,
      args: {
        query: nonNull(stringArg()),
      },
      resolve: async (_parent, { query }, ctx: Context) => {
        // Check if the data is cached
        const cachedData = await ctx.redis.get(
          `${cacheKeys.SEARCH_PRODUCTS}:${query}`
        );

        if (cachedData) {
          // Return the cached data if available
          return JSON.parse(cachedData);
        }

        // Perform a search query on Elasticsearch
        const searchResponse = await ctx.elasticsearch.search({
          index: "products",
          body: {
            query: {
              multi_match: {
                query,
                fields: ["name", "description"],
              },
            },
          },
        });

        // Extract the search results from the response
        const products = searchResponse.body.hits.hits.map(
          (hit: any) => hit._source
        );

        // Cache the search results for future use
        await ctx.redis.set(
          `${cacheKeys.SEARCH_PRODUCTS}:${query}`,
          JSON.stringify(products),
          {
            EX: 60,
          }
        );

        return products;
      },
    });

    t.field("getProductById", {
      type: ProductType,
      args: {
        id: nonNull(stringArg()),
      },
      resolve: async (_parent, { id }, ctx: Context) => {
        // Fetch a product by its ID from the database
        const product = await ctx.prisma.product.findUnique({
          where: { id },
        });

        // Throw an error if the product is not found
        if (!product) {
          throw new UserInputError("Product not found");
        }

        return product;
      },
    });
  },
});
