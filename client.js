// client.js is used to introduce the reader to generating clients from IDLs.
// It is not expected users directly test with this example. For a more
// ergonomic example, see `tests/basic-0.js` in this workspace.

const anchor = require('@project-serum/anchor');
const { SystemProgram } = anchor.web3;

// Configure the local cluster.
const provider = anchor.Provider.local("https://api.devnet.solana.com");

// Configure the client to use the local cluster.
anchor.setProvider(provider);

async function main() {
  // #region main
  // Read the generated IDL.
  const idl = JSON.parse(require('fs').readFileSync('./target/idl/guessgame.json', 'utf8'));

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey('HKRKXMWXBTy92QrYbrxb36nBCAXF1D3sGuxruNGTaYkW');

  // Generate the program client from IDL.
  const program = new anchor.Program(idl, programId);

  // The Account to create.
  let game = anchor.web3.Keypair.generate();
  let player_o = anchor.web3.Keypair.generate();

  console.log("Initializing a Game!!");

  await program.rpc.initialize(9, 3, {
    accounts: {
      playerX: program.provider.wallet.publicKey,
      game: game.publicKey,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    },
    signers: [game],
    instructions: [await program.account.game.createInstruction(game)]
  });

  // Fetch the newly created account from the cluster.
  let myGame = await program.account.game.fetch(game.publicKey);

  // Check it's game was initialized.
  console.log("Game Created Successfully!!", myGame);

  console.log("=============Player0 Joining the Game!!=============");

  await program.rpc.playerJoin({
    accounts: {
      playerO: player_o.publicKey,
      game: game.publicKey,
    },
    signers: [player_o], 
  });

  myGame = await program.account.game.fetch(game.publicKey);

  // Check it's game was initialized.
  console.log("Player0 Joined the Game & Game Starts Now!!", myGame);

  const guessNumber = async() => {
    if(myGame.numberOfChances){
      let rNumber = Math.floor((Math.random() * 9) + 1);
      console.log(`=============Player0 Guessing a Number Attempt -> ${3-myGame.numberOfChances}!! Guess Number -> ${rNumber} !!=============`);
      await program.rpc.playerGuess(rNumber, {
        accounts: {
          player: player_o.publicKey,
          game: game.publicKey,
        },
        signers: [player_o]
      });
      checkGameStatus();
    }
  }

  const checkGameStatus = async() => {
    myGame = await program.account.game.fetch(game.publicKey);
    console.log("Game Status is:===>", myGame)
    if(myGame.numberOfChances == 0){
      console.log("Lost all the Attempts! So, Player-X WON the Game!!")
    }else{
      switch (myGame.gameState) {
        case 1: guessNumber();
                break;
        case 2: console.log("Player-X WON the Game!!");
                console.log("Game Over!!", myGame);
                break;
        case 3: console.log("Player-0 WON the Game!!");
                console.log("Game Over!!", myGame);
                break;
        default: console.log("Game Not Started Yet! or Something Went Wrong!!")
      }
    }
  }

  guessNumber();
  
  // Check it's game was initialized.
  console.log("Game Over!!", myGame);
}



console.log('Running client.');
main().then(() => console.log('Success'));
