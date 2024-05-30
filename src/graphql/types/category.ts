import { objectType } from "nexus";
import { Category } from "nexus-prisma";
import { ProductType } from "./product";

/**
 * Represents the GraphQL object type for a Category.
 */
export const CategoryType = objectType({
  name: Category.$name,
  definition(t) {
    t.field(Category.id);
    t.nonNull.field(Category.name);
    t.list.field("products", {
      type: ProductType,
      resolve: (parent, _args, ctx) => {
        return ctx.prisma.product.findMany({
          where: { categoryId: parent.id },
        });
      },
    });
  },
});
