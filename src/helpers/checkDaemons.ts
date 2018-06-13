import to from 'await-to-js'
import * as childProcess from 'child_process'

import { DAEMON_CONFIG_DEFAULT } from '../constants'

export default async function(): Promise<{ isRunning: boolean, output?: string }> {
  const [err, output] = process.platform === 'win32'
    ? await to(exec(`netstat -a -n -o | findstr :${DAEMON_CONFIG_DEFAULT.port}`))
    : await to(exec(`lsof -n -i4TCP:${DAEMON_CONFIG_DEFAULT.port} | grep LISTEN`))

  return {
    isRunning: err === null && typeof output === 'string' && output.length !== 0,
    output,
  }
}

async function exec(command: string): Promise<string> {
  return new Promise((resolve: (stdout: string) => void, reject: (err: Error) => void): void => {
    const childProcessInstance: childProcess.ChildProcess = childProcess.exec(
      command,
      (err: Error, stdout: string, stderr: string): void => {
        childProcessInstance.kill()

        if (err !== null || stderr.length !== 0) {
          reject(err || new Error(stderr))

          return
        }

        resolve(stdout)
      }
    )
  })
}
