
import { CowSwapWidget, CowSwapWidgetParams, TradeType } from '@cowprotocol/widget-react'

//  Fill this form https://cowprotocol.typeform.com/to/rONXaxHV once you pick your "appCode"
const params: CowSwapWidgetParams = {
    "appCode": "My Cool App", // Name of your app (max 50 characters)
    "width": "100%", // Width in pixels (or 100% to use all available space)
    "height": "640px",
    "chainId": 1, // 1 (Mainnet), 100 (Gnosis), 11155111 (Sepolia)
    "tokenLists": [ // All default enabled token lists. Also see https://tokenlists.org
        "https://files.cow.fi/tokens/CoinGecko.json",
        "https://files.cow.fi/tokens/CowSwap.json"
    ],
    "tradeType": TradeType.SWAP, // TradeType.SWAP, TradeType.LIMIT or TradeType.ADVANCED
    "sell": { // Sell token. Optionally add amount for sell orders
        "asset": "thUSD",
        "amount": "100000"
    },
    "buy": { // Buy token. Optionally add amount for buy orders
        "asset": "USDC",
        "amount": "0"
    },
    "enabledTradeTypes": [ // TradeType.SWAP, TradeType.LIMIT and/or TradeType.ADVANCED
        TradeType.ADVANCED,
        TradeType.LIMIT,
        TradeType.SWAP
    ],
    "theme": "dark", // light/dark or provide your own color palette
    "standaloneMode": false,
    "disableToastMessages": true,
    "disableProgressBar": false,
    "hideBridgeInfo": false,
    "hideOrdersTable": false,
    "images": {},
    "sounds": {},
    "customTokens": []
}

// Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
const provider = window.ethereum

function App() {
  return (
    <CowSwapWidget params={params} provider={provider} />
  )
}
