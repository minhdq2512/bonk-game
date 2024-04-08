import { getSession, signOut, useSession } from "next-auth/react"
import { Fragment, useEffect } from "react"
import { signInWithCustomToken, signOut as fbSignOut } from "firebase/auth"
import { AiOutlineLoading3Quarters } from "react-icons/ai";


export default function InitialLayout({ children }: Readonly<{
    children: React.ReactNode
}>) {
    const session = useSession()

    return (
        <Fragment>
            {/* <LoginHeader /> */}
            {
                session.status === "authenticated" ?
                    children
                    :
                    (<div className="w-full h-full relative bg-transparent flex flex-col justify-center items-center min-h-[calc(100vh-80px)]" id="home">
                        <div className="text-[12px] lg:text-[14px] font-poppins flex items-center justify-center">
                            <w3m-button />
                        </div>
                    </div>)
            }
            {/* <VideoBackground /> */}
        </Fragment>
    )
}