"use client"
import React, { useCallback } from 'react'
import { WalletButton } from './AppWalletProvider'
import { useProgram } from './setup';
import * as anchor from "@coral-xyz/anchor";

import { useWallet } from '@solana/wallet-adapter-react';
interface NoteEntry {
    publicKey: anchor.web3.PublicKey;
    account: {
      title: string;
      message: string;
    }; 
  }
const NotesDapp = () => {
    const { program } = useProgram();
    const { publicKey } = useWallet();
    const [notes,setNotes] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [updatedMessage, setUpdatedMessage] = React.useState("");
    
    const fetchNotes = useCallback(async () => {
        if (!program || !publicKey) {
          console.error("Program or publicKey not available");
          return;
        }
        
        try {
          const fetchedNotes = await program.account.noteEntry.all();
          setNotes(fetchedNotes);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching entries:", error);
          setLoading(false);
        }
      }, [program, publicKey]);
      const createNoteEntry = async () => {
        if (!publicKey) {
          console.error("Wallet not connected");
          return;
        }
    
        try {
    
          if (!program) {
            console.error("Program not available");
            return;
          }
      
          const [NotePDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(title), publicKey.toBuffer()],
            program.programId
          );
    
          const tx = await program.methods
            .createNoteEntry(title, message)
            .accounts({
              noteEntry: NotePDA,
              payer: publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();
          
          console.log("Transaction Signature:", tx);
          setTitle("");
          setMessage("");
          fetchNotes(); // Refresh the list after creation
        } catch (error) {
          console.error("Transaction failed:", error);
        }
      };
      const updateNoteEntry = async (entry: NoteEntry) => {
        if (!publicKey) {
          console.error("Wallet not connected");
          return;
        }
        
        try {
          const tx = await program?.methods
            .updateNoteEntry(entry.account.title, updatedMessage)
            .accounts({ 
              owner: publicKey, 
              noteEntry: entry.publicKey 
            })
            .rpc();
    
          console.log("Transaction Signature:", tx);
          setUpdatedMessage("");
          fetchNotes(); // Refresh the list after update
        } catch (error) {
          console.error("Update failed:", error);
        }
      };
    
      const deleteEntry = async (entry:NoteEntry) => {
        if (!publicKey) return;
        
        try {
          const title = entry.account.title;
    
          if (!program) {
            console.error("Program not available");
            return;
          }
    
          const [notePDA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from(title), publicKey.toBuffer()],
            program.programId
          );
          
          // Call the delete method
          const tx = await program.methods
            .deleteNoteEntry(title)
            .accounts({
              noteEntry: notePDA,
              owner: publicKey,
              systemProgram: anchor.web3.SystemProgram.programId
            })
            .rpc();
            
          console.log("Delete Transaction Signature:", tx);
          
          
          await fetchNotes(); // Refresh after deletion
        } catch (error) {
          console.error("Delete failed:", error);
        }
      };
    
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
    <WalletButton />
  
    <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold">Create New Note</h2>
      <input
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={createNoteEntry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Create Note
      </button>
    </div>
  
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Notes</h2>
      {loading ? (
        <p>Loading notes...</p>
      ) : (
        notes.map((entry, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-lg p-4 shadow-md space-y-2"
          >
            <h3 className="text-xl font-semibold">{entry.account.title}</h3>
            <p className="text-gray-700">{entry.account.message}</p>
            <input
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
              placeholder="New Message"
              value={updatedMessage}
              onChange={(e) => setUpdatedMessage(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => updateNoteEntry(entry)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Update
              </button>
              <button
                onClick={() => deleteEntry(entry)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
  
  )
}

export default NotesDapp