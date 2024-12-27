import Web3 from 'web3';
import { Transaction } from '@ethereumjs/tx'

const web = new Web3(Web3.givenProvider);
const erc20abi = [""];

const fromTokenAddress = bestRoute.calldata.token;

const ERC20TokenContract = new web.eth.Contract(erc20abi, fromTokenAddress);

const maxApproval = new BigNumber(2).pow(256).minus(1);

const approveTxEncoded = await ERC20TokenContract.methods.approve(
    bestRoute.approvalTarget,
    maxApproval,
).encodeABI();

const approveTx = {
    to: fromTokenAddress,
    data: approveTxEncoded,
    gas: 300000,
    type: 0,
};

const signedApproveTx = await web.eth.accounts.signTransaction(approveTx, ETH_PRIVATE_KEY);
const approveTxHash = await web.eth.sendSignedTransaction(signedApproveTx.rawTransaction);


const transaction = {
    "to": "0xd31f7e39afECEc4855fecc51b693F9A0Cec49fd2",
    "from": "0xA58818F1cA5A7DD524Eca1F89E2325e15BAD6cc4",
    "value": "0x0",
    "gas": "273217",
    "gasPrice": "18000000000",
    "nonce": "272",
    "data": "0x0701c374000000000000000000000000d37bbe5744d730a1d98d8dc97c42f0ca46ad7146000000000000000000000000ff772b437e0c20d46722d67fdb973d70fd46cece00000000000000000000000000000000000000000000000000000000000001000000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f9840000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000001111111254fb6c44bac0bed2854e76f90643097d000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000",
  }

// Initialize web3 instance
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_HTTP_URL))

// This buffer will be used to sign the transaction
const privateKeyBuffer = Buffer.from(ETH_PRIVATE_KEY, 'hex')

// Create Transaction object
const tx = new Transaction(transaction)

// Sign it
const signedTx = tx.sign(privateKeyBuffer)

// Serialize it
const serializedTx = signedTx.serialize()

// Send it & log the receipt
await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')).on('receipt', console.log);

console.log('Swap complete!')