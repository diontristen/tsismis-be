import userResolver from './userResolver';
import tsismisResolver from './tsismisResolver';
import likeResolver from './likeResolver';
import favoriteResolver from './favoriteResolver';

const combinedResolvers = {
    Query: {
      ...userResolver.Query,
      ...tsismisResolver.Query,
      ...likeResolver.Query,
      ...favoriteResolver.Query,
    },
    Mutation: {
      ...userResolver.Mutation,
      ...tsismisResolver.Mutation,
      ...likeResolver.Mutation,
      ...favoriteResolver.Mutation,
    },
  };
  
  const resolvers = {
    ...combinedResolvers.Query,
    ...combinedResolvers.Mutation,
  };

  export default resolvers;