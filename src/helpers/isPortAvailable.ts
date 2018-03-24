import { Server } from 'net'

export default async function(port: number): Promise<boolean> {
  return new Promise((resolve: (res: boolean) => void): void => {
    // tslint:disable-next-line:no-require-imports
    const server: Server = require('net').createServer()
      .once('error', (err: Error) => resolve(false))
      .once('listening', () => server
        .once('close', () => resolve(true))
        .close()
      )
      .listen(port)
  })
}
