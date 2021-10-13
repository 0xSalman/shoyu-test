import { blockchainConfig } from '@src/env'
import { Job } from 'bull'
import { Signer, ethers } from 'ethers'

const signers: {[key: string]: Signer} = {}

export const createSigners = (): void => {
  blockchainConfig.networks.forEach((val: string, key: string) => {
    const provider = ethers.getDefaultProvider(val)
    signers[key] = new ethers.Wallet(blockchainConfig.contractAccountPK, provider)
  })
}

export const getEthereumEvent = (job: Job, done): Promise<any> => {
  const { chainId } = job.data
  const contractAddress = blockchainConfig.contractIds.get(chainId)
  console.log('fetch events from smart contract', chainId, contractAddress)
  done()
  return Promise.resolve(null)
}
