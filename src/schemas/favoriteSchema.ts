const favoriteSchema = `
  type Favorite {
    id: ID!
    tsismisId: ID!
    userId: ID!
    createdAt: Float!
    updatedAt: Float!
    success: Boolean!
    favorites: Float!
    hasFavorited: Boolean!
  }


  extend type Mutation {
    favoriteTsismis(tsismisId: String!): Like 
    unfavoriteTsismis(tsismisId: String!): Like 
  }
`;

export default favoriteSchema;
