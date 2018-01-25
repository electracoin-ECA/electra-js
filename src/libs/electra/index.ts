import * as bitcoinJs from 'bitcoinjs-lib'

import { Address } from './types'

const ECA_NETWORK: bitcoinJs.Network = {
  bip32: { public: 0, private: 0 },
  messagePrefix: '\u0018Electra very Signed Message:\n', // TODO Not sure about that yet !
  pubKeyHash: 33,
  scriptHash: 0, // TODO Find this parameter
  wif: 161
}

export default {
  createAddress: (): Address => {
    const keyPair: bitcoinJs.ECPair = bitcoinJs.ECPair.makeRandom({ network: ECA_NETWORK })
    const privateKey: string = keyPair.toWIF()
    const hash: string = keyPair.getAddress()

    return {
      hash,
      privateKey
    }
  },

  getAddressFromWif: (privateKey: string): string =>
    bitcoinJs.ECPair
      .fromWIF(privateKey, ECA_NETWORK)
      .getAddress()
}
