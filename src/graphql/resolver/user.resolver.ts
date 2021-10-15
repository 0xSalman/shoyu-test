import Joi, { ValidationError } from 'joi'
import { combineResolvers } from 'graphql-resolvers'

import { gqlTypes, ApolloCtx } from '@src/defs'
import { blockchain } from '@src/blockchain'
import { helper } from '@src/helper'
import { userRepository } from '@src/db'
import { appError, userError } from '@src/graphql/error'

const getUser = (chainId: string, address: string): Promise<gqlTypes.User> => {
  const userId = helper.toCompositeKey(chainId, address)
  return userRepository.findById(userId)
    .then((user) => (user
      ? user
      : Promise.reject(userError.buildUserNotFound())
    ))
    .then((user) => ({
      id: user.id,
      address: user.address,
      chainId: user.chainId,
      name: user.name,
      twitter: user.twitter,
      username: user.username,
    }))
}

const getCurrentUser = (_: any, args: any, ctx: ApolloCtx): Promise<gqlTypes.User> => {
  const { chainId, address } = ctx
  console.log(`${address} is requesting his/her user info`)
  return getUser(chainId, address)
}

const getOtherUser = (
  _: any,
  args: gqlTypes.QueryUserArgs,
  ctx: ApolloCtx,
): Promise<gqlTypes.User> => {
  const schema = Joi.object().keys({
    address: Joi.string().required().error(new Error('address is required')),
  })
  const { error } = schema.validate(args)
  if (error) {
    // console.error(`resolver.user.invalid schema: ${error}`)
    throw appError.buildInvalidSchemaError()
  }

  const { chainId, address } = ctx
  const { address: otherAddress } = args
  console.log(`${address} is request user info of ${otherAddress}`)
  return getUser(chainId, otherAddress)
}

const validateInput = (input: gqlTypes.UserInput): ValidationError => {
  const schema = Joi.object().keys({
    username: Joi.string().required().error(new Error('username is required')),
    name: Joi.string(),
    twitter: Joi.string(),
  })
  const { error } = schema.validate(input, { abortEarly: false })
  return error
}

const toUser = (ctx: ApolloCtx, username: string, name: string, twitter: string): gqlTypes.User => {
  const { chainId, address, userId } = ctx
  return {
    id: userId,
    address,
    chainId: parseInt(chainId),
    username,
    name,
    twitter,
  }
}

const signup = (
  _: any,
  args: gqlTypes.MutationSignUpArgs,
  ctx: ApolloCtx,
): Promise<gqlTypes.User> => {
  const { chainId, address, userId } = ctx
  console.log(`${address} wants to sign up`)

  const error = validateInput(args.input)
  if (error) {
    // console.error(`resolver.signup.invalid schema: ${error}`)
    throw appError.buildInvalidSchemaError()
  }

  const { username, name, twitter } = {
    username: args.input.username,
    name: args.input.name || '',
    twitter: args.input.twitter || '',
  }
  const contract = blockchain.getContract(chainId)
  const chainUsername = helper.toCompositeKey(chainId, username)

  return Promise.all([
    userRepository.doesExist({ _id: userId }),
    userRepository.doesExist({ chainUsername }),
  ])
    .then(([userExists, usernameExists]) => {
      if (userExists) {
        return Promise.reject(userError.buildUserAlreadyExistsError())
      }
      if (usernameExists) {
        return Promise.reject(userError.buildUsernameAlreadyExistsError())
      }
    })
    .then(() => contract.createIdentity(address, username, name, twitter, blockchain.getGasConf()))
    .catch(err => {
      console.log(err)
      return Promise.reject(appError.buildCustomError('Failed to create identity in Blockchain'))
    })
    .then(() => toUser(ctx, username, name, twitter))
}

const updateMe = (
  _: any,
  args: gqlTypes.MutationUpdateMeArgs,
  ctx: ApolloCtx,
): Promise<gqlTypes.User> => {
  const { chainId, address, userId } = ctx
  console.log(`${address} wants to update his/her user info`)

  const error = validateInput(args.input)
  if (error) {
    // console.error(`resolver.updateMe.invalid schema: ${error}`)
    throw appError.buildInvalidSchemaError()
  }

  const chainUsername = helper.toCompositeKey(chainId, args.input.username)
  const contract = blockchain.getContract(chainId)

  return userRepository.doesExist({ chainUsername })
    .then((exists) => (exists
      ? Promise.reject(userError.buildUsernameAlreadyExistsError())
      : Promise.resolve()
    ))
    .then(() => userRepository.findById(userId))
    .then((existingUser) => {
      if (!existingUser) {
        return Promise.reject(userError.buildUserNotFound())
      }

      const { username, name, twitter } = {
        username: args.input.username,
        name: args.input.name || existingUser.name,
        twitter: args.input.twitter || existingUser.twitter,
      }
      return contract.updateIdentity(address, username, name, twitter, blockchain.getGasConf())
        .catch(err => {
          console.log(err)
          const msg = appError.buildCustomError('Failed to update identity in Blockchain')
          return Promise.reject(msg)
        })
        .then(() => toUser(ctx, username, name, twitter))
    })
}

export default {
  Query: {
    me: combineResolvers(helper.hasChainId, helper.isAuthenticated, getCurrentUser),
    user: combineResolvers(helper.hasChainId, helper.isAuthenticated, getOtherUser),
  },
  Mutation: {
    signUp: combineResolvers(helper.hasChainId, helper.isAuthenticated, signup),
    updateMe: combineResolvers(helper.hasChainId, helper.isAuthenticated, updateMe),
  },
}
