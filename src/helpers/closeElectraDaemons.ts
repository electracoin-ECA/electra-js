// tslint:disable

import to from 'await-to-js'

import { DAEMON_CONFIG, DAEMON_URI } from '../constants'
import Rpc from '../libs/rpc'

async function exec(command: string): Promise<string> {
  return new Promise((resolve: (stdout: string) => void, reject) => {
    require('child_process').exec(
      command,
      (err: Error, stdout: string, stderr: string): void => {
        if (err !== null || stderr.length !== 0) {
          reject(err || new Error(stderr))

          return
        }

        resolve(stdout)
      }
    )
  })
}

function toArrayOfLines(output: string): string[] {
  return output
    .split(require('os').EOL)
    .map(line => line.trim())
    .filter(line => line.length !== 0)
}

export default async function(): Promise<void> {
  if (['darwin', 'linux'].includes(process.platform)) {
    /*
      STEP 1: Find all running Electra deamons
    */

    const [err1, stdout1] = await to(exec(`ps aux | grep -i "electra"`))
    if (err1 !== null || stdout1 === undefined) throw err1
    const resultsRaw1 = toArrayOfLines(stdout1)
    console.log(resultsRaw1)

    // Remove all "closeElectraDaemons" & "grep" results (since it's just the inlusion of our command)
    const results1 = resultsRaw1.filter(resultRaw => !/closeElectraDaemons|grep/i.test(resultRaw))

    if (results1.length === 0) return

    /*
      STEP 2: Find all used RPC port (default one)
    */

    const [err2, stdout2] = await to(exec(`lsof | grep :${DAEMON_CONFIG.rpcport}`))
    if (err2 === null && stdout2 !== undefined) {
      const resultsRaw2 = toArrayOfLines(stdout2)

      // Remove all "closeElectraDaemons" & "grep" results (since it's just the inlusion of our command)
      const results2 = resultsRaw2.filter(resultRaw => !/closeElectraDaemons|grep/i.test(resultRaw))

      // If we find at least one used RPC port, we can try to send a "stop" command
      if (results2.length !== 0) {
        const rpc = new Rpc(DAEMON_URI, {
          password: DAEMON_CONFIG.rpcpassword,
          username: DAEMON_CONFIG.rpcuser,
        })

        await rpc.stop()
      }
    }

    /*
      STEP 3: Find all running Electra deamons, again
    */

    const [err3, stdout3] = await to(exec(`ps aux | grep -i "electra"`))
    if (err3 !== null || stdout3 === undefined) throw err3
    const resultsRaw3 = toArrayOfLines(stdout3)

    // Remove all "closeElectraDaemons" & "grep" results (since it's just the inlusion of our command)
    const results3 = resultsRaw3.filter(resultRaw => !/closeElectraDaemons|grep/i.test(resultRaw))

    if (results3.length === 0) return

    /*
      STEP 4: Kill Electra daemons processes
    */

    await to(exec(`ps -ef | grep -ei electra -ei electrad | grep -v grep | awk '{print $2}' | xargs -r kill -9`))
  }
}
