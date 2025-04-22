import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SolanaStarterTemp } from "../target/types/solana_starter_temp";
import { assert } from "chai";

describe("solana_starter_temp", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaStarterTemp as Program<SolanaStarterTemp>;
  const owner = provider.wallet;
  const title = "MyFirstNote";
  const message = "Hello from Solana!";
  const updatedMessage = "Updated note message";

  let noteEntryPDA: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    [noteEntryPDA, bump] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from(title), owner.publicKey.toBuffer()],
      program.programId
    );
  });

  it("Creates a new note entry", async () => {
    await program.methods
      .createNoteEntry(title, message)
      .accounts({
        // noteEntry: noteEntryPDA,
        owner: owner.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    const account = await program.account.noteEntryState.fetch(noteEntryPDA);
    assert.equal(account.title, title);
    assert.equal(account.message, message);
    assert.ok(account.owner.equals(owner.publicKey));
  });

  it("Updates the note entry", async () => {
    await program.methods
      .updateNoteEntry(title, updatedMessage)
      .accounts({
        // noteEntry: noteEntryPDA,
        owner: owner.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    const account = await program.account.noteEntryState.fetch(noteEntryPDA);
    assert.equal(account.message, updatedMessage);
  });

  it("Deletes the note entry", async () => {
    await program.methods
      .deleteNoteEntry(title)
      .accounts({
        // noteEntry: noteEntryPDA,
        owner: owner.publicKey,
        // systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([])
      .rpc();

    // Check that account is closed
    try {
      await program.account.noteEntryState.fetch(noteEntryPDA);
      assert.fail("Account still exists after deletion");
    } catch (e) {
      assert.include(e.message, "Account does not exist");
    }
  });
});
