// Function to get CSS custom property values
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// Get the actual color values from CSS
const gameColors = {
  primary: getCSSVariable("--game-primary"),
  secondary: getCSSVariable("--game-secondary"),
  accent: getCSSVariable("--game-accent"),
  highlight: getCSSVariable("--game-highlight"),
  warning: getCSSVariable("--game-warning"),
};

/*
 * Text Styles
 */
export const TextStyles = {
  defaultText: {
    fontSize: "24px",
    color: gameColors.primary,
    fontFamily: "Black Ops One, sans-serif",
  },
  title: {
    fontSize: "64px",
    color: gameColors.primary,
    fontFamily: "Black Ops One, sans-serif",
  },
  menuItem: {
    fontSize: "48px",
    color: gameColors.primary,
    fontFamily: "Black Ops One, sans-serif",
  },
  menuItemHover: {
    color: gameColors.secondary,
    fontFamily: "Black Ops One, sans-serif",
  },
  button: {
    fontSize: "28px",
    color: gameColors.secondary,
    backgroundColor: gameColors.warning,
    padding: { x: 20, y: 10 },
    fontFamily: "Black Ops One, sans-serif",
  },
  buttonHover: {
    backgroundColor: gameColors.accent,
  },
};
