import express from "express";
import http from "http";
import { Context, context as partialContext } from "./context";
import { schema } from "./schema";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { applyMiddleware } from "graphql-middleware";
import { json } from "body-parser";
import { GraphQLError } from "graphql";
import { permissions } from "./utils/permissions";
import { makeExecutableSchema } from "@graphql-tools/schema";

const app = express();
const httpServer = http.createServer(app);

// Create an executable schema by applying middleware to the schema
const executableSchema = applyMiddleware(
  makeExecutableSchema({
    typeDefs: schema,
    resolvers: {},
  }),
  permissions
);

// Create an Apollo Server instance with the executable schema
const server = new ApolloServer<Context>({
  schema: executableSchema,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
  formatError: (err) => {
    console.error(err);

    // Handle validation errors and return a custom error message
    if (
      (err.extensions as { stacktrace: string[] })?.stacktrace[0].includes(
        "ValidationError"
      )
    ) {
      return new GraphQLError("User Validation Error", {
        extensions: { code: "VALIDATION_ERROR", message: err.message },
      });
    }

    return err;
  },
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  await server.start();

  app.use(
    "/graphql",
    json(),
    expressMiddleware<Context>(server, {
      context: async ({ req }) => {
        const userId = req.headers["user-id"] as string;
        const elasticsearch = partialContext.elasticsearch;
        return { ...partialContext, userId, elasticsearch };
      },
    })
  );

  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer();
