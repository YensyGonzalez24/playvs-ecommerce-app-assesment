import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./graphql/types";
import * as queries from "./graphql/resolvers/queries";
import * as mutations from "./graphql/resolvers/mutations";

export const schema = makeSchema({
  types: {
    ...types,
    ...queries,
    ...mutations,
  },
  outputs: {
    typegen: join(__dirname, "generated", "nexus-typegen.ts"),
    schema: join(__dirname, "generated", "schema.graphql"),
  },
  contextType: {
    module: join(__dirname, "./context.ts"),
    export: "Context",
  },
});