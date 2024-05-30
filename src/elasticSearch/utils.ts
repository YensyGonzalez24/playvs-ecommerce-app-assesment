import { PrismaClient } from "@prisma/client";
import { Client } from "@elastic/elasticsearch";

/**
 * Creates an Elasticsearch client and performs necessary setup operations.
 * @param prisma - The Prisma client instance.
 * @returns The Elasticsearch client instance.
 */
const createElasticSearchClient = (prisma: PrismaClient) => {
  const elasticsearch = new Client({
    node: `http://${process.env.ELASTICSEARCH_HOST}:9200`,
  });

  createIndex(elasticsearch);
  insertDataIntoElasticsearch(prisma, elasticsearch);

  return elasticsearch;
};

/**
 * Inserts data into Elasticsearch.
 * 
 * @param prisma - The Prisma client instance.
 * @param elasticsearch - The Elasticsearch client instance.
 */
const insertDataIntoElasticsearch = async (
  prisma: PrismaClient,
  elasticsearch: Client
) => {
  const products = await prisma.product.findMany();
  const body = products.flatMap((product) => [
    { index: { _index: "products", _id: product.id } },
    product,
  ]);

  await elasticsearch.bulk({ refresh: true, body }).catch((error) => {
    console.error("Elasticsearch error:", error);
  });
};

/**
 * Creates an index in Elasticsearch if it doesn't already exist.
 * @param elasticsearch - The Elasticsearch client.
 */
const createIndex = async (elasticsearch: Client) => {
  const index = "products";
  const exists = await elasticsearch.indices.exists({ index });
  if (!exists.body) {
    await elasticsearch.indices.create({
      index,
      body: {
        mappings: {
          properties: {
            name: { type: "text" },
            description: { type: "text" },
          },
        },
      },
    });
  }
};

export {
    createElasticSearchClient,
}
