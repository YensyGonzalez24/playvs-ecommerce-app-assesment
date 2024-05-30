import { objectType } from "nexus";
import { Product } from "nexus-prisma";
import { CategoryType } from "./category";

/**
 * Represents the GraphQL object type for a Product.
 */
export const ProductType = objectType({
  name: Product.$name,
  definition(t) {
    t.field(Product.id);
    t.nonNull.field(Product.name);
    t.nonNull.field(Product.price);
    t.nonNull.field(Product.description);
    t.nonNull.field(Product.categoryId);
    t.field("category", {
      type: CategoryType,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.category.findUnique({
          where: { id: parent.categoryId },
        });
      },
    });
  },
});
