import * as anchor from "@coral-xyz/anchor"
import { BN, IdlTypes, Program } from "@coral-xyz/anchor"
import {
	ASSOCIATED_TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	createCloseAccountInstruction,
	createSyncNativeInstruction,
	getAccount,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
	NATIVE_MINT,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import {
	Connection,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
} from "@solana/web3.js"

import { Solamon } from "../target/types/solamon"

export type SolamonPrototype = IdlTypes<Solamon>["solamonPrototype"]
export type Element = IdlTypes<Solamon>["element"]
export type BattleStatus = IdlTypes<Solamon>["battleStatus"]
export type CardData = IdlTypes<Solamon>["solamon"]
export type BattleAccount = IdlTypes<Solamon>["battleAccount"]

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
		{
			limit: 1,
		}
	)
	const battleLogs = await connection.getParsedTransaction(
		signature[0].signature,
		{
			commitment: "confirmed",
		}
	)

	return battleLogs?.meta?.logMessages
}

export async function isToken2022Mint(
	connection: Connection,
	mint: PublicKey
): Promise<boolean> {
	const accountInfo = await connection.getAccountInfo(mint)
	if (accountInfo?.owner.toString() == TOKEN_2022_PROGRAM_ID.toString()) {
		return true
	}
	return false
}

export async function getOrCreateTokenAccountTx(
	connection: Connection,
	mint: PublicKey,
	payer: PublicKey,
	owner: PublicKey
): Promise<{
	tokenAccount: PublicKey
	tx: Transaction | null
	tokenProgram: PublicKey
}> {
	const programId = (await isToken2022Mint(connection, mint))
		? TOKEN_2022_PROGRAM_ID
		: TOKEN_PROGRAM_ID
	const tokenAccount = await getAssociatedTokenAddress(
		mint,
		owner,
		true,
		programId
	)
	try {
		await getAccount(connection, tokenAccount, "confirmed", programId)
		return { tokenAccount: tokenAccount, tx: null, tokenProgram: programId }
	} catch (error) {
		const transaction = new Transaction()
		transaction.add(
			createAssociatedTokenAccountInstruction(
				payer,
				tokenAccount,
				owner,
				mint,
				programId,
				ASSOCIATED_TOKEN_PROGRAM_ID
			)
		)
		return {
			tokenAccount: tokenAccount,
			tx: transaction,
			tokenProgram: programId,
		}
	}
}

export async function getOrCreateNativeMintATA(
	connection: Connection,
	payer: PublicKey,
	owner: PublicKey
): Promise<{ tokenAccount: PublicKey; tx: Transaction | null }> {
	const { tokenAccount, tx } = await getOrCreateTokenAccountTx(
		connection,
		new PublicKey(NATIVE_MINT),
		payer,
		owner
	)
	return { tokenAccount, tx }
}

export function wrapSOLInstruction(
	recipient: PublicKey,
	amount: number
): TransactionInstruction[] {
	const ixs: TransactionInstruction[] = []
	const ata = getAssociatedTokenAddressSync(NATIVE_MINT, recipient)
	ixs.push(
		SystemProgram.transfer({
			fromPubkey: recipient,
			toPubkey: ata,
			lamports: amount,
		}),
		createSyncNativeInstruction(ata)
	)
	return ixs
}

export function unwrapSolIx(
	acc: PublicKey,
	destination: PublicKey,
	authority: PublicKey
): TransactionInstruction {
	return createCloseAccountInstruction(acc, destination, authority)
}

export async function spawnSolamonsTx(
	connection: Connection,
	program: Program<Solamon>,
	player: PublicKey,
	numberToSpawn: number
) {
	const spawnSolamonsTx = new Transaction()
	const feeAccount = (await getConfigAccount(program)).feeAccount

	const { tx: feeTokenCreateATATx } = await getOrCreateNativeMintATA(
		connection,
		player,
		feeAccount
	)

	if (feeTokenCreateATATx) {
		spawnSolamonsTx.add(feeTokenCreateATATx)
	}

	const spawnSolamons = await program.methods
		.spawnSolamons(numberToSpawn)
		.accounts({
			player: player,
			feeAccount: feeAccount,
		})
		.transaction()

	spawnSolamonsTx.add(spawnSolamons)

	return spawnSolamonsTx
}

export async function showSpawnResult(
	connection: Connection,
	txSig: string
): Promise<CardData[]> {
	const tx = await connection.getTransaction(txSig, {
		commitment: "confirmed",
	})
	console.log("Spawn result")
	const logs = (tx?.meta?.logMessages ?? [])
		.filter((log) => log.includes("Spawned"))
		.map((log) => {
			const trimmedLog = log.slice(29)
			return parseSolamonLog(trimmedLog)
		})

	return logs
}

export function stringToElement(elementStr: string): Element {
	switch (elementStr.toLowerCase()) {
		case "fire":
			return { fire: {} }
		case "wood":
			return { wood: {} }
		case "earth":
			return { earth: {} }
		case "water":
			return { water: {} }
		case "metal":
			return { metal: {} }
		default:
			throw new Error(`Unknown element: ${elementStr}`)
	}
}

export function elementToString(element: Element): string {
	switch (JSON.stringify(element)) {
		case JSON.stringify({ fire: {} }):
			return "fire"
		case JSON.stringify({ wood: {} }):
			return "wood"
		case JSON.stringify({ earth: {} }):
			return "earth"
		case JSON.stringify({ water: {} }):
			return "water"
		case JSON.stringify({ metal: {} }):
			return "metal"
		default:
			throw new Error(`Unknown element: ${JSON.stringify(element)}`)
	}
}

export function battleStatusToString(battleStatus: BattleStatus): string {
	switch (JSON.stringify(battleStatus)) {
		case JSON.stringify({ pending: {} }):
			return "pending"
		case JSON.stringify({ canceled: {} }):
			return "canceled"
		case JSON.stringify({ player1Wins: {} }):
			return "player1Wins"
		case JSON.stringify({ player2Wins: {} }):
			return "player2Wins"
	}
}

export function parseSolamonLog(logString: string): CardData {
	// Handle the specific format from the logs
	// Convert from "{ id: 0, species: 3, element: Metal, attack: 3, health: 12, is_available: true }"
	// to a proper JavaScript object

	// Replace is_available with isAvailable to match our TypeScript conventions
	const normalizedString = logString.replace("is_available", "isAvailable")

	// Extract values using regex
	const idMatch = normalizedString.match(/id:\s*(\d+)/)
	const speciesMatch = normalizedString.match(/species:\s*(\d+)/)
	const elementMatch = normalizedString.match(/element:\s*(\w+)/)
	const attackMatch = normalizedString.match(/attack:\s*(\d+)/)
	const healthMatch = normalizedString.match(/health:\s*(\d+)/)
	const isAvailableMatch = normalizedString.match(
		/isAvailable:\s*(true|false)/
	)

	if (!elementMatch) {
		throw new Error(`Failed to parse element from log: ${logString}`)
	}

	// Map the string to the enum
	const element = stringToElement(elementMatch[1])

	if (
		!idMatch ||
		!speciesMatch ||
		!elementMatch ||
		!attackMatch ||
		!healthMatch ||
		!isAvailableMatch
	) {
		throw new Error(`Failed to parse Solamon log: ${logString}`)
	}

	return {
		id: parseInt(idMatch[1]),
		species: parseInt(speciesMatch[1]),
		element,
		attack: parseInt(attackMatch[1]),
		health: parseInt(healthMatch[1]),
		isAvailable: isAvailableMatch[1] === "true",
	}
}

export async function wrapSolAndOpenBattleTx(
	connection: Connection,
	program: Program<Solamon>,
	player: PublicKey,
	battleStake: number,
	solamonIds: number[]
) {
	const openBattleTx = new Transaction()

	const { tokenAccount, tx } = await getOrCreateNativeMintATA(
		connection,
		player,
		player
	)

	if (tx) {
		openBattleTx.add(tx)
	}

	const wrapSolIxs = wrapSOLInstruction(player, battleStake)
	openBattleTx.add(...wrapSolIxs)

	const openBattle = await program.methods
		.openBattle(solamonIds, new BN(battleStake))
		.accounts({
			player: player,
			playerTokenAccount: tokenAccount,
		})
		.transaction()

	openBattleTx.add(openBattle)

	return openBattleTx
}

export async function wrapSolAndJoinBattleTx(
	connection: Connection,
	program: Program<Solamon>,
	player: PublicKey,
	battleId: number,
	solamonIds: number[]
) {
	const joinBattleTx = new Transaction()

	const battleAccount = await getBattleAccount(program, battleId)

	const { tokenAccount: playerATA, tx: playerCreateATATx } =
		await getOrCreateNativeMintATA(connection, player, player)

	if (playerCreateATATx) {
		joinBattleTx.add(playerCreateATATx)
	}

	const wrapSolIxs = wrapSOLInstruction(
		player,
		battleAccount.battleStake.toNumber()
	)
	joinBattleTx.add(...wrapSolIxs)

	const joinBattle = await program.methods
		.joinBattle(solamonIds)
		.accountsPartial({
			player,
			configAccount: getConfigPDA(program),
			battleAccount: getBattleAccountPDA(program, battleId),
			userAccount: getUserAccountPDA(program, player),
			playerTokenAccount: playerATA,
		})
		.transaction()

	joinBattleTx.add(joinBattle)
	return joinBattleTx
}

export async function cancelBattleAndUnwrapSolTx(
	connection: Connection,
	program: Program<Solamon>,
	player: PublicKey,
	battleId: number
) {
	const cancelBattleTx = new Transaction()

	const { tokenAccount: playerATA, tx: playerCreateATATx } =
		await getOrCreateNativeMintATA(connection, player, player)

	if (playerCreateATATx) {
		cancelBattleTx.add(playerCreateATATx)
	}

	const cancelBattle = await program.methods
		.cancelBattle()
		.accountsPartial({
			player,
			battleAccount: getBattleAccountPDA(program, battleId),
			playerTokenAccount: playerATA,
		})
		.transaction()

	cancelBattleTx.add(cancelBattle)

	const unwrapSolIxs = unwrapSolIx(playerATA, player, player)
	cancelBattleTx.add(unwrapSolIxs)

	return cancelBattleTx
}

export async function claimBattleAndUnwrapSolTx(
	connection: Connection,
	program: Program<Solamon>,
	player: PublicKey,
	battleId: number
) {
	const claimBattleTx = new Transaction()

	const { tokenAccount: playerATA, tx: playerCreateATATx } =
		await getOrCreateNativeMintATA(connection, player, player)

	const configAccount = await getConfigAccount(program)
	const { tokenAccount: feeTokenAccount, tx: feeTokenCreateATATx } =
		await getOrCreateNativeMintATA(
			connection,
			player,
			configAccount.feeAccount
		)

	if (playerCreateATATx) {
		claimBattleTx.add(playerCreateATATx)
	}

	if (feeTokenCreateATATx) {
		claimBattleTx.add(feeTokenCreateATATx)
	}

	const claimBattle = await program.methods
		.claimBattle()
		.accountsPartial({
			player,
			battleAccount: getBattleAccountPDA(program, battleId),
			feeTokenAccount: feeTokenAccount,
			playerTokenAccount: playerATA,
		})
		.transaction()

	claimBattleTx.add(claimBattle)

	const unwrapSolIxs = unwrapSolIx(playerATA, player, player)
	claimBattleTx.add(unwrapSolIxs)

	return claimBattleTx
}
