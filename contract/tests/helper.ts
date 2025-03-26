import { BN, IdlTypes, Program } from "@coral-xyz/anchor"
import { Solamon } from "../target/types/solamon"
import * as anchor from "@coral-xyz/anchor"
import { Connection, PublicKey } from "@solana/web3.js"

export type SolamonPrototype = IdlTypes<Solamon>["solamonPrototype"]
export type Element = IdlTypes<Solamon>["element"]
export type BattleStatus = IdlTypes<Solamon>["battleStatus"]

export const getConfigPDA = (program: Program<Solamon>) => {
	const [configPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync(
		[Buffer.from("config_account")],
		program.programId
	)

	return configPDA
}

export const getConfigAccount = async (program: Program<Solamon>) => {
	const configPDA = await getConfigPDA(program)

	const configAccount = await program.account.configAccount.fetch(configPDA)

	return configAccount
}

export const getSolamonPrototypeAccountPDA = (program: Program<Solamon>) => {
	const [solamonPrototypeAccountPDA, _bump] =
		anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("solamon_prototype_account")],
			program.programId
		)

	return solamonPrototypeAccountPDA
}

export const getSolamonPrototypeAccount = async (program: Program<Solamon>) => {
	const solamonPrototypeAccountPDA = getSolamonPrototypeAccountPDA(program)

	const solamonPrototypeAccount =
		await program.account.solamonPrototypeAccount.fetch(
			solamonPrototypeAccountPDA
		)

	return solamonPrototypeAccount
}

export const getUserAccountPDA = (
	program: Program<Solamon>,
	user: PublicKey
) => {
	const [userAccountPDA, _bump] =
		anchor.web3.PublicKey.findProgramAddressSync(
			[Buffer.from("user_account"), user.toBuffer()],
			program.programId
		)

	return userAccountPDA
}

export const getUserAccount = async (
	program: Program<Solamon>,
	user: PublicKey
) => {
	const userAccountPDA = await getUserAccountPDA(program, user)

	const userAccount = await program.account.userAccount.fetch(userAccountPDA)

	return userAccount
}

export const getBattleAccountPDA = (
	program: Program<Solamon>,
	battleId: number
) => {
	const [battleAccountPDA, _bump] =
		anchor.web3.PublicKey.findProgramAddressSync(
			[
				Buffer.from("battle_account"),
				new BN(battleId).toArrayLike(Buffer, "le", 8),
			],
			program.programId
		)

	return battleAccountPDA
}

export const getBattleAccount = async (
	program: Program<Solamon>,
	battleId: number
) => {
	const battleAccountPDA = getBattleAccountPDA(program, battleId)
	const battleAccount = await program.account.battleAccount.fetch(
		battleAccountPDA
	)
	return battleAccount
}

export const getAllBattleAccounts = async (program: Program<Solamon>) => {
	const battleAccounts = await program.account.battleAccount.all()
	return battleAccounts
}

export const getBattleAccountsByUser = async (
	program: Program<Solamon>,
	user: PublicKey
) => {
	// Create promises for fetching battle accounts
	const player1BattleAccountsPromise = program.account.battleAccount.all([
		{
			memcmp: {
				offset: 17, // Adjust this offset based on your account structure
				bytes: user.toBase58(),
			},
		},
	])

	const player2BattleAccountsPromise = program.account.battleAccount.all([
		{
			memcmp: {
				offset: 49, // Adjust this offset based on your account structure
				bytes: user.toBase58(),
			},
		},
	])

	// Await both promises using Promise.all
	const [player1BattleAccounts, player2BattleAccounts] = await Promise.all([
		player1BattleAccountsPromise,
		player2BattleAccountsPromise,
	])

	return { player1BattleAccounts, player2BattleAccounts }
}

export const getBattleLogs = async (
	connection: Connection,
	battleAccountPDA: anchor.web3.PublicKey
) => {
	const signature = await connection.getSignaturesForAddress(
		battleAccountPDA,
		{ limit: 1 }
	)
	const battleLogs = await connection.getParsedTransaction(
		signature[0].signature,
		{
			commitment: "confirmed",
		}
	)

	return battleLogs.meta?.logMessages
}
