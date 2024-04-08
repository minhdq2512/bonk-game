import { ABI_BATTLE_FACTORY } from "@/config/abi";
import { ADDRESS } from "@/config/address";
import { mainChain } from "@/config/connector";
import { formatCurrency } from "@/config/utils";
import { WaitingBattle, WaitingBattles } from "@/lib/dbInterface";
import { useBattles } from "@/lib/useBattles";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";


export default function Fight() {
    const router = useRouter()
    const battles = useBattles()
    const { data: tokenDecimals } = useReadContract({
        abi: erc20Abi,
        address: ADDRESS[mainChain.id].Token,
        chainId: mainChain.id,
        functionName: "decimals",
    })


    useEffect(() => {
        // console.log("battles", battles)
    }, [battles])


    return (
        <section className="">
            <div className="grid grid-cols-12 gap-1">
                <div className="col-span-12 lg:col-span-3">
                    <div className="flex flex-row lg:flex-col h-full gap-1">
                        <Link
                            href="/fight/create"
                            className="w-full lg:h-1/3 bg-[#00000030] py-5 flex justify-center items-center lg:text-[28px] hover:bg-[#ff6101] cursor-pointer select-none"
                        >
                            CREATE FIGHT
                        </Link>
                        <Link
                            href="/fight/cpu"
                            className="w-full lg:h-1/3 bg-[#00000030] py-5 flex justify-center items-center lg:text-[28px] hover:bg-[#ff6101] cursor-pointer select-none">
                            PLAY VS CPU
                        </Link>
                        <div
                            className="w-full lg:h-1/3 bg-[#00000030] py-5 flex justify-center items-center lg:text-[28px] hover:bg-[#ff6101] cursor-pointer select-none"
                            onClick={() => {
                                toast("Coming soon")
                            }}
                        >
                            <div>TOURNAMENT</div>
                        </div>
                    </div>
                </div>
                <div className="col-span-12 lg:col-span-9 flex flex-col bg-[#00000030] h-[calc(100vh-200px)] py-3 pl-3 gap-2">
                    <div className="h-1/2 overflow-y-scroll">
                        <h1>Active Fights</h1>
                        <table className="table-fixed">
                            <thead>
                                <tr>
                                    <th className="uppercase text-base lg:text-[18px] font-[100] text-center">Creator</th>
                                    <th className="uppercase text-base lg:text-[18px] font-[100] text-center">Mode</th>
                                    <th className="uppercase text-base lg:text-[18px] font-[100] text-center">Stakes</th>
                                    <th className="uppercase text-base lg:text-[18px] font-[100] text-center pr-2">Create time</th>
                                    <th className="uppercase text-base lg:text-[18px] font-[100] text-center pr-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    battles.filter(val => val.status !== 2).sort((a,b) => Number(b.createat) - Number(a.createat)).map((value, index) => (
                                        <tr key={`battle-list-${index}`}>
                                            <td className="text-[14px] text-center py-5 truncate">{value.owner}</td>
                                            <td className="text-[14px] text-center">{value.mode === 0 ? "3v3" : "5v5"}</td>
                                            <td className="text-[14px] text-center truncate">{formatCurrency(formatUnits(value.betamount, tokenDecimals || 18))}</td>
                                            <td className="text-[14px] text-center pr-2">{new Date(Number(value.createat) * 1000).toLocaleString()}</td>
                                            <td className="text-[14px] text-center pr-2">
                                                <button
                                                    className="bg-orange-500 text-white p-4 rounded"
                                                    onClick={() => {
                                                        router.push(`/fight/waiting/${value.battleid}`)
                                                    }}
                                                >
                                                    JOIN
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className="h-1/2 overflow-y-scroll">
                        <h1>Current Fights</h1>
                        <table className="table-fixed">
                            <thead>
                                <tr className="px-10">
                                    <th className="uppercase text-[18px] font-[100] text-center">Creator</th>
                                    <th className="uppercase text-[18px] font-[100] text-center">Mode</th>
                                    <th className="uppercase text-[18px] font-[100] text-center">Stakes</th>
                                    <th className="uppercase text-[18px] font-[100] text-center pr-2">Create time</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {
                                    battles.filter(val => val.status === 2).sort((a,b) => Number(b.createat) - Number(a.createat)).map((value, index) => (
                                        <tr key={`battle-list-${index}`}>
                                            <td className="text-[14px] text-center py-5 truncate">{value.owner}</td>
                                            <td className="text-[14px] text-center">{value.mode === 0 ? "3v3" : "5v5"}</td>
                                            <td className="text-[14px] text-center">{formatUnits(value.betamount, tokenDecimals || 18)} </td>
                                            <td className="text-[14px] text-center pr-2">{new Date(Number(value.createat) * 1000).toISOString()}</td>

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    )
}