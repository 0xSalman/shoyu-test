import { blockchainConfig } from '@src/env'
import { Job } from 'bull'

export const getEthereumEvent = (job: Job, done): Promise<any> => {
  const { chainId } = job.data
  const contractAddress = blockchainConfig.contractIds.get(chainId)
  console.log('fetch events from smart contract', chainId, contractAddress)
  done()
  return Promise.resolve(null)
}
