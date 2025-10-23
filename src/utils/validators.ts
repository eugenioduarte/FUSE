export function isValidEmail(email: string) {
  // Simple robust email regex for basic validation
  const re =
    /^(?:[a-zA-Z0-9_'^&/+-])+(?:\.(?:[a-zA-Z0-9_'^&/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/
  return re.test(email.trim())
}
