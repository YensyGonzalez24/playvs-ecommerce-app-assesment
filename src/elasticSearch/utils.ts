import { PrismaClient } from "@prisma/client";
import { Client } from "@elastic/elasticsearch";

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
  try {
    const products = await prisma.product.findMany();

    if (products.length === 0) {
      console.log("No products found to insert into Elasticsearch.");
      return;
    }

    const body = products.flatMap((product) => [
      { index: { _index: "products", _id: product.id } },
      product,
    ]);

    const { body: bulkResponse } = await elasticsearch.bulk({
      refresh: true,
      body,
    });

    if (bulkResponse.errors) {
      console.error("Errors in bulk insert:", bulkResponse.errors);
    } else {
      console.log("Successfully inserted data into Elasticsearch.");
    }
  } catch (error) {
    console.error("Elasticsearch error:", error);
  }
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

export { insertDataIntoElasticsearch, createIndex };
