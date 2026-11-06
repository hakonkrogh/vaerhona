import { screen } from './screen';

// Ready made media queries
export const responsive = {
  xs: `@media (max-width: ${screen.xsMax}px)`,
  sm: `@media (min-width: ${screen.smMin}px) and (max-width: ${screen.smMax}px)`,
  smAndLess: `@media (max-width: ${screen.smMax}px)`,
  smAndMore: `@media (min-width: ${screen.smMin}px)`,
  md: `@media (min-width: ${screen.mdMin}px) and (max-width: ${screen.mdMax}px)`,
  mdAndLess: `@media (max-width: ${screen.mdMax}px)`,
  mdAndMore: `@media (min-width: ${screen.mdMin}px)`,
  lg: `@media (min-width: ${screen.lgMin}px)`,
};
