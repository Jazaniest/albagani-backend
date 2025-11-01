// functions.js - fungsi untuk mengambil data dari URL
import axios from "axios";
import * as cheerio from "cheerio";

// Fungsi untuk mengubah URL relatif menjadi absolut
const toAbs = (u, base) => {
  if (!u) return null;
  try {
    return new URL(u, base).toString(); 
  } catch {
    return null;
  }
};

// Fungsi untuk mengembalikan tanda backslash yang di-escape menjadi karakter slash
const unescapeSlashes = (u) => (u ? u.replace(/\\\//g, "/") : u);

// Fungsi untuk membersihkan string (menghapus spasi ganda dan memotong)
const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

// Fungsi untuk mengikuti pengalihan (redirect)
export const resolveRedirects = async (startUrl, maxHops = 10) => {
  let url = startUrl;
  for (let i = 0; i < maxHops; i++) {
    const res = await axios.get(url, {
      maxRedirects: 0,
      validateStatus: s => (s >= 200 && s < 300) || (s >= 300 && s < 400),
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
      },
      timeout: 20000,
    });
    if (res.status < 300) return { finalUrl: url, html: res.data };
    const loc = res.headers.location;
    if (!loc) throw new Error("Redirect tanpa Location");
    url = toAbs(loc, url);
  }
  throw new Error("Redirect terlalu banyak");
};

// Fungsi untuk mengambil data dari parameter URL
export const getFromURLParams = (finalUrl) => {
  const out = { title: null, image: null };
  const u = new URL(finalUrl);

  const ogInfo = u.searchParams.get("og_info");
  if (ogInfo) {
    try {
      const obj = JSON.parse(decodeURIComponent(ogInfo));
      if (obj?.title) out.title = clean(obj.title);
      if (obj?.image) out.image = unescapeSlashes(obj.image);
    } catch {console.log("error")}
  }

  const imgKeys = ["image", "img", "img_url", "thumbnail", "thumb", "pic", "cover", "photo", "media", "poster", "preview"];
  for (const k of imgKeys) {
    const v = u.searchParams.get(k);
    if (v) { out.image = unescapeSlashes(decodeURIComponent(v)); break; }
  }

  const tKeys = ["title", "name", "product_title"];
  for (const k of tKeys) {
    const v = u.searchParams.get(k);
    if (v) { out.title = clean(decodeURIComponent(v)); break; }
  }

  return out;
};

// Fungsi untuk mengambil data dari HTML meta
export const getFromHTML = (html, baseUrl) => {
  const $ = cheerio.load(html);
  const pick = (sel, attr = "content") => $(sel).attr(attr) || null;

  const title = clean($("head > title").first().text()) ||
    clean(pick('meta[property="og:title"]')) ||
    clean(pick('meta[name="twitter:title"]')) ||
    null;

  const img = toAbs(pick('meta[property="og:image"]'), baseUrl) ||
    toAbs(pick('meta[property="og:image:url"]'), baseUrl) ||
    toAbs(pick('meta[name="twitter:image"]') || pick('meta[name="twitter:image:src"]'), baseUrl) ||
    toAbs($('link[rel="image_src"]').attr("href"), baseUrl) ||
    toAbs("/favicon.ico", baseUrl) ||
    null;

  return { title, image: img };
};
