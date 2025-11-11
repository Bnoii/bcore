console.log("🚀 Jinx Core Dashboard loaded");

const coreUrl = window.JINX_CORE_URL || location.origin;
const statOnline = document.getElementById("statOnline");
const statTotal = document.getElementById("statTotal");
const rows = document.getElementById("rows");
const tokenRows = document.getElementById("tokenRows");
const btnRefresh = document.getElementById("btnRefresh");
const btnReloadTokens = document.getElementById("btnReloadTokens");
const btnNewToken = document.getElementById("btnNewToken");
const autoRefresh = document.getElementById("autoRefresh");
const footInfo = document.getElementById("footInfo");

let refreshInterval = null;
let lastRefresh = null;

// ========================
// 🧩 FETCH NODE STATS
// ========================
async function loadStats() {
  try {
    const res = await fetch(`${coreUrl}/core/nodes/stats`);
    const data = await res.json();
    if (!data.success) throw new Error("Stats error");

    statOnline.textContent = data.online;
    statTotal.textContent = data.all;
    document.getElementById("statWindow").textContent = `${data.windowMinutes}m`;
    document.getElementById("coreUrl").textContent = coreUrl;

    footInfo.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
  } catch (err) {
    console.error("⚠️ Stats fetch failed:", err.message);
    statOnline.textContent = "—";
    statTotal.textContent = "—";
  }
}

// ========================
// 📊 FETCH NODE LIST
// ========================
async function loadNodes() {
  try {
    const res = await fetch(`${coreUrl}/core/nodes/list`);
    const data = await res.json();
    if (!data.success) throw new Error("List error");

    rows.innerHTML = data.nodes
      .map((n) => {
        const online =
          new Date() - new Date(n.lastSeen) < 120000
            ? '<span class="status online">● Online</span>'
            : '<span class="status offline">○ Offline</span>';
        return `
          <tr>
            <td>${n.siteId}</td>
            <td>${n.nodeType || "standard"}</td>
            <td>${n.version || "—"}</td>
            <td><a href="${n.url || "#"}" target="_blank">${n.url || "—"}</a></td>
            <td>${new Date(n.lastSeen).toLocaleTimeString()}</td>
            <td>${online}</td>
          </tr>`;
      })
      .join("");
  } catch (err) {
    console.error("⚠️ Node fetch failed:", err);
  }
}

// ========================
// 🔒 TOKEN SYSTEM
// ========================

// Local master key for Core actions (Hunn$0330)
const MASTER_KEY = "ilovepixiee";

async function loadTokens() {
  try {
    const res = await fetch(`${coreUrl}/core/nodes/tokens`, {
      headers: { Authorization: `Bearer ${MASTER_KEY}` },
    });
    const data = await res.json();
    if (!data.success) throw new Error("Token load failed");

    tokenRows.innerHTML = data.tokens
      .map(
        (t) => `
      <tr>
        <td>${t.name}</td>
        <td class="mono small">${t.token}</td>
        <td>${t.active ? "✅ Active" : "❌ Inactive"}</td>
        <td>${new Date(t.createdAt).toLocaleDateString()}</td>
        <td>${t.expiresAt ? new Date(t.expiresAt).toLocaleDateString() : "—"}</td>
        <td>
          <button class="btn-small btn-danger" onclick="deleteToken('${t._id}')">Revoke</button>
        </td>
      </tr>`
      )
      .join("");
  } catch (err) {
    console.warn("⚠️ Failed to load tokens:", err.message);
    tokenRows.innerHTML = `<tr><td colspan="6" style="text-align:center;">No tokens found or access denied</td></tr>`;
  }
}

async function createToken() {
  const name = prompt("Enter token name:");
  if (!name) return;
  try {
    const res = await fetch(`${coreUrl}/core/nodes/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MASTER_KEY}`,
      },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (data.success) {
      alert(`✅ Token created:\n${data.token}`);
      loadTokens();
    } else alert("❌ " + (data.error || "Failed"));
  } catch (err) {
    alert("⚠️ Failed to create token: " + err.message);
  }
}

async function deleteToken(id) {
  if (!confirm("Revoke this token?")) return;
  try {
    const res = await fetch(`${coreUrl}/core/nodes/token/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${MASTER_KEY}` },
    });
    const data = await res.json();
    if (data.success) {
      alert("✅ Token revoked");
      loadTokens();
    } else alert("❌ Failed: " + (data.error || ""));
  } catch (err) {
    alert("⚠️ Error: " + err.message);
  }
}

// ========================
// ⚙️ CONTROL PANEL
// ========================
btnRefresh.onclick = () => refreshAll();
btnReloadTokens.onclick = () => loadTokens();
btnNewToken.onclick = () => createToken();

function refreshAll() {
  loadStats();
  loadNodes();
  loadTokens();
  lastRefresh = Date.now();
}

if (autoRefresh) {
  refreshInterval = setInterval(() => {
    if (autoRefresh.checked) refreshAll();
  }, 10000);
}

// Initial load
refreshAll();
