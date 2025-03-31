import * as anchor from "@coral-xyz/anchor"
import { Program, BN } from "@coral-xyz/anchor"
import { Solamon } from "../target/types/solamon"
import {
	Connection,
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
} from "@solana/web3.js"
import fs from "fs"
import path from "path"
import { SolamonPrototype } from "../tests/helper"

async function main() {
	// Configure the client to use the local cluster
	const provider = anchor.AnchorProvider.env()
	anchor.setProvider(provider)

	// Initialize the program
	const program = anchor.workspace.Solamon as Program<Solamon>

	// Load admin keypair (or use the default provider wallet)
	const adminKeypair = provider.wallet.payer
	const adminPublicKey = adminKeypair.publicKey

	// Set up configuration parameters
	const feeAccount = adminPublicKey // Fee account is the admin for now
	const admin = adminPublicKey // Admin is the signer
	const feePercentageInBasisPoints = 100 // 1% fee (100 basis points = 1%)
	const spawnFee = new BN(LAMPORTS_PER_SOL * 0.1) // 0.01 SOL per spawn

	console.log("Initializing Solamon program with the following parameters:")
	console.log(`Admin: ${admin.toString()}`)
	console.log(`Fee Account: ${feeAccount.toString()}`)
	console.log(`Fee Percentage: ${feePercentageInBasisPoints / 100}%`)
	console.log(`Spawn Fee: ${spawnFee.toNumber() / LAMPORTS_PER_SOL} SOL`)

	try {
		// Call the initialize instruction
		const tx = await program.methods
			.initialize(feeAccount, admin, feePercentageInBasisPoints, spawnFee)
			.rpc()

		console.log("Initialization successful!")
		console.log(`Transaction signature: ${tx}`)
	} catch (error) {
		console.error("Error initializing Solamon program:", error)
	}

	try {
		const solamonPrototype: SolamonPrototype[] = [
			{
				imageUrl: "0",
				possibleElements: [{ fire: {} }, { water: {} }, { wood: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "1",
				possibleElements: [{ fire: {} }, { earth: {} }, { metal: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "2",
				possibleElements: [{ water: {} }, { fire: {} }, { metal: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "3",
				possibleElements: [{ water: {} }, { wood: {} }, { earth: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "4",
				possibleElements: [{ wood: {} }, { water: {} }, { fire: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "5",
				possibleElements: [{ wood: {} }, { earth: {} }, { metal: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "6",
				possibleElements: [{ wood: {} }, { fire: {} }, { metal: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "7",
				possibleElements: [{ earth: {} }, { water: {} }, { wood: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "8",
				possibleElements: [{ metal: {} }, { fire: {} }, { earth: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
			{
				imageUrl: "9",
				possibleElements: [{ metal: {} }, { water: {} }, { wood: {} }],
				elementProbabilityInBasisPoints: [8000, 1000, 1000],
				distributablePoints: 15,
			},
		]

		const txSig = await program.methods
			.createSolamonPrototype(solamonPrototype)
			.accounts({
				admin: adminPublicKey,
			})
			.signers([adminKeypair])
			.rpc()

		console.log("Solamon prototype created successfully!")
		console.log(`Transaction signature: ${txSig}`)
	} catch (error) {
		console.error("Error creating solamon prototype:", error)
	}
}

main().then(
	() => process.exit(0),
	(err) => {
		console.error(err)
		process.exit(1)
	}
)
