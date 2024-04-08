import React, { useState } from "react";
import Link from "next/link";
import { useMyNFTs } from "@/lib/useNFT";
import { useSession } from "next-auth/react";
import { Address, zeroAddress } from "viem";

export default function Team() {
    const session = useSession()

    const mynfts = useMyNFTs(session.data?.address as Address || zeroAddress)


    return (
        <section className="bg-[#0000002b] h-[calc(100vh-200px)] overflow-y-scroll">
            <div className="p-10" >
                <div className="ml-12 ">
                    <h1 className="text-12xl ">YOUR NFT</h1>
                    <p className="break-words">
                        View NFT stats by clicking to the card.
                    </p>
                </div>
                <div className="flex flex-wrap mt-12 gap-10 justify-center ">
                    {mynfts.sort((a, b) => b.rare - a.rare).map((value, index) => (
                        <Link key={`list-nft-${index}`} href={`/nft/${value.tokenid}`} className="flex">
                            <div
                                className="m-auto cursor-pointer justify-center bg-[#00000033] rounded-[8px] border border-[#00000033] hover:border-white"
                            >
                                <img
                                    className="mt-[12px]"
                                    src={value.image}
                                    width={230}
                                    alt={`Fighter ${value.tokenid}`}
                                />
                                <div
                                    className="flex justify-around gap-16 mt-5 text-2xl bg-[#00000035] rounded-b-[8px] py-[12px]"
                                >
                                    <div>#{value.tokenid}</div>
                                    <div className="capitalize">{value.class}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
