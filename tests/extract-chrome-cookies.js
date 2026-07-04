/**
 * Extracts Clerk session cookies from Chrome's Profile 28 ("autho")
 * and writes a valid Playwright auth-state.json.
 *
 * Handles Chrome's AES-256-GCM cookie encryption (v10/v11) via DPAPI.
 * Run: node extract-chrome-cookies.js
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, spawnSync } = require("child_process");

const PROFILE = "Profile 28";
const USER_DATA = path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "User Data");
const COOKIES_SRC = path.join(USER_DATA, PROFILE, "Network", "Cookies");
const LOCAL_STATE = path.join(USER_DATA, "Local State");
const COOKIES_TMP = path.join(os.tmpdir(), "chrome-cookies-tmp.sqlite");
const AUTH_FILE = path.join(__dirname, "auth-state.json");

// ── Step 1: copy the Cookies file (Chrome may hold a read lock) ──────────────
console.log("📋 Copying Cookies database...");
try {
  fs.copyFileSync(COOKIES_SRC, COOKIES_TMP);
  console.log("   ✓ Copied to", COOKIES_TMP);
} catch (e) {
  console.error("✗ Could not copy Cookies file:", e.message);
  console.error("  Make sure Chrome is not writing to it. Try closing the autho profile window.");
  process.exit(1);
}

// ── Step 2: get the AES key via PowerShell (DPAPI) ───────────────────────────
console.log("🔑 Decrypting Chrome AES key via DPAPI...");
const localState = JSON.parse(fs.readFileSync(LOCAL_STATE, "utf8"));
const encKeyB64 = localState.os_crypt.encrypted_key;

// PowerShell script: decode base64, strip "DPAPI" prefix, DPAPI-decrypt, output hex
const psScript = `
$b64 = '${encKeyB64}'
$bytes = [Convert]::FromBase64String($b64)
# Chrome prefixes the blob with b"DPAPI" (5 bytes)
$blob = $bytes[5..($bytes.Length - 1)]
Add-Type -AssemblyName System.Security
$key = [System.Security.Cryptography.ProtectedData]::Unprotect($blob, $null, 'CurrentUser')
[Convert]::ToBase64String($key)
`;

const psResult = spawnSync("powershell.exe", ["-NoProfile", "-Command", psScript], {
  encoding: "utf8",
  timeout: 15000,
});

if (psResult.status !== 0) {
  console.error("✗ PowerShell DPAPI failed:", psResult.stderr);
  process.exit(1);
}

const aesKeyB64 = psResult.stdout.trim();
const aesKey = Buffer.from(aesKeyB64, "base64");
console.log(`   ✓ AES key decrypted (${aesKey.length} bytes)`);

// ── Step 3: read the Cookies SQLite and decrypt Clerk cookies ─────────────────
const Database = require("better-sqlite3");
const crypto = require("crypto");

const db = new Database(COOKIES_TMP, { readonly: true, fileMustExist: true });

// Domains we care about
const domains = ["localhost", ".localhost", "evolved-kiwi-85.accounts.dev", ".evolved-kiwi-85.accounts.dev"];
const placeholders = domains.map(() => "?").join(", ");

const rows = db.prepare(
  `SELECT name, value, encrypted_value, host_key, path, expires_utc, is_httponly, is_secure, samesite
   FROM cookies
   WHERE host_key IN (${placeholders})
   ORDER BY host_key, name`
).all(...domains);

db.close();
fs.unlinkSync(COOKIES_TMP);

console.log(`\n🍪 Found ${rows.length} cookies for localhost / Clerk domains`);

function decryptChromeValue(encryptedValue) {
  if (!encryptedValue || encryptedValue.length === 0) return "";

  const buf = Buffer.from(encryptedValue);
  const prefix = buf.slice(0, 3).toString();

  if (prefix !== "v10" && prefix !== "v11") {
    // Old-style unencrypted (rare in modern Chrome)
    return buf.toString("utf8");
  }

  try {
    const nonce = buf.slice(3, 15);        // 12 bytes
    const tag   = buf.slice(buf.length - 16); // last 16 bytes
    const ciphertext = buf.slice(15, buf.length - 16);

    const decipher = crypto.createDecipheriv("aes-256-gcm", aesKey, nonce);
    decipher.setAuthTag(tag);
    return decipher.update(ciphertext, undefined, "utf8") + decipher.final("utf8");
  } catch {
    return null;
  }
}

// Chrome epoch: Jan 1 1601 → Unix epoch Jan 1 1970 (diff = 11644473600 seconds)
function chromeTimeToUnix(chromeTime) {
  if (!chromeTime) return -1;
  return chromeTime / 1_000_000 - 11_644_473_600;
}

const sameSiteMap = { "-1": "None", "0": "None", "1": "Lax", "2": "Strict" };

const playwrightCookies = [];

for (const row of rows) {
  let value = row.value;

  if (!value && row.encrypted_value && row.encrypted_value.length > 0) {
    const decrypted = decryptChromeValue(row.encrypted_value);
    if (decrypted === null) {
      console.log(`  ⚠ Could not decrypt: ${row.name} @ ${row.host_key}`);
      continue;
    }
    value = decrypted;
  }

  const domain = row.host_key.startsWith(".") ? row.host_key.slice(1) : row.host_key;

  playwrightCookies.push({
    name: row.name,
    value: value,
    domain: domain,
    path: row.path || "/",
    expires: chromeTimeToUnix(Number(row.expires_utc)),
    httpOnly: !!row.is_httponly,
    secure: !!row.is_secure,
    sameSite: sameSiteMap[String(row.samesite)] ?? "Lax",
  });

  const clerkNames = ["__clerk", "__session", "__client_uat"];
  const isClerk = clerkNames.some((n) => row.name.includes(n));
  if (isClerk) {
    console.log(`  ${row.name} @ ${row.host_key} = ${value.slice(0, 40)}...`);
  }
}

// ── Step 4: write auth-state.json ────────────────────────────────────────────
const authState = { cookies: playwrightCookies, origins: [] };
fs.writeFileSync(AUTH_FILE, JSON.stringify(authState, null, 2));

console.log(`\n✅ auth-state.json written with ${playwrightCookies.length} cookies`);
console.log("🎯 Run tests: npx playwright test --config=playwright.config.ts\n");
