import type { APIRoute } from "astro";
import { domToPng } from "modern-screenshot";
import { Resvg } from "@resvg/resvg-js";

export const GET: APIRoute = ({ params }) => {
  const { username } = params;

  const svg = `<svg width="300" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="100" fill="black"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24">Hola ${username}</text>
  </svg>`;

  const resvg = new Resvg(svg);
  const pngBuffer = resvg.render().asPng();

  return new Response(pngBuffer, {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
