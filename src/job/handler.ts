import { Job } from 'bull'

import { blockchain } from '@src/blockchain'
import { userRepository } from '@src/db'
import { helper } from '@src/helper'
import { blockchainConfig } from '@src/env'

// TODO
//  1) do not reprocess events
//  2) get the actual value of `username` instead of hash
export const getEthereumEvent = (job: Job): Promise<any> => {
  const { chainId } = job.data
  const network = blockchainConfig.networks.get(chainId)
  const contract = blockchain.getContract(chainId)

  const filter = { address: contract.address }
  return contract.queryFilter(filter)
    .then(events => {
      return events.map((evt) => {
        // const { addr, username, name, twitter } = evt.args
        // console.log(chainId, evt.event, addr, username, name, twitter)
        // console.log(chainId, evt.event, evt.args)
        console.log(`Found event ${evt.event} on ${network} network`)
        const [addr, username, name, twitter] = evt.args
        const userId = helper.toCompositeKey(chainId, addr)
        const chainUsername = helper.toCompositeKey(chainId, username.hash)

        switch (evt.event) {
        case 'CreateIdentity':
          // TODO using update with upsert because
          //  previously processed events are not skipped
          // return userRepository.create({
          return userRepository.updateById(
            userId,
            {
              address: addr,
              chainId: parseInt(chainId),
              username: username.hash,
              chainUsername,
              name,
              twitter,
            },
            true,
          )
        case 'UpdateIdentity':
          return userRepository.updateById(userId, {
            username: username.hash,
            chainUsername,
            name,
            twitter,
          })
        case 'DeleteIdentity':
          return userRepository.deleteById(userId)
        default:
          return
        }
      })
    })
}
