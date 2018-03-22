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
  const rpc = new Rpc(DAEMON_URI, {
    password: DAEMON_CONFIG.rpcpassword,
    username: DAEMON_CONFIG.rpcuser,
  })

  if (['darwin', 'linux'].includes(process.platform)) {
   const [err1, stdout1] = await to(exec(`lsof | grep :${DAEMON_CONFIG.rpcport}`))
   if (err1 === null && stdout1 !== undefined) {
     const results1 = toArrayOfLines(stdout1)
      // If we find at least one used RPC port, we can try to send a "stop" command
      if (results1.length !== 0) {
        const daemonPid = Number(results1[0].split(/\s+/)[1])

        try { await rpc.stop() }
        catch(err) { /* We can ignore any error here. */ }

        // tslint:disable-next-line:no-require-imports
        require('tree-kill')(daemonPid, 'SIGKILL')
      }
    }

    const [err2, stdout2] = await to(exec(`lsof | grep :${DAEMON_CONFIG.rpcport}`))
    if (err2 === null && stdout2 !== undefined) {
      const results2 = toArrayOfLines(stdout2)

      if (results2.length === 0) return
    } else {
      return
    }

    await to(exec(`ps -ef | grep -i ^electra* | grep -v grep | awk '{print $2}' | xargs -r kill -9`))
  }
}
