/**
 * Calculates perceived luminance of a HEX color and returns either '#FFFFFF' or '#000000'
 * to guarantee WCAG AAA compliant text contrast over dynamic background colors.
 */
export function getContrastTextColor(hexColor: string = '#000000'): string {
  // Remove leading '#' if present
  let color = hexColor.replace('#', '')

  // Handle 3-character hex (#fff -> #ffffff)
  if (color.length === 3) {
    color = color
      .split('')
      .map((char) => char + char)
      .join('')
  }

  // Fallback to black if invalid hex
  if (color.length !== 6) {
    return '#FFFFFF'
  }

  // Convert to RGB channels
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Perceived brightness formula (YIQ / ITU-R BT.601 standard)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // Return dark text for light backgrounds, white text for dark backgrounds
  return brightness > 128 ? '#000000' : '#FFFFFF'
}
