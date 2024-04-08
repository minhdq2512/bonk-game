import { ABI_BATTLE_DETAIL, ABI_BATTLE_FACTORY, ABI_CARDNFT, ABI_STORAGE } from "@/config/abi";
import { ADDRESS } from "@/config/address";
import { mainChain } from "@/config/connector";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Address, ContractFunctionExecutionError, TransactionExecutionError, erc20Abi } from "viem";
import { useBlockNumber, usePublicClient, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { ERROR } from "./dbInterface";
import { toast } from "react-toastify";
import { NFTData } from "./useNFT";
import BattleStore from "./store/battleStore";

enum AttackType {
    ACTIVE,
    PASSIVE
}

enum EffectType {
    DAMAGE,
    DEFEND,
    HEAL,
    SELF_HEAL,
    KILL,
    AOE_DAMAGE,
    PASSIVE_DEFEND,
    SPEEDDAMAGE,
    AROUNDDAMAGE,
    DAMAGECRIT,
    REFLECT,
}

enum NumType {
    NUM,
    PER,
    MUL,
    MINUS,
    ADD,
}

interface SkillDetail {
    id: number
    img: string,
    name: string,
    class: number,
    effect: {
        mana: number,
        etype: EffectType,
        value: number,
        ntype: NumType
    }
}

export const SKILL_LIST: SkillDetail[] = [
    {
        id: 1,
        img: "/newassets/images/abilities/bonk.png",
        name: "bonk",
        class: 0,
        effect: {
            mana: -5,
            etype: EffectType.DAMAGE,
            value: 10,
            ntype: NumType.NUM
        }
    },
    {
        id: 2,
        img: "/newassets/images/abilities/superbonk.png",
        name: "superbonk",
        class: 0,
        effect: {
            mana: -20,
            etype: EffectType.DAMAGE,
            value: 20,
            ntype: NumType.NUM
        }
    },
    {
        id: 3,
        img: "/newassets/images/abilities/block.png",
        name: "block",
        class: 0,
        effect: {
            mana: -12,
            etype: EffectType.DEFEND,
            value: 30,
            ntype: NumType.PER
        }
    },
    {
        id: 4,
        img: "/newassets/images/abilities/nothing.png",
        name: "nothing",
        class: 0,
        effect: {
            mana: 0,
            etype: EffectType.HEAL,
            value: 5,
            ntype: NumType.NUM
        }
    },
    {
        id: 5,
        img: "/newassets/images/abilities/gladiator-bonk.png",
        name: "gladiator bonk",
        class: 1,
        effect: {
            mana: -25,
            etype: EffectType.DAMAGECRIT,
            value: 25,
            ntype: NumType.PER
        }
    },
    {
        id: 6,
        img: "/newassets/images/abilities/berserker.png",
        name: "berserker",
        class: 1,
        effect: {
            mana: -30,
            etype: EffectType.KILL,
            value: 0.5,
            ntype: NumType.PER
        }
    },
    {
        id: 7,
        img: "/newassets/images/abilities/bonk-of-the-void.png",
        name: "bonk of the void",
        class: 2,
        effect: {
            mana: -25,
            etype: EffectType.DAMAGE,
            value: 25,
            ntype: NumType.NUM
        }
    },
    {
        id: 8,
        img: "/newassets/images/abilities/life-of-the-ancestors.png",
        name: "life of the ancestors",
        class: 2,
        effect: {
            mana: -30,
            etype: EffectType.HEAL,
            value: 30,
            ntype: NumType.NUM
        }
    },
    {
        id: 9,
        img: "/newassets/images/abilities/lightning-dash.png",
        name: "lightning dash",
        class: 3,
        effect: {
            mana: -25,
            etype: EffectType.SPEEDDAMAGE,
            value: 15,
            ntype: NumType.NUM
        }
    },
    {
        id: 10,
        img: "/newassets/images/abilities/lightning-bonk.png",
        name: "lightning bonk",
        class: 3,
        effect: {
            mana: -30,
            etype: EffectType.AROUNDDAMAGE,
            value: 20,
            ntype: NumType.NUM
        }
    },
    {
        id: 11,
        img: "/newassets/images/abilities/super-bonk-shield.png",
        name: "super bonk shield",
        class: 4,
        effect: {
            mana: -10000000000000,
            etype: EffectType.DEFEND,
            value: 15,
            ntype: NumType.PER
        }
    },
    {
        id: 12,
        img: "/newassets/images/abilities/iron-fortress.png",
        name: "iron fortress",
        class: 4,
        effect: {
            mana: -30,
            etype: EffectType.REFLECT,
            value: 50,
            ntype: NumType.PER
        }
    },
]


export function useBattles() {
    const queryClient = useQueryClient()
    const { data: blockNumber } = useBlockNumber({ watch: true })

    const { data: battles, queryKey, refetch } = useReadContract({
        abi: ABI_BATTLE_FACTORY,
        address: ADDRESS[mainChain.id].BattleFactory,
        functionName: "getAllBattle",
        scopeKey: "getAllBattle"
    })

    useEffect(() => {
        refetch()
    }, [blockNumber])


    return battles || []
}

export function useBattleInfo(battleid: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })

    const { data: battle, refetch } = useReadContract({
        abi: ABI_BATTLE_DETAIL,
        address: battleid,
        functionName: "getBattleInfo",
        scopeKey: `battleinfo-${battleid}`
    })

    useEffect(() => {
        refetch()
    }, [blockNumber, battleid])

    return battle
}

export function useApproveForBattle(battleid: Address, account: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const publicClient = usePublicClient()

    const { data: isApproved, refetch } = useReadContract({
        abi: ABI_CARDNFT,
        address: ADDRESS[mainChain.id].CARDNFT,
        functionName: "isApprovedForAll",
        args: [
            account, battleid
        ],
        scopeKey: `isApprovedForAll-${battleid}-${account}`
    })

    const { writeContractAsync } = useWriteContract()

    const approve = async () => {
        if (publicClient)
            try {
                const hash_approve = await writeContractAsync({
                    abi: ABI_CARDNFT,
                    address: ADDRESS[mainChain.id].CARDNFT,
                    functionName: "setApprovalForAll",
                    args: [
                        battleid,
                        true
                    ],
                })
                const result_approve = await publicClient.waitForTransactionReceipt({
                    confirmations: 2,
                    hash: hash_approve
                })
                if (result_approve.status !== "success") {
                    throw {
                        shortMessage: "Approve failed"
                    }
                } else {
                    toast("Approve success")
                }
            } catch (error: ERROR | any) {
                console.log(error)
                if (error instanceof TransactionExecutionError) {
                    toast(error.shortMessage)
                } else if (error instanceof ContractFunctionExecutionError) {
                    toast(error.shortMessage)
                } else if ("shortMessage" in error) {
                    toast(error.shortMessage)
                } else {
                    toast("Unknown error")
                }
            }
    }

    useEffect(() => {
        refetch()
    }, [blockNumber, battleid])

    return { isApproved, approve }
}

export function useCardOnBattle(battleid: Address, account: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const [myNft, setMyNft] = useState<NFTData[]>([])

    const { data, refetch } = useReadContract({
        abi: ABI_BATTLE_DETAIL,
        address: battleid,
        functionName: "getNFTs",
        args: [
            account
        ],
        scopeKey: `getNFTs-${battleid}-${account}`
    })

    const result = useReadContracts({
        contracts: data?.map(val => {
            return {
                abi: ABI_STORAGE,
                address: ADDRESS[mainChain.id].StorageNFT,
                functionName: "CardInfos",
                args: [val]
            }
        }) || [],
        allowFailure: false
    })

    const fetchNFTData = useCallback((thelist: any[]) => {
        const templist: NFTData[] = []
        thelist.forEach(element => {
            templist.push({
                tokenid: Number(element[0]),
                image: `https://bafybeigszjn34i7bell7haxhhuyvqbipzvmezcphzln6yxn33ha2wlobi4.ipfs.nftstorage.link/${element[2].toString()}/${element[3].toString()}/img${element[1].toString()}.png`,
                rare: Number(element[3]),
                classid: Number(element[2]),
                class: Number(element[2]) === 1 ? "warrior" : Number(element[2]) === 2 ? "magician" : Number(element[2]) === 3 ? "blitz" : Number(element[2]) === 4 ? "tank" : ""
            })
        });
        setMyNft(templist)
        BattleStore.setCardsInfo(account, templist)
    }, [blockNumber, account])

    useEffect(() => {
        refetch()
    }, [blockNumber])

    useEffect(() => {
        if (result.data) {
            fetchNFTData(result.data)
        }
    }, [result.data])

    return myNft
}

export default function useTokenOnBattle(account: Address, battleid: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })

    const { data, refetch } = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                abi: erc20Abi,
                address: ADDRESS[mainChain.id].Token,
                chainId: mainChain.id,
                functionName: "decimals",
            },
            {
                abi: erc20Abi,
                address: ADDRESS[mainChain.id].Token,
                chainId: mainChain.id,
                functionName: "balanceOf",
                args: [
                    account
                ]
            },
            {
                abi: erc20Abi,
                address: ADDRESS[mainChain.id].Token,
                chainId: mainChain.id,
                functionName: "allowance",
                args: [
                    account,
                    battleid
                ]
            },
        ]
    })

    useEffect(() => {
        refetch()
    }, [blockNumber])

    return data || [18, BigInt(0), BigInt(0)]
}

export interface NFTState {
    tokenid: number
    hp: number
    mana: number
}

export function useCardState(battleid: Address, tokenid: number) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const [state, setState] = useState({
        tokenid: -1,
        hp: 0,
        mana: 0
    })

    const { data, refetch } = useReadContract({
        abi: ABI_BATTLE_DETAIL,
        address: battleid,
        functionName: "nftstates",
        args: [
            BigInt(tokenid)
        ],
        scopeKey: `nftstates-${battleid}-${tokenid}`
    })

    useEffect(() => {
        refetch()
    }, [blockNumber])

    useEffect(() => {
        if (data) {
            setState({
                tokenid: tokenid,
                hp: Number(data[4]),
                mana: Number(data[5])
            })
            BattleStore.setCurrentState({
                battleid: battleid,
                tokenid: tokenid,
                hp: Number(data[4]),
                mana: Number(data[5])
            })
        }
    }, [data])

    return state
}

export function useCurrentTurnId(battleid: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const [turnid, setTurnid] = useState(-1)
    const { data: currentTurnId, refetch } = useReadContract({
        abi: ABI_BATTLE_DETAIL,
        address: battleid,
        functionName: "curruntTurnId",
        scopeKey: `curruntTurnId-${battleid}`
    })
    useEffect(() => {
        refetch()
    }, [blockNumber])

    useEffect(() => {
        if (typeof currentTurnId !== "undefined") {
            toast("New turn #" + currentTurnId.toString(), {
                position: "bottom-right",
                autoClose: 1000,
                pauseOnHover: false,

            })
            setTurnid(Number(currentTurnId))
            BattleStore.resetSkills()
        }
    }, [currentTurnId])

    return { turnid, blockNumber }
}

export function useCurrentSigned(battleid: Address, owner: Address, fighter: Address) {
    const { turnid, blockNumber } = useCurrentTurnId(battleid)
    const [ownerSigned, setOwnerSigned] = useState(false)
    const [fighterSigned, setFighterSigned] = useState(false)

    const result = useReadContracts({
        allowFailure: false,
        contracts: [
            {
                abi: ABI_BATTLE_DETAIL,
                address: battleid,
                functionName: "turnSigned",
                args: [
                    BigInt(turnid),
                    owner,
                ]
            },
            {
                abi: ABI_BATTLE_DETAIL,
                address: battleid,
                functionName: "turnSigned",
                args: [
                    BigInt(turnid),
                    fighter,
                ]
            }
        ]
    })

    useEffect(() => {
        result.refetch()
    }, [turnid, blockNumber])

    useEffect(() => {
        if (typeof result.data !== "undefined") {
            setOwnerSigned(result.data[0])
            setFighterSigned(result.data[1])
        }
    }, [result.data])


    return {
        turnid,
        ownerSigned,
        fighterSigned
    }
}





