use anchor_lang::prelude::*;
use borsh::{BorshSerialize, BorshDeserialize};

declare_id!("HKRKXMWXBTy92QrYbrxb36nBCAXF1D3sGuxruNGTaYkW");

#[program]
pub mod guessgame {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, number: u8, chances: u8) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        game.player_x = *ctx.accounts.player_x.key;
        game.number_to_guess = number;
        game.number_of_chances = chances;
        Ok(())
    }

    pub fn player_join(ctx: Context<Playerjoin>) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        game.player_o = *ctx.accounts.player_o.key;
        game.game_state = 1;
        Ok(())
    }

    #[access_control(Playerguess::chances(&ctx))]
    pub fn player_guess(ctx: Context<Playerguess>, player_guess: u8) -> ProgramResult {
        let game = &mut ctx.accounts.game;
        game.number_of_chances -= 1;
        game.status(player_guess);
        Ok(())
    }

    pub fn status(ctx: Context<Status>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Status<'info> {
    game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(signer)]
    player_x: AccountInfo<'info>,
    #[account(zero)]
    game: Account<'info, Game>,
}

/// Game State
/// 0 - Waiting
/// 1 - Active
/// 2 - XWon
/// 3 - OWon

#[derive(Accounts)]
pub struct Playerjoin<'info> {
    #[account(signer)]
    player_o: AccountInfo<'info>,
    #[account(mut, constraint = game.game_state == 0 && game.player_x != Pubkey::default())]
    game: Account<'info, Game>,
}

#[derive(Accounts)]
pub struct Playerguess<'info> {
    #[account(signer)]
    player: AccountInfo<'info>,
    #[account(mut)]
    game: Account<'info, Game>,
}

impl<'info> Playerguess<'info> {
    pub fn chances(ctx: &Context<Playerguess>) -> Result<()> {
        if ctx.accounts.game.game_state == 1 && ctx.accounts.game.number_of_chances > 0 {
            Ok(())
        }else {
            return Err(ErrorCode::Illegalmove.into());
        }
    }
}


#[account]
#[derive(Default)]
pub struct Game {
    player_x: Pubkey,
    player_o: Pubkey,
    game_state: u8,
    number_to_guess: u8,
    number_of_chances: u8
}

#[event]
pub struct GameStatus {
    player_x: Pubkey,
    player_o: Pubkey,
    game_state: u8,
    number_to_guess: u8,
    number_of_chances: u8
}

impl From<GameStatus> for Game {
    fn from(status: GameStatus) -> Self {
        Self {
            player_x: status.player_x,
            player_o: status.player_o,
            game_state: status.game_state,
            number_to_guess: status.number_to_guess,
            number_of_chances: status.number_of_chances
        }
    }
}

impl Game {
    pub fn status(self: &mut Game, player_guess: u8) {
        if self.number_to_guess == player_guess {
            self.game_state = 3;
        }else if(self.number_of_chances == 0){
            self.game_state = 2;
        }else{
            // NOthing!!
        }
    }
}

#[error]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("Wrong dashboard")]
    Wrongdashboard,
    #[msg("Wrong expected state")]
    Gamestate,
    #[msg("Dashboard already initialized")]
    Initialized,
    #[msg("Unexpected value")]
    UnexpectedValue,
    #[msg("Illegal move")]
    Illegalmove,
}