// Render every view, crop and export from the same normalised composition.
const StudioArt = (() => {
  const palettes = [
    ["#f1eee3", "#1a211c", "#b84a30"],
    ["#b9d4c6", "#182f36", "#346ca1"],
    ["#211e20", "#efe8d6", "#f47751"],
    ["#dde2a2", "#262e20", "#5c7852"],
    ["#c2b9dc", "#232033", "#73548f"],
    ["#e8bb95", "#35251f", "#944c45"],
  ];
  const layouts = ["Stack", "Masthead", "Split", "Column", "Inset", "Band"];
  const fonts = ["Georgia", "Arial", "Courier New"];
  function hash(value) {
    let n = 2166136261;
    for (const char of value) n = Math.imul(n ^ char.charCodeAt(0), 16777619);
    return n >>> 0;
  }
  function recipe(project, round, i) {
    const brief = project.brief + " " + round.direction;
    const seed = hash(project.id + round.id + brief + i);
    const r = {
      layout: (i + hash(brief)) % 6,
      palette: (i + (seed % 5)) % 6,
      font: seed % 3,
      motif: Math.floor(seed / 7) % 4,
      phase: (seed % 997) / 997,
      inset: 0.035 + (seed % 61) / 1000,
    };
    if (/monochrome|black and white/i.test(brief)) r.palette = 6;
    if (/serif/i.test(brief)) r.font = /sans.serif/i.test(brief) ? 1 : 0;
    if (/minimal|quiet/i.test(brief)) r.motif = 0;
    for (const [index, mark] of round.refs.entries()) {
      const source = project.rounds[mark.round].items[mark.item];
      const keys =
        mark.role === "palette"
          ? ["palette"]
          : mark.role === "title"
            ? ["font"]
            : mark.role === "art"
              ? ["motif", "phase", "palette"]
              : ["inset", "layout"];
      for (const key of keys) {
        // Alternate precedence when several references constrain the same trait.
        if (index === 0 || (i + index) % 3 !== 0) r[key] = source[key];
      }
    }
    return r;
  }
  const boxes = [
    [
      [0, 0, 1, 0.64],
      [0, 0.67, 1, 0.33],
    ],
    [
      [0, 0.32, 1, 0.68],
      [0, 0, 1, 0.29],
    ],
    [
      [0.48, 0, 0.52, 1],
      [0, 0, 0.45, 1],
    ],
    [
      [0, 0, 0.43, 1],
      [0.47, 0, 0.53, 1],
    ],
    [
      [0.15, 0.08, 0.78, 0.53],
      [0, 0.66, 1, 0.34],
    ],
    [
      [0, 0.23, 1, 0.42],
      [0, 0.68, 1, 0.32],
    ],
  ];
  function regions(r) {
    const inset = r.inset + (r.offset || 0) * 0.014;
    return boxes[r.layout].map(([x, y, w, h]) => [
      inset + x * (1 - 2 * inset),
      inset + y * (1 - 2 * inset),
      w * (1 - 2 * inset),
      h * (1 - 2 * inset),
    ]);
  }
  function lettering(ctx, copy, w, h, font, maxSize = Infinity) {
    let size = Math.min(h, w * 0.44, maxSize);
    while (size > 0.1) {
      ctx.font =
        (font === 1 ? "bold " : "") + size + 'px "' + fonts[font] + '"';
      const lines = [];
      for (const paragraph of copy.split("\n")) {
        let line = "";
        for (const word of paragraph.split(/\s+/)) {
          const next = line ? line + " " + word : word;
          if (line && ctx.measureText(next).width > w) {
            lines.push(line);
            line = word;
          } else line = next;
        }
        lines.push(line);
      }
      if (
        lines.length * size * 1.13 <= h &&
        lines.every((l) => ctx.measureText(l).width <= w)
      ) {
        ctx.textBaseline = "top";
        lines.forEach((line, i) => ctx.fillText(line, 0, i * size * 1.13));
        return lines.length * size * 1.13;
      }
      size *= 0.94;
    }
    return 0;
  }
  function draw(canvas, p, r, max = 400, crop = [0, 0, 1, 1]) {
    const w = p.width,
      h = p.height,
      [cx, cy, cw, ch] = crop;
    const scale = Math.min(1, max / Math.max(w * cw, h * ch));
    canvas.width = Math.max(1, Math.round(w * cw * scale));
    canvas.height = Math.max(1, Math.round(h * ch * scale));
    const ctx = canvas.getContext("2d");
    ctx.scale(canvas.width / (w * cw), canvas.height / (h * ch));
    ctx.translate(-cx * w, -cy * h);
    const [paper, ink, accent] = palettes[r.palette] || [
      "#ecebe7",
      "#191919",
      "#888888",
    ];
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);
    const [art, title] = regions(r);
    ctx.save();
    const aw = art[2] * w,
      ah = art[3] * h;
    ctx.translate(art[0] * w, art[1] * h);
    ctx.beginPath();
    ctx.rect(0, 0, aw, ah);
    ctx.clip();
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, aw, ah);
    if (p.picture) {
      const image = p.picture,
        zoom =
          Math.max(aw / image.width, ah / image.height) * (1 + r.phase * 0.5);
      ctx.drawImage(
        image,
        (aw - image.width * zoom) * r.phase,
        (ah - image.height * zoom) * 0.5,
        image.width * zoom,
        image.height * zoom,
      );
    } else {
      ctx.scale(aw, ah);
      ctx.fillStyle = ink;
      ctx.strokeStyle = ink;
      const phase = r.phase;
      if (r.motif === 0) {
        ctx.beginPath();
        ctx.ellipse(phase, 0.55, 0.42, 0.7, -0.4, 0, 2 * Math.PI);
        ctx.fill();
      } else if (r.motif === 1) {
        for (let i = 1; i < 30; i++) {
          ctx.lineWidth = 0.009;
          ctx.beginPath();
          ctx.ellipse(
            0.15 + phase * 0.7,
            0.6,
            i * 0.043,
            i * 0.026,
            -0.75,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      } else if (r.motif === 2) {
        for (let i = 0; i < 16; i++) {
          ctx.save();
          ctx.translate(i / 14, 0.5);
          ctx.rotate(0.3 + phase);
          ctx.fillRect(-0.025, -1, 0.033, 2);
          ctx.restore();
        }
      } else {
        for (let x = 0; x < 13; x++)
          for (let y = 0; y < 13; y++) {
            ctx.beginPath();
            ctx.arc(
              x / 12,
              y / 12,
              0.01 +
                0.039 * Math.abs(Math.sin(x * 0.31 + y * 0.43 + phase * 5)),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
      }
    }
    ctx.restore();
    ctx.fillStyle = ink;
    ctx.translate(title[0] * w, title[1] * h);
    const tw = title[2] * w,
      th = title[3] * h;
    const split = p.copy.indexOf("\n");
    if (p.typeHierarchy && split > 0 && p.copy.slice(split).trim()) {
      const headline = lettering(
        ctx,
        p.copy.slice(0, split),
        tw,
        th * 0.62,
        r.font,
      );
      const gap = Math.min(tw * 0.055, th * 0.075);
      ctx.translate(0, headline + gap);
      lettering(
        ctx,
        p.copy.slice(split + 1),
        tw,
        th - headline - gap,
        0,
        Math.min(th * 0.14, tw * 0.095),
      );
    } else {
      lettering(ctx, p.copy, tw, th, r.font);
    }
  }
  return { recipe, draw, regions, layouts };
})();
