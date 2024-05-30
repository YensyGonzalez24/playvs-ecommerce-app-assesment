# Mini E-commerce API

This project is a simple e-commerce backend API that handles products, categories, and search functionalities. It is built using TypeScript, GraphQL, PostgreSQL, Redis, and Elasticsearch. The project uses Docker and Docker Compose for setting up the local development environment.

## Features

- CRUD operations for products, categories, and users.
- Search functionality using Elasticsearch.
- Caching with Redis.
- GraphQL API with queries and mutations.
- Input validation and error handling.
- Authorization using roles.

## Technologies

- TypeScript
- Node.js
- GraphQL (Apollo Server)
- PostgreSQL (Prisma ORM)
- Redis
- Elasticsearch
- Docker & Docker Compose

## Setup

### Prerequisites

- Node.js
- Docker and Docker Compose
  
### Installation

`docker-compose up`

## Usage

### GraphQL Endpoints

#### Admin authorization

In order to use the endpoints that have authorization protection you must pass a http header called `user-id` containing the user id of a user with the `ADMIN` role

#### Product

- createProduct: Create a new product.
- updateProduct: Update an existing product.
- deleteProduct: Delete a product.
- getAllProducts: Fetch all products.
- getProductsByCategory: Fetch products by category.
- getProductById: Fetch a product by its ID.
- searchProducts: Search products by name and description.

#### User

- createUser: Create a new user.
- updateUser: Update an existing user.
- deleteUser: Delete a user.
- getAllUsers: Fetch all users.
- getUserById: Fetch a user by its ID.

#### Category

- createCategory: Create a new category.
- updateCategory: Update an existing category.
- deleteCategory: Delete a category and all associated products.
- getAllCategories: Fetch all categories.

**Note:** The following endpoints are only accessible by an admin:

- createProduct
- updateProduct
- deleteProduct
- createCategory
- updateCategory
- deleteCategory
