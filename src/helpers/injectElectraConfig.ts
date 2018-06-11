// tslint:disable

import { DAEMON_USER_DIR_PATH } from '../constants'

export default function() {
  const electraConfigFilePath = `${DAEMON_USER_DIR_PATH}/Electra.conf`
  const fs = require('fs')

  if (!fs.existsSync(DAEMON_USER_DIR_PATH)) {
    fs.mkdirSync(DAEMON_USER_DIR_PATH)
  }

  fs.writeFileSync(electraConfigFilePath, `
    listen=1
    daemon=1
    server=0
    rpcuser=user
    rpcpassword=pass
    rpcallowip=127.0.0.1
    rpcport=5788

    # Bootstrap Nodes
    # https://docs.google.com/spreadsheets/d/1b2SzZ8a1VVTizPcKq_k4Dxvp6nEh0sPkldgjuAtpqfI/edit?usp=sharing
    addnode=137.74.196.251:5817
    addnode=139.162.70.108:5817
    addnode=139.99.195.215:5817
    addnode=139.99.44.97:5817
    addnode=149.28.199.218:5817
    addnode=149.56.102.5:5817
    addnode=159.89.171.67:5817
    addnode=192.241.193.192:5817
    addnode=192.241.238.155:5817
    addnode=192.171.18.198:5817
    addnode=51.38.115.250:5817
    addnode=54.38.53.207:5817
  `
    .replace(/^\s+/gm, '')
    .replace(/^\n/m, ''))
}
