// tslint:disable

import to from 'await-to-js'

import { DAEMON_CONFIG, DAEMON_URI } from '../constants'
import Rpc from '../libs/rpc'
import isPortAvailable from './isPortAvailable'
import wait from './wait'

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
  if (await isPortAvailable(Number(DAEMON_CONFIG.port))) return

  const rpc = new Rpc(DAEMON_URI, {
    password: DAEMON_CONFIG.rpcpassword,
    username: DAEMON_CONFIG.rpcuser,
  })

  // First, we can try to send a simple "stop" command
  try {
    await rpc.stop()

    while (!await isPortAvailable(Number(DAEMON_CONFIG.rpcport))) {
      await wait(250)
    }
    // Let's wait for 2s to let the daemon close
    // await wait(2000)
  }
  catch(err) {
    console.error(err)
  }

  if (process.platform === 'win32') {
    // Last resort force kill
    await to(exec(`FOR /F "tokens=4 delims= " %%P IN ('netstat -a -n -o ^| findstr :${DAEMON_CONFIG.rpcport}') DO TaskKill.exe /PID %%P`))

    return
  }

  const [err, stdout] = await to(exec(`lsof | grep :${DAEMON_CONFIG.rpcport}`))
  if (err === null && stdout !== undefined) {
    const results1 = toArrayOfLines(stdout)
    // If we find at least one used RPC port, we can try to send a "stop" command
    if (results1.length !== 0) {
      const daemonPid = Number(results1[0].split(/\s+/)[1])

      try { await rpc.stop() }
      catch(err) { /* We can ignore any error here. */ }

      // tslint:disable-next-line:no-require-imports
      require('tree-kill')(daemonPid, 'SIGKILL')
    }
  }

  if (await isPortAvailable(Number(DAEMON_CONFIG.rpcport))) return

  // Last resort force kill
  // TODO Is it a possible case after a tree-kill ?
  await to(exec(`ps -ef | grep -i ^electra* | grep -v grep | awk '{print $2}' | xargs -r kill -9`))
}
