import { mergeResolvers } from '@graphql-tools/merge'
import UserResolvers from './user.resolver'

export const resolvers = mergeResolvers([
  UserResolvers,
])
