export const WHITELISTED_AUTHORS = [
  'jurgenjacobsen',
]

export const WHITELISTED_AUTHOR_SET = new Set(
  WHITELISTED_AUTHORS.map((username) => username.toLowerCase()),
)
