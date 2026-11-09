import styled from 'styled-components';

export const Wrapper = styled.header`
  flex: 0 0 auto;
  /* Room for the iOS status bar. It is 0 in a normal browser tab. */
  --status-bar: env(safe-area-inset-top, 0px);
  /* When the page is drawn under the status bar (a home screen app on newer
     iOS), iOS also blurs the page for about 50px below the bar, so the logo
     must sit below that too. min() makes this 0 when --status-bar is 0, so a
     browser tab and landscape look the same as before. */
  --status-bar-blur: min(50px, var(--status-bar) * 100);
  padding-top: calc(var(--status-bar) + var(--status-bar-blur));
  height: calc(50px + var(--status-bar) + var(--status-bar-blur));
  box-sizing: border-box;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const MainLink = styled.a`
  color: inherit;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
`;

export const Title = styled.span`
  display: inline-block;
  margin-left: 10px;
  position: relative;
  top: 2px;
`;
