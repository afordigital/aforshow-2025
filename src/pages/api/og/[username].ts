import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";

import fs from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import sharp from "sharp";

const handleeRegular = await fs.readFile(
  path.resolve("./public/fonts/Handlee-Regular.ttf"),
);

export const GET: APIRoute = async ({ params, request }) => {
  const username = params.username;
  // Hacemos el SVG dinámico obteniendo texto de los parámetros de la URL

  const svgBorder = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="666"
      height="332"
      fill="none"
      style="position: absolute;"
    >
      <path
        stroke="#1E1E1E"
        stroke-linecap="round"
        stroke-width="3.817"
        d="M34.53 6.332c163.947-6.031 330.089-5.516 598.833 0m-598.833 0c179.741 2.405 359.464 2.148 598.833 0m-598.833 0C17.628 7.898 6.148 19.55 3.99 36.873m30.54-30.54C18.363 3.68 2.273 15.963 3.99 36.873m629.373-30.54c17.016-.257 30.062 9.687 30.539 30.54m-30.539-30.54c17.035 3.58 31.236 10.193 30.539 30.54m0 0c-4.313 103.212-5.373 204.974 0 260.269m0-260.27c-4.552 81.215-4.142 165.656 0 260.27m0 0c-3.626 20.318-7.348 32.114-30.539 30.539m30.539-30.539c-.181 23.677-9.123 31.684-30.539 30.539m0 0c-125.239 1.613-251.89 2.233-598.833 0m598.833 0c-225.932-1.823-452.398-2.147-598.833 0m0 0c-24.174-1.546-27.695-12.187-30.54-30.539m30.54 30.539C13.467 325.409.775 315.379 3.99 297.141m0 0c-4.017-63.817-.562-133.236 0-260.27m0 260.27c2.988-100.121 4.858-200.728 0-260.27"
      />
    </svg>
  `;

  const svgBackground = `url('data:image/svg+xml;base64,${Buffer.from(
    svgBorder,
  ).toString("base64")}')`;

  // 1. Define tu HTML como un string. Puedes usar estilos en línea.
  const htmlTemplate = `
      <div
        style="position: relative; display: flex; width: 666px; height: 332px; background-image: ${svgBackground};font-family: 'Handlee';"
      >

        <div
          style="display: flex; padding: 50px 40px;align-items: flex-start;"
        >
          <div
            style="flex: 0 0 400px; display: flex; gap: 20px; align-items: center;"
          >
          <span
            style="width: 70px; height: 70px; border-radius: 100%; background-color: rgb(0, 0, 0);"
          ></span>
            <h4
              style="font-size: 2rem; margin: 0;"
            >
              ${username}
            </h4>
          </div>
        </div>
      </div>
  `;

  console.log("htmlTemplate", htmlTemplate);

  // 2. Convierte el string de HTML a la estructura que Satori necesita
  const markup = html(htmlTemplate);

  // 3. Usa Satori para generar el SVG
  const svg = await satori(markup as ReactNode, {
    width: 666,
    height: 332,
    fonts: [
      {
        name: "Handlee",
        data: handleeRegular,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(666, 332) // dimensiones OG
    .png()
    .toBuffer();

  // 4. Devuelve el SVG con la cabecera correcta
  return new Response(pngBuffer as any, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
    },
  });
};
