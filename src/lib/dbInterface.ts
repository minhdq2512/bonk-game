import { mainChain } from "@/config/connector";
import { createPublicClient, http } from "viem";

export interface Battles {
    [key: string]: string;
}

export interface ClientInfo {
    customId: string
    clientId: string
}

export interface WaitingBattle {
    owner: string
    // mode: 0 = 3v3; 1 = 5v5
    mode: number
    stakes: string
    // createAt: miliseconds
    createAt: number
    guess: string
}

export interface WaitingBattles {
    [owner: string]: WaitingBattle
}

export interface ERROR {
    shortMessage: string
}

export const publicClientViem = createPublicClient({
    chain: mainChain,
    transport: http()
})