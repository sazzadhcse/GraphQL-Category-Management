# GraphQL Category API

A GraphQL API for managing hierarchical categories with caching support.

> **Note:** This project contains both mandatory and bonus tasks. To view only the mandatory tasks, checkout to commit `c85e3bb`:
> ```bash
> git checkout c85e3bb
> ```

## Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Apollo Server** - GraphQL server
- **MongoDB** - Database
- **Redis** - Caching layer
- **TypeScript** - Language


## Project Structure

```
src/
├── config/
│   ├── database.ts       # MongoDB connection
│   └── redis.ts          # Redis client
├── models/
│   └── category.ts       # Category schema
├── services/
│   └── category.ts       # Business logic + caching
├── graphql/
│   ├── schema.ts         # GraphQL type definitions
│   └── resolvers.ts      # GraphQL resolvers
├── utils/
│   ├── cache.ts          # Cache utilities
│   └── errors.ts         # Custom error classes
└── server.ts             # Express + Apollo setup
```


## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- MongoDB
- Redis

## Deployment with Docker

The easiest way to run all services together:

```bash
docker-compose up
```

This will start:
- **API** at `http://localhost:3000`
- **GraphQL Playground** at `http://localhost:3000/graphql`
- **MongoDB** at `mongodb://localhost:27017`
- **Redis** at `redis://localhost:6379`

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start MongoDB & Redis

```bash
docker-compose up mongo redis
```

### 3. Configure Environment

Create `.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/graphql-category
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
MAX_CATEGORY_LEVEL=4
```

### 4. Run Development Server

```bash
npm run dev
```

## Production Deployment

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

## GraphQL Endpoints

### Queries

```graphql
# Get all categories
getCategories

# Get category by ID
getCategory(id: ID!)

# Search category by name
searchCategory(name: String!)
```

### Mutations

```graphql
# Create category
createCategory(name: String!, parentId: ID)

# Update category
updateCategory(id: ID!, name: String!)

# Deactivate category (cascades to descendants)
deactivateCategory(id: ID!)

# Delete category (cascades to descendants)
deleteCategory(id: ID!)
```

## Example GraphQL Queries

### Create Root Category

```graphql
mutation {
  createCategory(name: "Electronics") {
    id
    name
    isActive
  }
}
```

### Create Child Category

```graphql
mutation {
  createCategory(
    name: "Appliances"
    parentId: "6a36dff2c957a8d32e8fa26a"
  ) {
    id
    name
    parent {
      id
      name
    }
    ancestors {
      id
      name
    }
  }
}
```

### Get All Categories

```graphql
query {
  getCategories {
    id
    name
    path
    parent {
      id
      name
    }
    ancestors {
      id
      name
    }
  }
}
```


## Health Check

```bash
curl http://localhost:3000/health
```

Response: `{"status":"ok"}`
