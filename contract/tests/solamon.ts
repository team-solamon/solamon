import * as anchor from "@coral-xyz/anchor"
import { BN, Program } from "@coral-xyz/anchor"
import { Solamon } from "../target/types/solamon"
import { Connection, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js"
import { expect } from "chai"
import {
	getBattleAccount,
	getBattleAccountPDA,
	getAllBattleAccounts,
	getBattleAccountsByUser,
	getConfigAccount,
	getConfigPDA,
	getUserAccount,
	SolamonPrototype,
	getSolamonPrototypeAccount,
	getOrCreateNativeMintATA,
	wrapSolAndOpenBattleTx,
	wrapSolAndJoinBattleTx,
	cancelBattleAndUnwrapSolTx,
	claimBattleAndUnwrapSolTx,
	BattleStatus,
	showSpawnResult,
	spawnSolamonsTx,
	getAllUserAccounts,
} from "./helper"

describe("solamon", () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env())
	const program = anchor.workspace.solamon as Program<Solamon>
	const connection = new Connection("http://localhost:8899", "confirmed")
	const provider = anchor.AnchorProvider.env()
	const admin = anchor.web3.Keypair.generate()
	const player = anchor.web3.Keypair.generate()
	const player2 = anchor.web3.Keypair.generate()
	const player3 = anchor.web3.Keypair.generate()
	const battleStake = LAMPORTS_PER_SOL * 0.1

	console.log({
		player: player.publicKey.toBase58(),
		player2: player2.publicKey.toBase58(),
		player3: player3.publicKey.toBase58(),
		admin: admin.publicKey.toBase58(),
	})

	beforeEach(async () => {
		const txs = await Promise.all([
			connection.requestAirdrop(admin.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player2.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player3.publicKey, LAMPORTS_PER_SOL),
		])
		await Promise.all(txs.map((tx) => connection.confirmTransaction(tx)))
	})

	it("Is initialized", async () => {
		// Derive the PDA for the config account
		const spawnFee = LAMPORTS_PER_SOL * 0.01
		const feePercentageInBasisPoints = 100
		const tx = await program.methods
			.initialize(
				admin.publicKey,
				admin.publicKey,
				feePercentageInBasisPoints,
				new BN(spawnFee)
			)
			.accounts({
				signer: admin.publicKey,
			})
			.signers([admin])
			.rpc()

		console.log("Your transaction signature", tx)

		const configAccount = await getConfigAccount(program)

		expect(configAccount.feeAccount.toBase58()).to.equal(
			admin.publicKey.toBase58()
		)
		expect(configAccount.admin.toBase58()).to.equal(
			admin.publicKey.toBase58()
		)
		expect(configAccount.feePercentageInBasisPoints).to.equal(100)
	})

	it("Creates solamon prototype", async () => {
		const solamonPrototype: SolamonPrototype[] = [
			{
				imageUrl: "https://example.com/image.png",
				possibleElements: [{ fire: {} }, { water: {} }],
				elementProbabilityInBasisPoints: [8000, 2000],
				distributablePoints: 15,
			},
			{
				imageUrl: "https://example.com/image2.png",
				possibleElements: [{ wood: {} }, { earth: {} }],
				elementProbabilityInBasisPoints: [8000, 2000],
				distributablePoints: 15,
			},
			{
				imageUrl: "https://example.com/image3.png",
				possibleElements: [{ earth: {} }, { metal: {} }],
				elementProbabilityInBasisPoints: [8000, 2000],
				distributablePoints: 15,
			},
			{
				imageUrl: "https://example.com/image4.png",
				possibleElements: [{ metal: {} }, { water: {} }],
				elementProbabilityInBasisPoints: [8000, 2000],
				distributablePoints: 15,
			},
			{
				imageUrl: "https://example.com/image5.png",
				possibleElements: [{ wood: {} }, { fire: {} }],
				elementProbabilityInBasisPoints: [8000, 2000],
				distributablePoints: 15,
			},
		]

		const txSig = await program.methods
			.createSolamonPrototype(solamonPrototype)
			.accounts({
				admin: admin.publicKey,
			})
			.signers([admin])
			.rpc()

		await connection.confirmTransaction(txSig)

		const solamonPrototypeAccount = await getSolamonPrototypeAccount(
			program
		)
		expect(solamonPrototypeAccount.solamonPrototypes.length).to.equal(
			solamonPrototype.length
		)
	})

	it("Spawns solamons", async () => {
		// Spawn elements
		const solamonCount = 5

		const tx = await spawnSolamonsTx(
			connection,
			program,
			player.publicKey,
			solamonCount
		)

		const txSig = await connection.sendTransaction(tx, [player])

		await connection.confirmTransaction(txSig)

		await showSpawnResult(connection, txSig)

		// Fetch the user account to verify elements were added
		const userAccount = await getUserAccount(program, player.publicKey)
		expect(userAccount.solamons.length).to.equal(solamonCount)

		const solamonCount2 = 3

		await program.methods
			.spawnSolamons(solamonCount2)
			.accounts({
				player: player2.publicKey,
				feeAccount: (await getConfigAccount(program)).feeAccount,
			})
			.signers([player2])
			.rpc()

		const userAccount2 = await getUserAccount(program, player2.publicKey)
		expect(userAccount2.solamons.length).to.equal(solamonCount2)

		const solamonCount3 = 9

		await program.methods
			.spawnSolamons(solamonCount3)
			.accounts({
				player: player3.publicKey,
				feeAccount: (await getConfigAccount(program)).feeAccount,
			})
			.signers([player3])
			.rpc()

		const userAccount3 = await getUserAccount(program, player3.publicKey)
		expect(userAccount3.solamons.length).to.equal(solamonCount3)
	})

	it("Player 1 opens battle", async () => {
		// Fetch the user account to get solamons
		const userAccount = await getUserAccount(program, player.publicKey)

		// Get the first 3 solamon IDs
		const solamonIds = userAccount.solamons
			.map((solamon) => solamon.id)
			.slice(0, 3)

		const openBattleTx = await wrapSolAndOpenBattleTx(
			connection,
			program,
			player.publicKey,
			battleStake,
			solamonIds
		)

		const txSig = await connection.sendTransaction(openBattleTx, [player])

		await connection.confirmTransaction(txSig)

		const battleAccount = await getBattleAccount(program, 0)

		expect(battleAccount.player1.toBase58()).to.equal(
			player.publicKey.toBase58()
		)
		expect(battleAccount.player1Solamons.length).to.equal(3)
		expect(battleAccount.player2Solamons.length).to.equal(0)

		const configAccount = await getConfigAccount(program)

		expect(configAccount.battleCount.toNumber()).to.equal(1)
		expect(configAccount.availableBattleIds.length).to.equal(1)
		expect(configAccount.availableBattleIds[0].toNumber()).to.equal(0)

		const userAccountAfter = await getUserAccount(program, player.publicKey)
		expect(userAccountAfter.battleCount.toNumber()).to.equal(1)

		const { tokenAccount: configAccountATA } =
			await getOrCreateNativeMintATA(
				connection,
				getConfigPDA(program),
				getConfigPDA(program)
			)

		const stakeBalance = await connection.getTokenAccountBalance(
			configAccountATA
		)

		expect(stakeBalance.value.amount).to.equal(battleStake.toString())
	})

	it("Player 2 joins battle", async () => {
		// Fetch the user account to get solamons
		const userAccount = await getUserAccount(program, player2.publicKey)

		// Get the first 3 solamon IDs
		const solamonIds = userAccount.solamons
			.map((solamon) => solamon.id)
			.slice(0, 3)

		const battleId = 0 // Example battle ID

		const joinBattleTx = await wrapSolAndJoinBattleTx(
			connection,
			program,
			player2.publicKey,
			battleId,
			solamonIds
		)
		const txSig = await connection.sendTransaction(joinBattleTx, [player2])

		await connection.confirmTransaction(txSig)
	})

	it("Winner claims battle", async () => {
		const battleId = 0
		const battleAccount = await getBattleAccount(program, battleId)
		const winner =
			JSON.stringify(battleAccount.battleStatus) ===
			JSON.stringify({ player1Wins: {} })
				? player
				: player2

		const winnerBalanceBefore = await connection.getBalance(
			winner.publicKey
		)

		const claimBattleTx = await claimBattleAndUnwrapSolTx(
			connection,
			program,
			winner.publicKey,
			battleId
		)

		const txSig = await connection.sendTransaction(claimBattleTx, [winner])
		await connection.confirmTransaction(txSig)

		const winnerBalanceAfter = await connection.getBalance(winner.publicKey)
		expect(winnerBalanceAfter).to.be.greaterThan(winnerBalanceBefore)
	})

	it("Player 3 opens multiple battles", async () => {
		// Fetch the user account to get solamons
		const userAccountBefore = await getUserAccount(
			program,
			player3.publicKey
		)
		const configAccountBefore = await getConfigAccount(program)
		const numberOfBattlesToOpen = 3

		const balance1 = await connection.getBalance(player.publicKey)
		const balance2 = await connection.getBalance(player2.publicKey)
		const balance3 = await connection.getBalance(player3.publicKey)

		for (let i = 0; i < numberOfBattlesToOpen; i++) {
			const solamonIds = userAccountBefore.solamons
				.map((solamon) => solamon.id)
				.slice(0 + i * 3, 3 + i * 3)

			const openBattleTx = await wrapSolAndOpenBattleTx(
				connection,
				program,
				player3.publicKey,
				battleStake,
				solamonIds
			)
			const txSig = await connection.sendTransaction(openBattleTx, [
				player3,
			])
			await connection.confirmTransaction(txSig)
		}

		const configAccountAfter = await getConfigAccount(program)
		expect(configAccountAfter.battleCount.toNumber()).to.equal(
			numberOfBattlesToOpen + configAccountBefore.battleCount.toNumber()
		)

		expect(configAccountAfter.availableBattleIds.length).to.equal(
			numberOfBattlesToOpen
		)

		const userAccountAfter = await getUserAccount(
			program,
			player3.publicKey
		)
		expect(userAccountAfter.battleCount.toNumber()).to.equal(
			numberOfBattlesToOpen
		)

		const battleAccounts = await getAllBattleAccounts(program)

		const battleAccountsByUser = await getBattleAccountsByUser(
			program,
			player3.publicKey
		)

		expect(battleAccountsByUser.player1BattleAccounts.length).to.equal(
			numberOfBattlesToOpen
		)
		expect(battleAccountsByUser.player2BattleAccounts.length).to.equal(0)
	})

	it("Player 3 cancels one battle", async () => {
		const balanceBefore = await connection.getBalance(player3.publicKey)

		const battleAccountsByUser = await getBattleAccountsByUser(
			program,
			player3.publicKey
		)

		const battleAccount = battleAccountsByUser.player1BattleAccounts[0]

		const cancelBattleTx = await cancelBattleAndUnwrapSolTx(
			connection,
			program,
			player3.publicKey,
			battleAccount.account.battleId.toNumber()
		)

		const txSig = await connection.sendTransaction(cancelBattleTx, [
			player3,
		])
		await connection.confirmTransaction(txSig)

		const balanceAfter = await connection.getBalance(player3.publicKey)

		expect(balanceAfter).to.be.greaterThan(balanceBefore)
	})

	it("Can get all user accounts", async () => {
		const userAccounts = await getAllUserAccounts(program)
		expect(userAccounts.length).to.be.greaterThan(0)

		console.log(JSON.stringify(userAccounts, null, 2))
	})
})
