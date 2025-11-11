const $ = (sel) => document.querySelector(sel);
const coreBase = window.JINX_CORE_URL || location.origin;

const els = {
  statOnline: $("#statOnline"),
  statTotal: $("#statTotal"),
  statWindow: $("#statWindow"),
  coreUrl: $("#coreUrl"),
  rows: $("#rows"),
  btnRefresh: $("#btnRefresh"),
  autoRefresh: $("#autoRefresh"),
  search: $("#search"),
  typeFilter: $("#typeFilter"),
  footInfo: $("#footInfo"),
};

els.coreUrl.textContent = coreBase;

let nodes = [];
let timer = null;

function timeAgo(d) {
  const t = (Date.now() - new Date(d).getTime()) / 1000;
  if (t < 60) return `${Math.floor(t)}s ago`;
  if (t < 3600) return `${Math.floor(t/60)}m ago`;
  return `${Math.floor(t/3600)}h ago`;
}

async function fetchStats() {
  try {
    const r = await fetch(`${coreBase}/core/nodes/stats`);
    const j = await r.json();
    if (j.success) {
      els.statOnline.textContent = j.online;
      els.statTotal.textContent = j.all;
      els.statWindow.textContent = `${j.windowMinutes}m`;
      els.footInfo.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    }
  } catch (e) {
    console.warn("Stats error", e);
  }
}

async function fetchNodes() {
  try {
    const r = await fetch(`${coreBase}/core/nodes/list`);
    const j = await r.json();
    nodes = j.nodes || [];
    renderRows();
  } catch (e) {
    console.warn("List error", e);
  }
}

function renderRows() {
  const q = (els.search.value || "").toLowerCase();
  const type = els.typeFilter.value;
  const since = Date.now() - 2 * 60 * 1000;

  const filtered = nodes.filter(n => {
    const hay =
      (n.siteId || "") + " " + (n.url || "") + " " + (n.nodeType || "") + " " + (n.version || "");
    const okText = hay.toLowerCase().includes(q);
    const okType = !type || (n.nodeType === type);
    return okText && okType;
  });

  els.rows.innerHTML = filtered.map(n => {
    const online = new Date(n.lastSeen).getTime() >= since;
    return `
      <tr>
        <td class="mono">${n.siteId || "-"}</td>
        <td>${n.nodeType || "-"}</td>
        <td>${n.version || "-"}</td>
        <td><a class="mono" href="${n.url || "#"}" target="_blank">${n.url || "-"}</a></td>
        <td>${n.lastSeen ? timeAgo(n.lastSeen) : "-"}</td>
        <td><span class="badge ${online ? "ok" : "bad"}">${online ? "online" : "offline"}</span></td>
      </tr>
    `;
  }).join("");
}

async function refreshAll() {
  await Promise.all([fetchStats(), fetchNodes()]);
}

els.btnRefresh.addEventListener("click", refreshAll);
els.search.addEventListener("input", renderRows);
els.typeFilter.addEventListener("change", renderRows);

function startAuto() {
  if (timer) clearInterval(timer);
  if (els.autoRefresh.checked) {
    timer = setInterval(refreshAll, 5000);
  }
}
els.autoRefresh.addEventListener("change", startAuto);

// init
refreshAll().then(startAuto);
