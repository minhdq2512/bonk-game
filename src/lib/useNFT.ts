import { ABI_BATTLE_DETAIL, ABI_BATTLE_FACTORY, ABI_CARDNFT, ABI_STORAGE } from "@/config/abi";
import { ADDRESS } from "@/config/address";
import { mainChain } from "@/config/connector";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { Address } from "viem";
import { useBlockNumber, usePublicClient, useReadContract, useReadContracts } from "wagmi";

export interface NFTData {
    tokenid: number
    image: string
    rare: number
    classid: number
    class: string
}

export interface NFTStat {
    hp: number
    mana: number
    strength: number
    speed: number
    avoid: number
    armor: number
}

export type NFTMetaData = NFTData & NFTStat

export const defaultNFTmetaData: NFTMetaData = {
    tokenid: -1,
    image: ``,
    rare: 0,
    classid: 0,
    class: "",
    hp: 0,
    mana: 0,
    strength: 0,
    speed: 0,
    avoid: 0,
    armor: 0,
}

export function useMyNFTs(account: Address) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const [myNft, setMyNft] = useState<NFTData[]>([])
    const [tokenIds, setTokenIds] = useState<bigint[]>([])

    const { data: nftlist, queryKey, refetch } = useReadContract({
        abi: ABI_CARDNFT,
        address: ADDRESS[mainChain.id].CARDNFT,
        scopeKey: `getAllTokenOfOwner-${account}`,
        functionName: "getAllTokenOfOwner",
        args: [account]
    })


    const result = useReadContracts({
        contracts: tokenIds.map(val => {
            return {
                abi: ABI_STORAGE,
                address: ADDRESS[mainChain.id].StorageNFT,
                functionName: "CardInfos",
                args: [val]
            }
        }),
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
    }, [blockNumber, account])

    useEffect(() => {
        refetch()
    }, [blockNumber, account])

    useEffect(() => {
        if (nftlist) {
            setTokenIds(nftlist as bigint[])
        }
    }, [nftlist])

    useEffect(() => {
        if (result.data) {
            fetchNFTData(result.data)
        }
    }, [result.data])

    return myNft
}


export function useTokenId(tokenid: number) {
    const [data, setData] = useState<NFTMetaData>(defaultNFTmetaData)

    const { data: nftdata } = useReadContract({
        abi: ABI_STORAGE,
        address: ADDRESS[mainChain.id].StorageNFT,
        scopeKey: `CardInfos-${tokenid}`,
        functionName: "CardInfos",
        args: [BigInt(tokenid)]
    })

    const { data: nftstat } = useReadContract({
        abi: ABI_STORAGE,
        address: ADDRESS[mainChain.id].StorageNFT,
        scopeKey: `getBaseStat-${tokenid}`,
        functionName: "getBaseStat",
        args: nftdata ? [nftdata[2], nftdata[3]] : [BigInt(0), BigInt(0)]
    })

    useEffect(() => {
        if (nftdata && nftstat) {
            setData({
                tokenid: Number(nftdata[0]),
                image: `https://bafybeigszjn34i7bell7haxhhuyvqbipzvmezcphzln6yxn33ha2wlobi4.ipfs.nftstorage.link/${nftdata[2].toString()}/${nftdata[3].toString()}/img${nftdata[1].toString()}.png`,
                rare: Number(nftdata[3]),
                classid: Number(nftdata[2]),
                class: Number(nftdata[2]) === 1 ? "warrior" : Number(nftdata[2]) === 2 ? "magician" : Number(nftdata[2]) === 3 ? "blitz" : Number(nftdata[2]) === 4 ? "tank" : "",
                hp: Number(nftstat.hp),
                mana: Number(nftstat.mana),
                strength: Number(nftstat.strength),
                speed: Number(nftstat.speed),
                avoid: Number(nftstat.avoid),
                armor: Number(nftstat.armor),
            })
        }
    }, [nftdata, nftstat])

    return data
}

