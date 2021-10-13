import { ApolloServer } from 'apollo-server'
import { typeDefs } from '@src/graphql/schema'
import { resolvers } from '@src/graphql/resolver'
import { ApolloCtx } from '@src/defs'
import { ethers } from 'ethers'
import { AUTH_MESSAGE } from '@src/env'
import { toUserId } from '@src/helper/misc'

// TODO this returns any address which
//    1) may not even exist or
//    2) does not actually belong to user making the request
//  this does not verify that user actually signed the required message
const getAddress = (signature: string): string => {
  const signerAddress = ethers.utils.verifyMessage(AUTH_MESSAGE, signature)
  return signerAddress.toLowerCase()
}

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

  const address = getAddress(authSignature)
  const userId = toUserId(chainId, address)
  return {
    userId,
    address,
    chainId,
  }
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
