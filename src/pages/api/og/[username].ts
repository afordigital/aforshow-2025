import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";

import fs from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import sharp from "sharp";

const satoshiBold = await fs.readFile(
  path.resolve("./public/fonts/Satoshi-Bold.woff"),
);

export const GET: APIRoute = async ({ params, request }) => {
  const username = params.username;
  // Hacemos el SVG dinámico obteniendo texto de los parámetros de la URL
  const url = new URL(request.url);
  const texto = `Hola ${username}`;

  // 1. Define tu HTML como un string. Puedes usar estilos en línea.
  const htmlTemplate = `
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: #fff;
        font-family: 'Satoshi';
        font-size: 48px;
        color: #111;
        border: 2px solid #333;
        border-radius: 12px;
      "
    >
      ${texto}
    </div>
  `;

  // 2. Convierte el string de HTML a la estructura que Satori necesita
  const markup = html(htmlTemplate);

  // 3. Usa Satori para generar el SVG
  const svg = await satori(markup as ReactNode, {
    width: 600,
    height: 300,
    fonts: [
      {
        name: "Satoshi",
        data: satoshiBold,
        weight: 700,
        style: "normal",
      },
    ],
  });

  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(1200, 630) // dimensiones OG
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
