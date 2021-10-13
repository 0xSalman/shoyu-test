import { GQLTypes, ApolloCtx } from '@src/defs'

const getCurrentUser = (_: any, args: any, context: ApolloCtx): Promise<GQLTypes.User> => {
  return Promise.resolve(null)
}

const signup = (): void => {
  // TODO impl
}

export default {
  Query: {
    me: getCurrentUser,
  },
  Mutation: {
    signUp: signup,
  },
}
