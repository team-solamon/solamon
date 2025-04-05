import * as anchor from "@coral-xyz/anchor"
import { BN, Program } from "@coral-xyz/anchor"
import { Solamon } from "../target/types/solamon"
import {
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	Transaction,
} from "@solana/web3.js"
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
	joinBattleTx,
	cancelBattleTx,
	claimBattleTx,
	showSpawnResult,
	spawnSolamonsTx,
	getAllUserAccounts,
	openBattleTx,
	burnSolamonTx,
} from "./helper"
import {
	createAssociatedTokenAccount,
	createMint,
	getAssociatedTokenAddress,
	getAssociatedTokenAddressSync,
	mintTo,
} from "@solana/spl-token"

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
	const battleStake = 100
	const spawnDeposit = LAMPORTS_PER_SOL * 0.05
	let stakeTokenMint: PublicKey
	let depositTokenMint: PublicKey

	before(async () => {
		const txs = await Promise.all([
			connection.requestAirdrop(admin.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player2.publicKey, LAMPORTS_PER_SOL),
			connection.requestAirdrop(player3.publicKey, LAMPORTS_PER_SOL),
		])
		await Promise.all(txs.map((tx) => connection.confirmTransaction(tx)))

		// deploy stake token
		// Create and deploy SLP token
		stakeTokenMint = await createMint(
			connection,
			admin,
			admin.publicKey,
			admin.publicKey,
			9 // decimals
		)

		depositTokenMint = await createMint(
			connection,
			admin,
			admin.publicKey,
			admin.publicKey,
			9 // decimals
		)

		// Create ATAs for players
		const [
			playerStakeAta,
			player2StakeAta,
			player3StakeAta,
			playerDepositAta,
			player2DepositAta,
			player3DepositAta,
		] = await Promise.all([
			createAssociatedTokenAccount(
				connection,
				admin,
				stakeTokenMint,
				player.publicKey
			),
			createAssociatedTokenAccount(
				connection,
				admin,
				stakeTokenMint,
				player2.publicKey
			),
			createAssociatedTokenAccount(
				connection,
				admin,
				stakeTokenMint,
				player3.publicKey
			),
			createAssociatedTokenAccount(
				connection,
				admin,
				depositTokenMint,
				player.publicKey
			),
			createAssociatedTokenAccount(
				connection,
				admin,
				depositTokenMint,
				player2.publicKey
			),
			createAssociatedTokenAccount(
				connection,
				admin,
				depositTokenMint,
				player3.publicKey
			),
		])

		// Mint initial tokens to players
		await Promise.all([
			mintTo(
				connection,
				admin,
				stakeTokenMint,
				playerStakeAta,
				admin,
				1000
			),
			mintTo(
				connection,
				admin,
				stakeTokenMint,
				player2StakeAta,
				admin,
				1000
			),
			mintTo(
				connection,
				admin,
				stakeTokenMint,
				player3StakeAta,
				admin,
				1000
			),
			mintTo(
				connection,
				admin,
				depositTokenMint,
				playerDepositAta,
				admin,
				LAMPORTS_PER_SOL
			),
			mintTo(
				connection,
				admin,
				depositTokenMint,
				player2DepositAta,
				admin,
				LAMPORTS_PER_SOL
			),
			mintTo(
				connection,
				admin,
				depositTokenMint,
				player3DepositAta,
				admin,
				LAMPORTS_PER_SOL
			),
		])
	})

	it("Is initialized", async () => {
		// Derive the PDA for the config account
		const tx = await program.methods
			.initialize(admin.publicKey)
			.accounts({
				signer: admin.publicKey,
				stakeTokenMint: stakeTokenMint,
				depositTokenMint: depositTokenMint,
			})
			.signers([admin])
			.rpc()

		const configAccount = await getConfigAccount(program)

		expect(configAccount.admin.toBase58()).to.equal(
			admin.publicKey.toBase58()
		)
		expect(configAccount.depositTokenMint.toBase58()).to.equal(
			depositTokenMint.toBase58()
		)

		expect(configAccount.stakeTokenMint.toBase58()).to.equal(
			stakeTokenMint.toBase58()
		)
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

		const player1BalanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(depositTokenMint, player.publicKey)
		)

		const tx = await spawnSolamonsTx(
			program,
			player.publicKey,
			solamonCount,
			new BN(spawnDeposit)
		)

		const txSig = await connection.sendTransaction(tx, [player])

		await connection.confirmTransaction(txSig)

		await showSpawnResult(connection, txSig)

		const player1BalanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(depositTokenMint, player.publicKey)
		)

		expect(Number(player1BalanceAfter.value.amount)).to.be.equal(
			new BN(player1BalanceBefore.value.amount)
				.sub(new BN(spawnDeposit * solamonCount))
				.toNumber()
		)
		// Fetch the user account to verify elements were added
		const userAccount = await getUserAccount(program, player.publicKey)
		expect(userAccount.solamons.length).to.equal(solamonCount)

		const solamonCount2 = 3

		const tx2 = await spawnSolamonsTx(
			program,
			player2.publicKey,
			solamonCount2,
			new BN(spawnDeposit)
		)
		const txSig2 = await connection.sendTransaction(tx2, [player2])

		await connection.confirmTransaction(txSig2)

		const userAccount2 = await getUserAccount(program, player2.publicKey)
		expect(userAccount2.solamons.length).to.equal(solamonCount2)

		const solamonCount3 = 9

		const tx3 = await spawnSolamonsTx(
			program,
			player3.publicKey,
			solamonCount3,
			new BN(spawnDeposit)
		)
		const txSig3 = await connection.sendTransaction(tx3, [player3])

		await connection.confirmTransaction(txSig3)

		const userAccount3 = await getUserAccount(program, player3.publicKey)
		expect(userAccount3.solamons.length).to.equal(solamonCount3)
	})

	it("Player 1 opens battle", async () => {
		// Fetch the user account to get solamons
		const userAccount = await getUserAccount(program, player.publicKey)

		let configAccount = await getConfigAccount(program)

		const balanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				getConfigPDA(program),
				true
			)
		)

		// Get the first 3 solamon IDs
		const solamonIds = userAccount.solamons
			.map((solamon) => solamon.id)
			.slice(0, 3)

		const tx = await openBattleTx(
			program,
			player.publicKey,
			battleStake,
			solamonIds
		)

		const txSig = await connection.sendTransaction(tx, [player])

		await connection.confirmTransaction(txSig)

		const battleAccount = await getBattleAccount(program, 0)

		expect(battleAccount.player1.toBase58()).to.equal(
			player.publicKey.toBase58()
		)
		expect(battleAccount.player1Solamons.length).to.equal(3)
		expect(battleAccount.player2Solamons.length).to.equal(0)

		configAccount = await getConfigAccount(program)

		const balanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				getConfigPDA(program),
				true
			)
		)

		expect(balanceAfter.value.amount).to.equal(
			new BN(balanceBefore.value.amount)
				.add(new BN(battleStake))
				.toString()
		)

		expect(configAccount.battleCount.toNumber()).to.equal(1)
		expect(configAccount.availableBattleIds.length).to.equal(1)
		expect(configAccount.availableBattleIds[0].toNumber()).to.equal(0)

		const userAccountAfter = await getUserAccount(program, player.publicKey)
		expect(userAccountAfter.battleCount.toNumber()).to.equal(1)
	})

	it("Player 2 joins battle", async () => {
		// Fetch the user account to get solamons
		const userAccount = await getUserAccount(program, player2.publicKey)
		const configAccount = await getConfigAccount(program)
		const userTokenBalanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				player2.publicKey,
				true
			)
		)

		// Get the first 3 solamon IDs
		const solamonIds = userAccount.solamons
			.map((solamon) => solamon.id)
			.slice(0, 3)

		const battleId = 0 // Example battle ID

		const tx = await joinBattleTx(
			program,
			player2.publicKey,
			battleId,
			solamonIds
		)
		const txSig = await connection.sendTransaction(tx, [player2])

		await connection.confirmTransaction(txSig)

		const userTokenBalanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				player2.publicKey,
				true
			)
		)

		expect(userTokenBalanceAfter.value.amount).to.equal(
			new BN(userTokenBalanceBefore.value.amount)
				.sub(new BN(battleStake))
				.toString()
		)
	})

	it("Winner claims battle", async () => {
		const battleId = 0
		const battleAccount = await getBattleAccount(program, battleId)
		const configAccount = await getConfigAccount(program)
		const winner =
			JSON.stringify(battleAccount.battleStatus) ===
			JSON.stringify({ player1Wins: {} })
				? player
				: player2

		const winnerBalanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				winner.publicKey,
				true
			)
		)

		const tx = await claimBattleTx(program, winner.publicKey, battleId)

		const txSig = await connection.sendTransaction(tx, [winner])
		await connection.confirmTransaction(txSig)

		const winnerBalanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				winner.publicKey,
				true
			)
		)
		expect(winnerBalanceAfter.value.amount).to.be.equal(
			new BN(winnerBalanceBefore.value.amount)
				.add(new BN(battleStake * 2))
				.toString()
		)
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

			const tx = await openBattleTx(
				program,
				player3.publicKey,
				battleStake,
				solamonIds
			)
			const txSig = await connection.sendTransaction(tx, [player3])
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
		const configAccount = await getConfigAccount(program)
		const balanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				player3.publicKey,
				true
			)
		)

		const battleAccountsByUser = await getBattleAccountsByUser(
			program,
			player3.publicKey
		)

		const battleAccount = battleAccountsByUser.player1BattleAccounts[0]

		const tx = await cancelBattleTx(
			program,
			player3.publicKey,
			battleAccount.account.battleId.toNumber()
		)

		const txSig = await connection.sendTransaction(tx, [player3])
		await connection.confirmTransaction(txSig)

		const balanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(
				configAccount.stakeTokenMint,
				player3.publicKey,
				true
			)
		)

		expect(balanceAfter.value.amount).to.be.equal(
			new BN(balanceBefore.value.amount)
				.add(new BN(battleStake))
				.toString()
		)
	})

	it("Can get all user accounts", async () => {
		const userAccounts = await getAllUserAccounts(program)
		expect(userAccounts.length).to.be.greaterThan(0)
	})

	it("Player 3 burns one solamon", async () => {
		const userAccountBefore = await getUserAccount(
			program,
			player3.publicKey
		)
		const balanceBefore = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(depositTokenMint, player3.publicKey)
		)

		const tx = await burnSolamonTx(
			connection,
			program,
			player3.publicKey,
			userAccountBefore.solamons[3].id
		)
		const txSig = await connection.sendTransaction(tx, [player3])
		await connection.confirmTransaction(txSig)

		const userAccountAfter = await getUserAccount(
			program,
			player3.publicKey
		)
		expect(userAccountAfter.solamons.length).to.equal(
			userAccountBefore.solamons.length - 1
		)

		const balanceAfter = await connection.getTokenAccountBalance(
			getAssociatedTokenAddressSync(depositTokenMint, player3.publicKey)
		)

		expect(Number(balanceAfter.value.amount)).to.be.equal(
			Number(balanceBefore.value.amount) + spawnDeposit
		)
	})
})
