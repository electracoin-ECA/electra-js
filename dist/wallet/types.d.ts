import { Address, OrNull } from '../types';
export interface WalletAddress extends Address {
    label: OrNull<string>;
}
export declare type WalletExchangeFormat = [2, number, string, string[]];
export interface WalletTransaction {
    amount: number;
    confimationsCount: number;
    date?: number;
    fromAddressHash?: string;
    hash: string;
    toAddressHash: string;
}
export interface WalletStakingInfo {
    networkWeight: number;
    nextRewardIn: number;
    staking: boolean;
    weight: number;
}
export declare enum WalletState {
    EMPTY = "EMPTY",
    READY = "READY",
}
export declare enum WalletLockState {
    LOCKED = "LOCKED",
    STAKING = "STAKING",
    UNLOCKED = "UNLOCKED",
}
