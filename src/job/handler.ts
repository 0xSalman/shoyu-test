import { Job } from 'bull'
import { blockchain } from '@src/blockchain'

export const getEthereumEvent = (job: Job): Promise<any> => {
  const { chainId } = job.data
  const contract = blockchain.getContract(chainId)
  console.log(`fetch events from ${chainId}:${contract.address}`)

  // DeleteIdentity
  // UpdateIdentity
  return contract.queryFilter(contract.filters.CreateIdentity())
    .then(events => {
      events.forEach((evt) => {
        console.log(evt.topics, evt.data)
      })
    })
}
