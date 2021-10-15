/* eslint-disable @typescript-eslint/no-var-requires */
require('dotenv').config()
const kill = require('kill-port')

import { job } from '@src/job'
import { db } from '@src/db'
import { verifyEnvironment, serverPort } from '@src/env'
import { server } from '@src/graphql'
import { fp } from '@src/helper'
import { blockchain } from '@src/blockchain'

const bootstrap = (): Promise<void> => {
  verifyEnvironment()
  return db.connect()
    .then(() => server.start(serverPort))
    .then(fp.pause(500))
    .then(blockchain.createProviders)
    .then(job.startAndListen)
}

const handleError = (err: Error): void => {
  console.error(err)
  throw err
}

const killPort = (): Promise<unknown> => {
  return kill(serverPort)
    // Without this small delay sometimes it's not killed in time
    .then(fp.pause(500))
    .catch((err: any) => console.log(err))
}

const logGoodbye = (): void => {
  console.log('Cya! Thanks for stopping by.')
}

const cleanExit = (): Promise<void> => {
  return server.stop()
    .then(killPort)
    .then(db.disconnect)
    .then(job.stopAndDisconnect)
    .then(fp.pause(500))
    .finally(() => {
      logGoodbye()
      process.exit()
    })
}

process.on('SIGINT', cleanExit)
process.on('SIGTERM', cleanExit)

bootstrap().catch(handleError)
