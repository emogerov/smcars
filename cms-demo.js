import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { DEFAULT_CMS_CONTENT, SUPABASE_ANON_KEY, SUPABASE_URL } from "./cms-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

window.SMCarsSupabaseConfig = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
};

const isLocalDemoHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);

bootstrapCmsContent();

async function bootstrapCmsContent() {
  const heroCopy = document.getElementById("cms-hero-copy");
  const content = await fetchActiveContent();
  const bookings = await fetchPublicBookings();
  if (!content) {
    document.documentElement.classList.remove("cms-hydrating");
    document.documentElement.classList.remove("cms-content-ready");
    if (heroCopy) {
      heroCopy.style.opacity = "1";
      heroCopy.style.visibility = "visible";
    }
    window.SMCarsDemoAPI?.applyPublicBookings(bookings);
    return;
  }
  applyCmsContent(content);
  window.SMCarsDemoAPI?.applyPublicBookings(bookings);
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("cms-hydrating");
    document.documentElement.classList.add("cms-content-ready");
    if (heroCopy) {
      heroCopy.style.opacity = "1";
      heroCopy.style.visibility = "visible";
    }
  });
}

async function fetchActiveContent() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (isLocalDemoHost && session?.access_token) {
      const draftResponse = await fetch(`${SUPABASE_URL}/rest/v1/cms_snapshots?stage=eq.draft&select=content`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (draftResponse.ok) {
        const rows = await draftResponse.json();
        if (rows[0]?.content) return rows[0].content;
      }
    }

    const publishedResponse = await fetch(`${SUPABASE_URL}/rest/v1/cms_snapshots?stage=eq.published&select=content`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!publishedResponse.ok) {
      throw new Error(`HTTP ${publishedResponse.status}`);
    }

    const rows = await publishedResponse.json();
    return rows[0]?.content || null;
  } catch (error) {
    console.error("CMS demo sync failed:", error);
    return null;
  }
}

async function fetchPublicBookings() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_booking_ranges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ p_vehicle_id: null }),
    });

    if (!response.ok) {
      return [];
    }

    const rows = await response.json();
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Booking sync failed:", error);
    return [];
  }
}

function applyCmsContent(content) {
  const lang = document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "bg";
  const settings = content.siteSettings || {};
  const hero = content.hero || {};

  updateHeroTitle(hero.title?.[lang]);
  updateHeroSubtitle(hero.subtitle?.[lang]);
  updateHeroPrice(hero.priceLine?.[lang]);
  updateHeroMedia(hero.media || {});
  updateAddress(settings.address?.[lang]);
  updateMapEmbed(settings.googleMapsEmbedUrl);
  updatePhoneAndEmail(settings.phone, settings.email);
  updateShuttleRoutes(content.shuttleRoutes || [], lang);
  const terms = content.rentalTerms?.[lang];
  const resolvedTerms = shouldUseDefaultTerms(terms) ? DEFAULT_CMS_CONTENT.rentalTerms[lang] || [] : terms || [];
  updateTerms(ensureTermsNumbering(normalizeTermsCurrency(resolvedTerms)));
  window.SMCarsDemoAPI?.applyCmsPublishedContent(content);
}

function updateHeroTitle(text) {
  const target = document.getElementById("cms-hero-title");
  if (!target || !text) return;
  target.innerHTML = `<span class="gold-gradient-text">${escapeHtml(text)}</span>`;
}

function updateHeroSubtitle(text) {
  const target = document.getElementById("cms-hero-subtitle");
  if (!target || !text) return;
  target.textContent = text;
}

function updateHeroPrice(text) {
  const target = document.getElementById("cms-hero-price");
  if (!target || !text) return;
  target.innerHTML = `<span class="gold-gradient-text">${formatHeroPriceLine(text)}</span>`;
}

function formatHeroPriceLine(text) {
  const safe = escapeHtml(text);
  return safe.replace(/(\d+\s*€)/, '<span style="color: white;">$1</span>');
}

function updateHeroMedia(media) {
  const video = document.getElementById("cms-hero-video");
  const source = document.getElementById("cms-hero-video-source");
  const image = document.getElementById("cms-hero-image");
  if (!video || !source || !image) return;

  const type = media.type === "image" ? "image" : "video";
  const videoSrc = resolveDemoAssetPath(media.video);
  const imageSrc = resolveDemoAssetPath(media.image || media.poster);
  const posterSrc = resolveDemoAssetPath(media.poster || media.image);

  if (type === "image") {
    video.classList.add("hidden");
    image.classList.remove("hidden");
    if (imageSrc) {
      image.src = imageSrc;
    }
    return;
  }

  image.classList.add("hidden");
  video.classList.remove("hidden");

  if (posterSrc) {
    video.setAttribute("poster", posterSrc);
  }

  if (videoSrc && source.getAttribute("src") !== videoSrc) {
    source.setAttribute("src", videoSrc);
    video.load();
  }
}

function updateAddress(text) {
  const target = document.getElementById("cms-address");
  if (!target || !text) return;
  target.innerHTML = escapeHtml(text).replace(/\n/g, "<br />");
}

function updateMapEmbed(url) {
  const iframe = document.getElementById("cms-map-embed");
  if (!iframe || !url) return;
  iframe.src = url;
}

function updatePhoneAndEmail(phone, email) {
  if (phone) {
    const href = `tel:${phone.replace(/\s+/g, "")}`;
    document.querySelectorAll("a[href^='tel:']").forEach((link) => {
      link.href = href;
      link.textContent = phone;
    });
  }

  if (email) {
    document.querySelectorAll("a[href^='mailto:']").forEach((link) => {
      const suffix = link.href.includes("?") ? link.href.slice(link.href.indexOf("?")) : "";
      link.href = `mailto:${email}${suffix}`;
      link.textContent = email;
    });
  }
}

function updateShuttleRoutes(routes, lang) {
  const target = document.getElementById("cms-shuttle-routes");
  if (!target || !routes.length) return;

  target.innerHTML = routes
    .map((route) => {
      const airport = route.airport?.[lang] || route.airport?.bg || route.airport?.en || "";
      return `
        <div class="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 md:p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
          <div class="flex items-center gap-4">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <i data-lucide="plane" class="h-5 w-5"></i>
            </div>
            <span class="font-heading font-semibold text-sm md:text-base text-foreground">
              ${escapeHtml(airport)}
            </span>
          </div>
          <span class="shrink-0 font-heading font-bold text-lg md:text-xl text-primary">
            ${escapeHtml(route.price || "")}
          </span>
        </div>
      `;
    })
    .join("");

  window.lucide?.createIcons();
}

function updateTerms(terms) {
  const target = document.getElementById("cms-terms-list");
  if (!target || !terms.length) return;
  target.innerHTML = terms
    .map((item) => `<p class="cms-term-line">${escapeHtml(item)}</p>`)
    .join("");
}

function shouldUseDefaultTerms(items) {
  if (!Array.isArray(items) || items.length < 10) return true;
  return items.every((item) => /^[?\s.€()-]+$/.test(String(item || "")));
}

function normalizeTermsCurrency(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) =>
    String(item || "")
      .replace(/(\d)\?/g, "$1€")
      .replace(/\?\s*(?=\/)/g, "€")
      .replace(/(?<=\d)\s*\?(?=\s|$)/g, "€")
  );
}

function ensureTermsNumbering(items) {
  if (!Array.isArray(items)) return [];
  const hasCustomPrefixes = items.some((item) =>
    /^\s*(\d+(\.\d+)*[.)]|[A-Za-zА-Яа-я][.)]|[IVXLCDM]+[.)])\s+/u.test(String(item || ""))
  );
  if (hasCustomPrefixes) return items;
  return items.map((item, index) => `${index + 1}. ${String(item || "").trim()}`);
}

function resolveDemoAssetPath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const isEn = document.documentElement.lang?.toLowerCase().startsWith("en");
  if (isEn && !raw.startsWith("../")) return `../${raw}`;
  return raw;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
