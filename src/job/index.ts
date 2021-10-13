import { redisConfig, blockchainConfig } from '@src/env'
import { getEthereumEvent } from '@src/job/handler'
import * as Bull from 'bull'

const redis = {
  host: redisConfig.host,
  port: redisConfig.port,
}
const queuePrefix = 'queue'
const queues: {[key: string]: Bull.Queue} = {}

const createQueues = (): void => {
  blockchainConfig.networks.forEach((val: string, key: string) => {
    const qname = `${key}-${val}`
    queues[key] = new Bull(qname, {
      prefix: queuePrefix,
      redis,
    })
  })
}

const listenToJobs = (): Promise<void[]> => {
  const values = Object.values(queues)
  return Promise.all(values.map((queue) => {
    return queue.process(getEthereumEvent)
  }))
}

const publishJobs = (): Promise<Bull.Job[]> => {
  const chainIds = Object.keys(queues)
  return Promise.all(chainIds.map((chainId) => {
    // console.log(chainId)
    return queues[chainId].add({ chainId }, {
      removeOnComplete: true,
      removeOnFail: true,
      // repeat every 10 seconds
      repeat: { every: 10000 },
    })
  }))
}

export const startJobsAndListen = (): Promise<void> => {
  createQueues()
  return publishJobs()
    .then(() => void listenToJobs())
    .then(() => console.log('Start 👂 listening for jobs :)!!'))
}

export const stopJobsAndDisconnect = (): Promise<any> => {
  const values = Object.values(queues)
  return Promise.all(values.map((queue) => {
    return queue.empty()
      .then(() => queue.close(false))
  }))
}
