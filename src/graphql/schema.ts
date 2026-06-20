import { gql } from 'graphql-tag';

export const typeDefs = gql`
    type Category {
        id: ID!
        name: String!
        path: String!
        isActive: Boolean!
        parent: Category
        ancestors: [Category!]!
    }

    type Query {
        getCategory(id: ID!): Category
        searchCategory(name: String!): Category
        getCategories: [Category!]!
    }

    type Mutation {
        createCategory(name: String!, parentId: ID): Category!
        updateCategory(id: ID!, name: String!): Category!
        deactivateCategory(id: ID!): Boolean!
        deleteCategory(id: ID!): Boolean!
    }
`;