import type { APIRoute } from "astro";
import satori from "satori";
import { html } from "satori-html";

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const handleeRegular = await fs.readFile(
  path.resolve("./public/fonts/Handlee-Regular.ttf"),
);

const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_KEY,
);

export const GET: APIRoute = async ({ params, request }) => {
  const username = params.username;

  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, name, username, avatar_url")
    .eq("username", username)
    .single();

  if (error) {
    throw new Error(`Usuario no encontrado: ${error.message}`);
  }

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

  const starSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M23.5 46.2861C23.5 40.1862 21.0768 34.336 16.7635 30.0227C12.4501 25.7093 6.59998 23.2861 0.5 23.2861C6.59998 23.2861 12.4501 20.8629 16.7635 16.5496C21.0768 12.2363 23.5 6.38611 23.5 0.286133C23.5 6.38611 25.9232 12.2363 30.2365 16.5496C34.5499 20.8629 40.4 23.2861 46.5 23.2861C40.4 23.2861 34.5499 25.7093 30.2365 30.0227C25.9232 34.336 23.5 40.1862 23.5 46.2861Z" fill="url(#paint0_linear_775_169)"/>
      <defs>
        <linearGradient id="paint0_linear_775_169" x1="0.54294" y1="0.28613" x2="46.5429" y2="46.2861" gradientUnits="userSpaceOnUse">
        <stop offset="0.285339" stop-color="#FCAC5E"/>
        <stop offset="0.527327" stop-color="#C779D0"/>
        <stop offset="0.812053" stop-color="#4BC0C8"/>
        </linearGradient>
      </defs>
    </svg>
  `;

  const borderImageSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="76" height="70" viewBox="0 0 76 70" fill="none">
      <path d="M49.6038 3.77451C55.9979 5.51142 62.8405 10.9512 66.8202 16.4196C70.8093 21.8785 73.6342 30.0095 73.5292 36.5658C73.4243 43.1222 70.6089 50.6043 66.2094 55.7673C61.8003 60.9303 53.9938 65.6734 47.1129 67.5439C40.2321 69.4049 31.5762 69.2522 24.9339 66.9809C18.2916 64.7191 10.9241 59.5274 7.2594 53.935C3.59471 48.3425 2.64991 40.1828 2.94576 33.4165C3.25115 26.6502 4.72084 18.5382 9.05357 13.3275C13.3863 8.12633 21.1261 3.4214 28.9326 2.17121C36.7487 0.911468 50.8349 4.69068 55.9311 5.78818C61.0273 6.87613 59.8916 8.22176 59.5099 8.72757M37.1114 1.91353C43.7632 1.08325 51.3216 2.36207 57.1813 6.17946C63.0505 9.9873 69.626 18.6051 72.2981 24.7988C74.9703 30.9925 75.2375 37.4248 73.2047 43.3417C71.1815 49.2682 66.009 56.1204 60.1397 60.3291C54.261 64.5282 45.2138 68.0688 37.9798 68.5746C30.7459 69.0804 22.4717 67.3435 16.7456 63.3448C11.0195 59.3461 6.04738 51.0528 3.6138 44.5824C1.18021 38.1119 -0.0604359 30.3817 2.15365 24.522C4.36773 18.6623 10.8668 13.1557 16.9078 9.42424C22.9584 5.6832 35.2122 3.46912 38.4379 2.11394C41.6636 0.758772 36.2525 0.844664 36.262 1.30275" stroke="#1E1E1E" stroke-width="1.90869" stroke-linecap="round"/>
    </svg>
  `;

  const starBackground = `url('data:image/svg+xml;base64,${Buffer.from(starSvg).toString("base64")}')`;
  const borderImageBackground = `url('data:image/svg+xml;base64,${Buffer.from(borderImageSvg).toString("base64")}')`;

  const month = "SEPT";
  const day = 20;

  // 1. Define tu HTML como un string. Puedes usar estilos en línea.
  const htmlTemplate = `
      <div
        style="position: relative; display: flex; width: 666px; height: 332px; background-image: ${svgBackground}; font-family: 'Handlee'; background-color: #fff; border-radius: 20px;"
      >
        <div style="display: flex; width: 100%; padding: 40px;">
          <div style="flex: 2; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="position: relative; width: 76px; height: 70px; display: flex; align-items: center; justify-content: center;">
                <img src="${user.avatar_url}" alt="${user.name}"
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />
                <div style="position: absolute; display:flex; top: 0; left: 0; width: 76px; height: 70px; background-image: ${borderImageBackground}; background-size: contain; background-repeat: no-repeat; pointer-events: none; z-index: 10;"></div>
              </div>
              <div style="display: flex; flex-direction: column;">
                <h4 style="font-size: 2.3rem; margin: 0; color: #1E1E1E; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;">
                  ${user.name}
                </h4>
                <p style="font-size: 1rem; margin: 4px 0 0;">Ticket #${user.id}</p>
              </div>
            </div>

            <div style="margin-top: 20px; display: flex; flex-direction: column;">
              <div style="font-size: 3.5rem; font-weight: 400; color: #1E1E1E; line-height: 0.9; margin: 0;">
                ${month}
              </div>
              <div style="font-size: 3.5rem; font-weight: 400; color: #1E1E1E; line-height: 0.9; margin: 0;">
                ${day}
              </div>
            </div>
          </div>

          <div style="position: absolute; width: 1px; height: 175px; background-color: #1E1E1E; left: 430px; top: 75px; display: flex"></div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
            <div style="position: absolute; top: -10px; width: 40px; height: 40px; background-image: ${starBackground}; background-size: contain; display: flex;"></div>

            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; gap: 10px;">
              <div style="font-size: 3.2rem; font-weight: 400; color: #1E1E1E; line-height: 0.9; margin: 0;">
                AFOR
              </div>
              <div style="font-size: 3.2rem; font-weight: 400; color: #1E1E1E; line-height: 0.9; margin: 0;">
                SHOW
              </div>
              <div style="font-size: 3.2rem; font-weight: 400; color: #1E1E1E; line-height: 0.9; margin: 0;">
                2025
              </div>
            </div>

            <div style="position: absolute; bottom:  5px; width: 40px; height: 40px; background-image: ${starBackground}; background-size: contain; display: flex;"></div>
          </div>
        </div>
      </div>
  `;

  // 2. Convierte el string de HTML a la estructura que Satori necesita
  const markup = html(htmlTemplate);

  // 3. Usa Satori para generar el SVG
  const svg = await satori(markup, {
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
      "Cache-Control": "public, max-age=3600",
    },
  });
};
