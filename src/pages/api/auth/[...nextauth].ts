import type { SIWESession } from "@web3modal/siwe"
import { NextAuthOptions } from "next-auth"
import credentialsProvider from "next-auth/providers/credentials"
import { getCsrfToken } from "next-auth/react"
import { SiweMessage } from "siwe"
import NextAuth from "next-auth/next"
import { projectId } from "@/config/connector"
import { NextApiRequest, NextApiResponse } from "next"

declare module "next-auth" {
    interface Session extends SIWESession {
        address: string
        chainId: number
        fbtoken: string
    }
}
const nextAuthSecret = "0xad18aD23B3324d2bF29276ee1CA242C52FE057a1"

if (!nextAuthSecret) {
    throw new Error("NEXTAUTH_SECRET is not set")
}
// Get your projectId on https://cloud.walletconnect.com

if (!projectId) {
    throw new Error("NEXT_PUBLIC_PROJECT_ID is not set")
}

export const authOptions: NextAuthOptions = {
    secret: nextAuthSecret,
    providers: [
        credentialsProvider({
            name: "Ethereum",
            credentials: {
                message: {
                    label: "Message",
                    type: "text",
                    placeholder: "0x0",
                },
                signature: {
                    label: "Signature",
                    type: "text",
                    placeholder: "0x0",
                },
            },
            async authorize(credentials, req) {
                try {
                    if (!credentials?.message) {
                        throw new Error("SiweMessage is undefined")
                    }
                    const siwe = new SiweMessage(credentials.message)
                    const nonce = await getCsrfToken({ req: { headers: req.headers } })
                    const result = await siwe.verify(
                        {
                            signature: credentials?.signature || "",
                            nonce,
                        }
                    )
                    if (result.success) {

                        return {
                            id: `eip155:${siwe.chainId}:${siwe.address}`,
                        }
                    }
                    return null
                } catch (e) {
                    return null
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        session({ session, token }) {
            if (!token.sub) {
                return session
            }

            const [, chainId, address] = token.sub.split(":")
            if (chainId && address) {
                session.address = address
                session.chainId = parseInt(chainId, 10)
            }
            // console.log("session", session, token)
            return session
        },
    },
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    return await NextAuth(req, res, authOptions)
}