import { Address, OrNull } from '../types';
export interface WalletAddress extends Address {
    label: OrNull<string>;
}
export interface WalletData {
    chainsCount: number;
    masterNodeAddress: OrNull<WalletAddress>;
    randomAddresses: WalletAddress[];
}
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
