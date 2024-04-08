import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { cookieStorage, createConfig, createStorage, http } from 'wagmi'
import { Chain, bsc, bscTestnet, } from 'wagmi/chains'

export const projectId = "50b736dc7bc1b3d9de6f7992c0586087"

if (!projectId) throw new Error('Project ID is not defined')


const metadata = {
    name: 'Bonk Royale',
    description: 'Bonk Royale Game',
    url: 'https://babybonk-game.vercel.app', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const bscChainTestnet: Chain = {
    id: 97,
    name: 'Binance Smart Chain Testnet',
    nativeCurrency: {
        decimals: 18,
        name: 'BNB',
        symbol: 'tBNB',
    },
    rpcUrls: {
        default: { http: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'] },
    },
    blockExplorers: {
        default: {
            name: 'BscScan',
            url: 'https://testnet.bscscan.com',
            apiUrl: 'https://testnet.bscscan.com/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 17422483,
        },
    },
    testnet: true,
}

// Create wagmiConfig
const chains = [bscChainTestnet] as const

export const mainChain = chains[0]

export const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
    ssr: true,
    storage: createStorage({
        storage: cookieStorage
    }),
    transports: {
        [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.bnbchain.org:8545')
    }
})