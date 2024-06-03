
const userSchema = `
  type User {
    id: ID!
    username: String!
    displayName: String!
    description: String
    avatar: String!
    password: String!
    createdAt: Float!
    updatedAt: Float!
    tsismisCount: Int!
    likesCount: Int!
    favoritesCount: Int!
    success: Boolean!
  }

  type Token {
    token: String!
  }

  type Message {
    message: String!
  }

  type UserPage {
    users: [User]
    endCursor: String
    hasNextPage: Boolean
  }

 extend type Query {
    getUsers: [User]
    getUser(id: ID!): User
    getUserByUsername(username: String!): User
    me: User
    getLatestUsers: [User]
    searchUsers(username: String!, cursor: String!, limit: Int!): UserPage
  }

  extend type Mutation {
    signup(username: String!, displayName: String!, password: String!): Message
    login(username: String!, password: String!): Token
    updatePassword(oldPassword: String!, newPassword: String!): User
    updateUser(displayName: String!, description: String): User
  }
`;

export default userSchema;