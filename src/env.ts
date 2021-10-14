import * as _ from 'lodash'
import { misc } from '@src/helper'

const lookupEnvKeyOrThrow = (key: string): string => {
  const value = process.env[key]
  if (_.isString(value)) {
    return value
  }
  throw new Error(`Environment variable ${key} is required`)
}

export const verifyEnvironment = (): void => {
  console.log('Loading environment...')
}

export const SERVER_PORT = parseInt(process.env.PORT) || 9080
export const NODE_ENV = process.env.NODE_ENV
export const AUTH_MESSAGE = lookupEnvKeyOrThrow('AUTH_MESSAGE')

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 27017,
  username: process.env.DB_USERNAME || 'mongo',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'app',
}

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
}

export const blockchainConfig = {
  networks: misc.stringListToMap(lookupEnvKeyOrThrow('NETWORKS')),
  networksURI: misc.stringListToMap(lookupEnvKeyOrThrow('NETWORKS_URI'), '|', ';'),
  contractIds: misc.stringListToMap(lookupEnvKeyOrThrow('CONTRACT_IDS')),
  contractAccount: lookupEnvKeyOrThrow('CONTRACT_ACCOUNT'),
  contractAccountPK: lookupEnvKeyOrThrow('CONTRACT_ACCOUNT_PK'),
}
