import { ApolloServer } from 'apollo-server'
import { typeDefs } from '@src/graphql/schema'
import { resolvers } from '@src/graphql/resolver'
import { ApolloCtx } from '@src/defs'
import { toUserId } from '@src/helper/misc'
import { blockchain } from '@src/blockchain'

const createContext = (ctx: any): ApolloCtx => {
  const { req: request, connection } = ctx
  // * For subscription and query-mutation, gql handles headers differently 😪
  const headers = connection && connection.context ? connection.context : request.headers

  const chainId = headers['Chain-Id']
  if (!chainId) {
    throw new Error('Missing required header "Chain-Id"')
  }

  const authSignature = headers['Auth-Signature']
  if (!authSignature) {
    throw new Error('Missing required header "Auth-Signature"')
  }

  const address = blockchain.getAddressFromSignature(authSignature)
  const userId = toUserId(chainId, address)
  return {
    userId,
    address,
    chainId,
  }
}

let server: ApolloServer

export const start = async (port: number): Promise<void> => {
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

export const stop = (): Promise<void> => {
  if (!server) {
    return
  }
  return server.stop()
}
