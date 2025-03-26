import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Solamon } from "../target/types/solamon"
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { expect } from "chai"
import {
	getBattleAccount,
	getBattleAccountPDA,
	getAllBattleAccounts,
	getBattleAccountsByUser,
	getConfigAccount,
	getConfigPDA,
	getUserAccount,
	getUserAccountPDA,
	getBattleLogs,
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

		const tx = await program.methods
			.initialize(admin.publicKey)
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
	})

	it("Spawns solamons", async () => {
		// Spawn elements
		const solamonCount = 5
		const txHash = await program.methods
			.spawnSolamons(solamonCount)
			.accounts({
				player: player.publicKey,
				feeAccount: (await getConfigAccount(program)).feeAccount,
			})
			.signers([player])
			.rpc()

		await connection.confirmTransaction(txHash)

		const tx = await connection.getTransaction(txHash, {
			commitment: "confirmed",
		})

		console.log("Solamon spawn tx logs")
		console.log(tx.meta?.logMessages)

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

		const txSig = await program.methods
			.openBattle(solamonIds)
			.accounts({
				player: player.publicKey,
			})
			.signers([player])
			.rpc()

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
	})

	it("Player 2 joins battle", async () => {
		// Fetch the user account to get solamons
		const userAccount = await getUserAccount(program, player2.publicKey)

		// Get the first 3 solamon IDs
		const solamonIds = userAccount.solamons
			.map((solamon) => solamon.id)
			.slice(0, 3)

		const battleId = 0 // Example battle ID

		const txSig = await program.methods
			.joinBattle(solamonIds)
			.accountsPartial({
				player: player2.publicKey,
				configAccount: getConfigPDA(program),
				battleAccount: getBattleAccountPDA(program, battleId),
				userAccount: getUserAccountPDA(program, player2.publicKey),
			})
			.signers([player2])
			.rpc()

		await connection.confirmTransaction(txSig)

		const battleLogs = await getBattleLogs(
			connection,
			getBattleAccountPDA(program, battleId)
		)

		console.log({ battleLogs })

		expect(battleLogs.length).to.be.greaterThan(0)

		const battleAccountsByUser = await getBattleAccountsByUser(
			program,
			player2.publicKey
		)
		console.log({ battleAccountsByUser })
	})

	it("Player 3 opens multiple battles", async () => {
		// Fetch the user account to get solamons
		const userAccountBefore = await getUserAccount(
			program,
			player3.publicKey
		)
		const configAccountBefore = await getConfigAccount(program)
		const numberOfBattlesToOpen = 3

		for (let i = 0; i < numberOfBattlesToOpen; i++) {
			const solamonIds = userAccountBefore.solamons
				.map((solamon) => solamon.id)
				.slice(0 + i * 3, 3 + i * 3)

			const txSig = await program.methods
				.openBattle(solamonIds)
				.accounts({ player: player3.publicKey })
				.signers([player3])
				.rpc()

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
		console.log({ battleAccounts })

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
		const battleAccountsByUser = await getBattleAccountsByUser(
			program,
			player3.publicKey
		)

		const battleAccount = battleAccountsByUser.player1BattleAccounts[0]
		console.log({ battleAccount })
		console.log(battleAccount.publicKey)

		const txSig = await program.methods
			.cancelBattle()
			.accountsPartial({
				player: player3.publicKey,
				battleAccount: battleAccount.publicKey,
			})
			.signers([player3])
			.rpc()

		await connection.confirmTransaction(txSig)

		const battleAccountAfter = await getBattleAccount(
			program,
			battleAccount.account.battleId.toNumber()
		)
		console.log({ battleAccountAfter })
	})
})
