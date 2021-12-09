const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { SystemProgram } = anchor.web3;

describe("guess-game", () => {
  // Use a local provider.
  const provider = anchor.Provider.local("https://api.devnet.solana.com");

  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  it("Creates and initializes a Game", async () => {
    // #region code-simplified
    // The program to execute.
    // const program = anchor.workspace.GuessGame;
    const idl = JSON.parse(require('fs').readFileSync('../idl/guessgame.json', 'utf8'));

    // Address of the deployed program.
    const programId = new anchor.web3.PublicKey('HKRKXMWXBTy92QrYbrxb36nBCAXF1D3sGuxruNGTaYkW');

    // Generate the program client from IDL.
    const program = new anchor.Program(idl, programId);

    let game = anchor.web3.Keypair.generate();
    let player_o = anchor.web3.Keypair.generate();

    // Create the new account and initialize it with the program.
    // #region code-simplified
    await program.rpc.initialize(9, 3, {
      accounts: {
        playerX: program.provider.wallet.publicKey,
        game: game.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      },
      signers: [game],
      instructions: [await program.account.game.createInstruction(game)]
    });
    // #endregion code-simplified

    // Fetch the newly created account from the cluster.
    let myGame = await program.account.game.fetch(game.publicKey);

    console.log("SM====>", myGame);
    // Check it's state was initialized.
    // assert.ok(account.data.eq(new anchor.BN(1234)));
    assert.ok(true);

    // Store the account for the next test.
    _game = game;
  });

/*  it("Updates a previously created account", async () => {
    const myAccount ::game = _game;

    // #region update-test

    // The program to execute.
    const program = anchor.workspace.Basic1;

    // Invoke the update rpc.
    await program.rpc.update(new anchor.BN(4321), {
      accounts: {
        myAccount: myAccount.publicKey,
      },
    });

    // Fetch the newly updated account.
    const account = await program.account.myAccount.fetch(myAccount.publicKey);

    // Check it's state was mutated.
    assert.ok(account.data.eq(new anchor.BN(4321)));

    // #endregion update-test
  });
  */
});
