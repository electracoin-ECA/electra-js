module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
let binariesPath;
let daemonUserDirPath;
if (process !== undefined) {
    // tslint:disable:no-require-imports no-var-requires typedef
    const os = __webpack_require__(2);
    const path = __webpack_require__(10);
    // tslint:enable:no-require-imports no-var-requires typedef
    binariesPath = path.resolve(__dirname, `../bin`);
    switch (process.platform) {
        case 'darwin':
            daemonUserDirPath = path.resolve(os.homedir(), 'Library/Application Support/Electra');
            break;
        case 'win32':
            daemonUserDirPath = path.resolve(os.homedir(), 'AppData/Roaming/.Electra');
            break;
        default:
            daemonUserDirPath = path.resolve(os.homedir(), '.Electra');
    }
}
exports.BINARIES_PATH = binariesPath;
exports.DAEMON_CONFIG = {
    port: '5817',
    rpcpassword: 'pass',
    rpcport: '5788',
    rpcuser: 'user'
};
exports.DAEMON_URI = `http://127.0.0.1:${exports.DAEMON_CONFIG.rpcport}`;
exports.DAEMON_USER_DIR_PATH = daemonUserDirPath;
exports.ECA_NETWORK = {
    bip32: { public: 0, private: 0 },
    messagePrefix: '\u0018Electra very Signed Message:\n',
    pubKeyHash: 33,
    scriptHash: 0,
    wif: 161 // WIF version
};
exports.ECA_TRANSACTION_FEE = 0.00001;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("await-to-js");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("child_process");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("ramda");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable:no-null-keyword object-literal-sort-keys
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(3);
const error_1 = __webpack_require__(13);
const constants_1 = __webpack_require__(15);
const CONFIG_DEFAULT = {
    headers: {
        'Content-Type': 'application/json'
    }
};
// tslint:disable-next-line:no-magic-numbers
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
/**
 * RPC server related methods matching RPC commands.
 */
class Rpc {
    constructor(uri, auth) {
        this.auth = auth;
        this.uri = uri;
    }
    /**
     * JSON-RCP query helper.
     */
    query(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const rpcRequestDataFull = { jsonrpc: '2.0', method, params };
            const configFull = Object.assign({}, CONFIG_DEFAULT, { auth: this.auth });
            const [err, res] = yield await_to_js_1.default(axios_1.default.post(this.uri, rpcRequestDataFull, configFull));
            if (err !== null) {
                if (err.response !== undefined
                    && err.response.data !== undefined
                    && err.response.data.error !== undefined
                    && err.response.data.error !== null) {
                    const errorCode = String(err.response.data.error.code);
                    const errorKey = constants_1.RPC_ERRORS_TRANSLATION[errorCode];
                    if (errorKey !== undefined) {
                        throw new error_1.default(errorKey);
                    }
                    throw new Error(err.data.error.message);
                }
                throw new Error(err.message);
            }
            if (res === undefined || res.data === undefined) {
                throw new Error(`We did't get the expected RPC response.`);
            }
            return res.data.result;
        });
    }
    /**
     * Change the wallet passphrase from <oldPassphrase> to <newPassphrase>.
     */
    changePassphrase(oldPassphrase, newPassphrase) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('walletpassphrasechange', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Check the wallet integrity.
     */
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('checkwallet', null);
        });
    }
    /**
     * Encrypt the wallet with <passphrase>.
     */
    encryptWallet(passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('encryptwallet', [passphrase]);
        });
    }
    /**
     * Get the account associated with the given address.
     */
    getAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getaccount', [address]);
        });
    }
    /**
     * Get the total available balance.
     */
    getBalance() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getbalance', null);
        });
    }
    /**
     * Get connection count.
     */
    getConnectionCount() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getconnectioncount', null);
        });
    }
    /**
     * Get the difficulty as a multiple of the minimum difficulty.
     */
    getDifficulty() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getdifficulty', null);
        });
    }
    /**
     * Get the current state info.
     */
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getinfo', null);
        });
    }
    /**
     * Get the local block height.
     */
    getLocalBlockHeight() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getblockcount', null);
        });
    }
    /**
     * Generate a new address for receiving payments.
     */
    getNewAddress(account) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getnewaddress', account !== undefined ? [account] : null);
        });
    }
    /**
     * Get the peers info.
     */
    getPeersInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getpeerinfo', null);
        });
    }
    /**
     * Get the private key of <addressHash>.
     */
    getPrivateKey(addressHash) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('dumpprivkey', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Get the current staking info.
     */
    getStakingInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('getstakinginfo', null);
        });
    }
    /**
     * Get a transaction detailed info.
     */
    getTransaction(transactionHash) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('gettransaction', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Import a new address private key.
     */
    importPrivateKey(privateKey) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('importprivkey', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Lists groups of addresses which have had their common ownership made public
     * by common use as inputs or as the resulting change in past transactions.
     */
    listAddressGroupings() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('listaddressgroupings', null);
        });
    }
    /**
     * List receiving addresses data.
     */
    listReceivedByAddress(minConfirmations = 1, includeEmpty = false) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('listreceivedbyaddress', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * List transactions.
     */
    listTransactions(account = '*', count = 10, from = 0) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('listtransactions', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * List unspent transactions between <minConfirmations> and <maxConfirmations>,
     * for the given list of <address> if specified.
     */
    listUnspent(minConfirmations = 1, maxConfirmations = 9999999, ...address) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('listunspent', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Removes the wallet encryption key from memory, locking the wallet.
     * After calling this method, you will need to call walletpassphrase again
     * before being able to call any methods which require the wallet to be unlocked.
     */
    lock() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('walletlock', null);
        });
    }
    /**
     * Make a public/private key pair.
     * <prefix> is the optional preferred prefix for the public key.
     */
    makeKeyPair(prefix) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('makekeypair', prefix !== undefined ? [prefix] : null);
        });
    }
    /**
     * Create a basic transaction and broadcast it.
     *
     * @note
     * THIS METHOD SHOULD NOT BE USED ONCE THE FIRST FINAL VERSION IS RELEASED.
     * This transaction is "basic" because the unspent transaction are automatically selected.
     */
    sendBasicTransaction(toAddressHash, amount) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('sendtoaddress', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Exit the daemon.
     */
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('stop', null);
        });
    }
    /**
     * Stores the wallet decryption key in memory for <timeout> seconds.
     * If [stakingOnly] is TRUE, sending functions are disabled.
     */
    unlock(passphrase, timeout = ONE_YEAR_IN_SECONDS, stakingOnly = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.query('walletpassphrase', [passphrase, timeout, stakingOnly]);
        });
    }
    /**
     * Validate <address> and get its info.
     */
    validateAddress(address) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('validateaddress', Array.prototype.slice.call(arguments));
        });
    }
    /**
     * Validate <publicKey> and get its info.
     */
    validatePublicKey(publicKey) {
        return __awaiter(this, arguments, void 0, function* () {
            return this.query('validatepubkey', Array.prototype.slice.call(arguments));
        });
    }
}
exports.default = Rpc;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const getBalanceFor_1 = __webpack_require__(29);
const getCurrentPriceIn_1 = __webpack_require__(30);
exports.default = {
    getBalanceFor: getBalanceFor_1.default,
    getCurrentPriceIn: getCurrentPriceIn_1.default
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const constants = __webpack_require__(0);
const wallet_1 = __webpack_require__(11);
const web_services_1 = __webpack_require__(8);
const SETTINGS_DEFAULT = {
    isHard: false
};
/**
 * ElectraJs version.
 * DO NOT CHANGE THIS LINE SINCE THE VERSION IS AUTOMATICALLY INJECTED !
 */
const VERSION = '0.5.20';
/**
 * Main ElectraJS class.
 */
class ElectraJs {
    constructor(settings = {}) {
        /** Electra blockchain specific constants. */
        this.constants = constants;
        const { isHard } = Object.assign({}, SETTINGS_DEFAULT, settings);
        this.wallet = new wallet_1.default(isHard);
        this.webServices = web_services_1.default;
    }
    /**
     * Get the current version of ElectraJS.
     */
    getVersion() {
        return VERSION;
    }
}
exports.default = ElectraJs;
// tslint:disable
// For TypeScript
module.exports = ElectraJs;
module.exports.default = module.exports;


/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __webpack_require__(1);
const R = __webpack_require__(5);
const constants_1 = __webpack_require__(0);
const closeElectraDaemons_1 = __webpack_require__(12);
const getMaxItemFromList_1 = __webpack_require__(17);
const injectElectraConfig_1 = __webpack_require__(18);
const isPortAvailable_1 = __webpack_require__(19);
const tryCatch_1 = __webpack_require__(21);
const wait_1 = __webpack_require__(22);
const crypto_1 = __webpack_require__(23);
const electra_1 = __webpack_require__(26);
const rpc_1 = __webpack_require__(6);
const web_services_1 = __webpack_require__(8);
const types_1 = __webpack_require__(32);
// tslint:disable-next-line:no-magic-numbers
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
const PLATFORM_BINARY = {
    darwin: 'electrad-macos',
    linux: 'electrad-linux',
    win32: 'electrad-windows.exe'
};
const WALLET_INDEX = 0;
/**
 * Wallet management.
 */
class Wallet {
    constructor(isHard = false) {
        /** List of the wallet HD addresses. */
        this.ADDRESSES = [];
        /** List of the wallet random (non-HD) addresses. */
        this.RANDOM_ADDRESSES = [];
        this.isHard = isHard;
        this.STATE = types_1.WalletState.EMPTY;
        if (isHard) {
            this.rpc = new rpc_1.default(constants_1.DAEMON_URI, {
                password: constants_1.DAEMON_CONFIG.rpcpassword,
                username: constants_1.DAEMON_CONFIG.rpcuser
            });
            // tslint:disable-next-line:no-require-imports
            this.isNew = !this.isDaemonUserDirectory();
            this.DAEMON_STATE = types_1.WalletDaemonState.STOPPED;
            return;
        }
        this.LOCK_STATE = types_1.WalletLockState.UNLOCKED;
    }
    /** List of the wallet HD addresses. */
    get addresses() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet: The #addresses are only available when the #state is "READY".`);
        }
        return this.ADDRESSES;
    }
    /** List of the wallet non-HD (random) and HD addresses. */
    get allAddresses() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet: #allAddresses are only available when the #state is "READY".`);
        }
        return [...this.addresses, ...this.randomAddresses];
    }
    /** Electra Daemon state. */
    get daemonState() {
        if (!this.isHard) {
            throw new Error(`ElectraJs.Wallet: #daemonState is only available when using the hard wallet.`);
        }
        return this.DAEMON_STATE;
    }
    /**
     * Is this wallet locked ?
     * The wallet is considered as locked when all its addresses private keys are currently ciphered.
     */
    get lockState() {
        if (this.LOCK_STATE === undefined && this.DAEMON_STATE !== types_1.WalletDaemonState.STARTED) {
            throw new Error(`ElectraJs.Wallet: You need to #startDaemon in order to know the wallet #lockState.`);
        }
        return this.LOCK_STATE;
    }
    /**
     * Mnenonic.
     *
     * @note
     * ONLY available when generating a brand new Wallet, which happens after calling #generate()
     * with an undefined <mnemonic> parameter on a Wallet instance with an "EMPTY" #state.
     */
    get mnemonic() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet:
        #mnemonic is only available after a brand new Wallet has been generated the #state is "READY".
      `);
        }
        if (this.MNEMONIC === undefined) {
            throw new Error(`ElectraJs.Wallet: #mnemonic is only available after a brand new Wallet has been generated.`);
        }
        return this.MNEMONIC;
    }
    /** List of the wallet random (non-HD) addresses. */
    get randomAddresses() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet: The #randomAddresses are only available when the #state is "READY".`);
        }
        return this.RANDOM_ADDRESSES;
    }
    /**
     * Wallet state.
     * This state can be one of:
     * - EMPTY, when it has just been instanciated or reset ;
     * - READY, when it has been generated, or seeded with random (non-HD) private keys imports.
     */
    get state() {
        return this.STATE;
    }
    /**
     * Start the hard wallet daemon.
     */
    startDaemon() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isHard) {
                throw new Error(`ElectraJs.Wallet: The #startDeamon() method can only be called on a hard wallet`);
            }
            if (this.DAEMON_STATE !== types_1.WalletDaemonState.STOPPED) {
                throw new Error(`ElectraJs.Wallet:
        The #startDeamon() method can only be called on an stopped wallet (#daemonState = "STOPPED").
      `);
            }
            this.DAEMON_STATE = types_1.WalletDaemonState.STARTING;
            if (!(yield isPortAvailable_1.default(Number(constants_1.DAEMON_CONFIG.port)))) {
                // Stop any existing Electra deamon process first
                yield closeElectraDaemons_1.default();
            }
            // Inject Electra.conf file if it doesn't already exist
            const [err1] = tryCatch_1.default(injectElectraConfig_1.default);
            if (err1 !== undefined)
                throw err1;
            const binaryPath = `${constants_1.BINARIES_PATH}/${PLATFORM_BINARY[process.platform]}`;
            // Dirty hack to give enough permissions to the binary in order to be run
            // TODO Run this command in the postinstall script ?
            // tslint:disable-next-line:no-require-imports
            __webpack_require__(4).execSync(`chmod 755 ${binaryPath}`);
            // tslint:disable-next-line:no-require-imports
            this.daemon = __webpack_require__(4).spawn(binaryPath, [
                `--deamon=1`,
                `--port=${constants_1.DAEMON_CONFIG.port}`,
                `--rpcuser=${constants_1.DAEMON_CONFIG.rpcuser}`,
                `--rpcpassword=${constants_1.DAEMON_CONFIG.rpcpassword}`,
                `--rpcport=${constants_1.DAEMON_CONFIG.rpcport}`
            ]);
            // TODO Add a debug mode in ElectraJs settings
            this.daemon.stdout.setEncoding('utf8').on('data', console.log.bind(this));
            this.daemon.stderr.setEncoding('utf8').on('data', console.log.bind(this));
            this.daemon.on('close', (code) => {
                this.DAEMON_STATE = types_1.WalletDaemonState.STOPPED;
                // tslint:disable-next-line:no-console
                console.log(`The wallet daemon exited with the code: ${code}.`);
            });
            while (this.DAEMON_STATE === types_1.WalletDaemonState.STARTING) {
                const [err2] = yield await_to_js_1.default(this.rpc.getInfo());
                if (err2 === null) {
                    this.LOCK_STATE = yield this.getDaemonLockState();
                    this.DAEMON_STATE = types_1.WalletDaemonState.STARTED;
                }
            }
        });
    }
    /**
     * Stop the hard wallet daemon.
     */
    stopDaemon() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isHard) {
                throw new Error(`ElectraJs.Wallet: The #stopDeamon() method can only be called on a hard wallet`);
            }
            this.DAEMON_STATE = types_1.WalletDaemonState.STOPPING;
            yield closeElectraDaemons_1.default();
            // Dirty hack since we have no idea how long the deamon process will take to be killed
            while (this.DAEMON_STATE !== types_1.WalletDaemonState.STOPPED) {
                // tslint:disable-next-line:no-magic-numbers
                yield wait_1.default(250);
            }
        });
    }
    /**
     * Generate an HD wallet from either the provided mnemonic seed, or a randomly generated one,
     * including ‒ at least ‒ the first derived address.
     *
     * @note In case the [mnemonicExtension] is specified, it MUST be encoded in UTF-8 using NFKD.
     *
     * @see https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki#wordlist
     *
     * TODO Figure out a way to validate provided mnemonics using different specs (words list & entropy strength).
     */
    generate(mnemonic, mnemonicExtension, chainsCount = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.EMPTY) {
                throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on an empty wallet (#state = "EMPTY").
        You need to #reset() it first, then #initialize() it again in order to #generate() a new one.
      `);
            }
            if (this.isHard && this.DAEMON_STATE !== types_1.WalletDaemonState.STARTED) {
                throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called on a started hard wallet (#daemon = "STARTED").
        You need to #startDaemon() first.
      `);
            }
            if (this.isHard && this.LOCK_STATE !== types_1.WalletLockState.UNLOCKED) {
                throw new Error(`ElectraJs.Wallet:
        The #generate() method can only be called once the hard wallet has been unlocked (#lockState = "UNLOCKED").
        You need to #unlock() it first.
      `);
            }
            /*
              ----------------------------------
              STEP 1: MNEMONIC
            */
            if (mnemonic !== undefined) {
                if (!electra_1.default.validateMnemonic(mnemonic)) {
                    throw new Error(`ElectraJs.Wallet: #generate() <mnemonic> parameter MUST be a valid mnemonic.`);
                }
            }
            else {
                try {
                    // tslint:disable-next-line:no-parameter-reassignment
                    mnemonic = electra_1.default.getRandomMnemonic();
                    this.MNEMONIC = mnemonic;
                }
                catch (err) {
                    throw err;
                }
            }
            /*
              ----------------------------------
              STEP 2: MASTER NODE
            */
            try {
                const address = electra_1.default.getMasterNodeAddressFromMnemonic(mnemonic, mnemonicExtension);
                this.MASTER_NODE_ADDRESS = Object.assign({}, address, { label: null });
            }
            catch (err) {
                throw err;
            }
            /*
              ----------------------------------
              STEP 3: CHAINS
            */
            let chainIndex = -1;
            try {
                while (++chainIndex < chainsCount) {
                    const address = electra_1.default.getDerivedChainFromMasterNodePrivateKey(this.MASTER_NODE_ADDRESS.privateKey, WALLET_INDEX, chainIndex);
                    this.ADDRESSES.push(Object.assign({}, address, { label: null }));
                }
            }
            catch (err) {
                throw err;
            }
            /*
              ----------------------------------
              STEP 4: RPC SERVER
            */
            if (this.isHard) {
                let i;
                // We try to export all the used addresses from the RPC daemon
                const daemonAddresses = [];
                const [err, entries] = yield await_to_js_1.default(this.rpc.listAddressGroupings());
                if (err !== null || entries === undefined)
                    throw err;
                // tslint:disable-next-line:typedef
                entries.forEach((group) => group.forEach(([addressHash]) => daemonAddresses.push(addressHash)));
                // We filter out all the HD addresses
                const randomAddresses = daemonAddresses
                    .filter((daemonAddressHash) => this.ADDRESSES.filter(({ hash }) => daemonAddressHash === hash).length === 0);
                // We try to retrieve the random addresses private keys and import them
                i = randomAddresses.length;
                while (--i >= 0) {
                    try {
                        yield this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey);
                        this.RANDOM_ADDRESSES.push({
                            hash: randomAddresses[i],
                            isCiphered: false,
                            isHD: false,
                            label: null,
                            privateKey: yield this.rpc.getPrivateKey(randomAddresses[i])
                        });
                    }
                    catch (err) {
                        // We ignore this error for now.
                    }
                }
                // We try to import the HD addresses into the RPC deamon
                i = this.ADDRESSES.length;
                while (--i >= 0) {
                    try {
                        yield this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey);
                    }
                    catch (err) {
                        // We ignore this error in case the private key is already registered by the RPC deamon.
                    }
                }
            }
            this.STATE = types_1.WalletState.READY;
        });
    }
    /**
     * Lock the wallet, that is cipher all its private keys.
     */
    lock(passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isHard && this.STATE !== types_1.WalletState.READY) {
                throw new Error(`ElectraJs.Wallet: The #lock() method can only be called on a ready wallet (#state = "READY").`);
            }
            if (this.isHard && this.DAEMON_STATE !== types_1.WalletDaemonState.STARTED) {
                throw new Error(`ElectraJs.Wallet:
        The #lock() method can only be called on a started wallet (#daemonState = "STARTED").`);
            }
            if (this.LOCK_STATE === types_1.WalletLockState.LOCKED)
                return;
            if (this.isHard) {
                if (this.isNew) {
                    const [err1] = yield await_to_js_1.default(this.rpc.encryptWallet(passphrase));
                    if (err1 !== null) {
                        throw err1;
                    }
                    // Dirty hack since we have no idea how long the deamon process will take to exit
                    while (this.DAEMON_STATE !== types_1.WalletDaemonState.STOPPED) {
                        // tslint:disable-next-line:no-magic-numbers
                        yield wait_1.default(250);
                    }
                    // Encrypting the wallet has stopped the deamon, so we need to start it again
                    yield this.startDaemon();
                    this.isNew = false;
                    this.LOCK_STATE = types_1.WalletLockState.LOCKED;
                    return;
                }
                yield this.rpc.lock();
                this.LOCK_STATE = types_1.WalletLockState.LOCKED;
                return;
            }
            try {
                if (this.MASTER_NODE_ADDRESS !== undefined && !this.MASTER_NODE_ADDRESS.isCiphered) {
                    this.MASTER_NODE_ADDRESS.privateKey = crypto_1.default.cipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase);
                }
                this.ADDRESSES = this.ADDRESSES.map((address) => {
                    if (!address.isCiphered) {
                        address.privateKey = crypto_1.default.cipherPrivateKey(address.privateKey, passphrase);
                    }
                    return address;
                });
                this.RANDOM_ADDRESSES = this.RANDOM_ADDRESSES.map((randomAddress) => {
                    if (!randomAddress.isCiphered) {
                        randomAddress.privateKey = crypto_1.default.cipherPrivateKey(randomAddress.privateKey, passphrase);
                    }
                    return randomAddress;
                });
            }
            catch (err) {
                throw err;
            }
            // Locking the wallet should delete any stored mnemonic
            if (this.MNEMONIC !== undefined)
                delete this.MNEMONIC;
            this.LOCK_STATE = types_1.WalletLockState.LOCKED;
        });
    }
    /**
     * Unlock the wallet, that is decipher all its private keys.
     */
    unlock(passphrase, forStakingOnly = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isHard && this.STATE !== types_1.WalletState.READY) {
                throw new Error(`ElectraJs.Wallet: The #unlock() method can only be called on a ready wallet (#state = "READY").`);
            }
            if (this.isHard && this.DAEMON_STATE !== types_1.WalletDaemonState.STARTED) {
                throw new Error(`ElectraJs.Wallet:
        The #unlock() method can only be called on a started wallet (#daemonState = "STARTED").`);
            }
            if (this.isHard) {
                if (!forStakingOnly && this.LOCK_STATE === types_1.WalletLockState.STAKING
                    || forStakingOnly && this.LOCK_STATE === types_1.WalletLockState.UNLOCKED) {
                    const [err1] = yield await_to_js_1.default(this.lock(passphrase));
                    if (err1 !== null)
                        throw err1;
                }
                const [err2] = yield await_to_js_1.default(this.rpc.unlock(passphrase, ONE_YEAR_IN_SECONDS, forStakingOnly));
                if (err2 !== null)
                    throw err2;
                this.LOCK_STATE = forStakingOnly ? types_1.WalletLockState.STAKING : types_1.WalletLockState.UNLOCKED;
                return;
            }
            if (this.LOCK_STATE === types_1.WalletLockState.UNLOCKED)
                return;
            try {
                if (this.MASTER_NODE_ADDRESS !== undefined && this.MASTER_NODE_ADDRESS.isCiphered) {
                    this.MASTER_NODE_ADDRESS.privateKey = crypto_1.default.decipherPrivateKey(this.MASTER_NODE_ADDRESS.privateKey, passphrase);
                }
                this.ADDRESSES = this.ADDRESSES.map((address) => {
                    if (address.isCiphered) {
                        address.privateKey = crypto_1.default.decipherPrivateKey(address.privateKey, passphrase);
                    }
                    return address;
                });
                this.RANDOM_ADDRESSES = this.RANDOM_ADDRESSES.map((randomAddress) => {
                    if (randomAddress.isCiphered) {
                        randomAddress.privateKey = crypto_1.default.decipherPrivateKey(randomAddress.privateKey, passphrase);
                    }
                    return randomAddress;
                });
            }
            catch (err) {
                throw err;
            }
            this.LOCK_STATE = types_1.WalletLockState.UNLOCKED;
        });
    }
    /**
     * Import a wallet data containing ciphered private keys.
     *
     * @note
     * The <data> must be a stringified JSON WEF following the EIP-0002 specifications.
     * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
     */
    import(data, passphrase) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.EMPTY) {
                throw new Error(`ElectraJs.Wallet:
        The #import() method can only be called on an empty wallet (#state = "EMPTY").
      `);
            }
            const [err, wefData] = tryCatch_1.default(() => JSON.parse(data));
            if (err !== undefined)
                throw err;
            const [version, chainsCount, hdPrivateKeyX, randomPrivateKeysX] = wefData;
            // tslint:disable-next-line:no-magic-numbers
            if (version !== 2) {
                throw new Error(`ElectraJs.Wallet: The WEF version should be equal to 2.`);
            }
            /*
              ----------------------------------
              STEP 1: MASTER NODE
            */
            try {
                const privateKey = crypto_1.default.decipherPrivateKey(hdPrivateKeyX, passphrase);
                const hash = electra_1.default.getAddressHashFromPrivateKey(privateKey);
                this.MASTER_NODE_ADDRESS = {
                    hash,
                    isCiphered: false,
                    isHD: true,
                    label: null,
                    privateKey,
                };
            }
            catch (err) {
                throw err;
            }
            /*
              ----------------------------------
              STEP 2: CHAINS
            */
            let chainIndex = -1;
            try {
                while (++chainIndex < chainsCount) {
                    const address = electra_1.default.getDerivedChainFromMasterNodePrivateKey(this.MASTER_NODE_ADDRESS.privateKey, WALLET_INDEX, chainIndex);
                    this.ADDRESSES.push(Object.assign({}, address, { label: null }));
                }
            }
            catch (err) {
                throw err;
            }
            /*
              ----------------------------------
              STEP 3: RANDOM ADDRESSES
            */
            let randomAddressIndex = randomPrivateKeysX.length;
            try {
                while (--randomAddressIndex >= 0) {
                    const privateKey = crypto_1.default.decipherPrivateKey(randomPrivateKeysX[randomAddressIndex], passphrase);
                    const hash = electra_1.default.getAddressHashFromPrivateKey(privateKey);
                    this.RANDOM_ADDRESSES.push({
                        hash,
                        isCiphered: false,
                        isHD: true,
                        label: null,
                        privateKey,
                    });
                }
            }
            catch (err) {
                throw err;
            }
            /*
              ----------------------------------
              STEP 4: RPC SERVER
            */
            if (this.isHard) {
                let i;
                // We try to import the HD and the random (non-HD) addresses into the RPC deamon
                i = this.allAddresses.length;
                while (--i >= 0) {
                    try {
                        yield this.rpc.importPrivateKey(this.ADDRESSES[i].privateKey);
                    }
                    catch (err) { }
                }
            }
            this.STATE = types_1.WalletState.READY;
        });
    }
    /**
     * Export wallet data with ciphered private keys, or unciphered if <unsafe> is set to TRUE.
     *
     * @note
     * The returned string will be a stringified JSON WEF following the EIP-0002 specifications.
     * https://github.com/Electra-project/Electra-Improvement-Proposals/blob/master/EIP-0002.md
     */
    export() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet: The #export() method can only be called on a ready wallet (#state = "READY").`);
        }
        if (this.LOCK_STATE === types_1.WalletLockState.UNLOCKED) {
            throw new Error(`ElectraJs.Wallet:
        The wallet is currently unlocked. Exporting it would thus export the private keys in clear.
        You need to #lock() it first.
      `);
        }
        const wefData = [
            // tslint:disable-next-line:no-magic-numbers
            2,
            this.ADDRESSES.length,
            this.MASTER_NODE_ADDRESS.privateKey,
            this.RANDOM_ADDRESSES.map((address) => address.privateKey)
        ];
        return JSON.stringify(wefData);
    }
    /**
     * Import a ramdomly generated (legacy) WIF private key into the wallet.
     * If the [passphrase] is not defined, the <privateKey> MUST be given deciphered.
     * If the [passphrase] is defined, the <privateKey> MUST be given ciphered.
     */
    importRandomAddress(privateKey, passphrase) {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet:
        The #importRandomAddress() method can only be called on a ready wallet (#state = "READY").
      `);
        }
        const address = {
            isHD: false,
            label: null,
            privateKey
        };
        // Decipher the private key is necessary
        if (passphrase !== undefined) {
            try {
                address.privateKey = crypto_1.default.decipherPrivateKey(privateKey, passphrase);
            }
            catch (err) {
                throw err;
            }
        }
        address.isCiphered = false;
        // Get the address hash
        try {
            address.hash = electra_1.default.getAddressHashFromPrivateKey(address.privateKey);
        }
        catch (err) {
            throw err;
        }
        this.RANDOM_ADDRESSES.push(address);
    }
    /**
     * Reset the current wallet properties and switch the #state to "EMPTY".
     */
    reset() {
        if (this.STATE !== types_1.WalletState.READY) {
            throw new Error(`ElectraJs.Wallet: You can't #reset() a wallet that is not ready (#state = "READY").`);
        }
        delete this.MASTER_NODE_ADDRESS;
        delete this.MNEMONIC;
        this.ADDRESSES = [];
        this.RANDOM_ADDRESSES = [];
        this.STATE = types_1.WalletState.EMPTY;
    }
    /**
     * Get the global wallet balance, or the <address> balance if specified.
     */
    getBalance(addressHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.READY) {
                throw new Error(`ElectraJs.Wallet: You can only #getBalance() from a ready wallet (#state = "READY").`);
            }
            if (this.isHard) {
                const [err, balance] = yield await_to_js_1.default(this.rpc.getBalance());
                if (err !== null)
                    throw err;
                return balance;
            }
            const addresses = this.allAddresses;
            if (addressHash !== undefined) {
                if (addresses.filter((address) => address.hash === addressHash).length === 0) {
                    throw new Error(`ElectraJs.Wallet: You can't #getBalance() with an address not part of the current wallet.`);
                }
                // tslint:disable-next-line:no-shadowed-variable
                const [err, balance] = yield await_to_js_1.default(web_services_1.default.getBalanceFor(addressHash));
                if (err !== null)
                    throw err;
                return balance;
            }
            let index = addresses.length;
            let balanceTotal = 0;
            while (--index >= 0) {
                const [err, balance] = yield await_to_js_1.default(web_services_1.default.getBalanceFor(this.allAddresses[index].hash));
                if (err !== null || balance === undefined)
                    throw err;
                balanceTotal += balance;
            }
            return balanceTotal;
        });
    }
    /**
     * Get the wallet info.
     */
    getInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.READY) {
                return Promise.reject(new Error(`ElectraJs.Wallet: #getInfo() is only available when the #state is "READY".`));
            }
            try {
                const [localBlockchainHeight, peersInfo, stakingInfo] = yield Promise.all([
                    this.rpc.getLocalBlockHeight(),
                    this.rpc.getPeersInfo(),
                    this.rpc.getStakingInfo(),
                ]);
                const networkBlockchainHeight = peersInfo.length !== 0
                    ? getMaxItemFromList_1.default(peersInfo, 'startingheight').startingheight
                    : 0;
                return {
                    connectionsCount: peersInfo.length,
                    isHD: Boolean(this.MASTER_NODE_ADDRESS),
                    isStaking: stakingInfo.staking,
                    isSynchonized: localBlockchainHeight === networkBlockchainHeight,
                    localBlockchainHeight,
                    localStakingWeight: stakingInfo.weight,
                    networkBlockchainHeight,
                    networkStakingWeight: stakingInfo.netstakeweight,
                    nextStakingRewardIn: stakingInfo.expectedtime,
                };
            }
            catch (err) {
                throw err;
            }
        });
    }
    /**
     * Create and broadcast a new transaction of <amount> <toAddressHash> from the first unspent ones.
     */
    send(amount, toAddressHash, fromAddressHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.READY) {
                throw new Error(`ElectraJs.Wallet: You can only #send() from a ready wallet (#state = "READY").`);
            }
            if (this.LOCK_STATE !== types_1.WalletLockState.UNLOCKED) {
                throw new Error(`ElectraJs.Wallet:
        You can only #send() from an unlocked wallet (#lockState = 'UNLOCKED').
        Please #unlock() it first with <forStakingOnly> to TRUE.`);
            }
            if (amount <= 0) {
                throw new Error(`ElectraJs.Wallet: You can only send #send() a strictly positive <amount>.`);
            }
            if (fromAddressHash !== undefined && !R.contains({ hash: fromAddressHash }, this.allAddresses)) {
                throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`);
            }
            if (amount > ((yield this.getBalance()) - constants_1.ECA_TRANSACTION_FEE)) {
                throw new Error(`ElectraJs.Wallet: You can't #send() from an address that is not part of the current wallet.`);
            }
            if (this.isHard) {
                const [err2] = yield await_to_js_1.default(this.rpc.sendBasicTransaction(toAddressHash, amount));
                if (err2 !== null)
                    throw err2;
                return;
            }
            /*
              STEP 1: UNSPENT TRANSACTIONS
            */
            /*const [err1, unspentTransactions] = await to(this.getUnspentTransactions(true))
            if (err1 !== null || unspentTransactions === undefined) throw err1
        
            let availableAmount: number = 0
            const requiredUnspentTransactions: string[] = []
            // tslint:disable-next-line:prefer-const
            for (let unspentTransaction of unspentTransactions) {
              availableAmount += unspentTransaction.amount
              requiredUnspentTransactions.push(unspentTransaction.hash)
        
              if (availableAmount >= amount) break
            }*/
            /*
              STEP 2: BROADCAST
            */
            /*if (this.isHard) {
              // TODO Replace this method with a detailed unspent transactions signed one.
              const [err2] = await to(this.rpc.sendBasicTransaction(toAddressHash, amount))
              if (err2 !== null) throw err2
            }*/
        });
    }
    /**
     * List the last wallet transactions.
     */
    getTransactions(count = 10, fromIndex = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.STATE !== types_1.WalletState.READY) {
                throw new Error(`ElectraJs.Wallet: #getTransactions() is only available when the #state is "READY".`);
            }
            if (this.isHard) {
                const [err1, transactionsRaw] = yield await_to_js_1.default(this.rpc.listTransactions('*', count, fromIndex));
                if (err1 !== null || transactionsRaw === undefined)
                    throw err1;
                let index = 0;
                const transactions = [];
                while (++index < transactions.length) {
                    const transactionRaw = transactionsRaw[index];
                    const transaction = {
                        amount: transactionRaw.amount,
                        confimationsCount: transactionRaw.confirmations,
                        date: transactionRaw.time,
                        hash: transactionRaw.txid,
                    };
                    if (transactionRaw.category === 'generate') {
                        transaction.to = [transactionRaw.address];
                        transaction.type = types_1.WalletTransactionType.GENERATED;
                    }
                    else {
                        const [err2, transactionInfo] = yield await_to_js_1.default(this.rpc.getTransaction(transaction.hash));
                        if (err2 !== null || transactionInfo === undefined)
                            throw err2;
                        if (transactionRaw.category === 'send') {
                            transaction.from = [transactionRaw.address];
                            transaction.to = transactionInfo.details
                                .filter(({ category }) => category === 'receive')
                                .map(({ address }) => address);
                            transaction.type = types_1.WalletTransactionType.SENT;
                        }
                        if (transactionRaw.category === 'receive') {
                            transaction.from = transactionInfo.details
                                .filter(({ category }) => category === 'send')
                                .map(({ address }) => address);
                            transaction.to = [transactionRaw.address];
                            transaction.type = types_1.WalletTransactionType.RECEIVED;
                        }
                    }
                    transactions.push(transaction);
                }
                return transactions;
            }
            return [];
        });
    }
    /**
     * Does the daemon user directory exist ?
     */
    isDaemonUserDirectory() {
        // tslint:disable-next-line:no-require-imports
        return __webpack_require__(7).existsSync(constants_1.DAEMON_USER_DIR_PATH);
    }
    /**
     * Try to guess the daemon lock state by checking if the 'lock' method is available.
     */
    getDaemonLockState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isHard) {
                throw new Error(`ElectraJs.Wallet: #getLockState() is only available on a hard wallet.`);
            }
            if (this.DAEMON_STATE !== types_1.WalletDaemonState.STARTING) {
                throw new Error(`ElectraJs.Wallet:
        #getLockState() is only available when the hard wallet is starting (#DAEMON_STATE = 'STARTING').`);
            }
            const [err] = yield await_to_js_1.default(this.rpc.lock());
            if (err !== null && err.message === 'DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET') {
                return types_1.WalletLockState.UNLOCKED;
            }
            return types_1.WalletLockState.LOCKED;
        });
    }
}
exports.default = Wallet;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __webpack_require__(1);
const constants_1 = __webpack_require__(0);
const rpc_1 = __webpack_require__(6);
function exec(command) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            __webpack_require__(4).exec(command, (err, stdout, stderr) => {
                if (err !== null || stderr.length !== 0) {
                    reject(err || new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    });
}
function toArrayOfLines(output) {
    return output
        .split(__webpack_require__(2).EOL)
        .map(line => line.trim())
        .filter(line => line.length !== 0);
}
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        const rpc = new rpc_1.default(constants_1.DAEMON_URI, {
            password: constants_1.DAEMON_CONFIG.rpcpassword,
            username: constants_1.DAEMON_CONFIG.rpcuser,
        });
        if (['darwin', 'linux'].includes(process.platform)) {
            const [err1, stdout1] = yield await_to_js_1.default(exec(`lsof | grep :${constants_1.DAEMON_CONFIG.rpcport}`));
            if (err1 === null && stdout1 !== undefined) {
                const results1 = toArrayOfLines(stdout1);
                // If we find at least one used RPC port, we can try to send a "stop" command
                if (results1.length !== 0) {
                    const daemonPid = Number(results1[0].split(/\s+/)[1]);
                    try {
                        yield rpc.stop();
                    }
                    catch (err) { }
                    // tslint:disable-next-line:no-require-imports
                    __webpack_require__(16)(daemonPid, 'SIGKILL');
                }
            }
            const [err2, stdout2] = yield await_to_js_1.default(exec(`lsof | grep :${constants_1.DAEMON_CONFIG.rpcport}`));
            if (err2 === null && stdout2 !== undefined) {
                const results2 = toArrayOfLines(stdout2);
                if (results2.length === 0)
                    return;
            }
            else {
                return;
            }
            yield await_to_js_1.default(exec(`ps -ef | grep -i ^electra* | grep -v grep | awk '{print $2}' | xargs -r kill -9`));
        }
    });
}
exports.default = default_1;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __webpack_require__(14);
/**
 * Custom ElectraJs error class.
 */
class ElectraJsError extends Error {
    constructor(key) {
        super(key);
        this.code = constants_1.ERRORS[key];
    }
}
exports.default = ElectraJsError;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ERRORS = {
    DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET: 302,
    DAEMON_RPC_METHOD_NOT_FOUND: 301,
};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.RPC_ERRORS_TRANSLATION = {
    // "'Error: running with an unencrypted wallet, but walletlock was called.'"
    '-15': 'DAEMON_RPC_LOCK_ATTEMPT_ON_UNENCRYPTED_WALLET',
    // "Method not found"
    '-32601': 'DAEMON_RPC_METHOD_NOT_FOUND',
};


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = require("tree-kill");

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const R = __webpack_require__(5);
function default_1(list, propertyName) {
    return R.last(R.sortBy(R.prop(propertyName))(list));
}
exports.default = default_1;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable
Object.defineProperty(exports, "__esModule", { value: true });
function default_1() {
    const electraUserDirectoryPath = `${__webpack_require__(2).homedir()}/.Electra`;
    const electraConfigFilePath = `${electraUserDirectoryPath}/Electra.conf`;
    const fs = __webpack_require__(7);
    if (fs.existsSync(electraConfigFilePath))
        return;
    if (!fs.existsSync(electraConfigFilePath)) {
        fs.mkdirSync(electraUserDirectoryPath);
    }
    fs.writeFileSync(electraConfigFilePath, `
    listen=1
    daemon=1
    server=1
    rpcuser=user
    rpcpassword=pass
    rpcallowip=127.0.0.1
    rpcport=5788
    walletnotify=curl -X POST http://localhost:3005/transaction
    addnode=175.156.111.14:5817
    addnode=174.89.254.197:5817
    addnode=76.176.172.191:5817
    addnode=162.227.19.41:5817
    addnode=88.212.41.190:5817
    addnode=89.64.23.106:5817
    addnode=216.36.9.43:5817
    addnode=79.68.133.50:5817
    addnode=91.64.5.29:5817
    addnode=78.46.11.116:5817
    addnode=54.254.206.188:5817
    addnode=62.195.3.233:5817
    addnode=92.244.140.34:5817
    addnode=104.196.150.38:5817
    addnode=175.143.236.83:5817
    addnode=184.18.171.147:5817
    addnode=50.117.145.211:5817
    addnode=88.113.185.228:5817
    addnode=75.17.247.94:5817
    addnode=90.83.233.236:5817
    addnode=47.36.123.215:5817
    addnode=24.234.131.6:5817
    addnode=151.225.177.2:5817
    addnode=176.9.28.175:5817
    addnode=99.246.246.176:5817
    addnode=89.153.148.115:5817
    addnode=47.184.165.5:5817
    addnode=77.244.2.4:5817
    addnode=115.64.32.141:5817
    addnode=92.98.87.47:5817
    addnode=138.130.233.149:5817
    addnode=74.215.142.69:5817
    addnode=74.210.155.65:5817
    addnode=188.63.226.42:5817
    addnode=18.196.53.82:5817
    addnode=153.177.70.226:5817
    addnode=151.230.177.29:5817
    addnode=86.95.52.11:5817
    addnode=155.186.129.162:5817
    addnode=85.148.161.65:5817
    addnode=207.81.71.16:5817
    addnode=71.81.57.214:5817
    addnode=172.113.240.185:5817
    addnode=94.112.252.211:5817
    addnode=209.205.120.214:5817
    addnode=24.164.144.57:5817
    addnode=68.129.98.197:5817
    addnode=37.59.75.197:5817
    addnode=71.7.234.19:5817
    addnode=24.71.249.172:5817
    addnode=188.158.86.177:5817
    addnode=24.209.226.87:5817
    addnode=201.221.25.146:5817
    addnode=86.89.201.242:5817
    addnode=66.130.219.21:5817
    addnode=72.89.39.234:5817
    addnode=104.172.14.100:5817
    addnode=69.71.3.226:5817
    addnode=118.243.79.238:5817
    addnode=76.178.141.194:5817
    addnode=66.91.2.250:5817
    addnode=2.236.186.175:5817
    addnode=115.75.5.161:5817
    addnode=219.73.96.212:5817
    addnode=68.197.64.2:5817
    addnode=184.254.90.175:5817
    addnode=99.225.116.84:5817
    addnode=99.249.0.228:5817
    addnode=81.207.37.77:5817
    addnode=146.255.183.207:5817
    addnode=24.216.97.215:5817
    addnode=77.56.204.71:5817
    addnode=87.88.121.198:5817
    addnode=207.38.255.59:5817
    addnode=80.13.33.145:5817
    addnode=23.83.37.240:5817
    addnode=94.69.154.9:5817
    addnode=199.204.33.5:5817
    addnode=185.159.157.11:5817
    addnode=96.249.253.77:5817
    addnode=108.252.26.155:5817
    addnode=74.196.29.206:5817
    addnode=202.180.117.214:5817
    addnode=71.85.54.160:5817
    addnode=84.86.115.125:5817
    addnode=217.101.13.195:5817
    addnode=218.42.211.93:5817
    addnode=184.91.69.255:5817
    addnode=87.236.212.145:5817
    addnode=24.6.183.21:5817
    addnode=62.194.72.84:5817
    addnode=188.100.48.102:5817
    addnode=206.53.87.40:5817
    addnode=84.86.214.197:5817
    addnode=120.188.87.101:5817
    addnode=179.52.57.43:5817
    addnode=173.79.94.125:5817
    addnode=218.191.110.150:5817
    addnode=71.140.147.6:5817
    addnode=108.51.34.254:5817
    addnode=188.178.127.106:5817
    addnode=198.52.94.127:5817
    addnode=74.220.173.232:5817
    addnode=61.92.178.51:5817
    addnode=85.18.252.192:5817
    addnode=94.212.98.11:5817
    addnode=106.68.252.146:5817
    addnode=24.17.198.123:5817
    addnode=218.229.81.81:5817
    addnode=83.233.110.142:5817
    addnode=212.120.229.20:5817
    addnode=31.18.250.22:5817
    addnode=176.212.144.217:5817
    addnode=77.38.26.225:5817
    addnode=113.169.125.120:5817
    addnode=79.40.246.173:5817
    addnode=92.167.37.16:5817
    addnode=67.7.104.144:5817
    addnode=93.10.24.200:5817
    addnode=178.233.148.151:5817
    addnode=73.232.121.33:5817
    addnode=178.249.129.121:5817
    addnode=85.109.117.99:5817
  `);
}
exports.default = default_1;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(port) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            // tslint:disable-next-line:no-require-imports
            const server = __webpack_require__(20).createServer()
                .once('error', (err) => resolve(false))
                .once('listening', () => server
                .once('close', () => resolve(true))
                .close())
                .listen(port);
        });
    });
}
exports.default = default_1;


/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("net");

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper to one-line try / catch statements
 */
function default_1(callback) {
    try {
        const res = callback();
        return [undefined, res];
    }
    catch (err) {
        return [err, undefined];
    }
}
exports.default = default_1;


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wait for <forInMs> milliseconds.
 */
function default_1(forInMs) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => setTimeout(resolve, forInMs));
    });
}
exports.default = default_1;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable:no-unnecessary-class
Object.defineProperty(exports, "__esModule", { value: true });
const bip38 = __webpack_require__(24);
const wif = __webpack_require__(25);
const constants_1 = __webpack_require__(0);
/**
 * Cryptography helpers.
 */
class Crypto {
    /**
     * Cipher a WIF private key into a BIP38 cipher.
     *
     * @see https://github.com/bitcoinjs/bip38#api
     */
    static cipherPrivateKey(privateKey, passphrase, progressCallback) {
        try {
            const decodedPrivateKey = wif.decode(privateKey, constants_1.ECA_NETWORK.wif);
            const privateKeyCipher = bip38.encrypt(decodedPrivateKey.privateKey, decodedPrivateKey.compressed, passphrase, progressCallback !== undefined
                ? (status) => progressCallback(status.percent)
                : undefined);
            return privateKeyCipher;
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Decipher a BIP38 ciphered private key into a WIF private key.
     *
     * @see https://github.com/bitcoinjs/bip38#api
     */
    static decipherPrivateKey(privateKeyCipher, passphrase) {
        try {
            const encodedPrivateKey = bip38.decrypt(privateKeyCipher, passphrase);
            const privateKey = wif.encode(constants_1.ECA_NETWORK.wif, encodedPrivateKey.privateKey, encodedPrivateKey.compressed);
            return privateKey;
        }
        catch (err) {
            throw err;
        }
    }
}
exports.default = Crypto;


/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("bip38");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("wif");

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable:no-unnecessary-class
Object.defineProperty(exports, "__esModule", { value: true });
const bip39 = __webpack_require__(27);
const bitcoinJs = __webpack_require__(28);
const constants_1 = __webpack_require__(0);
const CHAIN_CODE_BUFFER_SIZE = 32;
const ENTROPY_STRENGTH = 128;
/**
 * Electra blockchain functions.
 */
class Electra {
    /**
     * Resolve the address hash from its WIF private key.
     */
    static getAddressHashFromPrivateKey(privateKey) {
        return bitcoinJs.ECPair
            .fromWIF(privateKey, constants_1.ECA_NETWORK)
            .getAddress();
    }
    /**
     * Calculate the derived key n (0-indexed) from a Highly Deterministic Wallet Master Node private key.
     *
     * @see https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#master-key-generation
     */
    static getDerivedChainFromMasterNodePrivateKey(privateKey, walletIndex, chainIndex) {
        const masterNode = this.getMasterNodeFromPrivateKey(privateKey);
        const derivedNode = masterNode.deriveHardened(walletIndex).derive(chainIndex);
        return {
            hash: derivedNode.getAddress(),
            isCiphered: false,
            isHD: true,
            privateKey: derivedNode.keyPair.toWIF()
        };
    }
    /**
     * Resolve the Highly Deterministic Wallet Master Node address hash and WIF private key
     * from its associated mnemonic, extended by the mnemonic extension if given.
     *
     * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
     */
    static getMasterNodeAddressFromMnemonic(mnemonic, mnemonicExtension) {
        const masterNode = this.getMasterNodeFromMnemonic(mnemonic, mnemonicExtension);
        const keyPair = masterNode.keyPair;
        return {
            hash: keyPair.getAddress(),
            isCiphered: false,
            isHD: true,
            privateKey: keyPair.toWIF()
        };
    }
    /**
     * Generate a crypto-random address.
     *
     * @note This address can't be associated with a mnemonic and requires its private key to be recovered.
     */
    static getRandomAddress() {
        const keyPair = bitcoinJs.ECPair.makeRandom({ network: constants_1.ECA_NETWORK });
        return {
            hash: keyPair.getAddress(),
            isCiphered: false,
            isHD: false,
            privateKey: keyPair.toWIF()
        };
    }
    /**
     * Generate a crypto-random mnemonic, using a 128-bits entropy.
     *
     * @note A 128-bits entropy generates a 12 words mnemonic.
     * @see https://github.com/bitcoinjs/bip39
     */
    static getRandomMnemonic() {
        return bip39.generateMnemonic(ENTROPY_STRENGTH);
    }
    /**
     * Generate a crypto-random mnemonic, using a 128-bits entropy.
     *
     * @note A 128-bits entropy generates a 12 words mnemonic.
     * @see https://github.com/bitcoinjs/bip39
     */
    static validateMnemonic(mnemonic) {
        return bip39.validateMnemonic(mnemonic);
    }
    /**
     * Return an instance of Highly Deterministic Wallet Master Node from its mnemonic,
     * extended by the mnemonic extension if given.
     */
    static getMasterNodeFromMnemonic(mnemonic, mnemonicExtension) {
        const seed = this.getSeedFromMnemonic(mnemonic, mnemonicExtension);
        return bitcoinJs.HDNode.fromSeedBuffer(seed, constants_1.ECA_NETWORK);
    }
    /**
     * Return an instance of Highly Deterministic Wallet Master Node from its WIF private key.
     */
    static getMasterNodeFromPrivateKey(privateKey) {
        const masterNodeKeyPair = bitcoinJs.ECPair.fromWIF(privateKey, constants_1.ECA_NETWORK);
        // TODO Check the "chainCode" buffer
        return new bitcoinJs.HDNode(masterNodeKeyPair, new Buffer(CHAIN_CODE_BUFFER_SIZE));
    }
    /**
     * Convert the mnemonic into a seed buffer, extended by the mnemonic extension if given.
     *
     * @see https://en.bitcoin.it/wiki/Mnemonic_phrase
     */
    static getSeedFromMnemonic(mnemonic, mnemonicExtension) {
        return bip39.mnemonicToSeed(mnemonic, mnemonicExtension);
    }
}
exports.default = Electra;


/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = require("bip39");

/***/ }),
/* 28 */
/***/ (function(module, exports) {

module.exports = require("bitcoinjs-lib");

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(3);
const URI = 'https://api.electraexplorer.com/ext/getaddress/';
/**
 * Get the current price of ECA via CoinMarketCap.
 */
function default_1(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const [err, res] = yield await_to_js_1.default(axios_1.default.get(URI + address));
        if (err)
            throw new Error(`webServices#getBalanceFor(): ${err.message}`);
        if (res === undefined || typeof res.data !== 'object' || typeof res.data.balance !== 'number') {
            if (res !== undefined && typeof res.data === 'object')
                return 0;
            throw new Error(`webServices#getBalanceFor(): We did't get the expected response from ElectraExplorer.`);
        }
        return Number(res.data.balance);
    });
}
exports.default = default_1;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __webpack_require__(1);
const axios_1 = __webpack_require__(3);
const enumStringArray_1 = __webpack_require__(31);
// https://coinmarketcap.com/api/
// tslint:disable-next-line:typedef
exports.CURRENCIES = enumStringArray_1.default([
    'AUD', 'BRL', 'BTC', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR',
    'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR',
    'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY',
    'TWD', 'USD', 'ZAR'
]);
const URI = 'https://api.coinmarketcap.com/v1/ticker/electra/';
/**
 * Get the current price of ECA via CoinMarketCap.
 */
function default_1(currency = 'USD') {
    return __awaiter(this, void 0, void 0, function* () {
        const [err, res] = yield await_to_js_1.default(axios_1.default.get(URI, { params: { convert: currency } }));
        if (err)
            throw new Error(`api#webServices(): ${err.message}`);
        if (res === undefined || !Array.isArray(res.data) || res.data.length === 0) {
            throw new Error(`api#webServices(): We did't get the expected response from CoinMarketCap.`);
        }
        const priceKey = `price_${currency.toLowerCase()}`;
        return Number(res.data[0][priceKey]);
    });
}
exports.default = default_1;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// tslint:disable
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Helper to create a K:V from an array of strings.
 */
function default_1(strings) {
    return strings.reduce((res, key) => (res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
exports.default = default_1;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var WalletDaemonState;
(function (WalletDaemonState) {
    WalletDaemonState["STARTED"] = "STARTED";
    WalletDaemonState["STARTING"] = "STARTING";
    WalletDaemonState["STOPPED"] = "STOPPED";
    WalletDaemonState["STOPPING"] = "STOPPING";
})(WalletDaemonState = exports.WalletDaemonState || (exports.WalletDaemonState = {}));
var WalletLockState;
(function (WalletLockState) {
    WalletLockState["LOCKED"] = "LOCKED";
    WalletLockState["STAKING"] = "STAKING";
    WalletLockState["UNLOCKED"] = "UNLOCKED";
})(WalletLockState = exports.WalletLockState || (exports.WalletLockState = {}));
var WalletState;
(function (WalletState) {
    WalletState["EMPTY"] = "EMPTY";
    WalletState["READY"] = "READY";
})(WalletState = exports.WalletState || (exports.WalletState = {}));
var WalletTransactionType;
(function (WalletTransactionType) {
    WalletTransactionType["GENERATED"] = "GENERATED";
    WalletTransactionType["RECEIVED"] = "RECEIVED";
    WalletTransactionType["SENT"] = "SENT";
})(WalletTransactionType = exports.WalletTransactionType || (exports.WalletTransactionType = {}));


/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map