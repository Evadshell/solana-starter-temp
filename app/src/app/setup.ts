import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import idl from './solana_starter_temp.json';
import { useWallet } from '@solana/wallet-adapter-react';

const programID = new PublicKey(idl.address);
const network = 'https://api.devnet.solana.com';
const connection = new Connection(network, 'processed');

export function useProgram() {
    const wallet = useWallet();
    const provider = useMemo(() => {
        if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new AnchorProvider(connection, wallet as any, {});
    }, [wallet]);
    const program = useMemo(() => {
        if (!provider) return null;
        return new Program(idl as Idl, provider);
    }, [provider]);
    return { program, provider };
}
