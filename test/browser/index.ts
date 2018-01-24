// tslint:disable

import * as assert from 'assert'
import * as chrome from 'selenium-webdriver/chrome'
import * as express from 'express'
import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import { Builder, By, logging, until, WebDriver, WebElement } from 'selenium-webdriver'
import { resolve } from 'path';
import { error } from 'util';
// var firefox = require('selenium-webdriver/firefox')

const IS_WINDOWS = /^win/.test(process.platform)
const PORT = 9000

let expressServer: http.Server

async function startServer() {
  return new Promise(resolve => {
    const app = express()
    app.use(express.static(path.resolve(__dirname, '../..')))
    app.get('/', (req, res) => res.send('Hello World!'))
    expressServer = app.listen(PORT, resolve)
  })
}

// Selenium WebDriver requires the chrome driver to be in the PATH
// and chromeOptions.setChromeBinaryPath() doesn't seem to work
process.env.PATH += ';' + path.resolve(
  __dirname,
  '../../node_modules/chromedriver/',
  IS_WINDOWS ? 'lib/chromedriver' : 'bin'
)

// Set Chrome options
const chromeOptions = new chrome.Options()
chromeOptions.addArguments(
  'headless',
  // "need to use --disable-gpu to avoid an error from a missing Mesa library."
  // https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
  'disable-gpu',
)

describe('Browser Compatibility Tests', function() {
  let driver: WebDriver
  let errors: WebElement[]

  this.timeout(10000)

  before(async function() {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build()

    await startServer()
    await driver.get(`http://localhost:${PORT}/test/browser/`)
    await driver.wait(until.titleIs('ElectraJs Browser Compatibility Tests - Done'), 1000);
  })

  it('SHOULD pass all the browser compatibility tests in Chrome', async function() {
    errors = await driver.findElements(By.className('error'))

    if (errors.length === 0) return assert.ok('Done.')

    console.log('\n--------------------------------------------------------------------------------')
    console.log('Mocha browser tests threw these errors:')
    for (let error of errors) {
      console.log('\n  > ' + await error.getText())
    }
    console.log('--------------------------------------------------------------------------------\n')

    assert.fail(`Mocha browser tests trew ${errors.length} error(s).`)
  })

  after(async function() {
    await driver.quit()
    await new Promise(resolve => expressServer.close(resolve))
  })
})
