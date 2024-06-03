import { buildSchema } from 'graphql';
import userSchema from './userSchema';
import tsismisSchema from './tsismisSchema';
import likeSchema from './likeSchema';
import favoriteSchema from './favoriteSchema';
const linkSchema = `
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }
`;

const typeDefs = [
  linkSchema,
  userSchema,
  tsismisSchema,
  likeSchema,
  favoriteSchema,
].join('\n');
const schema = buildSchema(typeDefs);
export default schema;
