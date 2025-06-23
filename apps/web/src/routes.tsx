// Should've just used tanstack router...
import { Suspense, lazy } from "react";
import { usePath } from "./router";

function loadPage(path: string) {
  switch (path) {
    case "/":
      return lazy(() => import("./page"))
    case "/play":
      return lazy(() => import("./play"));
    case "/new":
      return lazy(() => import("./new"));
    default:
      return lazy(() => import("./404"));
  }
}

export default function App() {
  const path = usePath();
  const Page = loadPage(path);

  return (
    <Suspense fallback={<Loading />}>
      <Page />
    </Suspense>
  );
}

function Loading() {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {/*<img alt="Loading..." src="/loading.svg" height={128} width={128} />*/}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        height={128}
        width={128}
      >
        <path transform="translate(2)" d="M0 12 V20 H4 V12z">
          <animate
            attributeName="d"
            values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0"
            keyTimes="0;.2;.5;1"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
            calcMode="spline"
          />
        </path>
        <path transform="translate(8)" d="M0 12 V20 H4 V12z">
          <animate
            attributeName="d"
            values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0.2"
            keyTimes="0;.2;.5;1"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
            calcMode="spline"
          />
        </path>
        <path transform="translate(14)" d="M0 12 V20 H4 V12z">
          <animate
            attributeName="d"
            values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0.4"
            keyTimes="0;.2;.5;1"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
            calcMode="spline"
          />
        </path>
        <path transform="translate(20)" d="M0 12 V20 H4 V12z">
          <animate
            attributeName="d"
            values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0.6"
            keyTimes="0;.2;.5;1"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
            calcMode="spline"
          />
        </path>
        <path transform="translate(26)" d="M0 12 V20 H4 V12z">
          <animate
            attributeName="d"
            values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z"
            dur="1.2s"
            repeatCount="indefinite"
            begin="0.8"
            keyTimes="0;.2;.5;1"
            keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8"
            calcMode="spline"
          />
        </path>
      </svg>
    </div>
  );
}
