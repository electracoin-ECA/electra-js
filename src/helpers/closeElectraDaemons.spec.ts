// tslint:disable

import * as assert from 'assert'
import chalk from 'chalk'
import * as extractZip from 'extract-zip'
import * as path from 'path'
import * as rimraf from 'rimraf'

import { BINARIES_PATH, DAEMON_CONFIG_DEFAULT, DAEMON_USER_DIR_PATH } from '../constants'
import assertThen from './assertThen'
import checkDaemons from './checkDaemons'
import closeElectraDaemons from './closeElectraDaemons'
import wait from './wait'

describe('helpers/closeElectraDaemons()', function() {
  this.timeout(30_000)

  const binaryName = `electrad-${process.platform}-${process.arch}${process.platform === 'win32' ? '.exe' : ''}`
  const binaryPath = `${BINARIES_PATH}/${binaryName}`
  const daemons = []

  // We skip the wallet tests in Travis CI for now
  // TODO Integrate an Electra core build in Travis CI
  before(async function() {
    // Remove the daemon user directory to simulate a brand new installation
    console.log(chalk.green('    ♦ Removing Electra daemon user directory...'))
    rimraf.sync(DAEMON_USER_DIR_PATH)

    await wait(1000)

    console.log(chalk.green('    ♦ Copying stored blockchain data...'))
    await new Promise(resolve => {
      // Copy the blockchain data
      extractZip(
        path.resolve(process.cwd(), `test/data/electra-js-test-data-${process.platform}-${process.arch}.zip`),
        { dir: path.resolve(DAEMON_USER_DIR_PATH, '..') },
        resolve
      )
    })
  })

  describe('AFTER starting a daemon WITH --daemon=1 --server=1', function() {
    it(`SHOULD NOT throw any error`, async () => {
      daemons.push(require('child_process').spawn(binaryPath, [
        `--daemon=1`,
        `--server=1`,
        `--port=${DAEMON_CONFIG_DEFAULT.port}`,
        `--rpcpassword=${DAEMON_CONFIG_DEFAULT.rpcpassword}`,
        `--rpcport=${DAEMON_CONFIG_DEFAULT.rpcport}`,
        `--rpcuser=${DAEMON_CONFIG_DEFAULT.rpcuser}`,
      ]))
      await wait(5000)
      await assertThen(() => closeElectraDaemons())
    })
    it(`checkDaemons() SHOULD return #isRunning as FALSE`, async () => assert.strictEqual((await checkDaemons()).isRunning, false))
  })

  describe('AFTER starting a daemon WITH --daemon=0 --server=0', function() {
    it(`SHOULD NOT throw any error`, async () => {
      daemons.push(require('child_process').spawn(binaryPath, [
        `--daemon=0`,
        `--server=0`,
        `--port=${DAEMON_CONFIG_DEFAULT.port}`,
        `--rpcpassword=${DAEMON_CONFIG_DEFAULT.rpcpassword}`,
        `--rpcport=${DAEMON_CONFIG_DEFAULT.rpcport}`,
        `--rpcuser=${DAEMON_CONFIG_DEFAULT.rpcuser}`,
      ]))
      await wait(5000)
      await assertThen(() => closeElectraDaemons())
    })
    it(`checkDaemons() SHOULD return #isRunning as FALSE`, async () => assert.strictEqual((await checkDaemons()).isRunning, false))
  })

  describe('AFTER starting a daemon WITH --daemon=1 --server=1 AND a custom --rpcpassword', function() {
    it(`SHOULD NOT throw any error`, async () => {
      daemons.push(require('child_process').spawn(binaryPath, [
        `--daemon=1`,
        `--server=1`,
        `--port=${DAEMON_CONFIG_DEFAULT.port}`,
        `--rpcpassword=custom`,
        `--rpcport=${DAEMON_CONFIG_DEFAULT.rpcport}`,
        `--rpcuser=${DAEMON_CONFIG_DEFAULT.rpcuser}`,
      ]))
      await wait(5000)
      await assertThen(() => closeElectraDaemons())
    })
    it(`checkDaemons() SHOULD return #isRunning as FALSE`, async () => assert.strictEqual((await checkDaemons()).isRunning, false))
  })

  after(function() {
    console.log(chalk.green('    ♦ Killing daemons processes...'))
    daemons.forEach(daemon => daemon.kill())
  })
})
