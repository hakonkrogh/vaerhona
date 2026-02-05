// Meteocons by Bas Milius - MIT License
// https://github.com/basmilius/weather-icons

export const ClearDay = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="clear-day-a" x1="150" x2="234" y1="119.2" y2="264.8" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fbbf24"/>
        <stop offset=".5" stopColor="#fbbf24"/>
        <stop offset="1" stopColor="#f59e0b"/>
      </linearGradient>
      <symbol id="clear-day-b" viewBox="0 0 384 384">
        <circle cx="192" cy="192" r="84" fill="url(#clear-day-a)" stroke="#f8af18" strokeMiterlimit="10" strokeWidth="6"/>
        <path fill="none" stroke="#fbbf24" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="24" d="M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7"/>
      </symbol>
    </defs>
    <use href="#clear-day-b" width="384" height="384" transform="translate(64 64)"/>
  </svg>
);

export const PartlyCloudyDay = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="pcd-a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f3f7fe"/>
        <stop offset=".5" stopColor="#f3f7fe"/>
        <stop offset="1" stopColor="#deeafb"/>
      </linearGradient>
      <linearGradient id="pcd-b" x1="78" x2="118" y1="63.4" y2="132.7" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#fbbf24"/>
        <stop offset=".5" stopColor="#fbbf24"/>
        <stop offset="1" stopColor="#f59e0b"/>
      </linearGradient>
      <symbol id="pcd-sun" viewBox="0 0 196 196">
        <circle cx="98" cy="98" r="40" fill="url(#pcd-b)" stroke="#f8af18" strokeMiterlimit="10" strokeWidth="4"/>
        <path fill="none" stroke="#fbbf24" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="12" d="M98 31.4V6m0 184v-25.4M145.1 51l18-17.9M33 163l18-17.9M51 51 33 33m130.1 130.1-18-18M6 98h25.4M190 98h-25.4"/>
      </symbol>
      <symbol id="pcd-cloud" viewBox="0 0 350 222">
        <path fill="url(#pcd-a)" stroke="#e6effc" strokeMiterlimit="10" strokeWidth="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/>
      </symbol>
      <symbol id="pcd-c" viewBox="0 0 363 258">
        <use href="#pcd-sun" width="196" height="196"/>
        <use href="#pcd-cloud" width="350" height="222" transform="translate(13 36)"/>
      </symbol>
    </defs>
    <use href="#pcd-c" width="363" height="258" transform="translate(68 109)"/>
  </svg>
);

export const Cloudy = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="cloudy-a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f3f7fe"/>
        <stop offset=".5" stopColor="#f3f7fe"/>
        <stop offset="1" stopColor="#deeafb"/>
      </linearGradient>
      <symbol id="cloudy-b" viewBox="0 0 350 222">
        <path fill="url(#cloudy-a)" stroke="#e6effc" strokeMiterlimit="10" strokeWidth="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/>
      </symbol>
    </defs>
    <use href="#cloudy-b" width="350" height="222" transform="translate(81 145)"/>
  </svg>
);

export const Overcast = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="oc-a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f3f7fe"/>
        <stop offset=".5" stopColor="#f3f7fe"/>
        <stop offset="1" stopColor="#deeafb"/>
      </linearGradient>
      <linearGradient id="oc-b" x1="52.7" x2="133.4" y1="9.6" y2="149.3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#9ca3af"/>
        <stop offset=".5" stopColor="#9ca3af"/>
        <stop offset="1" stopColor="#6b7280"/>
      </linearGradient>
      <symbol id="oc-dark" viewBox="0 0 200.3 126.1">
        <path fill="url(#oc-b)" stroke="#848b98" strokeMiterlimit="10" d="M.5 93.2a32.4 32.4 0 0032.4 32.4h129.8v-.1l2.3.1a34.8 34.8 0 006.5-68.9a32.4 32.4 0 00-48.5-33a48.6 48.6 0 00-88.6 37.1h-1.5A32.4 32.4 0 00.5 93.1Z"/>
      </symbol>
      <symbol id="oc-light" viewBox="0 0 350 222">
        <path fill="url(#oc-a)" stroke="#e6effc" strokeMiterlimit="10" strokeWidth="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/>
      </symbol>
      <symbol id="oc-c" viewBox="0 0 398 222">
        <use href="#oc-dark" width="200.3" height="126.1" transform="translate(198 27)"/>
        <use href="#oc-light" width="350" height="222"/>
      </symbol>
    </defs>
    <use href="#oc-c" width="398" height="222" transform="translate(68.84 145)"/>
  </svg>
);

export const OvercastRain = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="or-a" x1="99.5" x2="232.6" y1="30.7" y2="261.4" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#f3f7fe"/>
        <stop offset=".5" stopColor="#f3f7fe"/>
        <stop offset="1" stopColor="#deeafb"/>
      </linearGradient>
      <linearGradient id="or-b" x1="52.7" x2="133.4" y1="9.6" y2="149.3" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#9ca3af"/>
        <stop offset=".5" stopColor="#9ca3af"/>
        <stop offset="1" stopColor="#6b7280"/>
      </linearGradient>
      <linearGradient id="or-c" x1="1381.3" x2="1399.5" y1="-1144.7" y2="-1097.4" gradientTransform="rotate(-9 8002.567 8233.063)" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#0b65ed"/>
        <stop offset=".5" stopColor="#0a5ad4"/>
        <stop offset="1" stopColor="#0950bc"/>
      </linearGradient>
      <linearGradient href="#or-c" id="or-d" x1="1428.4" x2="1446.6" y1="-1084.7" y2="-1037.4" gradientTransform="rotate(-9 8009.537 8233.037)"/>
      <linearGradient href="#or-c" id="or-e" x1="1489.3" x2="1507.5" y1="-1111.6" y2="-1064.3" gradientTransform="rotate(-9 8016.566 8233.078)"/>
      <symbol id="or-dark" viewBox="0 0 200.3 126.1">
        <path fill="url(#or-b)" stroke="#848b98" strokeMiterlimit="10" d="M.5 93.2a32.4 32.4 0 0032.4 32.4h129.8v-.1l2.3.1a34.8 34.8 0 006.5-68.9a32.4 32.4 0 00-48.5-33a48.6 48.6 0 00-88.6 37.1h-1.5A32.4 32.4 0 00.5 93.1Z"/>
      </symbol>
      <symbol id="or-light" viewBox="0 0 350 222">
        <path fill="url(#or-a)" stroke="#e6effc" strokeMiterlimit="10" strokeWidth="6" d="m291 107-2.5.1A83.9 83.9 0 00135.6 43 56 56 0 0051 91a56.6 56.6 0 00.8 9A60 60 0 0063 219l4-.2v.2h224a56 56 0 000-112Z"/>
      </symbol>
      <symbol id="or-clouds" viewBox="0 0 398 222">
        <use href="#or-dark" width="200.3" height="126.1" transform="translate(198 27)"/>
        <use href="#or-light" width="350" height="222"/>
      </symbol>
      <symbol id="or-rain" viewBox="0 0 129 110">
        <path fill="url(#or-c)" stroke="#0a5ad4" strokeMiterlimit="10" d="M8.5 56.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/>
        <path fill="url(#or-d)" stroke="#0a5ad4" strokeMiterlimit="10" d="M64.5 109.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/>
        <path fill="url(#or-e)" stroke="#0a5ad4" strokeMiterlimit="10" d="M120.5 74.5a8 8 0 01-8-8v-40a8 8 0 0116 0v40a8 8 0 01-8 8Z"/>
      </symbol>
    </defs>
    <use href="#or-clouds" width="398" height="222" transform="translate(68.84 145)"/>
    <use href="#or-rain" width="129" height="110" transform="translate(191.5 343.5)"/>
  </svg>
);

export const Wind = ({ size = 24, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="wind-a" x1="138.5" x2="224.2" y1="5.1" y2="153.5" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#d4d7dd"/>
        <stop offset=".5" stopColor="#d4d7dd"/>
        <stop offset="1" stopColor="#bec1c6"/>
      </linearGradient>
      <linearGradient href="#wind-a" id="wind-b" x1="77.7" x2="169" y1="96.2" y2="254.4"/>
      <symbol id="wind-c" viewBox="0 0 348 240">
        <path fill="none" stroke="url(#wind-a)" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="24" d="M267.2 24.3A40 40 0 11296 92H12"/>
        <path fill="none" stroke="url(#wind-b)" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="24" d="M151.2 215.7A40 40 0 10180 148H12"/>
      </symbol>
    </defs>
    <use href="#wind-c" width="348" height="240" transform="translate(82 136)"/>
  </svg>
);
