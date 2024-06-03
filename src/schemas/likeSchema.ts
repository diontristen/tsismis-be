const likeSchema = `
  type Like {
    id: ID!
    tsismisId: ID!
    userId: ID!
    createdAt: Float!
    updatedAt: Float!
    success: Boolean!
    likes: Float!
    hasLike: Boolean!
  }


  extend type Mutation {
    likeTsismis(tsismisId: String!): Like 
    unlikeTsismis(tsismisId: String!): Like 
  }
`;

export default likeSchema;
