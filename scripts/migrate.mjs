#!/usr/bin/env node
/**
 * migrate.mjs — corre las migraciones contra tu proyecto Supabase
 *
 * Uso:
 *   node scripts/migrate.mjs <SUPABASE_ACCESS_TOKEN>
 *
 * El token lo obtenés en: https://supabase.com/dashboard/account/tokens
 * (Create new token → copiá el valor → pegalo como argumento)
 */

import { readFileSync } from "node:fs";
import { request }      from "node:https";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "zakvtvlwkojlvhodkgei";
const TOKEN       = process.argv[2];

if (!TOKEN) {
  console.error("❌  Falta el access token.\n");
  console.error("    Uso: node scripts/migrate.mjs <SUPABASE_ACCESS_TOKEN>\n");
  console.error("    Obtené el token en: https://supabase.com/dashboard/account/tokens\n");
  process.exit(1);
}

const __dir = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dir, "..", "supabase", "migrations");

const MIGRATIONS = [
  "001_users.sql",
  "002_listings.sql",
  "003_transactions.sql",
  "004_reviews.sql",
  "005_storage.sql",
  "006_relevance_score.sql",
  "007_mp_user_id.sql",
  "008_admin.sql",
  "009_dni_verification.sql",
  "010_favorites.sql",
  "011_notifications.sql",
];

function runQuery(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const options = {
      hostname: "api.supabase.com",
      path:     `/v1/projects/${PROJECT_REF}/database/query`,
      method:   "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type":  "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`\n🚀  Conectando a proyecto ${PROJECT_REF}...\n`);

  for (const file of MIGRATIONS) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, "utf8");

    process.stdout.write(`  ⏳  ${file} ... `);
    try {
      await runQuery(sql);
      console.log("✅");
    } catch (err) {
      // Ignorar errores de "ya existe" (idempotencia parcial)
      const msg = err.message ?? "";
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate") ||
        msg.includes("ya existe")
      ) {
        console.log("⚠️  ya existía (ok)");
      } else {
        console.log("❌");
        console.error(`\n     Error en ${file}:\n     ${msg}\n`);
        process.exit(1);
      }
    }
  }

  console.log("\n✅  Todas las migraciones aplicadas.\n");
  console.log("   Ahora podés correr el proyecto:");
  console.log("   cd market && npm run dev\n");
}

main();
