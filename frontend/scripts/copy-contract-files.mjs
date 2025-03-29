import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Define source and destination paths
const filesToCopy = [
  {
    source: path.resolve(__dirname, '../../contract/tests/helper.ts'),
    destination: path.resolve(__dirname, '../src/lib/solana-helper.ts'),
  },
  {
    source: path.resolve(__dirname, '../../contract/target/types/solamon.ts'),
    destination: path.resolve(__dirname, '../src/target/types/solamon.ts'),
  },
]

// Function to copy files
filesToCopy.forEach(({ source, destination }) => {
  // Ensure the destination directory exists
  const destDir = path.dirname(destination)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  // Copy the file
  fs.copyFileSync(source, destination)
  console.log(`Copied ${source} to ${destination}`)
})
