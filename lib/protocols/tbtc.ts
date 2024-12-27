import * as ethers from "ethers"
import { TBTC } from "keep-network/tbtc-v2"

// Create an Ethers provider. Pass the URL of an Ethereum mainnet node.
// For example, Alchemy or Infura.
const provider = new ethers.providers.JsonRpcProvider("...")
// Create an Ethers signer. Pass the private key and the above provider.
const signer = new ethers.Wallet("...", provider)

// If you want to initialize the SDK just for read-only actions, it is
// enough to pass the provider. 
const sdkReadonly = await TBTC.initializeMainnet(provider)
// If you want to make transactions as well, you have to pass the signer.
const sdk = await TBTC.initializeMainnet(signer)


// Set the P2WPKH/P2PKH Bitcoin recovery address. It can be used to recover
// deposited BTC in case something exceptional happens.
const bitcoinRecoveryAddress: string = "..."

// Initiate the deposit.
const deposit = await sdk.deposits.initiateDeposit(bitcoinRecoveryAddress)

// Take the Bitcoin deposit address. BTC must be sent here.
const bitcoinDepositAddress = await deposit.getBitcoinAddress()

// Initiate minting using latest funding UTXO. Returns hash of the
// initiate minting transaction. Can throw an error if there are no
// Bitcoin funding transactions targeting this deposit address. 
// In that case, consider retrying after a delay.
const txHash = await deposit.initiateMinting()