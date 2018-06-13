// tslint:disable

import log from '@inspired-beings/log'

import { DAEMON_CONFIG_DEFAULT, DAEMON_URI } from '../constants'
import Rpc from '../libs/rpc'
import checkDaemons from './checkDaemons'
import wait from './wait'

function toArrayOfLines(output: string): string[] {
  return output
    .split(require('os').EOL)
    .map(line => line.trim())
    .filter(line => line.length !== 0)
}

export default async function(): Promise<void> {
  if (!(await checkDaemons()).isRunning) return

  // First we try to stop it via a RPC call
  await stopDaemonViaRpc()

  const res = await checkDaemons()
  if (!res.isRunning) return

  const outputLines: string[] = toArrayOfLines(res.output as string)
  const processId: number = process.platform === 'win32'
    ? Number((outputLines[0].match(/\d+$/) as RegExpMatchArray)[0])
    : Number((outputLines[0].match(/\s(\d+)/) as RegExpMatchArray)[1])

  // Then we try to kill its process
  await killDaemonViaProcessId(processId)
}

async function killDaemonViaProcessId(processId: number): Promise<void> {
  process.kill(processId)

  // Limit the process killing attempt to 5s
  let timeLeft: number = 5000
  while ((await checkDaemons()).isRunning) {
    await wait(250)
    timeLeft -= 250
    if (timeLeft <= 0) break
  }
}

async function stopDaemonViaRpc(): Promise<void> {
  const rpc = new Rpc(DAEMON_URI, {
    password: DAEMON_CONFIG_DEFAULT.rpcpassword,
    username: DAEMON_CONFIG_DEFAULT.rpcuser,
  })

  try {
    await rpc.stop()

    // Limit the RPC stop call attempt to 5s
    let timeLeft: number = 5000
    while ((await checkDaemons()).isRunning) {
      await wait(250)
      timeLeft -= 250
      if (timeLeft <= 0) break
    }
  }
  catch(err) {
    log.info("The following error is automatically handled. You can safely ignore it.")
    log.warn(err)
  }
}
