import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import { Client as ElasticsearchClient } from "@elastic/elasticsearch";
import {
  createIndex,
  insertDataIntoElasticsearch,
} from "./elasticSearch/utils";
import { createRedisClient } from "./redis/utils";

const prisma = new PrismaClient();
const redis = createRedisClient();
const elasticsearch = new ElasticsearchClient({
  node: `http://${process.env.ELASTICSEARCH_HOST}:9200`,
});

createIndex(elasticsearch);
insertDataIntoElasticsearch(prisma, elasticsearch);

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
