declare module "wif" {
  interface PrivateKey {
    compressed: boolean;
    privateKey: Buffer;
    version: number;
  }

  export function decode(string: string, version: number): PrivateKey;
  export function decodeRaw(string: string, version: number): PrivateKey;
  export function encode(version: number, privateKey: Buffer, compressed: boolean): string;
  export function encodeRaw(version: number, privateKey: Buffer, compressed: boolean): string;
}
