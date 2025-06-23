import type { Color } from "@chessica/protocol";

export function switchColor(color: Color) {
  let link: HTMLLinkElement | null =
    document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (color == "White") {
    link.href = "/white_knook.png";
  } else {
    link.href = "/black_knook.png";
  }
}
