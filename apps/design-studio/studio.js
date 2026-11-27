const app = document.querySelector("#app"),
  nav = document.querySelector("#nav"),
  dialog = document.querySelector("dialog");
const by = (id) => document.getElementById(id);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const button = (label, id, primary = false) =>
  '<button type="button" id="' +
  id +
  '" class="' +
  (primary ? "primary" : "") +
  '">' +
  label +
  "</button>";
const counts =
  '<select name="count"><option>10</option><option selected>20</option><option>50</option><option>100</option></select>';
const uid = () => crypto.randomUUID();
let db,
  projects = [],
  p,
  round,
  ri,
  vi,
  tray = false,
  filtered = false,
  native = false,
  marking = false,
  pending,
  hidden = false,
  compare = false,
  reference = 0,
  observer,
  undo,
  timer;
const jobs = new Set(),
  positions = new Map();
function message(s) {
  by("status").textContent = s;
  clearTimeout(timer);
  timer = setTimeout(() => (by("status").textContent = ""), 4500);
}
function on(id, fn) {
  by(id)?.addEventListener("click", fn);
}
function save(project) {
  const previous = project.revision || 0;
  const { picture, ...record } = project;
  project.revision = record.revision = previous + 1;
  record.updated = project.updated = Date.now();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("projects", "readwrite");
    const store = tx.objectStore("projects");
    let conflict = false;
    store.getKey(record.id).onsuccess = (event) => {
      if (event.target.result === undefined) {
        store.put(record);
        return;
      }
      store.get(record.id).onsuccess = (read) => {
        if ((read.target.result.revision || 0) !== previous) {
          conflict = true;
          tx.abort();
          return;
        }
        store.put(record);
      };
    };
    tx.oncomplete = resolve;
    tx.onabort = () => {
      if (project.revision === record.revision) project.revision = previous;
      reject(
        conflict
          ? Error(
              "This workspace changed in another tab. Reload before continuing.",
            )
          : tx.error,
      );
    };
  });
}
function path(project, r, v) {
  return "#/" + project.id + "/" + r + (v == null ? "" : "/" + v);
}
function variant(r, i) {
  return "R" + (r + 1) + " · " + String(i + 1).padStart(3, "0");
}
function paint(canvas, project, r, limit, crop) {
  StudioArt.draw(canvas, project, r, limit, crop);
}
async function init() {
  db = await new Promise((resolve, reject) => {
    const req = indexedDB.open("vcr-design-explorations", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("projects", { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  projects = await new Promise((resolve, reject) => {
    const req = db.transaction("projects").objectStore("projects").getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  for (const project of projects)
    if (project.asset) project.picture = await loadImage(project.asset);
  route();
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(Error("Image could not be opened"));
    img.src = url;
  });
}
function route() {
  const [, id, r, v] = location.hash.split("/");
  p = projects.find((a) => a.id === id);
  ri = Number(r);
  round = p?.rounds[ri];
  vi = v === undefined ? null : Number(v);
  if (!round) {
    p = null;
    home();
    return;
  }
  if (vi !== null && !round.items[vi]) vi = null;
  marking = false;
  pending = null;
  native = false;
  compare = false;
  reference = 0;
  render();
  if (vi === null) {
    const pos = positions.get(path(p, ri));
    if (pos) {
      by("tile" + pos.i)?.focus({ preventScroll: true });
      window.scrollTo(0, pos.y);
    }
  }
}
function home() {
  observer?.disconnect();
  nav.innerHTML = "";
  tray = false;
  filtered = false;
  app.innerHTML =
    '<div class="home"><section class="hero"><div><h1>Design<br>explorations</h1><p>Explore a brief in parallel. Keep the details that work and take them into the next round.</p>' +
    button("New exploration", "new", true) +
    '</div><div class="sample" aria-label="Sample graphic treatments"><canvas></canvas><canvas></canvas><canvas></canvas></div></section><div class="row"><h2>Recent explorations</h2><small>Saved in this browser</small></div><div class="recent"></div></div>';
  app
    .querySelectorAll(".sample canvas")
    .forEach((c, i) =>
      paint(
        c,
        { width: 320, height: 450, copy: "Form\nstudies" },
        {
          layout: [0, 1, 4][i],
          palette: [0, 3, 2][i],
          motif: [1, 3, 2][i],
          phase: 0.34,
          inset: 0.055,
          font: i,
        },
      ),
    );
  const list = app.querySelector(".recent");
  if (!projects.length)
    list.innerHTML = '<p class="sub">Your explorations will appear here.</p>';
  for (const project of projects
    .slice()
    .sort((a, b) => b.updated - a.updated)) {
    const b = document.createElement("button");
    b.textContent =
      project.name +
      " · " +
      project.rounds.length +
      " round" +
      (project.rounds.length === 1 ? "" : "s");
    b.onclick = () =>
      (location.hash = path(project, project.rounds.length - 1));
    list.append(b);
  }
  on("new", () => form(false));
}
function form(next) {
  const refs = next ? p.marks.filter((m) => m.selected) : [];
  dialog.innerHTML =
    '<form><div class="row"><h2>' +
    (next ? "New round" : "New exploration") +
    "</h2>" +
    button("Close", "close") +
    "</div>" +
    (next
      ? '<div id="chosen"></div><label class="field">Direction for this round<textarea name="direction"></textarea></label>'
      : '<label class="field">Workspace name<input name="name" required maxlength="80" autofocus></label><label class="field">Design brief<textarea name="brief" required></textarea></label><label class="field">Required copy<textarea name="copy" required maxlength="1200"></textarea></label><label class="field">Image (optional)<input name="image" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="dims">' +
        ["Width", "Height"]
          .map(
            (k, i) =>
              '<label class="field">' +
              k +
              ' (px)<input name="' +
              k +
              '" type="number" min="64" max="4096" required value="' +
              [1080, 1350][i] +
              '"></label>',
          )
          .join("") +
        "</div>") +
    '<label class="field">Variants' +
    counts +
    '</label><button class="primary">Generate</button></form>';
  if (next)
    for (const m of refs) {
      const c = document.createElement("canvas");
      c.className = "crop";
      c.title = m.note || variant(m.round, m.item);
      by("chosen").append(c);
      paint(c, p, p.rounds[m.round].items[m.item], 140, m.box);
    }
  dialog.showModal();
  on("close", () => dialog.close());
  dialog.querySelector("form").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target),
      submit = e.submitter;
    submit.disabled = true;
    try {
      let project = p;
      if (!next) {
        project = {
          id: uid(),
          name: f.get("name").trim(),
          brief: f.get("brief").trim(),
          copy: f.get("copy"),
          width: +f.get("Width"),
          height: +f.get("Height"),
          marks: [],
          rounds: [],
        };
        const file = f.get("image");
        if (file.size) {
          project.asset = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          project.picture = await loadImage(project.asset);
        }
      }
      const r = {
        id: uid(),
        count: +f.get("count"),
        direction: f.get("direction") || "",
        refs: structuredClone(refs),
        items: [],
      };
      project.rounds.push(r);
      try {
        await save(project);
      } catch (error) {
        project.rounds.pop();
        throw error;
      }
      if (!next) projects.push(project);
      filtered = false;
      tray = false;
      dialog.close();
      location.hash = path(project, project.rounds.length - 1);
      generate(project, r);
    } catch (err) {
      message("Could not start the round. " + err.message);
      submit.disabled = false;
    }
  };
}
async function generate(project, r) {
  if (jobs.has(r.id)) return;
  jobs.add(r.id);
  try {
    for (let attempt = r.items.length; r.items.length < r.count; attempt++) {
      const item = StudioArt.recipe(project, r, attempt);
      // Preserve marked traits and explore independent optical offsets.
      item.offset = (attempt + 0.5) / (r.count + 1);
      r.items.push(item);
      if (r.items.length % 4 === 0 || r.items.length === r.count) {
        await save(project);
        if (p === project && round === r && vi === null) fillSheet();
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
    }
  } catch (err) {
    message("Generation interrupted. " + err.message);
  } finally {
    jobs.delete(r.id);
    if (round === r && vi === null) fillSheet();
  }
}
function render() {
  observer?.disconnect();
  nav.innerHTML =
    "<span>" +
    esc(p.name) +
    '</span><select id="round" aria-label="Round">' +
    p.rounds
      .map(
        (_, i) =>
          '<option value="' +
          i +
          '" ' +
          (ri === i ? "selected" : "") +
          ">Round " +
          (i + 1) +
          "</option>",
      )
      .join("") +
    "</select>" +
    button("Marks (" + p.marks.length + ")", "marks");
  by("round").onchange = (e) => (location.hash = path(p, +e.target.value));
  on("marks", () => {
    tray = !tray;
    render();
    by(tray ? "closeTray" : "marks").focus();
  });
  app.innerHTML =
    '<div class="workspace"><section class="content" id="content"></section>' +
    (tray ? '<aside class="tray" id="tray"></aside>' : "") +
    "</div>";
  if (vi === null) sheet();
  else inspect();
  if (tray) showTray();
}
function sheet() {
  by("content").innerHTML =
    '<div class="row"><h1>Round ' +
    (ri + 1) +
    '</h1><div class="row">' +
    button("All", "all") +
    button("Marked", "marked") +
    button("New round", "nextRound", true) +
    '</div></div><p class="sub" id="progress"></p><div class="sheet" id="grid"></div>';
  by("all").setAttribute("aria-pressed", !filtered);
  by("marked").setAttribute("aria-pressed", filtered);
  on("all", () => {
    filtered = false;
    render();
  });
  on("marked", () => {
    filtered = true;
    render();
  });
  on("nextRound", () => form(true));
  fillSheet();
}
function fillSheet() {
  if (!by("grid")) return;
  by("progress").textContent =
    round.items.length + " / " + round.count + " variants";
  if (round.items.length < round.count && !jobs.has(round.id)) {
    by("progress").insertAdjacentHTML(
      "beforeend",
      " " + button("Resume generation", "resume"),
    );
    on("resume", () => generate(p, round));
  }
  for (let i = 0; i < round.count; i++) {
    const n = p.marks.filter((m) => m.round === ri && m.item === i).length;
    if (filtered && !n) continue;
    let tile = by("tile" + i);
    if (!tile) {
      tile = document.createElement("button");
      tile.id = "tile" + i;
      tile.className = "tile";
      tile.disabled = true;
      tile.innerHTML =
        '<div class="thumb"></div><footer><span>' +
        variant(ri, i) +
        "</span><span></span></footer>";
      by("grid").append(tile);
    }
    if (!round.items[i] || !tile.disabled) continue;
    const c = document.createElement("canvas");
    tile.firstElementChild.append(c);
    paint(c, p, round.items[i], 320);
    tile.lastElementChild.lastElementChild.textContent = n
      ? n + " marked"
      : StudioArt.layouts[round.items[i].layout];
    tile.disabled = false;
    tile.onclick = () => {
      positions.set(path(p, ri), { i, y: scrollY });
      location.hash = path(p, ri, i);
    };
  }
  if (filtered && !by("grid").children.length)
    by("progress").textContent += " · No marked variants in this round.";
}
function inspect() {
  const refs = round.refs,
    src = refs[reference],
    r = round.items[vi];
  by("content").innerHTML =
    '<div class="row">' +
    button("← Contact sheet", "back") +
    "<small>" +
    variant(ri, vi) +
    " / " +
    StudioArt.layouts[r.layout] +
    "</small>" +
    button("Export PNG", "export") +
    '</div><div class="toolbar">' +
    button("Previous", "prev") +
    button("Next", "next") +
    button("Fit", "fit") +
    button("100%", "native") +
    button("Mark", "mark") +
    button(hidden ? "Show marks" : "Hide marks", "hide") +
    (refs.length ? button("Compare", "compare") : "") +
    "</div>" +
    (compare
      ? '<button class="mobileSwitch" id="switch">Show source</button>'
      : "") +
    '<div id="views" class="' +
    (compare ? "compare" : "") +
    '"><section class="candidate"><div class="stage" id="stage"><div id="board" class="board"><canvas></canvas></div></div></section>' +
    (compare
      ? '<section class="reference"><select id="sources" aria-label="Source mark">' +
        refs
          .map(
            (m, i) =>
              '<option value="' +
              i +
              '" ' +
              (i === reference ? "selected" : "") +
              ">" +
              variant(m.round, m.item) +
              " · " +
              esc(m.note || m.role) +
              "</option>",
          )
          .join("") +
        '</select><div class="stage" id="sourceStage"><div class="board" id="sourceBoard"><canvas></canvas></div></div></section>'
      : "") +
    '</div><div id="markControls"></div>';
  on("back", () => (location.hash = path(p, ri)));
  on("prev", () => location.replace(path(p, ri, vi - 1)));
  on("next", () => location.replace(path(p, ri, vi + 1)));
  by("prev").disabled = vi === 0;
  by("next").disabled = vi + 1 >= round.items.length;
  by("native").setAttribute("aria-pressed", native);
  by("fit").setAttribute("aria-pressed", !native);
  on("fit", () => {
    native = false;
    render();
  });
  on("native", () => {
    native = true;
    render();
  });
  on("hide", () => {
    hidden = !hidden;
    render();
  });
  on("compare", () => {
    compare = !compare;
    render();
  });
  if (compare) {
    by("sources").onchange = (e) => {
      reference = +e.target.value;
      render();
    };
    on("switch", () => {
      const source = by("views").classList.toggle("source");
      by("switch").textContent = source ? "Show candidate" : "Show source";
    });
  }
  on("export", () => {
    const c = document.createElement("canvas");
    paint(c, p, r, Infinity);
    c.toBlob((blob) => {
      if (!blob) {
        message("Export failed");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = p.name + "-r" + (ri + 1) + "-" + (vi + 1) + ".png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    });
  });
  on("mark", () => {
    marking = !marking;
    pending = marking ? [0.25, 0.25, 0.5, 0.5] : null;
    render();
    if (marking) by("keep").focus();
  });
  const board = by("board");
  paint(board.firstElementChild, p, r, Infinity);
  observer = new ResizeObserver(() => {
    sizeBoard(board, by("stage"), native);
    if (compare) sizeBoard(by("sourceBoard"), by("sourceStage"), false);
  });
  observer.observe(by("stage"));
  if (compare) {
    const source = by("sourceBoard");
    paint(
      source.firstElementChild,
      p,
      p.rounds[src.round].items[src.item],
      1200,
    );
    outline(source, src.box);
    observer.observe(by("sourceStage"));
  }
  if (!hidden)
    for (const m of p.marks.filter((m) => m.round === ri && m.item === vi))
      outline(board, m.box);
  if (marking) editMark(board, r);
}
function sizeBoard(board, stage, actual) {
  if (!stage || !board) return;
  const scale = actual
    ? 1
    : Math.min(
        (stage.clientWidth - 32) / p.width,
        (stage.clientHeight - 32) / p.height,
      );
  board.style.width = Math.max(1, p.width * scale) + "px";
  board.style.height = Math.max(1, p.height * scale) + "px";
}
function outline(board, box) {
  const el = document.createElement("div");
  el.className = "outline";
  board.append(el);
  locate(el, box);
  return el;
}
function locate(el, box) {
  ["left", "top", "width", "height"].forEach(
    (k, i) => (el.style[k] = 100 * box[i] + "%"),
  );
}
function roleAt(r, box) {
  const x = box[0] + box[2] / 2,
    y = box[1] + box[3] / 2;
  const i = StudioArt.regions(r).findIndex(
    ([a, b, w, h]) => x >= a && x <= a + w && y >= b && y <= b + h,
  );
  return ["art", "title"][i] || "spacing";
}
function editMark(board, r) {
  board.classList.add("marking");
  const overlay = outline(board, pending);
  by("markControls").innerHTML =
    '<form class="markform">' +
    ["Left", "Top", "Width", "Height"]
      .map(
        (k, i) =>
          "<label>" +
          k +
          ' %<input type="number" min="' +
          (i < 2 ? 0 : 1) +
          '" max="100" step="any" data-axis="' +
          i +
          '"></label>',
      )
      .join("") +
    '<label>Keep this detail<select name="trait"><option value="">From marked region</option><option value="art">Artwork treatment</option><option value="title">Typography</option><option value="spacing">Layout and spacing</option><option value="palette">Colours</option></select></label><label>Note (optional)<input name="note" maxlength="300"></label><button class="primary" id="keep">Keep</button>' +
    button("Cancel", "cancelMark") +
    "</form>";
  const inputs = [...app.querySelectorAll("[data-axis]")];
  function update() {
    locate(overlay, pending);
    inputs.forEach((el, i) => (el.value = +(pending[i] * 100).toFixed(2)));
  }
  inputs.forEach(
    (el, i) =>
      (el.onchange = () => {
        pending[i] = Math.max(
          i < 2 ? 0 : 0.01,
          Math.min(i < 2 ? 0.99 : 1, Number(el.value) / 100),
        );
        pending[2] = Math.min(pending[2], 1 - pending[0]);
        pending[3] = Math.min(pending[3], 1 - pending[1]);
        update();
      }),
  );
  update();
  const point = (e) => {
    const b = board.getBoundingClientRect();
    return [
      Math.max(0, Math.min(1, (e.clientX - b.left) / b.width)),
      Math.max(0, Math.min(1, (e.clientY - b.top) / b.height)),
    ];
  };
  let start;
  board.onpointerdown = (e) => {
    start = point(e);
    board.setPointerCapture(e.pointerId);
  };
  board.onpointermove = (e) => {
    if (!start) return;
    const [x, y] = point(e);
    pending = [
      Math.min(start[0], x),
      Math.min(start[1], y),
      Math.abs(start[0] - x),
      Math.abs(start[1] - y),
    ];
    update();
  };
  board.onpointerup = (e) => {
    if (!start) return;
    const [x, y] = point(e);
    if (Math.abs(start[0] - x) < 0.015 && Math.abs(start[1] - y) < 0.015) {
      pending = StudioArt.regions(r).find(
        ([a, b, w, h]) => x >= a && x <= a + w && y >= b && y <= b + h,
      ) || [
        Math.min(0.9, Math.max(0, x - 0.05)),
        Math.min(0.9, Math.max(0, y - 0.05)),
        0.1,
        0.1,
      ];
    } else {
      board.onpointermove(e);
      pending[2] = Math.max(0.001, pending[2]);
      pending[3] = Math.max(0.001, pending[3]);
    }
    start = null;
    update();
  };
  board.onpointercancel = () => {
    start = null;
  };
  on("cancelMark", cancelMark);
  by("markControls").firstElementChild.onsubmit = async (e) => {
    e.preventDefault();
    const mark = {
      id: uid(),
      round: ri,
      item: vi,
      box: pending.slice(),
      role: new FormData(e.target).get("trait") || roleAt(r, pending),
      note: new FormData(e.target).get("note"),
      selected: true,
    };
    const project = p;
    e.submitter.disabled = true;
    project.marks.push(mark);
    try {
      await save(project);
    } catch (error) {
      project.marks = project.marks.filter((m) => m.id !== mark.id);
      by("keep").disabled = false;
      throw error;
    }
    undo = mark.id;
    marking = false;
    pending = null;
    render();
    message("Mark saved");
  };
}
function cancelMark() {
  marking = false;
  pending = null;
  render();
  by("mark")?.focus();
}
function showTray() {
  by("tray").innerHTML =
    '<div class="row"><h2>Marks</h2>' +
    button("Close", "closeTray") +
    '</div><div id="markList"></div><div class="row">' +
    button("New round", "fromMarks", true) +
    (undo && p.marks.some((m) => m.id === undo)
      ? button("Undo last mark", "undo")
      : "") +
    "</div>";
  on("closeTray", () => {
    tray = false;
    render();
    by("marks").focus();
  });
  on("fromMarks", () => form(true));
  on("undo", async () => {
    p.marks = p.marks.filter((m) => m.id !== undo);
    undo = null;
    render();
    await save(p);
  });
  if (!p.marks.length)
    by("markList").innerHTML =
      "<p>Open a variant and mark a detail to keep.</p>";
  for (const m of p.marks) {
    const a = document.createElement("article");
    a.innerHTML =
      '<div class="row"><button class="openCrop" aria-label="Open source ' +
      variant(m.round, m.item) +
      '"><canvas class="crop"></canvas></button><label><input type="checkbox" ' +
      (m.selected ? "checked" : "") +
      "> Use in round</label></div><small>" +
      variant(m.round, m.item) +
      " · " +
      esc(m.role) +
      "</small><p>" +
      esc(m.note) +
      "</p>";
    by("markList").append(a);
    paint(
      a.querySelector("canvas"),
      p,
      p.rounds[m.round].items[m.item],
      140,
      m.box,
    );
    a.querySelector("input").onchange = async (e) => {
      m.selected = e.target.checked;
      await save(p);
    };
    a.querySelector("button").onclick = () => {
      tray = false;
      hidden = false;
      location.hash = path(p, m.round, m.item);
      route();
    };
  }
}
addEventListener("hashchange", route);
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dialog.open) {
    if (marking) cancelMark();
    else if (tray) by("closeTray").click();
  }
});
addEventListener("unhandledrejection", (e) =>
  message(
    "Could not complete the operation. " +
      (e.reason?.message || "Please try again."),
  ),
);
init().catch((err) => {
  app.textContent = "Could not open browser storage. " + err.message;
});
