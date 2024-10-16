import { v4 as uuid } from '@lukeed/uuid'
import { nanoid } from 'nanoid'

async function main() {
  document.querySelector('body').textContent = `Hello, user "${nanoid()}"! 你好，用户 "${uuid()}"！`

  const update = await import('./update')
  update.createHeading()
}

main()
