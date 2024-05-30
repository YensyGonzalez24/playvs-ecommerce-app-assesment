import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";
import { createElasticSearchClient } from "./elasticSearch/utils";
import { createRedisClient } from "./redis/utils";

const prisma = new PrismaClient();
const elasticsearch = createElasticSearchClient(prisma);
const redis = createRedisClient();

export interface Context {
  prisma: PrismaClient;
  redis: ReturnType<typeof createClient>;
  elasticsearch: ElasticsearchClient;
  userId: string | null;
}

export const context = {
  prisma,
  redis,
  elasticsearch,
};
