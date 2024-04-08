import { createWeb3Modal } from '@web3modal/wagmi/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { State, WagmiProvider, cookieToInitialState } from 'wagmi'
import { mainChain, projectId, wagmiConfig } from '@/config/connector'
import { Fragment, ReactNode } from 'react'
import { siweConfig } from '@/config/siwe'
import Head from 'next/head'

const queryClient = new QueryClient()

createWeb3Modal({
    wagmiConfig: wagmiConfig,
    siweConfig: siweConfig,
    projectId,
    defaultChain: mainChain,
    // enableAnalytics: true, // Optional - defaults to your Cloud configuration
    // enableOnramp: true // Optional - false as default
})

function Web3ModalProvider({
    children,
    initialState
}: {
    children: ReactNode
    initialState?: State
}) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    )
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    // const initialState = cookieToInitialState(wagmiConfig, headers().get('cookie'))

    return (
        <Fragment>
            <Head>
                <title>Bonk Royale Game</title>
            </Head>
            <Web3ModalProvider>{children}</Web3ModalProvider>
        </Fragment>
    )
}