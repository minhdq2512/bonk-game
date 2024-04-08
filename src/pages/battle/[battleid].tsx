import { supabase } from "@/lib/supabaseClient"
import { SKILL_LIST, useBattleInfo, useCardOnBattle, useCardState, useCurrentSigned, useCurrentTurnId } from "@/lib/useBattles"
import { NFTData, useTokenId } from "@/lib/useNFT"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { Address, ContractFunctionExecutionError, TransactionExecutionError, isAddressEqual, zeroAddress } from "viem"
import { useSnapshot } from 'valtio'
import BattleStore from "@/lib/store/battleStore"
import { toast } from "react-toastify"
import { ERROR } from "@/lib/dbInterface"
import { usePublicClient, useWriteContract } from "wagmi"
import { ABI_BATTLE_DETAIL } from "@/config/abi"


export default function MainFight() {
    const router = useRouter()
    const { battleid } = router.query
    const session = useSession()
    const [channel, setChannel] = useState<RealtimeChannel>()

    const battleInfo = useBattleInfo(battleid as Address)

    useEffect(() => {
        if (battleid && session.data && battleInfo) {
            setChannel(supabase.channel(
                `${battleid as string}-battle`,
                {
                    config: {
                        presence: {
                            key: session.data.address
                        }
                    }
                }
            ))
        }
        return () => {
            supabase.removeAllChannels()
        }
    }, [battleid, session, battleInfo])

    if (battleInfo && channel && session.data) {
        return (
            <BattleContainer account={session.data.address as Address} battleInfo={battleInfo} channel={channel} />
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


const BattleContainer = ({
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
    const currentSigned = useCurrentSigned(battleInfo.battleid, battleInfo.owner, battleInfo.fighter)
    const canSign = isAddressEqual(account, battleInfo.owner) ?
        (currentSigned.turnid % 2 === 0 ? currentSigned.fighterSigned : true) : (currentSigned.turnid % 2 === 0 ? true : currentSigned.ownerSigned)

    return (
        <div className="flex flex-col justify-center items-center absolute w-full">
            <div className="px-4">
                {
                    (isAddressEqual(account, battleInfo.owner) || isAddressEqual(account, battleInfo.fighter)) && canSign && currentSigned.turnid >= 0 &&
                    (<div className="bg-red-600 p-5 fixed z-10 bottom-5 text-3xl uppercase select-none">
                        it's your turn. Please sign
                    </div>)
                }
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <BattleTeam team={SideType.OWNER} account={account} battleInfo={battleInfo} channel={channel} />
                    <FightSystem account={account} battleInfo={battleInfo} canSign={canSign} currentSigned={currentSigned} />
                    <BattleTeam team={SideType.FIGHTER} account={account} battleInfo={battleInfo} channel={channel} />
                </div>
            </div>
        </div>
    )
}


enum SideType {
    OWNER,
    FIGHTER
}

const BattleTeam = ({
    team, channel, account, battleInfo,
}: {
    team: SideType
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
    const sideAddress = team === SideType.OWNER ? battleInfo.owner : battleInfo.fighter
    const listNFT = useCardOnBattle(battleInfo.battleid, sideAddress)
    const battleStore = useSnapshot(BattleStore.state)

    return (
        <div>
            <div className="flex bg-black bg-opacity-30 backdrop-blur-lg bg-filter">
                <div className="w-full">
                    <div
                        className="font-genotics text-orange-500 text-6xl max-w-[200px] justify-center flex items-center m-auto gap-2"
                    >
                        <div>{sideAddress.slice(0, 4)}...{sideAddress.slice(sideAddress.length - 4, sideAddress.length)}</div>
                        {isAddressEqual(account, sideAddress) && <div>(you)</div>}
                    </div>

                    <div>
                        {
                            listNFT.map((val, index) => (<div
                                key={`${val.tokenid}-${index}`} className={`mb-7 select-none ${isAddressEqual(account, sideAddress) ? (battleStore.selecting.tokenid === val.tokenid ? "opacity-100 cursor-pointer" : (battleStore.currentState[val.tokenid] && battleStore.currentState[val.tokenid].hp > 0 ? "opacity-60 hover:opacity-100 cursor-pointer" : "opacity-50 cursor-not-allowed")) : ""}`}
                                onClick={() => {
                                    if (battleStore.currentState[val.tokenid] && battleStore.currentState[val.tokenid].hp > 0) {
                                        if (isAddressEqual(account, sideAddress)) {
                                            if (battleStore.selecting.tokenid === val.tokenid) {
                                                BattleStore.setTokenSelecting({
                                                    tokenid: -1,
                                                    image: "",
                                                    rare: -1,
                                                    classid: -1,
                                                    class: "",
                                                })
                                            } else {
                                                BattleStore.setTokenSelecting(val)
                                            }
                                        }
                                    }
                                }}
                            >
                                <CardStat team={team} account={account} battleInfo={battleInfo} channel={channel} nftdata={val} />
                            </div>))}
                    </div>
                    {
                        battleInfo.status === 2 && (
                            isAddressEqual(battleInfo.winner, sideAddress) ? <div className={`flex justify-center items-center p-5 leading-5 tracking-widest bg-green-500`}>
                                WIN
                            </div> : <div className={`flex justify-center items-center p-5 leading-5 tracking-widest bg-red-500`}>
                                LOSE
                            </div>
                        )
                    }
                </div>
            </div>
        </div >
    )
}

const CardStat = ({
    team, channel, account, battleInfo, nftdata
}: {
    team: SideType
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
    nftdata: NFTData
}) => {

    const tokenInfo = useTokenId(nftdata.tokenid)
    const currentState = useCardState(battleInfo.battleid, nftdata.tokenid)

    return (
        <div className="flex items-center">
            <div className={`w-36 relative ${team === SideType.OWNER ? "order-1" : "order-2"}`} id="">
                <img
                    src={tokenInfo.image}
                    className={
                        team === SideType.OWNER ? "-right-10 relative" : "right-10 relative"
                    }
                />
            </div>
            <div className={
                team === SideType.OWNER ?
                    "border border-solid order-2 border-r border-l-0 border-orange-500 rounded-r-lg rounded-l-none flex-1 h-24 py-1 px-6 mr-5" :
                    "border border-solid order-1 border-l border-r-0 border-orange-500 rounded-l-lg rounded-r-none flex-1 h-24 py-1 px-6 ml-5"
            }>
                <div className="flex items-center w-full mb-0 leading-4">
                    <div className={`w-1/2 font-genotics text-white text-2xl text-center truncate ${team === SideType.OWNER ? "order-1 justify-start" : "order-2 justify-end"}  `}>
                        {tokenInfo.class} #{tokenInfo.tokenid}
                    </div>
                    <div className={`w-1/2 flex font-genotics items-center text-xl text-gray-500 truncate ${team === SideType.OWNER ? "order-2 justify-end" : "order-1 justify-start"}  `}>
                        {tokenInfo.rare.toString() === "2" ? "Rare" : tokenInfo.rare.toString() === "3" ? "Ultra Rare" : tokenInfo.rare.toString() === "4" ? "Legendary" : "Common"}
                    </div>
                </div>

                <div className="leading-none ml-4 font-genotics text-lg text-shadow-sm justify-center flex flex-col gap-2">
                    <div className="w-full text-white flex items-center h-[18px] relative">
                        <div className="relative z-10 text-center w-full">{currentState.hp}/{tokenInfo.hp}</div>
                        <div
                            className="absolute h-full bg-red-500 z-0"
                            style={{
                                width: `${Math.floor(100 * currentState.hp / tokenInfo.hp)}%`
                            }}
                        ></div>
                    </div>
                    <div className="w-full text-white flex items-center h-[18px] relative">
                        <div className="relative z-10 text-center w-full">{currentState.mana}/{tokenInfo.mana}</div>
                        <div className="absolute h-full bg-blue-500 z-0"
                            style={{
                                width: `${Math.floor(100 * currentState.mana / tokenInfo.mana)}%`
                            }}></div>
                    </div>
                </div>
            </div>

        </div>

    )
}

const FightSystem = ({
    account, battleInfo, canSign, currentSigned
}: {
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
    canSign: boolean
    currentSigned: {
        turnid: number;
        ownerSigned: boolean;
        fighterSigned: boolean;
    }
}) => {
    const publicClient = usePublicClient()
    const [loading, setLoading] = useState<boolean>(false)
    const battleStore = useSnapshot(BattleStore.state)
    const [targeting, setTargeting] = useState<number>(-1)
    const { writeContractAsync } = useWriteContract()

    useEffect(() => {
        setTargeting(battleStore.skills[battleStore.selecting.tokenid] ? battleStore.skills[battleStore.selecting.tokenid].targetid : -1)
    }, [battleStore.selecting])

    const handleClick = async () => {
        setLoading(true)
        console.log("battleStore.skills", Object.values(battleStore.skills), Object.values(battleStore.skills).filter(val => isAddressEqual(account, val.owner) && val.tokenid > 0).map(val => {
            return {
                owner: val.owner,
                tokenid: BigInt(val.tokenid),
                targetid: val.skillid === 4 ? BigInt(val.tokenid) : BigInt(val.targetid),
                skillid: BigInt(val.skillid),
            }
        }))
        try {
            if (typeof publicClient === "undefined") {
                throw {
                    shortMessage: "Unknown error"
                }
            }

            const gasE = await publicClient.estimateContractGas({
                abi: ABI_BATTLE_DETAIL,
                address: battleInfo.battleid,
                functionName: "setTurn",
                args: [
                    Object.values(battleStore.skills).filter(val => isAddressEqual(account, val.owner) && val.tokenid > 0).map(val => {
                        return {
                            owner: val.owner,
                            tokenid: BigInt(val.tokenid),
                            targetid: val.skillid === 4 ? BigInt(val.tokenid) : BigInt(val.targetid),
                            skillid: BigInt(val.skillid),
                        }
                    })
                ],
                account
            })

            const hash_create = await writeContractAsync({
                abi: ABI_BATTLE_DETAIL,
                address: battleInfo.battleid,
                functionName: "setTurn",
                args: [
                    Object.values(battleStore.skills).filter(val => isAddressEqual(account, val.owner) && val.tokenid > 0).map(val => {
                        return {
                            owner: val.owner,
                            tokenid: BigInt(val.tokenid),
                            targetid: val.skillid === 4 ? BigInt(val.tokenid) : BigInt(val.targetid),
                            skillid: BigInt(val.skillid),
                        }
                    })
                ],
                gas: gasE * BigInt(120) / BigInt(100)
            })

            const result_create = await publicClient.waitForTransactionReceipt({
                confirmations: 5,
                hash: hash_create
            })
            if (result_create.status === "success") {
                toast("Init turn success")
            } else {
                toast("Init turn failed")
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

    const handleClaim = async () => {
        setLoading(true)
        try {
            if (typeof publicClient === "undefined") {
                throw {
                    shortMessage: "Unknown error"
                }
            }
            const hash_create = await writeContractAsync({
                abi: ABI_BATTLE_DETAIL,
                address: battleInfo.battleid,
                functionName: "claim",
            })

            const result_create = await publicClient.waitForTransactionReceipt({
                confirmations: 5,
                hash: hash_create
            })
            if (result_create.status === "success") {
                toast("Claim success")
            } else {
                toast("Claim failed")
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

    const handleQuit = async () => {
        setLoading(true)
        try {
            if (typeof publicClient === "undefined") {
                throw {
                    shortMessage: "Unknown error"
                }
            }
            const hash_create = await writeContractAsync({
                abi: ABI_BATTLE_DETAIL,
                address: battleInfo.battleid,
                functionName: "exitBattle",
            })

            const result_create = await publicClient.waitForTransactionReceipt({
                confirmations: 2,
                hash: hash_create
            })
            if (result_create.status === "success") {
                toast("Quit battle success")
            } else {
                toast("Quit battle failed")
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
        <div className="grid grid-cols-1 gap-5">
            <div className="bg-black bg-opacity-30 backdrop-blur-lg bg-filter p-8">
                <div>
                    <div className="font-genotics text-5xl">
                        TURN #{currentSigned.turnid}
                    </div>
                    <div className="font-genotics text-3xl">
                        Battle Control {battleStore.selecting.class} #{battleStore.selecting.tokenid}
                    </div>
                    <div className="gap-10 flex flex-col">
                        {
                            battleInfo.status !== 2 && (<div>
                                <select
                                    className="w-full border border-orange-500 bg-opacity-20 font-genotics text-3xl uppercase text-orange-500"
                                    value={targeting} onChange={(e) => {
                                        setTargeting(Number(e.target.value))
                                        // console.log("targeting", targeting, Number(e.target.value))
                                    }}
                                >
                                    {
                                        battleStore.cardsInfo[battleInfo.fighter] && battleStore.cardsInfo[battleInfo.fighter].map((value, index) => (
                                            <option key={value.tokenid} value={value.tokenid}>{isAddressEqual(account, battleInfo.fighter) && <div>(you)</div>} {value.class} #{value.tokenid}</option>
                                        ))
                                    }
                                    {
                                        battleStore.cardsInfo[battleInfo.owner] && battleStore.cardsInfo[battleInfo.owner].map((value, index) => (
                                            <option key={value.tokenid} value={value.tokenid}>{isAddressEqual(account, battleInfo.owner) && <div>(you)</div>} {value.class} #{value.tokenid}</option>
                                        ))
                                    }
                                    <option value={-1}>Choose Target</option>
                                </select>
                            </div>)
                        }

                        <div className="flex flex-wrap gap-2 justify-center">
                            {
                                SKILL_LIST.filter(val => val.class === 0 || val.class === (battleStore.selecting.classid <= 0 ? 1 : battleStore.selecting.classid)).map((val, index) => (
                                    <div
                                        key={`skill-${index}`}
                                        className={`w-[75px] flex flex-col justify-center items-center ${(val.effect.mana < 0 && battleStore.selecting.tokenid >= 0 && battleStore.currentState[battleStore.selecting.tokenid].mana < Math.abs(val.effect.mana)) || battleStore.selecting.tokenid < 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => {
                                            if (!(val.effect.mana <= 0 && battleStore.selecting.tokenid >= 0 && battleStore.currentState[battleStore.selecting.tokenid].mana < Math.abs(val.effect.mana))) {
                                                BattleStore.setSkill(battleStore.selecting.tokenid, {
                                                    owner: account,
                                                    tokenid: battleStore.selecting.tokenid,
                                                    targetid: -1,
                                                    skillid: val.id
                                                })
                                            }
                                        }}
                                    >
                                        <div>
                                            <img
                                                className={`border-2 border-solid shadow-sm transition duration-200 transform-origin-center ${battleStore.skills[battleStore.selecting.tokenid]?.skillid === val.id ? "border-orange-500" : "border-[transparent]"}`}
                                                src={val.img}
                                            />
                                        </div>
                                        <div className="text-white font-genotics text-12 uppercase inline-block mx-auto truncate w-full">
                                            {val.name}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        {
                            battleInfo.status !== 2 ? (<div className="flex gap-5">
                                <button
                                    className="bg-green-500 text-white border-none py-3 text-3xl inline-block cursor-pointer w-full h-full font-genotics uppercase disabled:cursor-not-allowed disabled:bg-gray-500"
                                    onClick={() => {
                                        if (targeting >= 0 && battleStore.currentState[targeting] && battleStore.currentState[targeting].hp > 0) {
                                            BattleStore.setSkill(battleStore.selecting.tokenid, {
                                                ...battleStore.skills[battleStore.selecting.tokenid],
                                                targetid: targeting
                                            })
                                            BattleStore.setTokenSelecting({
                                                tokenid: -1,
                                                image: "",
                                                rare: -1,
                                                classid: -1,
                                                class: "",
                                            })
                                        } else if (battleStore.skills[battleStore.selecting.tokenid] && battleStore.skills[battleStore.selecting.tokenid].skillid == 4) {
                                            BattleStore.setSkill(battleStore.selecting.tokenid, {
                                                ...battleStore.skills[battleStore.selecting.tokenid],
                                                targetid: 0
                                            })
                                            BattleStore.setTokenSelecting({
                                                tokenid: -1,
                                                image: "",
                                                rare: -1,
                                                classid: -1,
                                                class: "",
                                            })
                                        } else {
                                            toast("Please choose target")
                                        }
                                    }}
                                    disabled={loading || battleStore.selecting.tokenid < 0}
                                >
                                    {loading ? "Loading" : "SAVE SKILL"}
                                </button>
                                <button
                                    className="bg-orange-500 disabled:bg-gray-500 text-white border-none py-3 text-3xl inline-block cursor-pointer w-full h-full font-genotics uppercase disabled:cursor-not-allowed"
                                    onClick={handleClick}
                                    disabled={
                                        loading || (isAddressEqual(account, battleInfo.owner) ? currentSigned.ownerSigned : currentSigned.fighterSigned) || !canSign
                                    }
                                >
                                    {loading ? "Loading" : "END TURN"}
                                </button>
                            </div>
                            ) : (<div className="flex gap-5">
                                <button
                                    className="bg-blue-500 text-white border-none py-3 text-3xl inline-block cursor-pointer w-full h-full font-genotics uppercase disabled:cursor-not-allowed"
                                    onClick={handleClaim}
                                    disabled={loading}
                                >
                                    {loading ? "Loading" : "CLAIM"}
                                </button>
                            </div>
                            )
                        }
                    </div>
                </div>

            </div>

            {(isAddressEqual(account, battleInfo.owner) || isAddressEqual(account, battleInfo.fighter)) && <div>
                <button
                    className="bg-blue-500 text-white border-none py-3 text-3xl inline-block cursor-pointer w-full h-full font-genotics uppercase disabled:cursor-not-allowed"
                    onClick={handleQuit}
                    disabled={loading}
                >
                    {loading ? "Loading" : "QUIT GAME"}
                </button>
            </div>}

            <div className="bg-black bg-filterbg-black bg-opacity-30 backdrop-blur-lg bg-filter p-5 overflow-auto">
                <h3>ROUND LOG</h3>
                <div className="flex flex-col-reverse h-[calc(50vh-100px)] overflow-auto">
                    {
                        Array(0).fill(0).map((val, index) => (
                            <div key={index}>
                                <div id="roundnumber" className="mt-0 text-2xl mb-20">
                                    <h2>Round #{index}</h2>
                                </div>
                                <div className="attacklog">
                                    <div className="flex items-center mb-10">
                                        <img
                                            src="/newassets/images/abilities/bonk.png"
                                            className="w-24 mr-10 border border-solid border-orange-500"
                                        />
                                        <p>
                                            <b>Warrior P0</b> bonks on the dead body of{" "}
                                            <b>Blitz P0</b>.
                                        </p>
                                    </div>
                                    <div className="flex items-center mb-10">
                                        <p>
                                            <b>Warrior P0</b> bonks on the dead body of{" "}
                                            <b>Blitz P0</b>.
                                        </p>
                                        <img
                                            src="/newassets/images/abilities/bonk.png"
                                            className="w-24 mr-10 border border-solid border-orange-500"
                                        />
                                    </div>
                                    <div className="flex items-center mb-10">
                                        <img
                                            src="/newassets/images/abilities/bonk.png"
                                            className="w-24 mr-10 border border-solid border-orange-500"
                                        />
                                        <p>
                                            <b>Magician P0</b> bonks on the dead body of{" "}
                                            <b>Blitz P0</b>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

