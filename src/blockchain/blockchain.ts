import { ethers, Signer, Contract } from 'ethers'
import { AUTH_MESSAGE, blockchainConfig } from '@src/env'
import contractABI from '@src/contract/IdentityManager.json'

// TODO this returns any address which
//    1) may not even exist or
//    2) does not actually belong to user making the request
//  this does not verify that user actually signed the required message
export const getAddressFromSignature = (signature: string): string => {
  const signerAddress = ethers.utils.verifyMessage(AUTH_MESSAGE, signature)
  return signerAddress.toLowerCase()
}

const providers: { [key: string]: ethers.providers.JsonRpcProvider } = {}

export const createProviders = (): void => {
  blockchainConfig.networksURI.forEach((val: string, key: string) => {
    providers[key] = new ethers.providers.JsonRpcProvider(val)
  })
}

export const getSigner = (chainId: string, address?: string): Signer => {
  const provider = providers[chainId]
  if (!address) {
    return new ethers.Wallet(blockchainConfig.contractAccountPK, provider)
  }
  return provider.getSigner(address)
}

export const getContract = (chainId: string, address?: string): Contract => {
  const signer = getSigner(chainId, address)
  const contractAddress = blockchainConfig.contractIds.get(chainId)
  return new ethers.Contract(contractAddress, contractABI, signer)
}
