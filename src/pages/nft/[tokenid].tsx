import { useTokenId } from "@/lib/useNFT";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function NFTStat() {
    const router = useRouter()
    const { tokenid } = router.query

    const tokeninfo = useTokenId(Number(tokenid as string))

    if (tokeninfo.tokenid >= 0) {
        return (
            <section className="bg-[#0000002b] h-max-[calc(100vh-200px)] overflow-y-scroll">
                <div className="p-10">
                    <div className="grid lg:grid-cols-2 gap-3">
                        <div className="">
                            <div className="left-stats">
                                <h2>NFT OVERVIEW</h2>
                                <p>Check the stats of your NFT and assign items to them</p>
                                

                                <h2>Stats</h2>
                                <div className="text-3xl py-3">Token ID: #{tokeninfo.tokenid}</div>
                                <div className="text-3xl py-3">Rare: {tokeninfo.rare.toString() === "2" ? "Rare" : tokeninfo.rare.toString() === "3" ? "Ultra Rare" : tokeninfo.rare.toString() === "4" ? "Legendary" : "Common"}</div>

                                <div className="flex flex-wrap mt-4" id="stats">
                                    <div className="w-full md:w-1/2 pr-10">
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                hp: <span id="hpValue">{tokeninfo.hp.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.hp)) / 1000 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                strength: <span id="hpValue">{tokeninfo.strength.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.strength)) / 100 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                speed: <span id="hpValue">{tokeninfo.speed.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.speed)) / 100 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full md:w-1/2 pr-10">
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                mana: <span id="hpValue">{tokeninfo.mana.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.mana)) / 1000 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                armor: <span id="hpValue">{tokeninfo.armor.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.armor)) / 100 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="mb-8">
                                            <div className="uppercase text-2xl">
                                                avoid: <span id="hpValue">{tokeninfo.avoid.toString()}</span>
                                            </div>
                                            <div
                                                id="hpProgressBar"
                                                className="w-full bg-gray-700 mt-2 h-6"
                                            >
                                                <div
                                                    id="hpProgress"
                                                    className="h-full text-right pr-1 leading-3 text-white rounded-none bg-white"
                                                    style={{
                                                        width: `${Math.floor(Number(tokeninfo.avoid)) / 100 * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center items-center px-20">
                            <div className="flex justify-center items-center">
                                <div className="flex flex-col justify-center gap-4">
                                    <img
                                        src="/newassets/images/cross.png"
                                        className="w-[80px]"
                                        alt="Bild 1"
                                    />
                                    <img
                                        src="/newassets/images/cross.png"
                                        className="w-[80px]"
                                        alt="Bild 1"
                                    />
                                    <img
                                        src="/newassets/images/cross.png"
                                        className="w-[80px]"
                                        alt="Bild 1"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-center items-center">
                                <img
                                    src={tokeninfo.image}
                                    className="w-[500px]"
                                    alt="Bild 4"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center m-10">
                        <Link
                            href={"/nft"}
                            className="w-[100px] flex justify-center items-center bg-orange-500 text-white font-genotics text-4xl py-2 px-4 rounded-xl no-underline leading-none"
                        >
                            Back
                        </Link>
                    </div>
                </div>
            </section>
        );
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