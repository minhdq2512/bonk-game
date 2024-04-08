import { Address } from "viem"
import { bscTestnet } from "viem/chains"


interface POOL {
    [chainId: number]: {
        Token: Address
        StorageNFT: Address
        CARDNFT: Address
        PermanentNFT: Address
        ConsumableNFT: Address
        Packs: Address
        BattleFactory: Address
    }
}


export const ADDRESS: POOL = {
    [bscTestnet.id]: {
        Token: '0xea57226F5867a8dafc777A66ec076226aC59cC67',
        StorageNFT: '0x85698c80F0cc04775511201f13d75BE65279Dfd6',
        CARDNFT: '0xa6E2262d4C5DDABaE02f9F155d3DfE5bad16C99D',
        PermanentNFT: '0xE90Fc71D77C2ae9A0546fEDC1e40827E9E686Cf6',
        ConsumableNFT: '0xe16f9F8906031320b6E8025f5097f3eF670D6C6c',
        Packs: '0xaF5DDAC07E86321a327f7e7e7dba82791c79FaC5',
        BattleFactory: '0x3cDBE618090b497F19D865c7D7CCFfcB39aaD746'
    },
}