import { ABI_BATTLE_DETAIL } from "@/config/abi";
import { ADDRESS } from "@/config/address";
import { mainChain } from "@/config/connector";
import { ERROR, WaitingBattle } from "@/lib/dbInterface";
import { supabase } from "@/lib/supabaseClient";
import useTokenOnBattle, { useApproveForBattle, useBattleInfo, useCardOnBattle } from "@/lib/useBattles";
import { NFTData, useMyNFTs } from "@/lib/useNFT";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { Address, ContractFunctionExecutionError, TransactionExecutionError, erc20Abi, isAddressEqual, maxUint256, parseUnits, zeroAddress } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

const DefaultData: NFTData = {
    tokenid: -1,
    image: "/newassets/images/teamplaceholder.png",
    rare: 0,
    classid: 0,
    class: ""
}

enum WaitingType {
    OWNER,
    FIGHTER
}

const WaitingRoomCore = ({
    channel, account, battleInfo
}: {
    channel: RealtimeChannel
    account: Address
    battleInfo: {
        battleid: `0x${string}`;
        owner: `0x${string}`;
        fighter: `0x${string}`;
        winner: `0x${string}`;
        betamount: bigint;
        mode: number;
        status: number;
        createat: bigint;
    }
}) => {
    const [cardSelecting, setCardSelecting] = useState<NFTData[]>([])

    const [joiner, setJoiner] = useState<string[]>([])
    const [sub, setSub] = useState<boolean>(false)
    const fighter: Address = isAddressEqual(zeroAddress, battleInfo.fighter) ?
        joiner.filter(val => !isAddressEqual(val as Address, battleInfo.owner)).length > 0 ? joiner.filter(val => !isAddressEqual(val as Address, battleInfo.owner))[0] as Address : zeroAddress
        : battleInfo.fighter

    useEffect(() => {
        if (channel && !sub) {
            try {
                channel
                    .subscribe(async (status) => {
                        console.log("status", status)
                        if (status === 'SUBSCRIBED') {
                            await channel.track({})
                            setSub(true)
                        }
                    })
            } catch (error) {
                console.log("error", error)
            }

        }
        if (channel) {
            channel.on('presence', { event: 'sync' }, () => {
                // console.log("sync", channel.presenceState())
                const addresses: string[] = Object.keys(channel.presenceState())
                const uniq_addressed: string[] = addresses.filter(function (item, pos) {
                    return addresses.indexOf(item) == pos;
                })
                setJoiner(uniq_addressed)
            })
        }

        return () => {
            if (channel) {
                channel.untrack()
            }
        }

    }, [channel])
    const [loading, setLoading] = useState<boolean>(false)
    const myAllNFTs = useMyNFTs(account)
    const allowance = useTokenOnBattle(account, battleInfo.battleid)
    const { writeContractAsync } = useWriteContract()
    const publicClient = usePublicClient()

    const { isApproved, approve } = useApproveForBattle(battleInfo.battleid, account)

    const handleClick = async () => {
        setLoading(true)

        try {
            if (typeof publicClient === "undefined") {
                throw {
                    shortMessage: "Unknown error"
                }
            }
            if (battleInfo.betamount > allowance[2]) {
                const hash_approve = await writeContractAsync({
                    abi: erc20Abi,
                    address: ADDRESS[mainChain.id].Token,
                    functionName: "approve",
                    args: [
                        battleInfo.battleid,
                        maxUint256
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
                    toast("Approve token success")
                }
            }
            if (!isApproved) {
                await approve()
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
        setLoading(false)
    }

    return (
        <div className="flex flex-col justify-center items-center absolute w-full gap-10">
            <div className="flex gap-20 h-full relative">
                <WaitingCard account={account} owner={battleInfo.owner} fighter={fighter} battleInfo={battleInfo} channel={channel} cardtype={WaitingType.OWNER} joiner={joiner as Address[]} />
                <div className="hidden h-full w-1 lg:flex justify-center z-1">
                    <img className="absolute h-full w-[180px]" src="/newassets/images/bbvs.svg" alt="" />
                </div>
                <WaitingCard account={account} owner={battleInfo.owner} fighter={fighter} battleInfo={battleInfo} channel={channel} cardtype={WaitingType.FIGHTER} joiner={joiner as Address[]} />
            </div>
            {
                myAllNFTs.length > 0 && (isAddressEqual(battleInfo.fighter, zeroAddress) || isAddressEqual(account, battleInfo.owner))
                && (
                    battleInfo.betamount > allowance[2] || !isApproved ?
                        <div className="flex flex-col mb-20 gap-5">
                            <button
                                className={`flex gap-2 justify-center items-center p-5 bg-yellow-500`}
                                disabled={loading}
                                onClick={handleClick}
                            >
                                {loading && <div className="font-poppins flex items-center justify-center">
                                    <AiOutlineLoading3Quarters className="text-2xl font-bold animate-spin" />
                                </div>}
                                <div>
                                    APPROVE TO PICK NFT
                                </div>
                            </button>
                        </div>
                        :
                        <div className="flex flex-col w-full mb-20 gap-5">
                            <div className="bg-[#00000030] flex p-10 gap-2 overflow-x-auto w-full select-none">
                                {myAllNFTs.sort((a, b) => b.rare - a.rare).map((value, index) => (
                                    <div
                                        className={`block cursor-pointer justify-center bg-[#00000033] rounded-[8px] border hover:border-white flex-shrink-0 ${cardSelecting.findIndex((val) => val.tokenid === value.tokenid) >= 0 ? "border-yellow-400" : "border-[#00000033]"}`}
                                        onClick={() => {
                                            if (cardSelecting.length < (battleInfo.mode === 1 ? 5 : 3)) {
                                                setCardSelecting((precValue) => [...precValue, value])
                                            }
                                        }}
                                    >
                                        <img
                                            className="mt-[12px]"
                                            src={value.image}
                                            alt={`Fighter ${value.tokenid}`}
                                            width={150}
                                        />
                                        <div
                                            className="flex justify-around gap-16 mt-5 text-2xl bg-[#00000035] rounded-b-[8px] py-[12px]"
                                        >
                                            <div>#{value.tokenid}</div>
                                            {/* <div className="capitalize">{value.class}</div> */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-center items-center gap-5">
                                <button
                                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white px-10 rounded text-[20px] leading-[40px] flex justify-center items-center h-[60px]"
                                    onClick={() => {
                                        if (cardSelecting.length === (battleInfo.mode === 1 ? 5 : 3)) {
                                            channel.track({
                                                nft: cardSelecting
                                            })
                                        } else {
                                            toast("Select nft not enough")
                                        }

                                    }}
                                >
                                    <div>SELECT</div>
                                </button>
                                <button
                                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-white px-10 rounded text-[20px] leading-[40px] flex justify-center items-center h-[60px]"
                                    disabled={cardSelecting.length === 0}
                                    onClick={() => {
                                        setCardSelecting([])
                                        channel.track({})
                                    }}
                                >
                                    <div>CLEAR</div>
                                </button>
                            </div>
                        </div>
                )
            }
        </div>
    )
}

const WaitingCard = ({
    channel, account, owner, fighter, battleInfo, cardtype, joiner
}: {
    channel: RealtimeChannel
    account: Address
    owner: Address
    fighter: Address
    battleInfo: {
        battleid: `0x${string}`;
        owner: `0x${string}`;
        fighter: `0x${string}`;
        winner: `0x${string}`;
        betamount: bigint;
        mode: number;
        status: number;
        createat: bigint;
    }
    cardtype: WaitingType
    joiner: Address[]
}) => {
    const [loading, setLoading] = useState<WaitingType | null>(null)
    const [cards, setCards] = useState<NFTData[]>(Array(battleInfo.mode === 1 ? 5 : 3).fill(DefaultData))
    const currentAddress = cardtype === WaitingType.OWNER ? owner : fighter
    const { isApproved, approve } = useApproveForBattle(battleInfo.battleid, currentAddress)
    const isAvailable = (cardtype === WaitingType.OWNER && isAddressEqual(account, currentAddress)) || (cardtype === WaitingType.FIGHTER && isAddressEqual(account, currentAddress))
    const allowance = useTokenOnBattle(currentAddress, battleInfo.battleid)
    const { writeContractAsync } = useWriteContract()
    const publicClient = usePublicClient()

    const handleClick = async () => {
        if (isAddressEqual(owner, account)) {
            setLoading(WaitingType.OWNER)
        } else {
            setLoading(WaitingType.FIGHTER)
        }

        try {
            if (typeof publicClient === "undefined") {
                throw {
                    shortMessage: "Unknown error"
                }
            }
            if (isAddressEqual(battleInfo.fighter, zeroAddress)) {
                toast("Start Locking")
                if (battleInfo.betamount > allowance[2]) {
                    const hash_approve = await writeContractAsync({
                        abi: erc20Abi,
                        address: ADDRESS[mainChain.id].Token,
                        functionName: "approve",
                        args: [
                            battleInfo.battleid,
                            maxUint256
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
                }

                const hash_create = await writeContractAsync({
                    abi: ABI_BATTLE_DETAIL,
                    address: battleInfo.battleid,
                    functionName: "joinBattle",
                    args: [
                        cards.map(val => BigInt(val.tokenid))
                    ],
                })

                const result_create = await publicClient.waitForTransactionReceipt({
                    confirmations: 2,
                    hash: hash_create
                })
                if (result_create.status === "success") {
                    toast("Joint Battle success")
                } else {
                    toast("Lock failed")
                }
            } else {
                const hash_create = await writeContractAsync({
                    abi: ABI_BATTLE_DETAIL,
                    address: battleInfo.battleid,
                    functionName: "joinBattle",
                    args: [
                        cards.map(val => BigInt(val.tokenid))
                    ],
                })

                const result_create = await publicClient.waitForTransactionReceipt({
                    confirmations: 2,
                    hash: hash_create
                })
                if (result_create.status === "success") {
                    toast("Battle Started")
                } else {
                    toast("Battle start failed")
                }
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
        setLoading(null)
    }

    useEffect(() => {
        if (channel) {
            channel.on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                Object.keys(state).forEach(element => {
                    // console.log(cardtype, element, currentAddress, isAddressEqual(element as Address, currentAddress))
                    if (isAddressEqual(element as Address, currentAddress)) {
                        const realstate = state[currentAddress].find(val => "nft" in val)
                        if (realstate && "nft" in realstate) {
                            setCards(realstate["nft"] as NFTData[])
                            return
                        } else {
                            // setCards(Array(battleInfo.mode === 1 ? 5 : 3).fill(DefaultData))
                        }
                    }
                });

            })
        }
    }, [joiner])

    const cardonBattle = useCardOnBattle(battleInfo.battleid, currentAddress)

    // console.log("cardonBattle", cardonBattle)

    return (
        <div className={`flex flex-col justify-between bg-[#00000030] border ${isAddressEqual(account, currentAddress) ? "border-white" : "border-transparent"}`}>
            <div className="flex flex-col justify-between items-center">
                <div className="text-center flex gap-2 font-genotics text-4xl m-2 truncate">
                    <div className="">
                        {
                            cardtype === WaitingType.OWNER
                                ?
                                joiner.includes(owner) ? `${owner.slice(0, 4)}...${owner.slice(owner.length - 4, owner.length)}` : "???"
                                :
                                joiner.includes(fighter) ? `${fighter.slice(0, 4)}...${fighter.slice(fighter.length - 4, fighter.length)}` : "???"
                        }
                    </div>
                    {isAddressEqual(account, currentAddress) && <div>(you)</div>}
                </div>
                <div className="flex flex-wrap lg:max-w-xl justify-center items-center p-10">
                    {
                        (cardonBattle.length > 0 ? cardonBattle : cards).map((val, index) => (
                            <div key={`team1-${index}`} className={`w-full md:w-1/3 h-[200px] p-2 ${isAvailable ? "hover:cursor-pointer" : ""}`}>
                                <img src={val.image} alt="" />
                            </div>
                        ))
                    }
                </div>
            </div>
            {
                cardtype === WaitingType.FIGHTER ?
                    <button
                        className={`
                            flex gap-2 justify-center items-center w-[100%] pt-[15px] pb-[15px] 
                            ${isApproved ? (isAddressEqual(battleInfo.fighter, zeroAddress) ? "bg-blue-500" : "bg-green-500") : "bg-yellow-500"}
                        `}
                        disabled={!isAvailable}
                        onClick={isApproved ? handleClick : console.log}
                    >
                        {loading === WaitingType.FIGHTER && <div className="font-poppins flex items-center justify-center">
                            <AiOutlineLoading3Quarters className="text-2xl font-bold animate-spin" />
                        </div>}
                        <div>
                            {
                                isApproved ?
                                    isAddressEqual(battleInfo.fighter, zeroAddress) ? "LOCK" : "READY"
                                    :
                                    "APPROVE FOR USING NFT"
                            }
                        </div>
                    </button>
                    :
                    <button
                        className={`flex gap-2 justify-center items-center w-[100%] pt-[15px] pb-[15px] ${isApproved ? "bg-blue-500" : "bg-yellow-500"}`}
                        disabled={isApproved ? isAddressEqual(battleInfo.fighter, zeroAddress) : !isAvailable}
                        onClick={isApproved ? handleClick : approve}
                    >
                        {loading === WaitingType.OWNER && <div className="font-poppins flex items-center justify-center">
                            <AiOutlineLoading3Quarters className="text-2xl font-bold animate-spin" />
                        </div>}
                        <div>
                            {
                                isApproved ?
                                    isAddressEqual(battleInfo.fighter, zeroAddress) ? "WAIT FOR LOCKING" : "START"
                                    :
                                    "APPROVE FOR USING NFT"
                            }
                        </div>
                    </button>
            }
        </div>
    )
}

export default function WaitingRoom() {
    const router = useRouter()
    const { battleid } = router.query
    const session = useSession()
    const [channel, setChannel] = useState<RealtimeChannel>()

    const battleInfo = useBattleInfo(battleid as Address)

    useEffect(() => {
        if (battleid && session.data && battleInfo) {
            if (battleInfo.status === 1) {
                router.push(`/battle/${battleInfo.battleid}`)
            } else {
                setChannel(supabase.channel(battleid as string, {
                    config: {
                        presence: {
                            key: session.data.address
                        }
                    }
                }))
            }
        }
        return () => {
            supabase.removeAllChannels()
        }
    }, [battleid, session, battleInfo])


    if (battleInfo && channel && session.data) {
        return (
            <WaitingRoomCore account={session.data.address as Address} battleInfo={battleInfo} channel={channel} />
        )
    } else {
        return (
            <div className="w-full h-full relative bg-transparent flex flex-col justify-center items-center min-h-[calc(100vh-80px)]" id="home">
                <div className="font-poppins flex items-center justify-center">
                    <AiOutlineLoading3Quarters className="text-5xl font-bold animate-spin" />
                </div>
            </div>
        )
    }
}
