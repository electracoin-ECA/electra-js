/// <reference types="node" />
import { Address, OrNull } from '../types';
export declare type PlatformBinary = {
    [P in NodeJS.Platform]?: string;
};
export interface WalletAddress extends Address {
    label: OrNull<string>;
}
export declare type WalletExchangeFormat = [2, number, string, string[]];
export interface WalletInfo {
    connectionsCount?: number;
    isHD: boolean;
    isStaking: boolean;
    isSynchonized?: boolean;
    localBlockchainHeight?: number;
    localStakingWeight?: number;
    networkBlockchainHeight: number;
    networkStakingWeight: number;
    nextStakingRewardIn: number;
}
export declare enum WalletLockState {
    LOCKED = "LOCKED",
    STAKING = "STAKING",
    UNLOCKED = "UNLOCKED",
}
export declare enum WalletState {
    EMPTY = "EMPTY",
    READY = "READY",
    STOPPED = "STOPPED",
}
export interface WalletTransaction {
    amount: number;
    confimationsCount: number;
    date: number;
    from?: string[];
    hash: string;
    to: string[];
    type: WalletTransactionType;
}
export declare enum WalletTransactionType {
    GENERATED = "GENERATED",
    RECEIVED = "RECEIVED",
    SENT = "SENT",
}
