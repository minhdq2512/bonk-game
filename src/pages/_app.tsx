import '@/styles/globals.css'
import '@/styles/style1.css'
import type { AppProps } from 'next/app'
import { Client, HydrationProvider } from 'react-hydration-provider'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import RootLayout from '@/components/Layout/RootLayout'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import InitialLayout from '@/components/Layout/InitialLayout'
import LoginHeader from '@/components/Layout/LoginHeader';
import VideoBackground from '@/components/VideoBackgound/bg';

export default function App({ Component, pageProps }: AppProps<{
    session: Session
}>) {
    return (
        <HydrationProvider>
            <Client>
                <SessionProvider session={pageProps.session} refetchInterval={0}>
                    <RootLayout>
                        <ToastContainer
                            position="top-right"
                            autoClose={2000}
                            hideProgressBar={false}
                            newestOnTop={true}
                            closeOnClick={true}
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                            limit={2}
                        />
                        <div className="App">
                            <LoginHeader />
                            <InitialLayout>
                                <Component {...pageProps} />
                            </InitialLayout>
                            <VideoBackground />
                        </div>
                    </RootLayout>
                </SessionProvider>
            </Client>
        </HydrationProvider>
    )
}
