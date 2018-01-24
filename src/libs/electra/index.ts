import * as bitcoinJs from 'bitcoinjs-lib'

const ECA_NETWORK: bitcoinJs.Network = {
  bip32: { public: 0, private: 0 },
  messagePrefix: '\u0018Electra very Signed Message:\n', // TODO Not sure about that yet !
  pubKeyHash: 33,
  scriptHash: 0, // TODO Find this parameter
  wif: 161
}

export default {
  getAddressFromWif: (privateKey: string): string =>
    bitcoinJs.ECPair
      .fromWIF(privateKey, ECA_NETWORK)
      .getAddress()
}
