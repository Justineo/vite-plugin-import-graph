export function createHeading() {
  const heading = document.createElement('h1')
  heading.textContent = 'Hello, world!'
  document.body.prepend(heading)
}
