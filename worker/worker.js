// Cloudflare Worker: menjaga mesin Instabox tetap hidup.
// Dijalankan oleh Cron Trigger. Tiap jalan:
//   running   -> ping keepalive
//   suspended -> POST /resume
//   stopped   -> POST /start
//   lainnya   -> dilewati / dicatat di log

const API = "https://api.instabox.sh/v1";

async function call(env, method, path) {
  const headers = { "X-API-Key": env.INSTABOX_API_KEY };
  if (method === "POST") headers["Idempotency-Key"] = crypto.randomUUID();
  const res = await fetch(API + path, { method, headers });
  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    // body kosong atau bukan JSON
  }
  return { status: res.status, body };
}

async function ping(env) {
  const url = env.KEEPALIVE_URL;
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "instabox-keeper" },
      signal: AbortSignal.timeout(10000),
    });
    console.log(`Keepalive ping: HTTP ${res.status}`);
  } catch (e) {
    console.warn(`Keepalive ping gagal: ${e.message}`);
  }
}

async function keepAlive(env) {
  const id = env.MACHINE_ID;

  const info = await call(env, "GET", `/machines/${id}`);
  if (info.status !== 200) {
    console.error(`Gagal cek mesin: HTTP ${info.status}`, JSON.stringify(info.body?.error ?? info.body));
    return;
  }

  const state = info.body.state;
  console.log(`State mesin: ${state}`);

  let action;
  if (state === "suspended") action = "resume";
  else if (state === "stopped") action = "start";
  else if (state === "running") {
    await ping(env);
    return;
  } else if (["creating", "starting", "resuming", "suspending", "stopping"].includes(state)) {
    console.log(`Sedang transisi (${state}), dicek lagi di jadwal berikutnya.`);
    return;
  } else {
    console.error(`State tidak terduga: ${state} (cek dashboard)`);
    return;
  }

  const res = await call(env, "POST", `/machines/${id}/${action}`);
  const errDetail = res.body?.message || res.body?.error || JSON.stringify(res.body);

  if (res.status === 202) {
    console.log(`${action} diterima, operation ${res.body?.id}`);
  } else if (res.status === 409) {
    // Menangkap pesan spesifik dari Instabox (misal: cooldown 20 menit)
    console.warn(`Operasi ditolak (409): ${errDetail}`);
  } else if (res.status === 429) {
    console.warn("Kuota/cooldown (429), dicoba lagi di jadwal berikutnya.", errDetail);
  } else {
    console.error(`${action} gagal: HTTP ${res.status}`, errDetail);
  }
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(keepAlive(env));
  },

  async fetch() {
    return new Response("instabox-keeper aktif", { status: 200 });
  },
};