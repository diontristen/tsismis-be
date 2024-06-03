
const tsismisSchema = `
type Tsismis {
  id: ID!
  message: String!
  userId: ID!
  user: User!
  tags: [String!]
  likes: Int!
  hasLiked: Boolean!
  favorites: Int!
  hasFavorited: Boolean!
  createdAt: Float!
  updatedAt: Float!
  success: Boolean!
}

type TsismisPage {
  tsismis: [Tsismis]
  endCursor: String
  hasNextPage: Boolean
}

extend type Query {
  getTsismis(cursor: String, limit: Int!): TsismisPage
  getTsismisByOwnUser(cursor: String, limit: Int!): TsismisPage
  getTsismisByUsername(username: String!, cursor: String!, limit: Int!): TsismisPage
  getFavoriteTsismisByOwnUser(cursor: String, limit: Int!): TsismisPage
  searchTsismisMessages(query: String!, cursor: String!, limit: Int!): TsismisPage
}

extend type Mutation {
  createTsismis(message: String!, tags: [String!]): Tsismis
  deleteTsismis(id: String!): Tsismis
  updateTsismis(id: String!, message: String!, tags: [String!]): Tsismis
}
`;

export default tsismisSchema;