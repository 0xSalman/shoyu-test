import { ApolloServer } from 'apollo-server'
import { typeDefs } from '@src/graphql/schema'
import { resolvers } from '@src/graphql/resolver'
import { ApolloCtx } from '@src/defs'

const createContext = (ctx: any): ApolloCtx => {
  const { req: request, connection } = ctx
  // * For subscription and query-mutation, gql handles headers differently 😪
  const headers = connection && connection.context ? connection.context : request.headers
  return null
}

let server: ApolloServer

export const startApolloSever = async (port: number): Promise<void> => {
  if (server) {
    return
  }

  server = new ApolloServer({
    cors: true,
    resolvers: resolvers,
    typeDefs: typeDefs(),
    context: createContext,
  })
  const { url } = await server.listen(port)
  console.log(`🚀  Server ready at ${url}`)
}

export const stopApolloServer = (): Promise<void> => {
  if (!server) {
    return
  }
  return server.stop()
}
