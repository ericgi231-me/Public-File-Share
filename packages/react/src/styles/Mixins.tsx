import { css } from 'styled-components';

// Flexbox utilities
//

// Centers content both vertically and horizontally using flexbox
export const flexCenter = css`
  display: flex;
  justify-content: center;
  align-items: center;
`

// Distributes space between items with flexbox, aligning items center vertically
export const flexBetween = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

// Arranges children in a column using flexbox
export const flexColumn = css`
  display: flex;
  flex-direction: column;
`

// Allows flex items to wrap onto multiple lines
export const flexWrap = css`
  display: flex;
  flex-wrap: wrap;
`

// Grid utilities
//

// Centers content both vertically and horizontally using CSS grid
export const gridCenter = css`
  display: grid;
  place-items: center;
`

// Creates a responsive grid that auto-fits columns with a minimum width
export const gridAutoFit = (minWidth = '250px') => css`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(${minWidth}, 1fr));
  gap: ${props => props.theme.spacing.lg};
`

// Text utilities
//

// Truncates text with an ellipsis if it overflows its container
export const textEllipsis = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

// Clamps text to a specific number of lines, showing ellipsis for overflow
export const textClamp = (lines = 3) => css`
  display: -webkit-box;
  -webkit-line-clamp: ${lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
`

// Hides content visually but keeps it accessible to screen readers
export const visuallyHidden = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

// Positioning utilities
//

// Absolutely centers an element within its parent
export const absoluteCenter = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

// Makes an element take up the full width and height of its parent
export const fullSize = css`
  width: 100%;
  height: 100%;
`

// Button utilities
//

// Removes default button styles for a clean slate
export const buttonReset = css`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
`

// Base button styles with padding, alignment, and transitions
export const buttonBase = css`
  ${buttonReset}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.base};
  font-weight: ${props => props.theme.fontWeights.medium};
  transition: ${props => props.theme.transitions.fast};
  text-decoration: none;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`

// Input utilities
//

// Base input styles for consistent appearance
export const inputBase = css`
  display: block;
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.base};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.base};
  transition: ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
`

// Card utilities
//

// Base card styles with background, border radius, shadow, and padding
export const cardBase = css`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.base};
  padding: ${props => props.theme.spacing.lg};
`

// Card styles with hover effect for elevation and movement
export const cardHover = css`
  ${cardBase}
  transition: ${props => props.theme.transitions.base};
  cursor: pointer;

  &:hover {
    box-shadow: ${props => props.theme.shadows.lg};
    transform: translateY(-2px);
  }
`

// Responsive utilities
//

// Applies styles for mobile screens (max-width: sm)
export const mobile = (...args: Parameters<typeof css>) => css`
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    ${css(...args)}
  }
`;

// Applies styles for tablet screens (max-width: md)
export const tablet = (...args: Parameters<typeof css>) => css`
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    ${css(...args)}
  }
`;

// Applies styles for desktop screens (min-width: md)
export const desktop = (...args: Parameters<typeof css>) => css`
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    ${css(...args)}
  }
`;