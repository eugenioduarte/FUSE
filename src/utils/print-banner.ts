const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

const FUSE_BANNER = `


  ░██████████░██     ░██   ░██████   ░██████████
  ░██        ░██     ░██  ░██   ░██  ░██
  ░██        ░██     ░██ ░██         ░██
  ░█████████ ░██     ░██  ░████████  ░█████████
  ░██        ░██     ░██         ░██ ░██
  ░██         ░██   ░██   ░██   ░██  ░██
  ░██          ░██████     ░██████   ░██████████

  by Eugenio Silva  —  v${process.env.APP_VERSION ?? '1.0.0'}

  A learning platform where AI agents generate personalised study
  content on-the-fly: topic summaries, quizzes, hangman, matrix
  challenges and flash-cards — all driven by LLM pipelines.

  Agents also handle: offline sync queue, collab sessions,
  push notifications, avatar generation and code quality reviews.

  ⚠  Portfolio project — expect rough edges and ongoing changes.
`

let bannerPrinted = false

export function printBanner(): void {
  if (bannerPrinted) return
  bannerPrinted = true
  console.log(`${YELLOW}${FUSE_BANNER}${RESET}`)
}
