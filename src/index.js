import iziToast from "izitoast";

const NS = "[AOT]";

// -------------------- RUNTIME STATE --------------------

const runtime = {
    focusedWindow: null,
    running: false,
    smartblocksLoadedHandler: null,
    ctx: null,
};

// -------------------- SETTINGS --------------------

const SETTING_CANCEL_CLEANUP = "cancel_cleanup_mode";
const DEFAULT_CANCEL_CLEANUP = true;

function normalizeBoolean(v, fallback = false) {
    if (v === true || v === "true" || v === 1 || v === "1") return true;
    if (v === false || v === "false" || v === 0 || v === "0") return false;
    return fallback;
}

function getCancelCleanupEnabled(extensionAPI) {
    try {
        const v = extensionAPI?.settings?.get?.(SETTING_CANCEL_CLEANUP);
        return normalizeBoolean(v, DEFAULT_CANCEL_CLEANUP);
    } catch (e) {
        return DEFAULT_CANCEL_CLEANUP;
    }
}

function ensureDefaultSettings(extensionAPI) {
    try {
        const existing = extensionAPI?.settings?.get?.(SETTING_CANCEL_CLEANUP);
        if (existing === null || existing === undefined) {
            extensionAPI?.settings?.set?.(SETTING_CANCEL_CLEANUP, DEFAULT_CANCEL_CLEANUP);
        }
    } catch (e) {
        // non-fatal
    }
}

function createSettingsPanel(extensionAPI) {
    try {
        extensionAPI.settings.panel.create({
            tabTitle: "AOT",
            settings: [
                {
                    id: SETTING_CANCEL_CLEANUP,
                    name: "Cancel cleanup mode",
                    description:
                        "If you cancel a workflow, automatically remove blocks created during this run and restore the starting block text.",
                    action: {
                        type: "switch",
                        onChange: (v) => {
                            const checked = typeof v === "boolean" ? v : !!v?.target?.checked;
                            extensionAPI.settings.set(SETTING_CANCEL_CLEANUP, checked);
                        },
                    },
                },
            ],
        });
    } catch (e) {
        console.warn(`${NS} Could not create settings panel:`, e);
    }
}

// -------------------- LOGGING / TOASTS --------------------

function log(level, ...args) {
    const fn = console?.[level] || console.log;
    try {
        fn(NS, ...args);
    } catch (e) {
        // ignore
    }
}

function toastInfo(message, title = "AOT") {
    try {
        iziToast.info({
            theme: "dark",
            color: "",
            title,
            message,
            position: "center",
            timeout: 2500,
            closeOnClick: true,
        });
    } catch (e) {
        log("log", title, message);
    }
}

function toastWarn(message, title = "AOT") {
    try {
        iziToast.warning({
            theme: "dark",
            color: "",
            title,
            message,
            position: "center",
            timeout: 3500,
            closeOnClick: true,
        });
    } catch (e) {
        log("warn", title, message);
    }
}

// -------------------- SAFETY HELPERS --------------------

function safeUid(u) {
    const s = String(u ?? "");
    return /^[a-zA-Z0-9_-]{6,}$/.test(s) ? s : "";
}

function escapeHtml(str) {
    return String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeBlurActiveElement() {
    try {
        document.activeElement?.blur?.();
    } catch (e) {
        // ignore
    }
}

function forceCommitActiveEditor() {
    try {
        const ae = document.activeElement;
        if (!ae) return;

        // Only intervene if we're actually in a Roam editor
        const isEditor = ae.tagName === "TEXTAREA" || ae.getAttribute?.("contenteditable") === "true";
        if (!isEditor) return;

        // 1. Blur (cheap)
        ae.blur?.();

        // 2. Real pointer event (forces Roam commit)
        document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
        document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    } catch (e) {
        // non-fatal
    }
}

// -------------------- RAILS / FOCUS HELPERS --------------------

function getFocus() {
    const fb = window.roamAlphaAPI?.ui?.getFocusedBlock?.();
    const uid = fb?.["block-uid"];
    const windowId = fb?.["window-id"];
    return { uid: safeUid(uid) || null, windowId: windowId || null };
}

async function readParentUid(uid) {
    const u = safeUid(uid);
    if (!u) return null;
    try {
        const q = await window.roamAlphaAPI.q(
            `[:find ?puid .
              :where
              [?b :block/uid "${u}"]
              [?b :block/parents ?p]
              [?p :block/uid ?puid]]`
        );
        return safeUid(q) || null;
    } catch (e) {
        return null;
    }
}

async function safeRefocus(blockUid, windowId) {
    const uid = safeUid(blockUid);
    const wid = windowId || runtime.focusedWindow;
    if (!uid || !wid) return;
    try {
        runtime.focusedWindow = wid;
        await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
            location: { "block-uid": uid, "window-id": wid },
        });
    } catch (e) {
        log("warn", "Could not refocus:", e);
    }
}

async function safeSetFocus(blockUid) {
    const uid = safeUid(blockUid);
    if (!uid) return;

    const ctx = getCtx();
    if (!runtime.focusedWindow) runtime.focusedWindow = ctx?.windowId || runtime.focusedWindow;

    if (!runtime.focusedWindow) {
        const { windowId } = getFocus();
        runtime.focusedWindow = windowId || runtime.focusedWindow;
    }

    if (!runtime.focusedWindow) return;

    try {
        await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
            location: { "block-uid": uid, "window-id": runtime.focusedWindow },
        });
    } catch (e) {
        log("warn", "Could not set focus:", e);
    }
}

async function forceEditorRepaint(rootUid, windowId) {
    try {
        forceCommitActiveEditor();
        await new Promise((r) => setTimeout(r, 0));

        const parentUid = await readParentUid(rootUid);
        if (parentUid && parentUid !== rootUid) {
            await safeRefocus(parentUid, windowId);
            await new Promise((r) => setTimeout(r, 0));
        }

        await safeRefocus(rootUid, windowId);
    } catch (e) {
        // non-fatal
    }
}

async function detachEditorFromBlockThenWrite(rootUid, windowId, writeFn) {
    const uid = safeUid(rootUid);
    if (!uid) return writeFn();

    try {
        // Move focus to parent (best) to force Roam to commit editor buffer elsewhere
        const parentUid = await readParentUid(uid);
        if (parentUid && parentUid !== uid) {
            await safeRefocus(parentUid, windowId);
            await new Promise((r) => setTimeout(r, 0));
        } else {
            // Fallback: blur + body click
            safeBlurActiveElement();
            document.body?.click?.();
            await new Promise((r) => setTimeout(r, 0));
        }
    } catch (e) {
        // non-fatal
    }

    // Write while root is NOT the active editor
    const out = await writeFn();

    // Repaint to reconcile UI
    try {
        await forceEditorRepaint(uid, windowId);
    } catch (e) {
        // ignore
    }

    return out;
}

// -------------------- RUN CONTEXT + CANCEL CLEANUP --------------------

let CURRENT_CTX = null;

function getCtx() {
    return CURRENT_CTX;
}

// Sentinel for clean cancellation (no error toast)
const AOT_CANCELLED = Symbol("AOT_CANCELLED");

function throwIfCancelled() {
    const ctx = getCtx();
    if (ctx?.cancelled) throw AOT_CANCELLED;
}

function markCancelled() {
    const ctx = getCtx();
    if (ctx) ctx.cancelled = true;
}

async function mustPrompt(...args) {
    const v = await prompt(...args);
    if (v == null) {
        markCancelled();
        throw AOT_CANCELLED;
    }
    return v;
}

async function readBlockString(uid) {
    const u = safeUid(uid);
    if (!u) return "";
    try {
        const q = await window.roamAlphaAPI.q(`[:find (pull ?b [:block/string :block/uid]) :where [?b :block/uid "${u}"]]`);
        return q?.[0]?.[0]?.string ?? "";
    } catch (e) {
        return "";
    }
}

async function setBlockString(uid, string, open = true) {
    const u = safeUid(uid);
    if (!u) return;
    return window.roamAlphaAPI.updateBlock({
        block: { uid: u, string: String(string ?? ""), open: !!open },
    });
}

async function initRootContext(ctx, { uid, windowId, originalStringOverride } = {}) {
    if (!ctx) return;

    const u = uid ? safeUid(uid) : null;

    // rootUid set exactly once
    if (!ctx.rootUid) {
        ctx.rootUid = u || null;
    } else if (u && ctx.rootUid !== u) {
        log("warn", "rootUid already set; refusing to change", { existing: ctx.rootUid, attempted: u });
    }

    // windowId: prefer first good value
    if (windowId && !ctx.windowId) ctx.windowId = windowId;

    // capture original root string exactly once
    if (ctx.rootUid && (ctx.rootOriginalString === null || ctx.rootOriginalString === undefined)) {
        if (originalStringOverride !== undefined) {
            ctx.rootOriginalString = String(originalStringOverride ?? "");
        } else {
            ctx.rootOriginalString = await readBlockString(ctx.rootUid);
        }
    }
}

async function countChildren(parentUid) {
    const p = safeUid(parentUid);
    if (!p) return 0;
    try {
        const q = await window.roamAlphaAPI.q(
            `[:find (count ?c) .
              :where
              [?p :block/uid "${p}"]
              [?p :block/children ?c]]`
        );
        const n = Number(q);
        return Number.isFinite(n) && n >= 0 ? n : 0;
    } catch (e) {
        return 0;
    }
}

async function trackedUpdateBlock(uid, string, open = true) {
    throwIfCancelled();
    const u = safeUid(uid);
    if (!u) return;

    return window.roamAlphaAPI.updateBlock({
        block: { uid: u, string: String(string ?? ""), open: !!open },
    });
}

async function trackedCreateBlock(parentUid, order, string, uid) {
    throwIfCancelled();

    const ctx = getCtx();
    const parent = safeUid(parentUid);
    if (!parent) return null;

    const blockUid = safeUid(uid) || window.roamAlphaAPI.util.generateUID();
    if (ctx) ctx.createdUids.push(blockUid);

    let ord = order;
    if (ord === null || ord === undefined || ord === "last") {
        ord = await countChildren(parent);
    }

    try {
        await window.roamAlphaAPI.createBlock({
            location: { "parent-uid": parent, order: ord },
            block: { string: String(string ?? ""), uid: blockUid },
        });
        return blockUid;
    } catch (e) {
        // One retry with refreshed order (cheap race hardening)
        try {
            const retryOrd = await countChildren(parent);
            await window.roamAlphaAPI.createBlock({
                location: { "parent-uid": parent, order: retryOrd },
                block: { string: String(string ?? ""), uid: blockUid },
            });
            return blockUid;
        } catch (e2) {
            log("warn", "createBlock failed:", e2);
            throw e2;
        }
    }
}

async function safeDeleteBlock(uid) {
    const u = safeUid(uid);
    if (!u) return;

    // Prefer deleteBlock if available; otherwise blank it.
    try {
        if (typeof window.roamAlphaAPI.deleteBlock === "function") {
            await window.roamAlphaAPI.deleteBlock({ block: { uid: u } });
            return;
        }
    } catch (e) {
        // fall through
    }
    try {
        await window.roamAlphaAPI.updateBlock({ block: { uid: u, string: "" } });
    } catch (e) {
        // ignore
    }
}

async function deleteCreatedBlocks(ctx) {
    const uids = Array.from(new Set(ctx?.createdUids || []));
    for (let i = uids.length - 1; i >= 0; i--) {
        const uid = safeUid(uids[i]);
        if (uid && uid !== ctx.rootUid) {
            await safeDeleteBlock(uid);
        }
    }
}

async function cancelCleanup(ctx) {
    try {
        await deleteCreatedBlocks(ctx);

        if (ctx?.rootUid) {
            const restore = ctx.rootOriginalString !== null && ctx.rootOriginalString !== undefined ? ctx.rootOriginalString : "";
            await setBlockString(ctx.rootUid, restore, true);
            await forceEditorRepaint(ctx.rootUid, ctx.windowId);
        }
    } catch (e) {
        log("error", "cancelCleanup failed", e);
    }
}

async function runAOT(extensionAPI, fn, { allowParallel = false, launchWindowId = null } = {}) {
    if (!allowParallel && runtime.running) {
        toastWarn("An AOT workflow is already running. Finish it first (or cancel it).");
        return;
    }

    const ctx = {
        cancelled: false,
        createdUids: [],
        rootUid: null,
        rootOriginalString: null,
        windowId: launchWindowId || null,
    };

    runtime.running = true;
    CURRENT_CTX = ctx;

    try {
        await fn(ctx);
    } catch (e) {
        if (e === AOT_CANCELLED) {
            // noop
        } else {
            log("error", "Workflow error:", e);
            toastWarn("Something went wrong running this AOT. Check console for details.", "AOT Error");
        }
    } finally {
        try {
            if (ctx.cancelled) toastInfo("Cancelled");
            if (ctx.cancelled && getCancelCleanupEnabled(extensionAPI)) {
                await cancelCleanup(ctx);
            }
        } finally {
            CURRENT_CTX = null;
            runtime.running = false;
        }
    }
}

// -------------------- SELECT BUILDER (SAFE) --------------------

function buildSelectFromOptions(options) {
    const safe = Array.isArray(options) ? options : [];
    let html = '<select><option value="">Select</option>';
    for (const opt of safe) {
        const value = safeUid(opt?.value);
        const label = escapeHtml(opt?.label ?? "");
        html += `<option value="${value}">${label}</option>`;
    }
    html += "</select>";
    return html;
}

// -------------------- MINI DSL HELPERS --------------------
// 1) appendLine(parentUid, text)
// 2) ensureSection(rootUid, "**Title:**") -> returns section uid
// 3) chooseChild(parentUid, title, message) -> returns chosen child uid
// 4) leaf(parentUid) -> creates empty child + focuses it

async function setRootHeading(rootUid, heading, open = true) {
    const uid = safeUid(rootUid);
    if (!uid) return;

    const ctx = getCtx();
    const wid = ctx?.windowId || runtime.focusedWindow || null;

    await detachEditorFromBlockThenWrite(uid, wid, async () => {
        await trackedUpdateBlock(uid, String(heading ?? ""), !!open);
    });
    document.querySelector("body")?.click();
}

async function appendLine(parentUid, text, order = "last") {
    return trackedCreateBlock(parentUid, order, String(text ?? ""));
}

async function ensureSection(rootUid, label, { order = "last" } = {}) {
    const root = safeUid(rootUid);
    if (!root) return null;

    try {
        const q = await window.roamAlphaAPI.q(
            `[:find (pull ?p [:block/uid {:block/children [:block/uid :block/string]}]) .
              :where
              [?p :block/uid "${root}"]]`
        );
        const children = q?.children || [];
        const found = children.find((c) => String(c?.string ?? "") === String(label ?? ""));
        const foundUid = safeUid(found?.uid);
        if (foundUid) return foundUid;
    } catch (e) {
        // fall through to create
    }

    const newUid = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(root, order, String(label ?? ""), newUid);
    return newUid;
}

async function chooseChild(parentUid, title, message) {
    const parent = safeUid(parentUid);
    if (!parent) return null;

    const q = await window.roamAlphaAPI.q(
        `[:find (pull ?p [:block/uid {:block/children [:block/uid :block/string]}]) .
          :where
          [?p :block/uid "${parent}"]]`
    );

    const children = q?.children || [];
    const options = children
        .map((c) => ({
            value: safeUid(c?.uid),
            label: String(c?.string ?? "").trim() || "(empty)",
        }))
        .filter((o) => !!o.value);

    if (!options.length) return null;

    const selectString = buildSelectFromOptions(options);
    const picked = await mustPrompt(message, 2, title, selectString);
    return safeUid(picked) || null;
}

async function leaf(parentUid, { order = "last", focus = true } = {}) {
    const uid = window.roamAlphaAPI.util.generateUID();
    const created = await trackedCreateBlock(parentUid, order, "", uid);
    if (focus && created) await safeSetFocus(created);
    return created;
}

// -------------------- EXTENSION --------------------

export default {
    onload: ({ extensionAPI }) => {
        ensureDefaultSettings(extensionAPI);
        createSettingsPanel(extensionAPI);

        const registerPalette = (label, fn) => {
            extensionAPI.ui.commandPalette.addCommand({
                label,
                callback: () => {
                    // Let palette close + focus restore before reading focus
                    setTimeout(() => {
                        const { uid, windowId } = getFocus();
                        const launchWindowId = windowId || runtime.focusedWindow || null;
                        if (launchWindowId) runtime.focusedWindow = launchWindowId;

                        if (!uid) {
                            alert("Please make sure to focus a block before starting an AOT");
                            return;
                        }

                        if (!launchWindowId) {
                            toastWarn("Could not determine windowId (focus restore may not work).", "AOT");
                        }

                        runAOT(
                            extensionAPI,
                            async (ctx) => {
                                await initRootContext(ctx, { uid, windowId: launchWindowId || null });
                                await fn(uid);
                            },
                            { launchWindowId }
                        );
                    }, 0);
                },
            });
        };

        // Registry (keeps palette + SmartBlocks aligned)
        const AOTS = [
            { palette: "AOT - Aims, Goals, Objectives (AGO)", sb: "AOTAGO", fn: aot_ago },
            { palette: "AOT - Agreement, Disagreement and Irrelevance", sb: "AOTADI", fn: aot_adi },
            { palette: "AOT - Alternatives, Possibilities, Choices", sb: "AOTAPC", fn: aot_apc },
            { palette: "AOT - Assumptions X-ray", sb: "AOTAX", fn: aot_ax },
            { palette: "AOT - Basic Decision", sb: "AOTBASICDECISION", fn: aot_bd },
            { palette: "AOT - Consequence and Sequel (C&S)", sb: "AOTCS", fn: aot_cs },
            { palette: "AOT - Consider All Factors", sb: "AOTCAF", fn: aot_caf },
            { palette: "AOT - Design/Decision, Outcome, Channels, Action (DODCA)", sb: "AOTDODCA", fn: aot_dodca },
            { palette: "AOT - Difference Engine", sb: "AOTDIFFERENCE", fn: aot_de },
            { palette: "AOT - Examine Both Sides (EBS)", sb: "AOTEBS", fn: aot_ebs },
            { palette: "AOT - First Important Priorities", sb: "AOTFIP", fn: aot_fip },
            { palette: "AOT - Five Whys", sb: "AOTFIVEWHYS", fn: aot_five_whys },
            // { palette: "AOT - Issue Log", sb: "AOTISSUELOG", fn: aot_issue_log },
            { palette: "AOT - Next Action", sb: "AOTNEXTACTION", fn: aot_na },
            // { palette: "AOT - Other People's Views", sb: "AOTOPV", fn: aot_opv },
            { palette: "AOT - Pain Button", sb: "AOTPAIN", fn: aot_pain_button },
            { palette: "AOT - Plus, Minus and Interesting", sb: "AOTPMI", fn: aot_pmi },
            { palette: "AOT - REALLY?", sb: "AOTREALLY", fn: aot_really },
            { palette: "AOT - REAPPRAISED", sb: "AOTREAPPRAISED", fn: aot_reappraised },
            { palette: "AOT - Recognise, Analyse, Divide", sb: "AOTRAD", fn: aot_rad },
            { palette: "AOT - Regret Minimisation", sb: "AOTREGRET", fn: aot_regret_min },
            { palette: "AOT - Right to Disagree (Cortex Futura)", sb: "AOTRTD", fn: aot_right_to_disagree_cortex },
            { palette: "AOT - Right to Disagree (Deeper Version)", sb: "AOTRTDDEEP", fn: aot_right_to_disagree_deep },
            { palette: "AOT - Simple Choice", sb: "AOTCHOICE", fn: aot_choice },
            { palette: "AOT - Six Thinking Hats", sb: "AOTSIXHATS", fn: aot_six_hats },
            { palette: "AOT - SWOT Analysis", sb: "AOTSWOT", fn: aot_swot },
            { palette: "AOT - TOSCA", sb: "AOTTOSCA", fn: aot_tosca },
            { palette: "AOT - Want, Impediment, Remedy", sb: "AOTWANT", fn: aot_wir },
        ];

        // Palette commands
        AOTS.forEach((a) => registerPalette(a.palette, a.fn));

        // ---- SmartBlocks commands ----
        const mkSmartblocksCmd = (text, help, fn) => ({
            text,
            help,
            handler: (context) => () => {
                const uid = safeUid(context?.currentUid);

                // Capture window-id immediately (before overlay steals focus)
                const { windowId: nowWindowId } = getFocus();
                const launchWindowId = context?.windowId || nowWindowId || runtime.focusedWindow || null;

                if (launchWindowId) runtime.focusedWindow = launchWindowId;

                setTimeout(() => {
                    runAOT(
                        extensionAPI,
                        async (ctx) => {
                            if (!uid) {
                                toastWarn("No currentUid from SmartBlocks context.", "AOT");
                                return;
                            }

                            await initRootContext(ctx, {
                                uid,
                                windowId: launchWindowId || null,
                                originalStringOverride: "", // SB placeholder should always restore to ""
                            });

                            await fn(uid);
                        },
                        { launchWindowId }
                    );
                }, 0);

                // overwrite any SmartBlocks placeholder/heading text immediately
                return "";
            },
        });

        const cmds = AOTS.map((a) => mkSmartblocksCmd(a.sb, a.palette, a.fn));

        const registerAllSmartblocks = () => {
            if (!window.roamjs?.extension?.smartblocks) return false;
            cmds.forEach((c) => window.roamjs.extension.smartblocks.registerCommand(c));
            return true;
        };

        if (!registerAllSmartblocks()) {
            runtime.smartblocksLoadedHandler = () => registerAllSmartblocks();
            document.body.addEventListener(`roamjs:smartblocks:loaded`, runtime.smartblocksLoadedHandler);
        }
    },

    onunload: () => {
        if (window.roamjs?.extension?.smartblocks) {
            // Unregister by SmartBlocks text id (stable)
            const ids = [
                "AOTADI",
                "AOTAPC",
                "AOTAX",
                "AOTBASICDECISION",
                "AOTCAF",
                "AOTCHOICE",
                "AOTDIFFERENCE",
                "AOTFIP",
                "AOTFIVEWHYS",
                "AOTNEXTACTION",
                "AOTPAIN",
                "AOTPMI",
                "AOTRAD",
                "AOTREALLY",
                "AOTREAPPRAISED",
                "AOTREGRET",
                "AOTRTD",
                "AOTRTDDEEP",
                "AOTSIXHATS",
                "AOTSWOT",
                "AOTTOSCA",
                "AOTWANT",
                "AOTAGO",
                "AOTCS",
                "AOTDODCA",
                "AOTEBS",
            ];
            ids.forEach((id) => window.roamjs.extension.smartblocks.unregisterCommand(id));
        }

        if (runtime.smartblocksLoadedHandler) {
            document.body.removeEventListener(`roamjs:smartblocks:loaded`, runtime.smartblocksLoadedHandler);
            runtime.smartblocksLoadedHandler = null;
        }

        runtime.focusedWindow = null;
        runtime.running = false;
        CURRENT_CTX = null;
    },
};

// -------------------- AOT FLOWS --------------------

// Aims, Goals, Objectives
// https://www.debono.com/de-bono-thinking-lessons-1/4.-AGO-lesson-plan
async function aot_ago(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const topic = await mustPrompt("What is the topic / situation you’re setting objectives for?", 1, "AGO");

    const header = "AGO::";
    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, header, true);
    });

    await trackedCreateBlock(uid, 0, `**Topic:** ${topic}`);

    const aimBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 1, "**Aim (overall purpose):**", aimBlock);
    const aim = await mustPrompt("What is the overall AIM (broad purpose)?", 1, "AGO");
    await trackedCreateBlock(aimBlock, 0, String(aim));

    const goalsBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 2, "**Goals (key results to achieve the aim):**", goalsBlock);

    while (true) {
        throwIfCancelled();
        const goal = await mustPrompt("Name one GOAL (a key result).", 1, "AGO");
        await trackedCreateBlock(goalsBlock, "last", String(goal));

        const more = await mustPrompt("Any other goals?", 3, "AGO");
        if (more !== "yes") break;
    }

    const objectivesBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 3, "**Objectives (specific, actionable steps):**", objectivesBlock);

    while (true) {
        throwIfCancelled();
        const obj = await mustPrompt("Name one OBJECTIVE (specific, actionable step).", 1, "AGO");
        await trackedCreateBlock(objectivesBlock, "last", String(obj));

        const more = await mustPrompt("Any other objectives?", 3, "AGO");
        if (more !== "yes") break;
    }

    await prompt(
        "Quick review: does each objective clearly support a goal, and do the goals support the aim?",
        4,
        "AGO",
        null,
        6500
    );
}

// Agreement, Disagreement and Irrelevance
async function aot_adi(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const situation = await mustPrompt(
        "What is the situation you wish to analyse?",
        1,
        "Agreement, Disagreement and Irrelevance"
    );

    await setRootHeading(uid, "**Situation:**");
    await appendLine(uid, situation, 0);

    const agreeBlock = await ensureSection(uid, "**Agreement:**", { order: 1 });

    while (true) {
        throwIfCancelled();
        const agree = await mustPrompt(
            "What is something about this situation on which you agree?",
            1,
            "Agreement, Disagreement and Irrelevance"
        );
        await appendLine(agreeBlock, agree);

        const more = await mustPrompt(
            "Are there any other things on which you agree?",
            3,
            "Agreement, Disagreement and Irrelevance"
        );
        if (more !== "yes") break;
    }

    const disagreeBlock = await ensureSection(uid, "**Disagreement:**", { order: 2 });

    while (true) {
        throwIfCancelled();
        const disagree = await mustPrompt(
            "What is something about this situation on which you disagree?",
            1,
            "Agreement, Disagreement and Irrelevance"
        );
        await appendLine(disagreeBlock, disagree);

        const more = await mustPrompt(
            "Are there any other things on which you disagree?",
            3,
            "Agreement, Disagreement and Irrelevance"
        );
        if (more !== "yes") break;
    }

    const irrBlock = await ensureSection(uid, "**Irrelevance:**", { order: 3 });

    while (true) {
        throwIfCancelled();
        const irrelevant = await mustPrompt(
            "What is something about your disagreement that is irrelevant?",
            1,
            "Agreement, Disagreement and Irrelevance"
        );
        await appendLine(irrBlock, irrelevant);

        const more = await mustPrompt(
            "Are there any other things that have been brought up that are irrelevant?",
            3,
            "Agreement, Disagreement and Irrelevance"
        );
        if (more !== "yes") break;
    }
}

// Alternatives, Possibilities, Choices
async function aot_apc(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const situation = await mustPrompt(
        "What is the situation you wish to consider?",
        1,
        "Alternatives, Possibilities, Choices"
    );

    await setRootHeading(uid, "**Situation:**");
    await appendLine(uid, situation, 0);

    const apcBlock = await ensureSection(uid, "**Alternatives, Possibilities, Choices:**", { order: 1 });

    while (true) {
        throwIfCancelled();
        const apc = await mustPrompt(
            "What is one way to consider this situation?",
            1,
            "Alternatives, Possibilities, Choices"
        );
        await appendLine(apcBlock, apc);

        const more = await mustPrompt("Are there alternative ways to consider this?", 3, "Alternatives, Possibilities, Choices");
        if (more !== "yes") break;
    }
}

// Assumptions X-ray
async function aot_ax(uid) {
    throwIfCancelled();

    await setRootHeading(uid, "**Assumption X-Ray:**");

    const generalUid = await ensureSection(uid, "**General Assumptions:**", { order: 0 });

    const culturallyUid = await ensureSection(generalUid, "Culturally Binding:", { order: 0 });
    const cult = await mustPrompt("What are the culturally binding assumptions?", 1, "Assumptions X-Ray");
    await appendLine(culturallyUid, cult, 0);

    const infoUid = await ensureSection(generalUid, "Information Adequacy:", { order: 1 });
    const info = await mustPrompt("Is the available information correct? Is it complete?", 1, "Assumptions X-Ray");
    await appendLine(infoUid, info, 0);

    const cruxUid = await ensureSection(uid, "**Assumptions at the crux:**", { order: 1 });
    const crux = await mustPrompt("What is the main crux of your assumptions?", 1, "Assumptions X-Ray");
    await appendLine(cruxUid, crux, 0);

    const constraintsUid = await ensureSection(uid, "**Assumptions determining the constraints:**", { order: 2 });

    const makeConstraint = async (label, q, order) => {
        throwIfCancelled();
        const parent = await ensureSection(constraintsUid, `${label}:`, { order });
        const ans = await mustPrompt(q, 1, "Assumptions X-Ray");
        // Put the answer as the first child each run (or append if you prefer)
        await appendLine(parent, ans, "last");
    };

    await makeConstraint("Time", "What assumptions are there around time?", 0);
    await makeConstraint("Money", "What assumptions are there around money?", 1);
    await makeConstraint("Energy", "What assumptions are there around the energy required?", 2);
    await makeConstraint("Cost/Benefit", "Is solving this problem worthwhile? What is the cost/benefit?", 3);
    await makeConstraint(
        "Cooperation",
        "Do I require the cooperation of anyone else? Do I hold assumptions about their views?",
        4
    );
    await makeConstraint("Physics", "Do the laws of physics interfere? Is this problem insoluble?", 5);
    await makeConstraint("Law", "Is the solution blocked by law?", 6);

    await prompt(
        "Finally, look over your assumptions and consider whether there are more to add, or other things to consider.",
        4,
        "Assumptions X-Ray:",
        null,
        6000
    );
}

// Basic Decision
async function aot_bd(uid) {
    throwIfCancelled();
    const { windowId } = getFocus();
    runtime.focusedWindow = windowId || runtime.focusedWindow;
    forceCommitActiveEditor();

    const choice = await mustPrompt("What are you trying to decide?", 1, "Basic Decision");

    await setRootHeading(uid, "Basic Decision::");
    await appendLine(uid, `#Choice: ${choice}`, 0);

    const optionsBlock = await ensureSection(uid, "**Options:**", { order: 1 });

    let optionNumber = 1;
    while (true) {
        throwIfCancelled();

        const optionString = optionNumber === 1 ? "What is your first option?" : "What is another option?";
        const option = await mustPrompt(optionString, 1, "Option");

        const thisOption = await ensureSection(optionsBlock, `**${option}:**`, { order: optionNumber - 1 });

        const adv = await mustPrompt("What is one advantage of this option?", 1, "Option");
        const advBlock = await ensureSection(thisOption, "**Advantage:**", { order: 0 });
        await appendLine(advBlock, adv, "last");

        const dis = await mustPrompt("What is one disadvantage of this option?", 1, "Option");
        const disBlock = await ensureSection(thisOption, "**Disadvantage:**", { order: 1 });
        await appendLine(disBlock, dis, "last");

        const finished = await mustPrompt("Are there any more options?", 3, "Basic Decision");
        if (finished !== "yes") break;

        optionNumber += 1;
    }

    const constraintsBlock = await ensureSection(uid, "**Constraints:**", { order: 2 });

    let constraintsNumber = 1;
    while (true) {
        throwIfCancelled();
        const constraints = await mustPrompt("What is a constraint on this decision?", 1, "Constraint");
        await appendLine(constraintsBlock, constraints, constraintsNumber - 1);

        const finished = await mustPrompt("Are there any more constraints?", 3, "Basic Decision");
        if (finished !== "yes") break;

        constraintsNumber += 1;
    }

    await prompt(
        "Look over your options and consider if there are more advantages or disadvantages to add. Then, consider your constraints. Finally, record your decision!",
        4,
        "Decision Time",
        null,
        8000
    );

    const decisionBlock = await ensureSection(uid, "**Decision:**", { order: 3 });
    await leaf(decisionBlock, { order: 0, focus: true });
}

// Consequence and Sequel
// https://www.debono.com/de-bono-thinking-lessons-1/3.-C%26S-lesson-plan
async function aot_cs(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const action = await mustPrompt("What action/decision/idea are you evaluating consequences for?", 1, "C&S");

    const header = "C&S::";
    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, header, true);
    });

    await trackedCreateBlock(uid, 0, `**Action / Decision:** ${action}`);

    const makeHorizon = async (title, question, order) => {
        throwIfCancelled();
        const block = window.roamAlphaAPI.util.generateUID();
        await trackedCreateBlock(uid, order, `**${title}:**`, block);

        while (true) {
            throwIfCancelled();
            const c = await mustPrompt(question, 1, "C&S");
            await trackedCreateBlock(block, "last", String(c));

            const more = await mustPrompt("Any more?", 3, "C&S");
            if (more !== "yes") break;
        }
    };

    await makeHorizon("Immediate consequences", "Name one immediate consequence.", 1);
    await makeHorizon("Short-term sequels", "Name one short-term sequel (what follows on).", 2);
    await makeHorizon("Medium-term sequels", "Name one medium-term sequel.", 3);
    await makeHorizon("Long-term sequels", "Name one long-term sequel.", 4);

    await prompt(
        "Scan your list: which sequels are most likely, and which are most important?",
        4,
        "C&S",
        null,
        6500
    );
}

// Consider All Factors
async function aot_caf(uid) {
    throwIfCancelled();

    forceCommitActiveEditor();
    const situation = await mustPrompt("What is the situation you wish to consider?", 1, "Consider All Factors");

    await setRootHeading(uid, "**Situation:**");
    await appendLine(uid, situation, 0);

    const cafBlock = await ensureSection(uid, "**Factors to Consider:**", { order: 1 });

    while (true) {
        throwIfCancelled();
        const caf = await mustPrompt("What is one factor you should consider?", 1, "Consider All Factors");
        await appendLine(cafBlock, caf);

        const more = await mustPrompt("Are there other factors you need to consider?", 3, "Consider All Factors");
        if (more !== "yes") break;
    }
}

// Design/Decision, Outcome, Channels, Action
async function aot_dodca(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const dd = await mustPrompt("What are you designing/deciding?", 1, "DODCA");

    const header = "DODCA::";
    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, header, true);
    });

    await trackedCreateBlock(uid, 0, `**Design/Decision:** ${dd}`);

    const outcomeBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 1, "**Outcomes (what success looks like):**", outcomeBlock);
    while (true) {
        throwIfCancelled();
        const o = await mustPrompt("Name one desired outcome.", 1, "DODCA");
        await trackedCreateBlock(outcomeBlock, "last", String(o));
        const more = await mustPrompt("Any other outcomes?", 3, "DODCA");
        if (more !== "yes") break;
    }

    const channelsBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 2, "**Channels (ways/means to reach outcomes):**", channelsBlock);
    while (true) {
        throwIfCancelled();
        const c = await mustPrompt("Name one channel/approach/lever you could use.", 1, "DODCA");
        await trackedCreateBlock(channelsBlock, "last", String(c));
        const more = await mustPrompt("Any other channels?", 3, "DODCA");
        if (more !== "yes") break;
    }

    const actionBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 3, "**Actions (next steps):**", actionBlock);
    while (true) {
        throwIfCancelled();
        const a = await mustPrompt("Name one next action you can take.", 1, "DODCA");
        await trackedCreateBlock(actionBlock, "last", `{{[[TODO]]}} ${a}`);
        const more = await mustPrompt("Any other actions?", 3, "DODCA");
        if (more !== "yes") break;
    }
}

// Difference Engine
async function aot_de(uid) {
    throwIfCancelled();

    await setRootHeading(uid, "Difference Engine::");

    const curUID = await ensureSection(uid, "**Current Situation:**", { order: 0 });
    const current = await mustPrompt("What is the Current Situation?", 1, "Difference Engine");
    await appendLine(curUID, current, 0);

    const futUID = await ensureSection(uid, "**Future Situation:**", { order: 1 });
    const future = await mustPrompt("What is the situation in the Future?", 1, "Difference Engine");
    await appendLine(futUID, future, 0);

    const difUID = await ensureSection(uid, "**Differences:**", { order: 2 });

    while (true) {
        throwIfCancelled();
        const diff = await mustPrompt("What is one difference?", 1, "Difference Engine");
        await appendLine(difUID, diff);

        const more = await mustPrompt("Are there any more differences?", 3, "Difference Engine");
        if (more !== "yes") break;
    }

    const serUID = await ensureSection(uid, "**Most serious difference:**", { order: 3 });

    // Choose from children of difUID
    const serious = await chooseChild(difUID, "Difference Engine", "Which is the most serious difference?");
    if (!serious) return;

    await appendLine(serUID, `((${serious}))`, 0);

    const mitUID = await ensureSection(uid, "**Steps to reduce the difference:**", { order: 4 });

    while (true) {
        throwIfCancelled();
        const mitigate = await mustPrompt("What is one step to reduce the difference?", 1, "Difference Engine");
        await appendLine(mitUID, mitigate);

        const more = await mustPrompt("Are there any more ways to mitigate the difference?", 3, "Difference Engine");
        if (more !== "yes") break;
    }
}

// Examine Both Sides
// https://www.zsolt.blog/2020/12/de-bonos-algorithms-of-thought-for_8.html
async function aot_ebs(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const issue = await mustPrompt("What issue / disagreement / choice do you want to examine both sides of?", 1, "EBS");

    const header = "EBS::";
    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, header, true);
    });

    await trackedCreateBlock(uid, 0, `**Issue:** ${issue}`);

    const sideABlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 1, "**Side A (your current view):**", sideABlock);
    while (true) {
        throwIfCancelled();
        const p = await mustPrompt("Add one point for Side A.", 1, "EBS");
        await trackedCreateBlock(sideABlock, "last", String(p));
        const more = await mustPrompt("More points for Side A?", 3, "EBS");
        if (more !== "yes") break;
    }

    const sideBBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 2, "**Side B (the other view, mapped neutrally):**", sideBBlock);
    while (true) {
        throwIfCancelled();
        const p = await mustPrompt("Add one point for Side B (as fairly as you can).", 1, "EBS");
        await trackedCreateBlock(sideBBlock, "last", String(p));
        const more = await mustPrompt("More points for Side B?", 3, "EBS");
        if (more !== "yes") break;
    }

    const bridgeBlock = window.roamAlphaAPI.util.generateUID();
    await trackedCreateBlock(uid, 3, "**Bridge / synthesis / next step:**", bridgeBlock);
    const next = await mustPrompt("Given both sides, what’s a constructive next step?", 1, "EBS");
    await trackedCreateBlock(bridgeBlock, 0, `{{[[TODO]]}} ${next}`);
}

// First Important Priorities (FIP)
async function aot_fip(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await setRootHeading(uid, "First Important Priorities::", true);

    // --- Situation ---
    const situation = await mustPrompt(
        "What situation are you dealing with (in one sentence)?",
        1,
        "First Important Priorities"
    );

    const situationSection = await ensureSection(uid, "**Situation:**");
    await appendLine(situationSection, String(situation));

    // --- Priorities container ---
    const prioritiesSection = await ensureSection(uid, "**Priorities:**");

    // Helper: create one priority subtree
    const addPriority = async (n) => {
        throwIfCancelled();

        const p = await mustPrompt(
            n === 1 ? "What is the single most important priority right now?" : "What is another important priority?",
            1,
            "First Important Priorities"
        );

        // Priority node
        const priorityNode = await appendLine(prioritiesSection, `**Priority ${n}:** ${String(p)}`);
        // If appendLine doesn’t return a uid in your helper implementation, replace the line above with:
        // const priorityNode = await trackedCreateBlock(prioritiesSection, "last", `**Priority ${n}:** ${String(p)}`);

        // Why important
        const whySection = await trackedCreateBlock(priorityNode, "last", "**Why it matters:**");
        const why = await mustPrompt("Why is this priority important?", 1, "First Important Priorities");
        await appendLine(whySection, String(why));

        // Consequence of not doing it
        const riskSection = await trackedCreateBlock(priorityNode, "last", "**If I ignore this:**");
        const risk = await mustPrompt("What happens if you *don’t* address this priority?", 1, "First Important Priorities");
        await appendLine(riskSection, String(risk));

        // First action
        const actionSection = await trackedCreateBlock(priorityNode, "last", "**First action:**");
        const action = await mustPrompt(
            "What is the very first concrete action you can take?",
            1,
            "First Important Priorities"
        );

        const actionLeaf = await leaf(actionSection, { focus: false });
        await trackedUpdateBlock(actionLeaf, `{{[[TODO]]}} ${String(action)}`, true);

        return { priorityNode, actionLeaf };
    };

    // Default to at least 1 priority
    let n = 1;
    let firstActionLeaf = null;

    while (true) {
        const { actionLeaf } = await addPriority(n);
        if (!firstActionLeaf) firstActionLeaf = actionLeaf;

        const more = await mustPrompt("Do you have another priority to add?", 3, "First Important Priorities");
        if (more !== "yes") break;

        n += 1;

        // Gentle guardrail (optional): prevent runaway trees
        if (n > 7) {
            await prompt(
                "You’ve added quite a few priorities. Consider stopping and ranking them before adding more.",
                4,
                "First Important Priorities",
                null,
                6000
            );
            break;
        }
    }

    // --- Rank / choose the “first first” ---
    const closing = await ensureSection(uid, "**Choose what to do first:**");
    await appendLine(
        closing,
        "Review the list above. Which priority should you do *first*? You can reorder or add notes."
    );

    // Put cursor somewhere useful
    const focusLeaf = await leaf(closing, { focus: true });
    await trackedUpdateBlock(focusLeaf, "", true);
    await safeSetFocus(focusLeaf);

    // Optional: also focus the first action TODO (uncomment if you prefer)
    // if (firstActionLeaf) await safeSetFocus(firstActionLeaf);
}

// Five Whys
async function aot_five_whys(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    await setRootHeading(uid, "Five Whys::", true);

    // Problem / situation
    const problem = await mustPrompt("What problem are you trying to understand?", 1, "Five Whys");
    const problemSection = await ensureSection(uid, "**Problem:**");
    await appendLine(problemSection, String(problem));

    // Chain container
    const chainSection = await ensureSection(uid, "**Why chain:**");

    // Start the nested chain under the section
    let parent = chainSection;

    for (let i = 1; i <= 5; i++) {
        throwIfCancelled();

        // Create a "Why #n" node, then an answer leaf beneath it.
        const whyNode = await trackedCreateBlock(parent, "last", `**Why ${i}?**`);
        if (!whyNode) break;

        const answer = await mustPrompt(
            i === 1
                ? "Why is this happening? (Answer as directly as you can.)"
                : "And why is that true?",
            1,
            "Five Whys"
        );

        // Put the answer as a child of the Why node (leaf pattern).
        const answerLeafUid = await leaf(whyNode, { focus: false });
        await trackedUpdateBlock(answerLeafUid, String(answer), true);

        // Early stop: ask if this is the root cause
        const done = await mustPrompt("Is this the root cause (deep enough)?", 3, "Five Whys");
        if (done === "yes") {
            const resultSection = await ensureSection(uid, "**Root cause:**");
            await appendLine(resultSection, `((${answerLeafUid}))`);
            break;
        }

        // Next why nests under the previous answer (classic “why chain” feel)
        parent = whyNode;
    }

    // Optional: give them a place to write actions
    const actionsSection = await ensureSection(uid, "**Next steps:**");
    const actionLeaf = await leaf(actionsSection, { focus: true });
    await trackedUpdateBlock(actionLeaf, "{{[[TODO]]}} ", true);
    await safeSetFocus(actionLeaf);
}

// TODO: Issue Log

// Next Action
async function aot_na(uid) {
    throwIfCancelled();

    const { windowId } = getFocus();
    runtime.focusedWindow = windowId || runtime.focusedWindow;

    forceCommitActiveEditor();

    const na = await mustPrompt("Do you know the next action?", 3, "Next Action");
    await setRootHeading(uid, "Next Action::");

    if (na === "yes") {
        const next = await mustPrompt("What's the very next action?", 1, "Next Action");
        await aot_na_sim(uid, 1, next);
        return;
    }

    const brainstormingBlock = await ensureSection(uid, "**Brainstorming:**", { order: 0 });

    while (true) {
        throwIfCancelled();

        const scratch = await leaf(brainstormingBlock, { order: "last", focus: true });

        await prompt(
            "Do a three-minute brainstorming session to come up with a next action",
            5,
            "Brainstorming",
            null,
            180000
        );

        const now = await mustPrompt("Now do you know the next action?", 3, "Next Action");
        if (now === "yes") {
            const next = await mustPrompt("What's the very next action?", 1, "Next Action");
            await aot_na_sim(uid, 1, next);
            return;
        }

        // keep the scratch leaf (it's the brainstorm output)
        // (scratch var kept for clarity; not used)
        void scratch;
    }
}

async function aot_na_sim(uid, order, na) {
    throwIfCancelled();

    const na_now = await mustPrompt(`Now mentally simulate doing this action - ${na}. Can you do it right now?`, 3, "Next Action");
    const naBlock = window.roamAlphaAPI.util.generateUID();

    if (na_now === "yes") {
        await trackedCreateBlock(uid, order, `{{[[TODO]]}} ${na}`, naBlock);
        return;
    }

    let curOrder = order;
    while (true) {
        throwIfCancelled();
        const nablocking = await mustPrompt("Create any other tasks you need to complete", 1, "Next Action");

        const naBlock1 = window.roamAlphaAPI.util.generateUID();
        await trackedCreateBlock(uid, curOrder, `{{[[TODO]]}} ${nablocking} #blocking [*](((${naBlock})))`, naBlock1);

        const more = await mustPrompt("Are there any other blocking tasks?", 3, "Next Action");
        if (more !== "yes") break;

        curOrder += 1;
    }

    await trackedCreateBlock(uid, curOrder + 1, `{{[[TODO]]}} ${na}`, naBlock);
}

// Ray Dalio's Pain Button
// Source SmartBlocks version (structure adapted): https://github.com/dvargas92495/SmartBlocks/issues/104#issue-761609493
async function aot_pain_button(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, "Pain Button::", true);
    });

    // ---- Situation ----
    const situation = await mustPrompt(
        "What situation is causing you pain (or discomfort) right now?",
        1,
        "Pain Button"
    );

    const situationSec = await ensureSection(uid, "**Situation:**");
    await appendLine(situationSec, situation);

    // ---- Emotion (select, with Other fallback) ----
    const EMOTIONS = [
        "Disappointment",
        "Frustration",
        "Embarrassment",
        "Stress",
        "Disrespect",
        "Nervousness",
        "Worry",
        "Insecurity",
        "Other",
    ];

    const emotionOptions = EMOTIONS.map((e) => ({
        value: (e || "").toLowerCase().replace(/[^a-z0-9_-]/g, "-"),
        label: e,
    }));

    const emotionSelect = buildSelectFromOptions(emotionOptions);

    let emotion = await mustPrompt(
        "What emotion best fits what you're feeling?",
        2,
        "Pain Button",
        emotionSelect
    );

    // Map the select value back to a label
    const picked = emotionOptions.find((o) => o.value === emotion);
    emotion = picked?.label || "";

    if (emotion === "Other" || !emotion) {
        emotion = await mustPrompt("What emotion are you experiencing?", 1, "Pain Button");
    }

    const emotionSec = await ensureSection(uid, "**Emotion:**");
    await appendLine(emotionSec, emotion);

    // ---- Reflection (timed entry -> writes into a single child under Reflection) ----
    const reflectionSec = await ensureSection(uid, "**Reflection:**");

    // Create just ONE child to hold the user's reflection
    const reflectionAnswerUid = await trackedCreateBlock(reflectionSec, "last", "");

    // Timed text entry (3 min) — instruction lives in the prompt
    const reflectionText = await mustPrompt(
        "Reflect for 3 minutes:\n\n• What happened (facts)?\n• What did you assume / interpret?\n• What did you do next?\n\nType below — it will auto-save when time runs out (or press Save).",
        6,
        "Pain Button — 3-minute reflection",
        null,
        180000
    );

    await trackedUpdateBlock(reflectionAnswerUid, String(reflectionText ?? ""), true);
    await safeSetFocus(reflectionAnswerUid);

    // ---- Questions ----
    const questionsSec = await ensureSection(uid, "**Answer these questions:**");

    const warranted = await mustPrompt(
        "Do you still feel this pain was warranted or valid?",
        3,
        "Pain Button"
    );

    const stillMatters = await mustPrompt(
        "Does this situation still matter today?",
        3,
        "Pain Button"
    );

    const mitigation = await mustPrompt(
        "What is one thing you could do to mitigate against this type of pain in the future?",
        1,
        "Pain Button"
    );

    await appendLine(questionsSec, `Was the pain warranted and valid:: ${warranted}`);
    await appendLine(questionsSec, `Does the situation still matter:: ${stillMatters}`);

    // ---- Mitigation ----
    const mitigationSec = await ensureSection(uid, "**Mitigation:**");
    await appendLine(mitigationSec, mitigation);

    // Optional close-out / next note
    const closeSec = await ensureSection(uid, "**Progress:**");
    const closeLeaf = await leaf(closeSec, { focus: true });
    await trackedUpdateBlock(
        closeLeaf,
        "What did you learn here — and what will you do differently next time?",
        true
    );
    await safeSetFocus(closeLeaf);
}

// Plus, Minus and Interesting
async function aot_pmi(uid) {
    throwIfCancelled();

    const situation = await mustPrompt("What situation are you facing/considering?", 1, "Plus, Minus and Interesting");
    await setRootHeading(uid, `**Situation:** ${situation}`);

    const plusUID = await ensureSection(uid, "**Plus:**", { order: 0 });
    while (true) {
        throwIfCancelled();
        const plus = await mustPrompt("What is a positive aspect of this situation?", 1, "Plus, Minus and Interesting");
        await appendLine(plusUID, plus);

        const more = await mustPrompt("Are there any more positive aspects to consider?", 3, "Plus, Minus and Interesting");
        if (more !== "yes") break;
    }

    const minusUID = await ensureSection(uid, "**Minus:**", { order: 1 });
    while (true) {
        throwIfCancelled();
        const minus = await mustPrompt("What is a negative aspect of this situation?", 1, "Plus, Minus and Interesting");
        await appendLine(minusUID, minus);

        const more = await mustPrompt("Are there any more negative aspects to consider?", 3, "Plus, Minus and Interesting");
        if (more !== "yes") break;
    }

    const intUID = await ensureSection(uid, "**Interesting:**", { order: 2 });
    while (true) {
        throwIfCancelled();
        const int = await mustPrompt("What is an interesting aspect of this situation?", 1, "Plus, Minus and Interesting");
        await appendLine(intUID, int);

        const more = await mustPrompt("Are there any more interesting aspects to consider?", 3, "Plus, Minus and Interesting");
        if (more !== "yes") break;
    }
}

// REALLY?
async function aot_really(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, "REALLY?::", true);
    });

    const claim = await mustPrompt(
        "What statement, belief, or assumption are you questioning?",
        1,
        "REALLY?"
    );
    const claimSec = await ensureSection(uid, "**Claim:**");
    await appendLine(claimSec, claim);

    const evidence = await mustPrompt(
        "What evidence supports this claim?",
        1,
        "REALLY?"
    );
    const eSec = await ensureSection(uid, "**Evidence:**");
    await appendLine(eSec, evidence);

    const counter = await mustPrompt(
        "What evidence or examples might contradict it?",
        1,
        "REALLY?"
    );
    const cSec = await ensureSection(uid, "**Contrary evidence:**");
    await appendLine(cSec, counter);

    const scope = await mustPrompt(
        "Is this always true, usually true, or only sometimes true?",
        1,
        "REALLY?"
    );
    const sSec = await ensureSection(uid, "**Scope / limits:**");
    await appendLine(sSec, scope);

    const alt = await mustPrompt(
        "What alternative explanations could exist?",
        1,
        "REALLY?"
    );
    const aSec = await ensureSection(uid, "**Alternative explanations:**");
    await appendLine(aSec, alt);

    const reviseSec = await ensureSection(uid, "**Revised belief:**");
    const leafUid = await leaf(reviseSec, { focus: true });
    await trackedUpdateBlock(
        leafUid,
        "After questioning this, how would you now state the belief more accurately?",
        true
    );
    await safeSetFocus(leafUid);
}

// REAPPRAISED — Research Integrity Checklist
// https://www.cortexfutura.com/adversarial-reading/
async function aot_reappraised(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(
        uid,
        ctx?.windowId || runtime.focusedWindow,
        async () => {
            await trackedUpdateBlock(uid, "REAPPRAISED::", true);
        }
    );

    const paper = await mustPrompt(
        "What paper, preprint, or study are you evaluating?",
        1,
        "REAPPRAISED"
    );

    const root = await ensureSection(uid, "**Paper under review:**");
    await appendLine(root, paper);

    const sections = [
        {
            title: "Research governance",
            items: [
                "Are the locations where the research took place specified, and is this information plausible?",
                "Is a funding source reported?",
                "Has the study been registered?",
                "Are details such as dates and study methods consistent with registration documents?",
            ],
        },
        {
            title: "Ethics",
            items: [
                "Is there evidence that the work has been approved by a specific, recognized committee?",
                "Are there any concerns about unethical practice?",
            ],
        },
        {
            title: "Authorship",
            items: [
                "Do all authors meet criteria for authorship?",
                "Are contributorship statements present?",
                "Are contributorship statements complete?",
                "Is authorship of related papers consistent?",
                "Can co-authors attest to the reliability of the paper?",
            ],
        },
        {
            title: "Productivity",
            items: [
                "Is the volume of work reported by the research group plausible?",
                "Is the reported staffing adequate for the study conduct as described?",
            ],
        },
        {
            title: "Plagiarism",
            items: [
                "Is there evidence of copied work?",
                "Is there evidence of text recycling or inconsistent pasted material?",
            ],
        },
        {
            title: "Research conduct",
            items: [
                "Is participant recruitment plausible within the stated timeframe?",
                "Is recruitment plausible given the epidemiology of the disease and study location?",
                "Do animal or participant numbers align with what is reported?",
                "Are withdrawals compatible with disease, age, and timeline?",
                "Are deaths compatible with disease, age, and timeline?",
                "Is the interval between study completion and manuscript submission plausible?",
                "Could the study plausibly be completed as described?",
            ],
        },
        {
            title: "Analyses and methods",
            items: [
                "Are the study methods plausible at the stated location?",
                "Have appropriate analyses been undertaken and reported?",
                "Is there evidence of poor methodology (missing data, inappropriate handling)?",
                "Is there evidence of p-hacking or selective analyses?",
                "Is there evidence of unacknowledged multiple testing?",
                "Is there outcome switching compared to registered analysis plans?",
            ],
        },
        {
            title: "Image manipulation",
            items: [
                "Is there evidence of manipulation or duplication of images?",
            ],
        },
        {
            title: "Statistics and data",
            items: [
                "Are any data impossible?",
                "Are subgroup means incompatible with whole-cohort data?",
                "Are summary data compatible with reported ranges?",
                "Are summary outcomes identical across groups?",
                "Are there discrepancies between figures, tables, and text?",
                "Are statistical test results compatible with reported data?",
                "Are baseline data excessively similar or different between groups?",
                "Are outcome data unexpected outliers?",
                "Are outcome frequencies unusual?",
                "Are any data outside expected ranges for sex, age, or disease?",
                "Are percentage and absolute changes consistent?",
                "Are data consistent with inclusion criteria?",
                "Are variances in biological variables implausibly consistent?",
            ],
        },
        {
            title: "Errors",
            items: [
                "Are correct units reported?",
                "Are participant numbers correct and consistent?",
                "Are proportions and percentages calculated correctly?",
                "Are results internally consistent?",
                "Are statistical results internally consistent and plausible?",
                "Are other data errors present?",
                "Are there typographical errors?",
            ],
        },
        {
            title: "Data duplication and reporting",
            items: [
                "Have the data been published elsewhere?",
                "Is duplicate reporting acknowledged or explained?",
                "How much data is duplicate reported?",
                "Are duplicate data consistent across publications?",
                "Are methods consistent across publications?",
                "Is there evidence of figure duplication?",
            ],
        },
    ];

    for (const section of sections) {
        const secUid = await ensureSection(uid, section.title);
        for (const q of section.items) {
            await appendLine(secUid, q);
        }
    }

    // Leave cursor somewhere sensible
    await safeSetFocus(uid);
}

// Recognise, Analyse, Divide
async function aot_rad(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();
    await setRootHeading(uid, "Recognise, Analyse, Divide::", true);

    const issue = await mustPrompt("What issue/problem are you working on (one sentence)?", 1, "Recognise, Analyse, Divide");
    const issueSec = await ensureSection(uid, "**Issue:**");
    await appendLine(issueSec, String(issue));

    const recogniseSec = await ensureSection(uid, "**Recognise (what’s here?):**");
    await appendLine(recogniseSec, "List key elements without solving yet (facts, stakeholders, constraints, unknowns).");

    while (true) {
        throwIfCancelled();
        const item = await mustPrompt("Name one key element (fact/stakeholder/constraint/unknown).", 1, "Recognise");
        await appendLine(recogniseSec, String(item));
        const more = await mustPrompt("Add another element?", 3, "Recognise");
        if (more !== "yes") break;
    }

    const analyseSec = await ensureSection(uid, "**Analyse (what’s going on?):**");
    const a1 = await mustPrompt("What do you think is driving this issue? (causes/mechanisms)", 1, "Analyse");
    await appendLine(analyseSec, `**Drivers:** ${a1}`);
    const a2 = await mustPrompt("What assumptions are you making (yours/theirs/systemic)?", 1, "Analyse");
    await appendLine(analyseSec, `**Assumptions:** ${a2}`);
    const a3 = await mustPrompt("What’s missing or uncertain? What would you need to learn?", 1, "Analyse");
    await appendLine(analyseSec, `**Unknowns:** ${a3}`);

    const divideSec = await ensureSection(uid, "**Divide (split into parts):**");
    await appendLine(divideSec, "Break the issue into smaller sub-problems you can address independently.");

    let n = 1;
    while (true) {
        throwIfCancelled();

        const sub = await mustPrompt(
            n === 1 ? "What is the first sub-problem?" : "What is another sub-problem?",
            1,
            "Divide"
        );

        // Create a node so we can attach children
        const subNode = await trackedCreateBlock(divideSec, "last", `**Sub-problem ${n}:** ${String(sub)}`);
        const clarify = await mustPrompt("Describe it clearly (what counts as solved?).", 1, "Divide");
        await trackedCreateBlock(subNode, "last", `**Definition:** ${String(clarify)}`);

        const next = await mustPrompt("What is the first actionable next step?", 1, "Divide");
        const nextSec = await trackedCreateBlock(subNode, "last", "**Next step:**");
        const todoLeaf = await leaf(nextSec, { focus: false });
        await trackedUpdateBlock(todoLeaf, `{{[[TODO]]}} ${String(next)}`, true);

        const more = await mustPrompt("Add another sub-problem?", 3, "Divide");
        if (more !== "yes") break;
        n += 1;

        if (n > 10) {
            await prompt("You’ve added many sub-problems. Consider stopping and ranking them.", 4, "Recognise, Analyse, Divide", null, 6000);
            break;
        }
    }

    const focusSec = await ensureSection(uid, "**Now choose one:**");
    const focusLeaf = await leaf(focusSec, { focus: true });
    await trackedUpdateBlock(focusLeaf, "Which sub-problem will you tackle first, and why?", true);
    await safeSetFocus(focusLeaf);
}

// Regret Minimisation
async function aot_regret_min(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    await setRootHeading(uid, "Regret Minimisation::", true);

    const decision = await mustPrompt("What decision are you considering?", 1, "Regret Minimisation");
    const dSec = await ensureSection(uid, "**Decision:**");
    await appendLine(dSec, String(decision));

    const horizon = await mustPrompt("Choose a time horizon (e.g., 1 year / 5 years / 10 years).", 1, "Regret Minimisation");
    const hSec = await ensureSection(uid, "**Time horizon:**");
    await appendLine(hSec, String(horizon));

    const self = await mustPrompt(`Imagine yourself ${horizon} from now. What do you value most about that future life?`, 1, "Regret Minimisation");
    const vSec = await ensureSection(uid, "**Future-self values:**");
    await appendLine(vSec, String(self));

    const doSec = await ensureSection(uid, "**If you DO it, you might regret:**");
    while (true) {
        throwIfCancelled();
        const r = await mustPrompt("Name one possible regret if you do it.", 1, "Regret Minimisation");
        await appendLine(doSec, String(r));
        const more = await mustPrompt("Add another regret (DO)?", 3, "Regret Minimisation");
        if (more !== "yes") break;
    }

    const dontSec = await ensureSection(uid, "**If you DON’T do it, you might regret:**");
    while (true) {
        throwIfCancelled();
        const r = await mustPrompt("Name one possible regret if you don’t do it.", 1, "Regret Minimisation");
        await appendLine(dontSec, String(r));
        const more = await mustPrompt("Add another regret (DON’T)?", 3, "Regret Minimisation");
        if (more !== "yes") break;
    }

    const mitigateSec = await ensureSection(uid, "**How to reduce regrets:**");
    const m1 = await mustPrompt("What could you do now to reduce the biggest DO-regret?", 1, "Regret Minimisation");
    await appendLine(mitigateSec, `**Reduce DO-regret:** ${m1}`);
    const m2 = await mustPrompt("What could you do now to reduce the biggest DON’T-regret?", 1, "Regret Minimisation");
    await appendLine(mitigateSec, `**Reduce DON’T-regret:** ${m2}`);

    const choiceSec = await ensureSection(uid, "**Decision draft:**");
    const choice = await mustPrompt("Given this, what do you choose (for now)?", 1, "Regret Minimisation");
    await appendLine(choiceSec, String(choice));

    const nextSec = await ensureSection(uid, "**Next action:**");
    const next = await mustPrompt("What is the next small action to move forward (or test)?", 1, "Regret Minimisation");
    const todoLeaf = await leaf(nextSec, { focus: true });
    await trackedUpdateBlock(todoLeaf, `{{[[TODO]]}} ${String(next)}`, true);
    await safeSetFocus(todoLeaf);
}

// Right to Disagree (Cortex triage)
// https://www.cortexfutura.com/adversarial-reading/
async function aot_right_to_disagree_cortex(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, "Right to Disagree::", true);
    });

    // Optional traceability line
    const srcSec = await ensureSection(uid, "**Source:**");
    await appendLine(srcSec, "Cortex Futura — adversarial reading / right to disagree");

    const claim = await mustPrompt(
        "What claim, belief, or position are you disagreeing with?",
        1,
        "Right to Disagree"
    );

    // (3) Standardize heading
    const claimSec = await ensureSection(uid, "**Claim:**");
    await appendLine(claimSec, claim);

    const whySec = await ensureSection(uid, "**Why I disagree:**");

    // (5) Small ergonomics: one-line instruction
    await appendLine(whySec, "Sort your objections into the buckets below (add notes under each).");

    // Cortex buckets
    const missing = await trackedCreateBlock(whySec, "last", "Missing information?");
    const wrong = await trackedCreateBlock(whySec, "last", "Wrong information?");
    const reasoning = await trackedCreateBlock(whySec, "last", "Reasoning errors?");
    const nonSeq = await trackedCreateBlock(reasoning, "last", "Non sequitur?");
    const incons = await trackedCreateBlock(reasoning, "last", "Inconsistency?");
    const incomplete = await trackedCreateBlock(whySec, "last", "Incomplete analysis?");

    // (1) Make buckets immediately writable (create empty leaves)
    const missingLeaf = await leaf(missing, { focus: true });
    await leaf(wrong);
    await leaf(nonSeq);
    await leaf(incons);
    await leaf(incomplete);

    // Ensure focus lands on a writable spot
    await safeSetFocus(missingLeaf);

    // Optional “update condition” (recommended)
    const changeSec = await ensureSection(uid, "**What would change my mind:**");
    const changeLeaf = await leaf(changeSec);
    await trackedUpdateBlock(changeLeaf, "Evidence/arguments: ", true);
    // (Do not steal focus from the bucket triage by default)
}

// Right to Disagree (Deep)
// Neutral, argument-focused, keeps steelman/crux/change-mind
async function aot_right_to_disagree_deep(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const ctx = getCtx();
    await detachEditorFromBlockThenWrite(uid, ctx?.windowId || runtime.focusedWindow, async () => {
        await trackedUpdateBlock(uid, "Right to Disagree (Deep)::", true);
    });

    // Optional traceability line
    const srcSec = await ensureSection(uid, "**Mode:**");
    await appendLine(srcSec, "Steelman → strongest challenge → crux → update condition → stance");

    const claim = await mustPrompt(
        "What claim, belief, or position is in dispute?",
        1,
        "Right to Disagree (Deep)"
    );

    // (3) Standardize heading
    const claimSec = await ensureSection(uid, "**Claim:**");
    await appendLine(claimSec, claim);

    const steelman = await mustPrompt(
        "Reconstruct the strongest version of the opposing position — as if you agreed with it.",
        1,
        "Right to Disagree (Deep)"
    );
    const steelSec = await ensureSection(uid, "**Strongest opposing case (steelman):**");
    await appendLine(steelSec, steelman);

    const objection = await mustPrompt(
        "What is your main reason for disagreeing (in one sentence)?",
        1,
        "Right to Disagree (Deep)"
    );
    const objSec = await ensureSection(uid, "**Your main reason for disagreeing:**");
    await appendLine(objSec, objection);

    const strongestChallenge = await mustPrompt(
        "What is the strongest point or evidence that challenges your position?",
        1,
        "Right to Disagree (Deep)"
    );
    const challengeSec = await ensureSection(uid, "**Strongest challenge to your view:**");
    await appendLine(challengeSec, strongestChallenge);

    const crux = await mustPrompt(
        "What is the crux of disagreement (the key point where one of you must be wrong, or where different assumptions diverge)?",
        1,
        "Right to Disagree (Deep)"
    );
    const cruxSec = await ensureSection(uid, "**Crux of disagreement:**");
    await appendLine(cruxSec, crux);

    // (2) Add “Where does the disagreement live?” classifier (optional but implemented)
    const whereSec = await ensureSection(uid, "**Where the disagreement lives:**");
    await appendLine(whereSec, "Classify the disagreement (you can pick more than one):");
    await trackedCreateBlock(whereSec, "last", "Missing information");
    await trackedCreateBlock(whereSec, "last", "Wrong information");
    await trackedCreateBlock(whereSec, "last", "Reasoning error");
    await trackedCreateBlock(whereSec, "last", "Incomplete analysis");
    await trackedCreateBlock(whereSec, "last", "Values / priorities");

    const change = await mustPrompt(
        "What evidence, argument, or observation would change your mind (or materially update your confidence)?",
        1,
        "Right to Disagree (Deep)"
    );
    const changeSec = await ensureSection(uid, "**What would change my mind:**");
    await appendLine(changeSec, change);

    const stanceSec = await ensureSection(uid, "**Provisional stance:**");
    const stanceLeaf = await leaf(stanceSec, { focus: true });
    await trackedUpdateBlock(
        stanceLeaf,
        "Given the above, where do you currently stand — and with what level of confidence?",
        true
    );
    await safeSetFocus(stanceLeaf);
}

// Six Thinking Hats
async function aot_six_hats(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();
    await setRootHeading(uid, "Six Thinking Hats::", true);

    const topic = await mustPrompt("What topic/decision/problem are you thinking about?", 1, "Six Thinking Hats");
    const tSec = await ensureSection(uid, "**Topic:**");
    await appendLine(tSec, String(topic));

    const hats = [
        { name: "White Hat", prompt: "List facts, data, and what you *know*. What information is missing?" },
        { name: "Red Hat", prompt: "What are your feelings/intuition here (no justification needed)?" },
        { name: "Black Hat", prompt: "What could go wrong? Risks, downsides, cautions." },
        { name: "Yellow Hat", prompt: "What are the benefits? Upside, value, opportunities." },
        { name: "Green Hat", prompt: "Generate alternatives/creative options. What else could you do?" },
        { name: "Blue Hat", prompt: "What is the process/next steps? Summarise and decide how you’ll proceed." },
    ];

    for (const h of hats) {
        throwIfCancelled();

        const sec = await ensureSection(uid, `**${h.name}:**`);

        // Let user add multiple bullets per hat
        while (true) {
            throwIfCancelled();
            const line = await mustPrompt(h.prompt, 1, h.name);
            await appendLine(sec, String(line));

            const more = await mustPrompt(`Add another note for ${h.name}?`, 3, "Six Thinking Hats");
            if (more !== "yes") break;
        }
    }

    const synth = await ensureSection(uid, "**Synthesis:**");
    const synthLeaf = await leaf(synth, { focus: true });
    await trackedUpdateBlock(synthLeaf, "What is your current best conclusion? What will you do next?", true);
    await safeSetFocus(synthLeaf);
}

// SWOT Analysis — COMPLETE
async function aot_swot(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();
    await setRootHeading(uid, "SWOT Analysis::", true);

    const subject = await mustPrompt("What are you doing a SWOT for (project, decision, career move, strategy)?", 1, "SWOT Analysis");
    const sSec = await ensureSection(uid, "**Subject:**");
    await appendLine(sSec, String(subject));

    const sections = [
        { title: "**Strengths:**", q: "Add one strength (internal advantage).", name: "Strengths" },
        { title: "**Weaknesses:**", q: "Add one weakness (internal limitation).", name: "Weaknesses" },
        { title: "**Opportunities:**", q: "Add one opportunity (external upside).", name: "Opportunities" },
        { title: "**Threats:**", q: "Add one threat (external risk).", name: "Threats" },
    ];

    const uids = {};

    for (const s of sections) {
        throwIfCancelled();
        const secUid = await ensureSection(uid, s.title);
        uids[s.name] = secUid;

        while (true) {
            throwIfCancelled();
            const item = await mustPrompt(s.q, 1, "SWOT Analysis");
            await appendLine(secUid, String(item));

            const more = await mustPrompt(`Add another ${s.name.toLowerCase().slice(0, -1)}?`, 3, "SWOT Analysis");
            if (more !== "yes") break;
        }
    }

    const strat = await ensureSection(uid, "**Strategies:**");
    await appendLine(strat, "**SO:** Use strengths to seize opportunities.");
    await appendLine(strat, "**ST:** Use strengths to reduce threats.");
    await appendLine(strat, "**WO:** Use opportunities to improve weaknesses.");
    await appendLine(strat, "**WT:** Reduce weaknesses to avoid threats.");

    const so = await mustPrompt("Name one SO strategy (Strength → Opportunity).", 1, "SWOT Strategies");
    await appendLine(strat, `**SO:** ${so}`);
    const st = await mustPrompt("Name one ST strategy (Strength → Threat).", 1, "SWOT Strategies");
    await appendLine(strat, `**ST:** ${st}`);
    const wo = await mustPrompt("Name one WO strategy (Weakness → Opportunity).", 1, "SWOT Strategies");
    await appendLine(strat, `**WO:** ${wo}`);
    const wt = await mustPrompt("Name one WT strategy (Weakness → Threat).", 1, "SWOT Strategies");
    await appendLine(strat, `**WT:** ${wt}`);

    const priorities = await ensureSection(uid, "**Top priorities:**");
    for (let i = 1; i <= 3; i++) {
        throwIfCancelled();
        const p = await mustPrompt(`Priority ${i}: What will you do? (actionable)`, 1, "SWOT Analysis");
        const todoLeaf = await leaf(priorities, { focus: i === 1 });
        await trackedUpdateBlock(todoLeaf, `{{[[TODO]]}} ${String(p)}`, true);
        if (i === 1) await safeSetFocus(todoLeaf);
    }
}

// Simple Choice
async function aot_choice(uid) {
    throwIfCancelled();

    const { windowId } = getFocus();
    runtime.focusedWindow = windowId || runtime.focusedWindow;
    forceCommitActiveEditor();

    const choice = await mustPrompt("What do you need to decide about?", 1, "Simple Choice");
    await setRootHeading(uid, `**{{[[TODO]]}} [[Choice]]:** ${choice}`);

    const constraintsUid = await ensureSection(uid, "**Constraints:**", { order: 0 });
    while (true) {
        throwIfCancelled();
        const constraints = await mustPrompt("What is one constraint?", 1, "Simple Choice");
        await appendLine(constraintsUid, constraints);

        const more = await mustPrompt("Are there any more constraints?", 3, "Simple Choice");
        if (more !== "yes") break;
    }

    const optUID = await ensureSection(uid, "**Options:**", { order: 1 });
    while (true) {
        throwIfCancelled();
        const options = await mustPrompt("What is one option?", 1, "Simple Choice");
        await appendLine(optUID, options);

        const more = await mustPrompt("Are there any more options?", 3, "Simple Choice");
        if (more !== "yes") break;
    }

    const decUID = await ensureSection(uid, "**Decision:**", { order: 2 });
    await leaf(decUID, { order: 0, focus: true });

    await prompt(
        "Look over your constraints and options, make your decision and record it here.",
        4,
        "Simple Choice:",
        null,
        4000
    );
}

// TOSCA
async function aot_tosca(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const trouble = await mustPrompt(
        'What are the symptoms that make this problem real and present? Be specific. Avoid interpretation or solution ideas. Ask: "Why now?"',
        1,
        "TOSCA"
    );

    await setRootHeading(uid, "[[TOSCA]]:");

    const troubleUID = await ensureSection(uid, "Trouble: ", { order: 0 });
    await appendLine(troubleUID, trouble, 0);

    const owner = await mustPrompt("Whose problem is this?", 1, "TOSCA");
    const ownerUID = await ensureSection(uid, "Owner: ", { order: 1 });
    await appendLine(ownerUID, owner, 0);

    const sc = await mustPrompt("What will success look like, and by when? Include a quantified target if possible.", 1, "TOSCA");
    const scUID = await ensureSection(uid, "Success Criteria: ", { order: 2 });
    await appendLine(scUID, sc, 0);

    const actorsUID = await ensureSection(uid, "Actors: ", { order: 3 });
    while (true) {
        throwIfCancelled();
        const actors = await mustPrompt("Which other stakeholders have a say, and what do they want?", 1, "TOSCA");
        await appendLine(actorsUID, actors);

        const more = await mustPrompt("Are there any other stakeholders?", 3, "TOSCA");
        if (more !== "yes") break;
    }

    const coreQ = await mustPrompt("Now that you've considered the TOSCA items, what is the Core Question?", 1, "TOSCA");
    const coreQUID = await ensureSection(uid, "**Core Question:**", { order: 4 });
    await appendLine(coreQUID, coreQ, 0);
}

// Want, Impediment, Remedy
async function aot_wir(uid) {
    throwIfCancelled();
    forceCommitActiveEditor();

    const want = await mustPrompt("What do you want?", 1, "Want, Impediment, Remedy");
    await setRootHeading(uid, `[[I want]] ${want}`);

    const remedyUids = [];

    while (true) {
        throwIfCancelled();

        const imp = await mustPrompt("What is an impediment to achieving this?", 1, "Want, Impediment, Remedy");
        const impUID = window.roamAlphaAPI.util.generateUID();
        await trackedCreateBlock(uid, "last", `Impediment: ${imp}`, impUID);

        const rem = await mustPrompt("How can I remedy this impediment?", 1, "Want, Impediment, Remedy");
        const remUID = window.roamAlphaAPI.util.generateUID();
        await trackedCreateBlock(impUID, 0, `Remedy: ${rem}`, remUID);

        remedyUids.push(remUID);

        const more = await mustPrompt("Are there any more impediments?", 3, "Want, Impediment, Remedy");
        if (more !== "yes") break;
    }

    const actUID = await ensureSection(uid, "Actions: ", { order: "last" });

    for (let i = 0; i < remedyUids.length; i++) {
        await appendLine(actUID, `((${remedyUids[i]}))`, i);
    }
}

// -------------------- OPV --------------------
// (not registered in palette here, but kept correct if you re-enable later)
// https://www.debono.com/de-bono-thinking-lessons-1/7.-OPV-lesson-plan

async function aot_opv(uid) {
    throwIfCancelled();

    const situation = await mustPrompt("What is the situation?", 1, "Other People's Views");
    await setRootHeading(uid, `**Situation:** ${situation}`);

    const peopleUID = await ensureSection(uid, "{{table}}", { order: 0 });

    while (true) {
        throwIfCancelled();
        const person = await mustPrompt("Who is affected by this?", 1, "Other People's Views");
        const personUID = window.roamAlphaAPI.util.generateUID();
        await trackedCreateBlock(peopleUID, "last", String(person), personUID);

        const more = await mustPrompt("Are there other people affected?", 3, "Other People's Views");
        if (more !== "yes") break;
    }

    // views
    const existingItems = await window.roamAlphaAPI.q(
        `[:find (pull ?page [:block/uid {:block/children [:block/uid :block/string]} ])
          :where [?page :block/uid "${safeUid(peopleUID)}"] ]`
    );

    const table = existingItems?.[0]?.[0];
    const people = table?.children || [];
    if (!people.length) return;

    for (let i = 0; i < people.length; i++) {
        throwIfCancelled();

        const person = people[i];
        const name = person?.string || "this person";
        const personUid = safeUid(person?.uid);
        if (!personUid) continue;

        while (true) {
            throwIfCancelled();
            const view = await mustPrompt(`How does ${name} view this situation?`, 1, "Other People's Views");
            await appendLine(personUid, view);

            const more = await mustPrompt("Do they have any other views?", 3, "Other People's Views");
            if (more !== "yes") break;
        }
    }
}

// -------------------- PROMPT --------------------

async function prompt(message, type, title, selectString, timer) {
    // one-shot resolver guard (prevents double-resolve)
    const once = (resolve) => {
        let done = false;
        return (v) => {
            if (done) return;
            done = true;
            resolve(v);
        };
    };

    // Central cancel handler
    const cancel = (done) => {
        markCancelled();
        done(null);
    };

    const toastId = `aot-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    // ---------- type 1: input ----------
    if (type === 1) {
        return new Promise((resolve) => {
            const done = once(resolve);

            iziToast.question({
                theme: "dark",
                color: "",
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                overlayClose: true,
                closeOnEscape: true,
                displayMode: 2,
                id: toastId,
                title,
                message,
                position: "center",
                inputs: [
                    [
                        '<input type="text" placeholder="">',
                        "keyup",
                        function (instance, toast, input, e) {
                            if (e.code === "Enter") {
                                instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                                done(input.value);
                            }
                        },
                        true,
                    ],
                ],
                buttons: [
                    [
                        "<button><b>Confirm</b></button>",
                        function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            done(inputs?.[0]?.value ?? "");
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            cancel(done);
                        },
                    ],
                ],
                onClosed: function (instance, toast, closedBy) {
                    if (closedBy === "esc" || closedBy === "overlay") cancel(done);
                },
            });
        });
    }

    // ---------- type 2: select ----------
    if (type === 2) {
        return new Promise((resolve) => {
            const done = once(resolve);

            iziToast.question({
                theme: "dark",
                color: "",
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                overlayClose: true,
                closeOnEscape: true,
                id: toastId,
                title,
                message,
                position: "center",
                inputs: [[selectString, "change", function () { }]],
                buttons: [
                    [
                        "<button><b>Confirm</b></button>",
                        function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            const sel = inputs?.[0];
                            const value =
                                sel && sel.options && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].value : "";
                            done(value);
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            cancel(done);
                        },
                    ],
                ],
                onClosed: function (instance, toast, closedBy) {
                    if (closedBy === "esc" || closedBy === "overlay") cancel(done);
                },
            });
        });
    }

    // ---------- type 3: yes/no ----------
    if (type === 3) {
        return new Promise((resolve) => {
            const done = once(resolve);

            iziToast.question({
                theme: "dark",
                color: "",
                layout: 2,
                drag: false,
                timeout: false,
                close: false,
                overlay: true,
                overlayClose: true,
                closeOnEscape: true,
                displayMode: 2,
                id: toastId,
                title,
                message,
                position: "center",
                buttons: [
                    [
                        "<button>Yes</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            done("yes");
                        },
                        false,
                    ],
                    [
                        "<button>No</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            done("no");
                        },
                    ],
                    [
                        "<button>Cancel</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            cancel(done);
                        },
                    ],
                ],
                onClosed: function (instance, toast, closedBy) {
                    if (closedBy === "esc" || closedBy === "overlay") cancel(done);
                },
            });
        });
    }

    // ---------- type 4: toast ----------
    if (type === 4) {
        return new Promise((resolve) => {
            iziToast.show({
                title,
                message,
                theme: "dark",
                layout: 1,
                close: true,
                closeOnEscape: true,
                closeOnClick: true,
                displayMode: 0,
                position: "center",
                timeout: timer,
                progressBar: true,
                overlay: false,
                transitionIn: "fadeInUp",
                transitionOut: "fadeOut",
                transitionInMobile: "fadeInUp",
                transitionOutMobile: "fadeOutDown",
                onClosed: function () {
                    resolve("completed cycle");
                },
            });
        });
    }

    // ---------- type 5: brainstorming toast ----------
    if (type === 5) {
        return new Promise((resolve) => {
            iziToast.show({
                title,
                message,
                theme: "dark",
                layout: 1,
                close: true,
                closeOnEscape: true,
                closeOnClick: true,
                displayMode: 0,
                position: "bottomRight",
                timeout: timer,
                progressBar: true,
                overlay: false,
                transitionIn: "fadeInUp",
                transitionOut: "fadeOut",
                transitionInMobile: "fadeInUp",
                transitionOutMobile: "fadeOutDown",
                onClosed: function () {
                    resolve("completed cycle");
                },
            });
        });
    }

    // ---------- type 6: timed text entry (textarea) ----------
    // Returns the typed text when user confirms OR when timer elapses.
    // Cancel / overlay / esc still returns null.
    if (type === 6) {
        return new Promise((resolve) => {
            const done = once(resolve);

            iziToast.question({
                theme: "dark",
                color: "",
                layout: 2,
                drag: false,
                timeout: typeof timer === "number" ? timer : 180000, // default 3 min
                close: false,
                overlay: true,
                overlayClose: true,
                closeOnEscape: true,
                displayMode: 2,
                id: toastId,
                title,
                message,
                position: "center",
                progressBar: true,
                inputs: [
                    [
                        '<textarea rows = "6" style = "min-width:400px; min-height:220px; resize:vertical; font-size:14px; line-height:1.4;"placeholder = "Type here..."></textarea >', "keyup",
                        function (instance, toast, input, e) {
                            // Ctrl/Cmd+Enter submits quickly
                            if ((e.ctrlKey || e.metaKey) && e.code === "Enter") {
                                instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                                done(input.value);
                            }
                        },
                        true,
                    ],
                ],
                buttons: [
                    [
                        "<button><b>Save</b></button>",
                        function (instance, toast, button, e, inputs) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            done(inputs?.[0]?.value ?? "");
                        },
                        false,
                    ],
                    [
                        "<button>Cancel</button>",
                        function (instance, toast) {
                            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
                            cancel(done);
                        },
                    ],
                ],
                onClosed: function (instance, toast, closedBy) {
                    // If it was closed by timeout, treat it as "Save what you typed"
                    if (closedBy === "timeout") {
                        const ta = toast?.querySelector?.("textarea");
                        done(ta?.value ?? "");
                        return;
                    }
                    // If it was closed by esc/overlay, treat as cancel unless already resolved
                    if (closedBy === "esc" || closedBy === "overlay") cancel(done);
                },
            });
        });
    }

    return null;
}
