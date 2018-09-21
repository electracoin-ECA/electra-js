import { DAEMON_USER_DIR_PATH } from '../constants'

export default function(): void {
  // tslint:disable-next-line:no-require-imports
  require('rimraf').sync(require('path').resolve(DAEMON_USER_DIR_PATH, '!(wallet.dat)'))
}
