import { createGlobalStyle } from 'styled-components';

import { PHOTO_TRANSITION_NAME } from 'core/page-transition';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: ${({ fontFamily }) => fontFamily}, sans-serif;
    /* Room for the camera cut-out when an iPhone is held sideways. */
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }

  * {
    box-sizing: border-box;
  }

  img {
    max-width: 100%;
  }

  /* The photo has a different shape on the front page and the place page.
     Without this, the browser stretches it while it moves. */
  ::view-transition-old(${PHOTO_TRANSITION_NAME}),
  ::view-transition-new(${PHOTO_TRANSITION_NAME}) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    /* Without this, the part that "cover" cuts away is still drawn, outside
       the moving box. */
    overflow: clip;
  }

  /* The browser fades from the old photo to the new one. The front page
     shows a cut of the photo, so the two do not line up and the fade shows
     a double image. Draw only the whole photo (the place page's), cut to
     the moving box. It then looks the same as the front page's at that end.
     markFullPhotoPage in core/page-transition.js sets data-full-photo. */
  html[data-full-photo='new']::view-transition-old(${PHOTO_TRANSITION_NAME}),
  html[data-full-photo='old']::view-transition-new(${PHOTO_TRANSITION_NAME}) {
    display: none;
  }

  html[data-full-photo='new']::view-transition-new(${PHOTO_TRANSITION_NAME}),
  html[data-full-photo='old']::view-transition-old(${PHOTO_TRANSITION_NAME}) {
    animation: none;
    opacity: 1;
    mix-blend-mode: normal;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
`;
