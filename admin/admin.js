import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { DEFAULT_CMS_CONTENT, SUPABASE_ANON_KEY, SUPABASE_URL, VEHICLE_IMAGES_BUCKET } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const PRICE_FIELD_MAP = [
  ["24 часа", "price-24h"],
  ["2-6 дена", "price-2-6"],
  ["7-14 дена", "price-7-14"],
  ["14-30 дена", "price-14-30"],
  ["30+ дена", "price-30-plus"],
];

const MAX_BACKUPS = 20;
const ADMIN_THEME_KEY = "admin-theme";

const state = {
  session: null,
  draft: null,
  published: null,
  vehicles: [],
  backups: [],
  vehicleFilter: "all",
  selectedVehicleId: null,
  modalVehicleDraft: null,
  modalMode: "edit",
  hasUnsavedChanges: false,
  isHydrating: false,
};

const elements = {};
let toastTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initAdminTheme();
  bindEvents();
  restoreSession();
});

function cacheElements() {
  elements.authPanel = document.getElementById("auth-panel");
  elements.dashboard = document.getElementById("dashboard");
  elements.sidebarNav = document.getElementById("sidebar-nav");
  elements.sidebarActions = document.getElementById("sidebar-actions");
  elements.loginForm = document.getElementById("login-form");
  elements.loginButton = document.getElementById("login-button");
  elements.logoutButtonSidebar = document.getElementById("logout-button-sidebar");
  elements.saveAllButton = document.getElementById("save-all-button");
  elements.publishButton = document.getElementById("publish-button");
  elements.themeToggleButton = document.getElementById("theme-toggle-button");
  elements.sectionSaveButtons = Array.from(document.querySelectorAll("[data-save-section]"));
  elements.authMessage = document.getElementById("auth-message");
  elements.dashboardMessage = document.getElementById("dashboard-message");
  elements.userEmail = document.getElementById("user-email");
  elements.publishedStatus = document.getElementById("published-status");
  elements.loaderOverlay = document.getElementById("loader-overlay");
  elements.loaderText = document.getElementById("loader-text");
  elements.historyTableBody = document.getElementById("history-table-body");
  elements.makeBackupButton = document.getElementById("make-backup-button");

  elements.companyName = document.getElementById("company-name");
  elements.phone = document.getElementById("phone");
  elements.contactEmail = document.getElementById("contact-email");
  elements.addressBg = document.getElementById("address-bg");
  elements.addressEn = document.getElementById("address-en");
  elements.mapsEmbedUrl = document.getElementById("maps-embed-url");

  elements.heroTitleBg = document.getElementById("hero-title-bg");
  elements.heroTitleEn = document.getElementById("hero-title-en");
  elements.heroSubtitleBg = document.getElementById("hero-subtitle-bg");
  elements.heroSubtitleEn = document.getElementById("hero-subtitle-en");
  elements.heroPriceBg = document.getElementById("hero-price-bg");
  elements.heroPriceEn = document.getElementById("hero-price-en");
  elements.heroMediaType = document.getElementById("hero-media-type");
  elements.heroVideo = document.getElementById("hero-video");
  elements.heroImage = document.getElementById("hero-image");
  elements.heroVideoFile = document.getElementById("hero-video-file");
  elements.heroImageFile = document.getElementById("hero-image-file");
  elements.heroMediaPicker = document.getElementById("hero-media-picker");
  elements.heroMediaPreviewVideo = document.getElementById("hero-media-preview-video");
  elements.heroMediaPreviewImage = document.getElementById("hero-media-preview-image");
  elements.heroMediaPreviewEmpty = document.getElementById("hero-media-preview-empty");
  elements.heroMediaPickerText = document.getElementById("hero-media-picker-text");

  elements.seasonLowSurcharge = document.getElementById("season-low-surcharge");
  elements.seasonLowPeriods = document.getElementById("season-low-periods");
  elements.seasonMiddleSurcharge = document.getElementById("season-middle-surcharge");
  elements.seasonMiddlePeriods = document.getElementById("season-middle-periods");
  elements.seasonHighSurcharge = document.getElementById("season-high-surcharge");
  elements.seasonHighPeriods = document.getElementById("season-high-periods");
  elements.seasonTruckSurcharge = document.getElementById("season-truck-surcharge");
  elements.seasonTruckPeriods = document.getElementById("season-truck-periods");

  elements.shuttleRoutes = document.getElementById("shuttle-routes");
  elements.termsBg = document.getElementById("terms-bg");
  elements.termsEn = document.getElementById("terms-en");

  elements.addVehicleButton = document.getElementById("add-vehicle-button");
  elements.vehicleFilterCategory = document.getElementById("vehicle-filter-category");
  elements.vehicleTableBody = document.getElementById("vehicle-table-body");
  elements.vehicleModal = document.getElementById("vehicle-modal");
  elements.vehicleModalDoneButton = document.getElementById("vehicle-modal-done-button");
  elements.vehicleName = document.getElementById("vehicle-name");
  elements.vehicleMainCategory = document.getElementById("vehicle-main-category");
  elements.vehicleCarClass = document.getElementById("vehicle-car-class");
  elements.vehicleGearbox = document.getElementById("vehicle-gearbox");
  elements.vehicleSeats = document.getElementById("vehicle-seats");
  elements.vehicleFuel = document.getElementById("vehicle-fuel");
  elements.vehicleDeposit = document.getElementById("vehicle-deposit");
  elements.vehicleImage = document.getElementById("vehicle-image");
  elements.vehicleImageFile = document.getElementById("vehicle-image-file");
  elements.vehicleImagePicker = document.getElementById("vehicle-image-picker");
  elements.vehicleImagePreview = document.getElementById("vehicle-image-preview");
  elements.vehicleImagePreviewEmpty = document.getElementById("vehicle-image-preview-empty");
  elements.vehicleSortOrder = document.getElementById("vehicle-sort-order");
  elements.vehicleAvailable = document.getElementById("vehicle-available");
  elements.vehicleLuggageCount = document.getElementById("vehicle-luggage-count");
  elements.vehicleLuggageIcon = document.getElementById("vehicle-luggage-icon");
  elements.vehicleLuggagePlus = document.getElementById("vehicle-luggage-plus");
  elements.deleteVehicleButton = document.getElementById("delete-vehicle-button");

  PRICE_FIELD_MAP.forEach(([, id]) => {
    elements[id] = document.getElementById(id);
  });
}

function bindEvents() {
  elements.loginForm?.addEventListener("submit", handleLogin);
  elements.logoutButtonSidebar?.addEventListener("click", handleLogout);
  elements.saveAllButton?.addEventListener("click", saveDraft);
  elements.publishButton?.addEventListener("click", publishSite);
  elements.themeToggleButton?.addEventListener("click", toggleAdminTheme);
  elements.sectionSaveButtons.forEach((button) => button.addEventListener("click", saveDraft));
  elements.makeBackupButton?.addEventListener("click", createBackup);

  elements.dashboard?.addEventListener("input", handleDraftMutation, true);
  elements.dashboard?.addEventListener("change", handleDraftMutation, true);

  elements.heroMediaType?.addEventListener("change", renderHeroMediaPreview);
  elements.heroMediaPicker?.addEventListener("click", () => {
    if (elements.heroMediaType.value === "video") {
      elements.heroVideoFile.click();
    } else {
      elements.heroImageFile.click();
    }
  });
  elements.heroVideoFile?.addEventListener("change", () => uploadHeroAsset("video"));
  elements.heroImageFile?.addEventListener("change", () => uploadHeroAsset("image"));

  elements.addVehicleButton?.addEventListener("click", startCreateVehicle);
  elements.vehicleFilterCategory?.addEventListener("change", () => {
    state.vehicleFilter = elements.vehicleFilterCategory.value;
    renderVehicleTable();
  });
  elements.vehicleTableBody?.addEventListener("click", handleVehicleTableClick);
  elements.vehicleModalDoneButton?.addEventListener("click", commitVehicleModal);
  elements.deleteVehicleButton?.addEventListener("click", deleteSelectedVehicle);
  elements.vehicleImagePicker?.addEventListener("click", () => elements.vehicleImageFile.click());
  elements.vehicleImageFile?.addEventListener("change", uploadVehicleImage);

  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-vehicle-modal='true']")) {
      closeVehicleModal();
    }

    const restoreButton = event.target.closest("[data-restore-backup-id]");
    if (restoreButton) {
      restoreBackup(restoreButton.getAttribute("data-restore-backup-id"));
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.vehicleModal.classList.contains("hidden")) {
      closeVehicleModal();
    }
  });

  window.addEventListener("beforeunload", handleBeforeUnload);

  bindModalField(elements.vehicleName, "name", syncVehicleName);
  bindModalField(elements.vehicleMainCategory, "mainCategory", handleVehicleCategoryChange);
  bindModalField(elements.vehicleCarClass, "carClass");
  bindModalField(elements.vehicleGearbox, "gearbox", syncGearboxLabel);
  bindModalField(elements.vehicleSeats, "seats");
  bindModalField(elements.vehicleFuel, "fuel");
  bindModalField(elements.vehicleDeposit, "depositText");
  bindModalField(elements.vehicleSortOrder, "sortOrder", null, "number");
  bindModalField(elements.vehicleAvailable, "isAvailable", null, "boolean-select");
  bindModalField(elements.vehicleLuggageCount, "luggage.count", syncLuggage, "number");
  bindModalField(elements.vehicleLuggageIcon, "luggage.icon", syncLuggage);
  bindModalField(elements.vehicleLuggagePlus, "luggage.withPlus", syncLuggage, "boolean-select");

  PRICE_FIELD_MAP.forEach(([label, id], index) => {
    elements[id]?.addEventListener("input", () => {
      if (!state.modalVehicleDraft) return;
      state.modalVehicleDraft.prices[index].label = label;
      state.modalVehicleDraft.prices[index].value = elements[id].value.trim();
    });
  });

  supabase.auth.onAuthStateChange((event, session) => {
    const previousEmail = state.session?.user?.email || null;
    state.session = session;
    updateAuthUI();

    if (event === "SIGNED_OUT") {
      resetState();
      return;
    }

    if (event === "SIGNED_IN" && session && previousEmail !== session.user?.email) {
      loadSnapshots({ silent: true });
    }
  });
}

function bindModalField(element, path, callback = null, type = "text") {
  if (!element) return;
  element.addEventListener(type === "checkbox" || type === "boolean-select" ? "change" : "input", () => {
    if (!state.modalVehicleDraft) return;
    const value =
      type === "checkbox"
        ? element.checked
        : type === "boolean-select"
          ? element.value === "true"
          : type === "number"
            ? Number(element.value || 0)
            : element.value.trim();
    setNestedValue(state.modalVehicleDraft, path, value);
    if (callback) callback(state.modalVehicleDraft);
  });
}

async function restoreSession() {
  setLoading(true, "Проверка на достъпа...");

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      showAuthMessage(`Грешка при проверка на сесията: ${error.message}`, true);
      return;
    }

    state.session = data.session;
    updateAuthUI();

    if (state.session) {
      await loadSnapshots();
    } else {
      showAuthMessage("Очаква вход.", false);
    }
  } finally {
    setLoading(false);
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAuthMessage("Въведи имейл и парола.", true);
    return;
  }

  elements.loginButton.disabled = true;
  setLoading(true, "Влизане...");
  showAuthMessage("Проверка на данните...", false);

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showAuthMessage(`Неуспешен вход: ${error.message}`, true);
      return;
    }
    showAuthMessage("Успешен вход.", false);
  } finally {
    elements.loginButton.disabled = false;
    setLoading(false);
  }
}

async function handleLogout() {
  setLoading(true, "Изход...");
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showToast(`Неуспешен изход: ${error.message}`, true);
      return;
    }
    showToast("Излезе успешно.", false);
  } finally {
    setLoading(false);
  }
}

function updateAuthUI() {
  const loggedIn = Boolean(state.session);
  elements.authPanel.classList.toggle("hidden", loggedIn);
  elements.dashboard.classList.toggle("hidden", !loggedIn);
  elements.sidebarNav.classList.toggle("hidden", !loggedIn);
  elements.sidebarActions.classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    elements.userEmail.textContent = state.session.user.email || "-";
  }
}

async function loadSnapshots(options = {}) {
  if (!state.session) return;
  const { silent = false } = options;

  if (!silent) {
    setLoading(true, "Зареждане на данните...");
  }

  try {
    const [snapshotsResult] = await Promise.all([
      supabase
        .from("cms_snapshots")
        .select("stage, content, revision, updated_at, updated_by, published_at, published_by")
        .in("stage", ["draft", "published"]),
    ]);

    if (snapshotsResult.error) {
      showToast(`Неуспешно зареждане: ${snapshotsResult.error.message}`, true);
      return;
    }

    state.draft = snapshotsResult.data.find((entry) => entry.stage === "draft") || null;
    state.published = snapshotsResult.data.find((entry) => entry.stage === "published") || null;

    if (!state.draft) {
      showToast("Липсва чернова. Необходимо е първоначално инициализиране.", true);
      renderSnapshotState();
      renderBackups([]);
      return;
    }

    const mergedContent = mergeWithDefaults(state.draft.content || {});
    state.vehicles = mergedContent.vehicles.map(normalizeVehicle);
    state.backups = Array.isArray(mergedContent.backups) ? mergedContent.backups : [];
    state.vehicleFilter = "all";
    elements.vehicleFilterCategory.value = "all";
    hydrateForms(mergedContent);
    renderSnapshotState();
    renderBackups(state.backups);
    renderVehicleTable();
  } finally {
    if (!silent) {
      setLoading(false);
    }
  }
}

function mergeWithDefaults(content) {
  const merged = {
    ...structuredClone(DEFAULT_CMS_CONTENT),
    ...content,
    backups: Array.isArray(content.backups) ? content.backups : [],
    categories:
      Array.isArray(content.categories) && content.categories.length
        ? content.categories
        : structuredClone(DEFAULT_CMS_CONTENT.categories),
    carClasses:
      Array.isArray(content.carClasses) && content.carClasses.length
        ? content.carClasses
        : structuredClone(DEFAULT_CMS_CONTENT.carClasses),
    siteSettings: {
      ...structuredClone(DEFAULT_CMS_CONTENT.siteSettings),
      ...(content.siteSettings || {}),
      address: {
        ...structuredClone(DEFAULT_CMS_CONTENT.siteSettings.address),
        ...(content.siteSettings?.address || {}),
      },
    },
    hero: {
      ...structuredClone(DEFAULT_CMS_CONTENT.hero),
      ...(content.hero || {}),
      title: {
        ...structuredClone(DEFAULT_CMS_CONTENT.hero.title),
        ...(content.hero?.title || {}),
      },
      subtitle: {
        ...structuredClone(DEFAULT_CMS_CONTENT.hero.subtitle),
        ...(content.hero?.subtitle || {}),
      },
      priceLine: {
        ...structuredClone(DEFAULT_CMS_CONTENT.hero.priceLine),
        ...(content.hero?.priceLine || {}),
      },
      media: {
        ...structuredClone(DEFAULT_CMS_CONTENT.hero.media),
        ...(content.hero?.media || {}),
      },
    },
    rentalTerms: {
      ...structuredClone(DEFAULT_CMS_CONTENT.rentalTerms),
      ...(content.rentalTerms || {}),
    },
    seasonalRules:
      Array.isArray(content.seasonalRules) && content.seasonalRules.length
        ? content.seasonalRules
        : structuredClone(DEFAULT_CMS_CONTENT.seasonalRules),
    shuttleRoutes:
      Array.isArray(content.shuttleRoutes) && content.shuttleRoutes.length
        ? content.shuttleRoutes
        : structuredClone(DEFAULT_CMS_CONTENT.shuttleRoutes),
    vehicles:
      Array.isArray(content.vehicles) && content.vehicles.length
        ? content.vehicles
        : structuredClone(DEFAULT_CMS_CONTENT.vehicles),
  };

  if (isBrokenBulgarianTerms(merged.rentalTerms?.bg)) {
    merged.rentalTerms.bg = structuredClone(DEFAULT_CMS_CONTENT.rentalTerms.bg);
  }

  if (isBrokenBulgarianTerms(merged.rentalTerms?.en, false)) {
    merged.rentalTerms.en = structuredClone(DEFAULT_CMS_CONTENT.rentalTerms.en);
  }

  merged.rentalTerms.bg = ensureTermsNumbering(normalizeTermsCurrency(merged.rentalTerms.bg));
  merged.rentalTerms.en = ensureTermsNumbering(normalizeTermsCurrency(merged.rentalTerms.en));

  return merged;
}

function isBrokenBulgarianTerms(items, requireCyrillic = true) {
  if (!Array.isArray(items) || items.length < 10) return true;
  const joined = items.join(" ");
  if (joined.includes("???")) return true;
  if (requireCyrillic && !/[А-Яа-я]/.test(joined)) return true;
  return false;
}

function renderSnapshotState() {
  elements.publishedStatus.textContent = formatPublishedLabel(state.published);
}

function formatPublishedLabel(snapshot) {
  if (!snapshot || !snapshot.published_at) return "Няма публикувана версия";
  return new Date(snapshot.published_at).toLocaleString("bg-BG");
}

function hydrateForms(content) {
  state.isHydrating = true;

  elements.companyName.value = content.siteSettings?.companyName || "";
  elements.phone.value = content.siteSettings?.phone || "";
  elements.contactEmail.value = content.siteSettings?.email || "";
  elements.addressBg.value = content.siteSettings?.address?.bg || "";
  elements.addressEn.value = content.siteSettings?.address?.en || "";
  elements.mapsEmbedUrl.value = content.siteSettings?.googleMapsEmbedUrl || "";

  elements.heroTitleBg.value = content.hero?.title?.bg || "";
  elements.heroTitleEn.value = content.hero?.title?.en || "";
  elements.heroSubtitleBg.value = content.hero?.subtitle?.bg || "";
  elements.heroSubtitleEn.value = content.hero?.subtitle?.en || "";
  elements.heroPriceBg.value = content.hero?.priceLine?.bg || "";
  elements.heroPriceEn.value = content.hero?.priceLine?.en || "";
  elements.heroMediaType.value = content.hero?.media?.type || "video";
  elements.heroVideo.value = content.hero?.media?.video || "";
  elements.heroImage.value = content.hero?.media?.image || content.hero?.media?.poster || "";
  renderHeroMediaPreview();

  hydrateSeasonalRules(content.seasonalRules || []);
  elements.shuttleRoutes.value = serializeRoutes(content.shuttleRoutes || []);
  elements.termsBg.value = (content.rentalTerms?.bg || []).join("\n");
  elements.termsEn.value = (content.rentalTerms?.en || []).join("\n");

  state.isHydrating = false;
  state.hasUnsavedChanges = false;
}

function buildDraftContent() {
  const base = mergeWithDefaults(state.draft?.content || {});

  base.siteSettings = {
    ...(base.siteSettings || {}),
    companyName: elements.companyName.value.trim(),
    phone: elements.phone.value.trim(),
    email: elements.contactEmail.value.trim(),
    address: {
      bg: elements.addressBg.value.trim(),
      en: elements.addressEn.value.trim(),
    },
    googleMapsEmbedUrl: elements.mapsEmbedUrl.value.trim(),
  };

  base.hero = {
    ...(base.hero || {}),
    title: {
      bg: elements.heroTitleBg.value.trim(),
      en: elements.heroTitleEn.value.trim(),
    },
    subtitle: {
      bg: elements.heroSubtitleBg.value.trim(),
      en: elements.heroSubtitleEn.value.trim(),
    },
    priceLine: {
      bg: elements.heroPriceBg.value.trim(),
      en: elements.heroPriceEn.value.trim(),
    },
    media: {
      type: elements.heroMediaType.value,
      video: elements.heroVideo.value.trim(),
      image: elements.heroImage.value.trim(),
      poster: elements.heroImage.value.trim(),
    },
  };

  base.seasonalRules = collectSeasonalRules();
  base.shuttleRoutes = parseRoutes(elements.shuttleRoutes.value);
  base.rentalTerms = {
    bg: ensureTermsNumbering(normalizeTermsCurrency(splitTermsLines(elements.termsBg.value))),
    en: ensureTermsNumbering(normalizeTermsCurrency(splitTermsLines(elements.termsEn.value))),
  };
  base.vehicles = state.vehicles
    .map((vehicle) => normalizeVehicle(vehicle))
    .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

  return base;
}

async function saveDraft() {
  if (!state.session) return;

  const saved = await persistDraft({
    nextRevision: (state.draft?.revision || 0) + 1,
    showSuccessToast: "Промените са запазени.",
    loadingText: "Запазване...",
  });

  if (saved) {
    await loadSnapshots();
  }
}

async function persistDraft({ nextRevision, showSuccessToast, loadingText }) {
  if (!state.session) return false;

  const nextContent = buildDraftContent();
  nextContent.backups = state.backups;

  setLoading(true, loadingText);
  toggleSaveButtons(true);

  try {
    const { error } = await supabase
      .from("cms_snapshots")
      .update({
        content: nextContent,
        revision: nextRevision,
        updated_at: new Date().toISOString(),
        updated_by: state.session.user.email,
      })
      .eq("stage", "draft");

    if (error) {
      showToast(`Неуспешно записване: ${error.message}`, true);
      return false;
    }

    await supabase.from("cms_change_log").insert({
      event_type: "draft_saved",
      stage: "draft",
      actor_email: state.session.user.email,
      summary: `Запазена чернова, ревизия ${nextRevision}`,
    });

    if (showSuccessToast) {
      showToast(showSuccessToast, false);
    }
    return true;
  } finally {
    toggleSaveButtons(false);
    setLoading(false);
  }
}

async function publishSite() {
  if (!state.session) return;

  const nextRevision = (state.draft?.revision || 0) + 1;
  const saved = await persistDraft({
    nextRevision,
    showSuccessToast: "",
    loadingText: "Подготовка за публикуване...",
  });

  if (!saved) return;

  setLoading(true, "Публикуване...");
  toggleSaveButtons(true);

  try {
    const { error } = await supabase.rpc("publish_cms_draft");
    if (error) {
      showToast(`Неуспешно публикуване: ${error.message}`, true);
      return;
    }

    showToast("Промените са публикувани.", false);
    await loadSnapshots();
  } finally {
    toggleSaveButtons(false);
    setLoading(false);
  }
}

function stripBackups(content) {
  const clone = structuredClone(content);
  delete clone.backups;
  return clone;
}

async function createBackup() {
  if (!state.session || !state.draft) return;

  const currentContent = mergeWithDefaults(state.draft.content || {});
  const nextRevision = state.draft.revision || 1;
  const backupEntry = {
    id: `backup-${Date.now()}`,
    savedAt: new Date().toISOString(),
    savedBy: state.session.user.email,
    revision: nextRevision,
    content: stripBackups(currentContent),
  };

  const nextContent = {
    ...currentContent,
    backups: [backupEntry, ...state.backups].slice(0, MAX_BACKUPS),
  };

  setLoading(true, "Създаване на архив...");
  elements.makeBackupButton.disabled = true;

  try {
    const { error } = await supabase
      .from("cms_snapshots")
      .update({
        content: nextContent,
        updated_at: new Date().toISOString(),
        updated_by: state.session.user.email,
      })
      .eq("stage", "draft");

    if (error) {
      showToast(`Неуспешно създаване на архив: ${error.message}`, true);
      return;
    }

    await supabase.from("cms_change_log").insert({
      event_type: "draft_saved",
      stage: "draft",
      actor_email: state.session.user.email,
      summary: `Създаден архив за ревизия ${nextRevision}`,
    });

    showToast("Архивът е създаден.", false);
    await loadSnapshots();
  } finally {
    elements.makeBackupButton.disabled = false;
    setLoading(false);
  }
}

async function restoreBackup(backupId) {
  if (!state.session || !backupId) return;

  const backup = state.backups.find((entry) => entry.id === backupId);
  if (!backup) return;

  const nextRevision = (state.draft?.revision || 0) + 1;
  const currentContent = mergeWithDefaults(state.draft?.content || {});
  const restored = mergeWithDefaults(backup.content || {});
  restored.backups = [
    {
      id: `backup-${Date.now()}`,
      savedAt: new Date().toISOString(),
      savedBy: state.session.user.email,
      revision: state.draft?.revision || 1,
      content: stripBackups(currentContent),
    },
    ...state.backups.filter((entry) => entry.id !== backupId),
  ].slice(0, MAX_BACKUPS);

  setLoading(true, "Възстановяване на архив...");
  try {
    const { error } = await supabase
      .from("cms_snapshots")
      .update({
        content: restored,
        revision: nextRevision,
        updated_at: new Date().toISOString(),
        updated_by: state.session.user.email,
      })
      .eq("stage", "draft");

    if (error) {
      showToast(`Неуспешно възстановяване: ${error.message}`, true);
      return;
    }

    await supabase.from("cms_change_log").insert({
      event_type: "draft_saved",
      stage: "draft",
      actor_email: state.session.user.email,
      summary: `Възстановен архив, ревизия ${nextRevision}`,
    });

    showToast("Архивът е възстановен.", false);
    await loadSnapshots();
  } finally {
    setLoading(false);
  }
}

function toggleSaveButtons(disabled) {
  elements.saveAllButton.disabled = disabled;
  if (elements.publishButton) {
    elements.publishButton.disabled = disabled;
  }
  elements.sectionSaveButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function renderBackups(backups) {
  if (!elements.historyTableBody) return;

  const items = Array.isArray(backups) ? backups : [];
  if (!items.length) {
    elements.historyTableBody.innerHTML = `
      <tr>
        <td colspan="4" class="history-empty">Все още няма архиви.</td>
      </tr>
    `;
    return;
  }

  elements.historyTableBody.innerHTML = items
    .map((backup) => `
      <tr>
        <td>${escapeHtml(new Date(backup.savedAt).toLocaleString("bg-BG"))}</td>
        <td>${escapeHtml(backup.savedBy || "-")}</td>
        <td>${escapeHtml(String(backup.revision || "-"))}</td>
        <td><button type="button" class="button button-secondary" data-restore-backup-id="${backup.id}">Възстанови</button></td>
      </tr>
    `)
    .join("");
}

async function uploadHeroAsset(kind) {
  const fileMap = {
    video: elements.heroVideoFile,
    image: elements.heroImageFile,
  };

  const file = fileMap[kind]?.files?.[0];
  if (!file) return;

  const extension = getFileExtension(file.name);
  const objectPath = `hero/${slugify(`${kind}-${Date.now()}.${extension}`)}`;

  setLoading(true, "Качване на файл...");
  try {
    const { error } = await supabase.storage.from(VEHICLE_IMAGES_BUCKET).upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      showToast(`Неуспешно качване: ${error.message}`, true);
      return;
    }

    const { data } = supabase.storage.from(VEHICLE_IMAGES_BUCKET).getPublicUrl(objectPath);
    const url = data?.publicUrl || "";
    if (kind === "video") elements.heroVideo.value = url;
    if (kind === "image") elements.heroImage.value = url;
    fileMap[kind].value = "";
    renderHeroMediaPreview();
    showToast("Файлът е качен успешно.", false);
  } finally {
    setLoading(false);
  }
}

function renderHeroMediaPreview() {
  const type = elements.heroMediaType.value;
  const videoSrc = resolveAdminAssetPath(elements.heroVideo.value.trim());
  const imageSrc = resolveAdminAssetPath(elements.heroImage.value.trim());

  elements.heroMediaPreviewVideo.classList.add("hidden");
  elements.heroMediaPreviewImage.classList.add("hidden");
  elements.heroMediaPreviewEmpty.classList.add("hidden");
  elements.heroMediaPreviewVideo.pause();
  elements.heroMediaPreviewVideo.removeAttribute("src");
  elements.heroMediaPreviewImage.removeAttribute("src");

  elements.heroMediaPickerText.textContent = type === "video" ? "Смени видеото" : "Смени изображението";

  if (type === "video" && videoSrc) {
    elements.heroMediaPreviewVideo.src = videoSrc;
    elements.heroMediaPreviewVideo.classList.remove("hidden");
    return;
  }

  if (type === "image" && imageSrc) {
    elements.heroMediaPreviewImage.src = imageSrc;
    elements.heroMediaPreviewImage.classList.remove("hidden");
    return;
  }

  elements.heroMediaPreviewEmpty.classList.remove("hidden");
}

function startCreateVehicle() {
  const nextOrder = state.vehicles.reduce((max, vehicle) => Math.max(max, Number(vehicle.sortOrder) || 0), 0) + 1;
  const category = state.vehicleFilter === "all" ? "car" : state.vehicleFilter;
  const draft = normalizeVehicle({
    id: `vehicle-${Date.now()}`,
    brand: "",
    model: "",
    name: "",
    mainCategory: category,
    carClass: category === "car" ? "low" : "",
    gearbox: category === "motor" ? "automatic" : "manual",
    seats: category === "motor" ? "1+1" : "4+1",
    fuel: "",
    depositText: "",
    sortOrder: nextOrder,
    isAvailable: true,
    image: "",
    luggage: {
      count: category === "truck" ? 4 : 2,
      icon: category === "truck" ? "barrel" : "briefcase",
      sizeClass: category === "truck" ? "w-5 h-5" : "w-4 h-4",
      withPlus: false,
    },
    prices: PRICE_FIELD_MAP.map(([label]) => ({ label, value: "" })),
  });

  state.modalMode = "create";
  state.modalVehicleDraft = draft;
  state.selectedVehicleId = null;
  fillVehicleModal(draft);
  openVehicleModal();
}

function handleVehicleTableClick(event) {
  const trigger = event.target.closest("[data-vehicle-id]");
  if (!trigger) return;
  const vehicleId = trigger.getAttribute("data-vehicle-id");
  const action = trigger.getAttribute("data-action");

  if (action === "edit") {
    openVehicleForEdit(vehicleId);
  } else if (action === "remove") {
    removeVehicle(vehicleId);
  }
}

function openVehicleForEdit(vehicleId) {
  const vehicle = state.vehicles.find((entry) => entry.id === vehicleId);
  if (!vehicle) return;

  state.modalMode = "edit";
  state.selectedVehicleId = vehicleId;
  state.modalVehicleDraft = structuredClone(normalizeVehicle(vehicle));
  fillVehicleModal(state.modalVehicleDraft);
  openVehicleModal();
}

function openVehicleModal() {
  elements.vehicleModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeVehicleModal() {
  elements.vehicleModal.classList.add("hidden");
  document.body.style.overflow = "";
  state.modalVehicleDraft = null;
}

function fillVehicleModal(vehicle) {
  elements.vehicleName.value = vehicle.name || getVehicleDisplayName(vehicle);
  elements.vehicleMainCategory.value = vehicle.mainCategory || "car";
  elements.vehicleCarClass.value = vehicle.carClass || "";
  elements.vehicleGearbox.value = vehicle.gearbox || "manual";
  elements.vehicleSeats.value = vehicle.seats || "";
  elements.vehicleFuel.value = vehicle.fuel || "";
  elements.vehicleDeposit.value = vehicle.depositText || "";
  elements.vehicleImage.value = vehicle.image || "";
  elements.vehicleSortOrder.value = vehicle.sortOrder || 0;
  elements.vehicleAvailable.value = String(vehicle.isAvailable !== false);
  elements.vehicleLuggageCount.value = vehicle.luggage?.count || 0;
  elements.vehicleLuggageIcon.value = vehicle.luggage?.icon || "briefcase";
  elements.vehicleLuggagePlus.value = String(Boolean(vehicle.luggage?.withPlus));

  PRICE_FIELD_MAP.forEach(([label, id], index) => {
    const row = vehicle.prices[index] || { label, value: "" };
    elements[id].value = row.value || "";
  });

  toggleCarClassField(vehicle.mainCategory);
  updateVehicleImagePreview(vehicle.image);
}

function commitVehicleModal() {
  if (!state.modalVehicleDraft) return;

  const prepared = normalizeVehicle(state.modalVehicleDraft);
  if (state.modalMode === "create") {
    state.vehicles.push(prepared);
    state.selectedVehicleId = prepared.id;
  } else {
    const index = state.vehicles.findIndex((entry) => entry.id === state.selectedVehicleId);
    if (index !== -1) {
      state.vehicles[index] = prepared;
    }
  }

  renderVehicleTable();
  closeVehicleModal();
}

function removeVehicle(vehicleId) {
  state.vehicles = state.vehicles.filter((vehicle) => vehicle.id !== vehicleId);
  if (state.selectedVehicleId === vehicleId) {
    closeVehicleModal();
    state.selectedVehicleId = null;
  }
  renderVehicleTable();
}

function deleteSelectedVehicle() {
  if (!state.modalVehicleDraft) return;
  const targetId = state.modalMode === "create" ? state.modalVehicleDraft.id : state.selectedVehicleId;
  if (!targetId) return;
  removeVehicle(targetId);
}

async function uploadVehicleImage() {
  if (!state.modalVehicleDraft) return;
  const file = elements.vehicleImageFile.files?.[0];
  if (!file) return;

  const extension = getFileExtension(file.name);
  const objectPath = `${state.modalVehicleDraft.mainCategory || "misc"}/${slugify(`${state.modalVehicleDraft.name || "vehicle"}-${Date.now()}.${extension}`)}`;

  setLoading(true, "Качване на изображение...");
  try {
    const { error } = await supabase.storage.from(VEHICLE_IMAGES_BUCKET).upload(objectPath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) {
      showToast(`Неуспешно качване: ${error.message}`, true);
      return;
    }

    const { data } = supabase.storage.from(VEHICLE_IMAGES_BUCKET).getPublicUrl(objectPath);
    const publicUrl = data?.publicUrl || "";
    state.modalVehicleDraft.image = publicUrl;
    elements.vehicleImage.value = publicUrl;
    elements.vehicleImageFile.value = "";
    updateVehicleImagePreview(publicUrl);
    showToast("Изображението е качено успешно.", false);
  } finally {
    setLoading(false);
  }
}

function renderVehicleTable() {
  const filtered = [...state.vehicles]
    .filter((vehicle) => state.vehicleFilter === "all" || vehicle.mainCategory === state.vehicleFilter)
    .sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0));

  if (!filtered.length) {
    elements.vehicleTableBody.innerHTML = `
      <tr>
        <td colspan="3" class="history-empty">Няма налични записи.</td>
      </tr>
    `;
    return;
  }

  elements.vehicleTableBody.innerHTML = filtered
    .map((vehicle) => {
      const available = vehicle.isAvailable !== false;
      return `
        <tr>
          <td>${escapeHtml(getVehicleDisplayName(vehicle))}</td>
          <td>
            <span class="status-badge ${available ? "is-available" : "is-hidden"}">
              ${available ? "✔" : "✖"} ${available ? "Наличен" : "Скрит"}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button type="button" class="button button-secondary" data-action="edit" data-vehicle-id="${vehicle.id}">Редактирай</button>
              <button type="button" class="button button-danger" data-action="remove" data-vehicle-id="${vehicle.id}">Премахни</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function getVehicleDisplayName(vehicle) {
  if (vehicle.name) return String(vehicle.name).trim();
  return [vehicle.brand, vehicle.model].filter(Boolean).join(" ").trim();
}

function syncVehicleName(vehicle) {
  const name = String(vehicle.name || "").trim();
  const [brand, ...rest] = name.split(/\s+/);
  vehicle.brand = brand || "";
  vehicle.model = rest.join(" ");
}

function handleVehicleCategoryChange(vehicle) {
  if (vehicle.mainCategory !== "car") {
    vehicle.carClass = "";
  } else if (!vehicle.carClass) {
    vehicle.carClass = "low";
  }

  if (vehicle.mainCategory === "truck") {
    vehicle.luggage.icon = "barrel";
  }

  if (vehicle.mainCategory === "motor") {
    vehicle.gearbox = "automatic";
    vehicle.gearboxLabel = "Автоматик";
  }

  toggleCarClassField(vehicle.mainCategory);
}

function syncGearboxLabel(vehicle) {
  vehicle.gearboxLabel = vehicle.gearbox === "automatic" ? "Автоматик" : "Ръчна";
}

function syncLuggage(vehicle) {
  if (!vehicle.luggage) vehicle.luggage = {};
  vehicle.luggage.sizeClass = deriveLuggageSize(vehicle.luggage.icon);
}

function toggleCarClassField(mainCategory) {
  const field = elements.vehicleCarClass.closest(".field");
  if (!field) return;
  field.classList.toggle("hidden", mainCategory !== "car");
}

function normalizeVehicle(vehicle) {
  const normalized = structuredClone(vehicle);
  normalized.id = normalized.id || `vehicle-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  normalized.sortOrder = Number(normalized.sortOrder || 0);
  normalized.isAvailable = normalized.isAvailable !== false;
  normalized.gearbox = normalized.gearbox || "manual";
  normalized.gearboxLabel = normalized.gearbox === "automatic" ? "Автоматик" : "Ръчна";
  normalized.depositText = normalized.depositText || "";
  normalized.name = getVehicleDisplayName(normalized);
  normalized.luggage = {
    count: Number(normalized.luggage?.count || 0),
    icon: normalized.luggage?.icon || "briefcase",
    sizeClass: normalized.luggage?.sizeClass || deriveLuggageSize(normalized.luggage?.icon || "briefcase"),
    withPlus: Boolean(normalized.luggage?.withPlus),
  };
  normalized.prices = PRICE_FIELD_MAP.map(([label], index) => ({
    label,
    value: normalized.prices?.[index]?.value || normalized.prices?.find((entry) => entry.label === label)?.value || "",
  }));
  return normalized;
}

function hydrateSeasonalRules(rules) {
  const byKey = Object.fromEntries(rules.map((rule) => [rule.key, rule]));
  setSeasonalRuleFields("low", byKey.low);
  setSeasonalRuleFields("middle", byKey.middle);
  setSeasonalRuleFields("high", byKey.high);
  setSeasonalRuleFields("truck", byKey.truck);
}

function setSeasonalRuleFields(key, rule) {
  const surchargeField = elements[`season${capitalize(key)}Surcharge`];
  const periodsField = elements[`season${capitalize(key)}Periods`];
  if (!surchargeField || !periodsField) return;
  surchargeField.value = Number(rule?.surchargePerDay || 0);
  periodsField.value = Array.isArray(rule?.periods) ? rule.periods.join("\n") : "";
}

function collectSeasonalRules() {
  return [
    buildSeasonalRule("low", "Нисък клас"),
    buildSeasonalRule("middle", "Среден клас"),
    buildSeasonalRule("high", "Висок клас"),
    buildSeasonalRule("truck", "Товарни"),
  ];
}

function buildSeasonalRule(key, label) {
  const surchargeField = elements[`season${capitalize(key)}Surcharge`];
  const periodsField = elements[`season${capitalize(key)}Periods`];
  return {
    key,
    label,
    surchargePerDay: Number(surchargeField?.value || 0),
    periods: splitLines(periodsField?.value || ""),
  };
}

function updateVehicleImagePreview(imagePath) {
  const src = resolveAdminAssetPath(String(imagePath || "").trim());
  if (!src) {
    elements.vehicleImagePreview.classList.add("hidden");
    elements.vehicleImagePreview.removeAttribute("src");
    elements.vehicleImagePreviewEmpty.classList.remove("hidden");
    return;
  }

  elements.vehicleImagePreview.src = src;
  elements.vehicleImagePreview.classList.remove("hidden");
  elements.vehicleImagePreviewEmpty.classList.add("hidden");
}

function deriveLuggageSize(icon) {
  if (icon === "barrel") return "w-5 h-5";
  if (icon === "shopping-bag") return "w-3.5 h-3.5";
  return "w-4 h-4";
}

function setNestedValue(target, path, value) {
  const segments = path.split(".");
  let cursor = target;
  while (segments.length > 1) {
    const key = segments.shift();
    if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
    cursor = cursor[key];
  }
  cursor[segments[0]] = value;
}

function serializeRoutes(routes) {
  return routes
    .map((route) => `${route.airport?.bg || ""} | ${route.airport?.en || ""} | ${route.price || ""}`)
    .join("\n");
}

function parseRoutes(text) {
  return splitLines(text).map((line) => {
    const [bg = "", en = "", price = ""] = line.split("|").map((entry) => entry.trim());
    return {
      airport: { bg, en },
      price,
    };
  });
}

function splitLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function splitTermsLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim().length > 0);
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

function handleDraftMutation(event) {
  if (state.isHydrating || !state.session) return;
  if (!event.target.closest("#dashboard") && !event.target.closest("#vehicle-modal")) return;
  state.hasUnsavedChanges = true;
}

function handleBeforeUnload(event) {
  if (!state.hasUnsavedChanges) return;
  event.preventDefault();
  event.returnValue = "";
}

function initAdminTheme() {
  const savedTheme = localStorage.getItem(ADMIN_THEME_KEY);
  setAdminTheme(savedTheme === "dark" ? "dark" : "light");
}

function toggleAdminTheme() {
  const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
  setAdminTheme(nextTheme);
}

function setAdminTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("theme-light", isLight);
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  localStorage.setItem(ADMIN_THEME_KEY, isLight ? "light" : "dark");
  if (elements.themeToggleButton) {
    const sun = elements.themeToggleButton.querySelector(".theme-icon-sun");
    const moon = elements.themeToggleButton.querySelector(".theme-icon-moon");
    sun?.classList.toggle("hidden", !isLight);
    moon?.classList.toggle("hidden", isLight);
  }
}

function resetState() {
  state.draft = null;
  state.published = null;
  state.vehicles = [];
  state.backups = [];
  state.vehicleFilter = "all";
  state.selectedVehicleId = null;
  state.modalVehicleDraft = null;
  state.hasUnsavedChanges = false;
  state.isHydrating = false;
  resetForms();
}

function resetForms() {
  hydrateForms(DEFAULT_CMS_CONTENT);
  state.vehicles = structuredClone(DEFAULT_CMS_CONTENT.vehicles).map(normalizeVehicle);
  state.backups = [];
  state.vehicleFilter = "all";
  elements.vehicleFilterCategory.value = "all";
  renderVehicleTable();
  renderBackups([]);
  elements.publishedStatus.textContent = "Няма публикувана версия";
}

function showAuthMessage(message, isError) {
  if (!elements.authMessage) {
    if (isError && message) {
      showToast(message, true);
    }
    return;
  }

  elements.authMessage.textContent = message;
  elements.authMessage.style.color = isError ? "var(--danger)" : "var(--muted)";
}

function showToast(message, isError) {
  elements.dashboardMessage.textContent = message;
  elements.dashboardMessage.classList.remove("hidden", "is-error", "is-success");
  elements.dashboardMessage.classList.add(isError ? "is-error" : "is-success");

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    elements.dashboardMessage.classList.add("hidden");
  }, 3600);
}

function setLoading(isLoading, text = "Моля, изчакай...") {
  elements.loaderText.textContent = text;
  elements.loaderOverlay.classList.toggle("hidden", !isLoading);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getFileExtension(filename) {
  const clean = String(filename || "").trim();
  const dotIndex = clean.lastIndexOf(".");
  if (dotIndex === -1) return "jpg";
  return clean.slice(dotIndex + 1).toLowerCase();
}

function resolveAdminAssetPath(path) {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("../")) {
    return raw;
  }
  if (raw.startsWith("assets/")) {
    return `../${raw}`;
  }
  return raw;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function capitalize(value) {
  return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
}
