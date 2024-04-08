import { proxy } from 'valtio'
import { Address, zeroAddress } from 'viem'
import { NFTData } from '../useNFT'

interface GlobalState {
    currentState: {
        [tokenid: number]: {
            battleid: Address,
            tokenid: number,
            hp: number,
            mana: number
        }
    },
    selecting: NFTData,
    skills: {
        [tokenid: number]: {
            owner: Address
            tokenid: number
            targetid: number
            skillid: number
        }
    },
    cardsInfo: {
        [account: Address]: NFTData[]
    },
    accountState: {
        [account: Address]: string
    }
}

const state = proxy<GlobalState>({
    currentState: {},
    selecting: {
        tokenid: -1,
        image: "",
        rare: -1,
        classid: -1,
        class: "",
    },
    skills: {},
    cardsInfo: {},
    accountState: {}
})

const BattleStore = {
    state,
    setCurrentState(value: {
        battleid: Address,
        tokenid: number,
        hp: number,
        mana: number
    }) {
        state.currentState[value.tokenid] = value
    },
    setTokenSelecting(value: NFTData) {
        state.selecting = value
        if (!(value.tokenid in state.skills)) {
            state.skills[value.tokenid] = {
                owner: zeroAddress,
                tokenid: value.tokenid,
                targetid: -1,
                skillid: -1
            }
        }
    },
    setSkill(tokenid: number, value: {
        owner: Address
        tokenid: number
        targetid: number
        skillid: number
    }) {
        state.skills[tokenid] = value
    },
    setCardsInfo(acctount: Address, value: NFTData[]) {
        state.cardsInfo[acctount] = value
    },
    setAccountState(acctount: Address, value: string) {
        state.accountState[acctount] = value
    },
    resetSkills() {
        state.skills = {}
    }
}

export default BattleStore
