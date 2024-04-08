import { ABI_BATTLE_FACTORY } from "@/config/abi";
import { ADDRESS } from "@/config/address";
import { mainChain } from "@/config/connector";
import { formatCurrency, formatInputNumber } from "@/config/utils";
import { ERROR } from "@/lib/dbInterface";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { Address, ContractFunctionExecutionError, TransactionExecutionError, decodeEventLog, erc20Abi, formatUnits, maxUint256, parseUnits, zeroAddress } from "viem";
import { useAccount, usePublicClient, useReadContracts, useWriteContract } from "wagmi";



export default function CreateFight() {
    const publicClient = usePublicClient()
    const router = useRouter()
    const account = useAccount()
    const { writeContractAsync } = useWriteContract()
    const [mode, setMode] = useState<1 | 0>(1)
    const [betAmount, setBetAmount] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)

    // const chainid = useChainId()

    const tokenInfo = useReadContracts({
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
                    account.address || zeroAddress
                ]
            },
            {
                abi: erc20Abi,
                address: ADDRESS[mainChain.id].Token,
                chainId: mainChain.id,
                functionName: "allowance",
                args: [
                    account.address || zeroAddress,
                    ADDRESS[mainChain.id].BattleFactory
                ]
            },
        ]
    })


    const handleCreate = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true)
        if (publicClient && tokenInfo.data && tokenInfo.data.length >= 3) {
            try {
                if (parseUnits(betAmount, tokenInfo.data[0]) > tokenInfo.data[2]) {
                    const hash_approve = await writeContractAsync({
                        abi: erc20Abi,
                        address: ADDRESS[mainChain.id].Token,
                        functionName: "approve",
                        args: [
                            ADDRESS[mainChain.id].BattleFactory,
                            maxUint256
                        ],
                    })
                    const result_approve = await publicClient.waitForTransactionReceipt({
                        confirmations: 5,
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
                    abi: ABI_BATTLE_FACTORY,
                    address: ADDRESS[mainChain.id].BattleFactory,
                    functionName: "createBattle",
                    args: [
                        BigInt(mode),
                        BigInt(parseUnits(betAmount, tokenInfo.data[0]))
                    ],
                })

                const result_create = await publicClient.waitForTransactionReceipt({
                    confirmations: 5,
                    hash: hash_create
                })

                if (result_create.status === "success") {
                    toast("Create fight success")
                    result_create.logs.forEach(elm => {
                        try {
                            const decoded = decodeEventLog({
                                abi: [
                                    {
                                        "anonymous": false,
                                        "inputs": [
                                            {
                                                "indexed": false,
                                                "internalType": "address",
                                                "name": "battleid",
                                                "type": "address"
                                            },
                                            {
                                                "indexed": false,
                                                "internalType": "address",
                                                "name": "owner",
                                                "type": "address"
                                            }
                                        ],
                                        "name": "BattleCreate",
                                        "type": "event"
                                    }
                                ],
                                topics: elm.topics,
                                strict: false,
                                data: elm.data,
                            })
                            if (decoded.args.battleid) {
                                router.push(`/fight/waiting/${decoded.args.battleid}`)
                            }
                        } catch (error) {

                        }
                    })
                    setBetAmount("")
                    setMode(1)
                } else {
                    toast("Create fight failed")
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
        setLoading(false)

    }


    return (
        <div>
            <section className="bg-[#00000030] p-9">
                <div className="">
                    <div className="row ">
                        <div className="col-md-12 heading text-center">
                            <h2 className="text-6xl">CREATE FIGHT</h2>
                        </div>
                        <div className="col-md-14 flex justify-end">
                            <form method="POST"
                                className="mx-auto max-w-xl bg-[#00000030] backdrop-blur-[20px] rounded-lg p-1 md:p-10 md:pt-12"
                                onSubmit={handleCreate}
                            >
                                <div className="p-2">
                                    <div>
                                        <h3 className="text-4xl">MODE</h3>
                                    </div>
                                    <div className="container bullets flex flex-col select-none">
                                        {/* <ul className="flex items-center text-xl">
                                            <li className="mr-2">
                                                <input
                                                    type="radio"
                                                    id="bullet1"
                                                    name="mode"
                                                    className="bullet"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setMode(1)
                                                        }
                                                    }}
                                                    checked={mode === 1}
                                                    disabled={loading}
                                                />
                                                <label htmlFor="bullet1" className="ml-2">
                                                    5 VS 5
                                                </label>
                                            </li>
                                            <li>
                                                <input
                                                    type="radio"
                                                    id="bullet2"
                                                    name="mode"
                                                    className="bullet"
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setMode(0)
                                                        }
                                                    }}
                                                    checked={mode === 0}
                                                    disabled={loading}
                                                />
                                                <label htmlFor="bullet2" className="ml-2">
                                                    3 VS 3
                                                </label>
                                            </li>
                                        </ul> */}
                                        <div className="flex items-center gap-10">
                                            <div
                                                className={`px-5 py-2 text-2xl cursor-pointer ${mode === 1 ? "bg-orange-500" : "bg-[#000000a2]"}`}
                                                onClick={() => {
                                                    setMode(1)
                                                }}
                                            >
                                                5v5
                                            </div>
                                            <div
                                                className={`px-5 py-2 text-2xl cursor-pointer ${mode === 0 ? "bg-orange-500" : "bg-[#000000a2]"}`}
                                                onClick={() => {
                                                    setMode(0)
                                                }}
                                            >
                                                3v3
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 md:mt-8">
                                        <div className="flex justify-between items-center my-2">
                                            <div className="text-2xl">BET AMOUNT</div>
                                            <div className="flex items-center gap-2">
                                                <div>{tokenInfo.data && tokenInfo.data.length >= 2 ? formatCurrency(formatUnits(tokenInfo.data[1], tokenInfo.data[0])) : 0}</div>
                                                <img className="h-6 w-6" src="/newassets/images/bonklogo.png" />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <input
                                                placeholder="Enter $BABYBONK amount"
                                                className="border bg-[#00000030] backdrop-blur-[20px] p-2 rounded-lg w-full leading-[30px] pt-[5px] text-[20px]"
                                                value={betAmount} onChange={(e) => {
                                                    setBetAmount(formatInputNumber(e.target.value))
                                                }}
                                                required
                                                disabled={loading}
                                            />
                                            <img
                                                src="/assets/images/bonklogo.png"
                                                alt=""
                                                className="absolute bottom-0 left-2" // Align the image to the bottom left
                                                style={{ height: "30px" }} // Adjust the height of the image as needed
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 md:mt-8">
                                        <button
                                            type="submit"
                                            className="bg-orange-500 disabled:bg-gray-600 text-white py-2 rounded w-full text-[20px] leading-[40px] flex justify-center items-center h-[60px]"
                                            disabled={
                                                !(!loading && tokenInfo.data && tokenInfo.data.length >= 2 && tokenInfo.data[1] >= parseUnits(betAmount, tokenInfo.data[0]) && parseUnits(betAmount, tokenInfo.data[0]) >= parseUnits("0", 1))
                                            }
                                        >
                                            {
                                                loading ? <div><AiOutlineLoading3Quarters className="font-bold animate-spin" /></div> : <div>CREATE</div>
                                            }
                                        </button>
                                        <p className="text-sm mt-4">
                                            Please set your bet amount responsibly and double-check
                                            it. Make sure you’re active once you create a fight. If
                                            you’re AFK longer than 2 rounds, you will automatically
                                            lose the fight. BabyBonk won’t refund any lost tokens.
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
