/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()

import { startJobsAndListen, stopJobsAndDisconnect } from '@src/job'
import { db } from '@src/db'
import { verifyEnvironment, SERVER_PORT } from '@src/env'
import { stopApolloServer, startApolloSever } from '@src/graphql'
import { fp } from '@src/helper'

const kill = require('kill-port')

const bootstrap = (): Promise<void> => {
  verifyEnvironment()
  return db.connect()
    .then(() => startApolloSever(SERVER_PORT))
    .then(fp.pause(500))
    .then(() => startJobsAndListen())
}

const handleError = (err: Error): void => {
  console.error(err)
  throw err
}

const killPort = (): Promise<unknown> => {
  return kill(SERVER_PORT)
    // Without this small delay sometimes it's not killed in time
    .then(fp.pause(500))
    .catch((err: any) => console.log(err))
}

const logGoodbye = (): void => {
  console.log('Cya! Thanks for stopping by.')
}

const cleanExit = (): Promise<void> => {
  return stopApolloServer()
    .then(killPort)
    .then(db.disconnect)
    .then(stopJobsAndDisconnect)
    .then(fp.pause(500))
    .finally(() => {
      logGoodbye()
      process.exit()
    })
}

process.on('SIGINT', cleanExit)
process.on('SIGTERM', cleanExit)

bootstrap().catch(handleError)
