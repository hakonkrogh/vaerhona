import styled from 'styled-components';

export const Wrapper = styled.header`
  flex: 0 0 auto;
  /* Room for the iOS status bar. It is 0 in a normal browser tab. */
  --status-bar: env(safe-area-inset-top, 0px);
  --status-bar-blur: 0px;
  /* As a home screen app, iOS blurs the top of the page for about 50px
     below the status bar, so the logo must sit below that too. Some iOS
     versions report a safe-area inset of 0 there and still blur, so this
     checks for the home screen app (the ios-app class, set in _document.js),
     not the inset. In landscape iOS hides the status bar, so no room. */
  @media (orientation: portrait) {
    html.ios-app & {
      --status-bar-blur: 50px;
    }
  }
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
