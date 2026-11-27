const { chromium } = require("node:module").createRequire(
  require("node:path").resolve(
    __dirname,
    "../../packages/capture/package.json",
  ),
)("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(6000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      require("node:url").pathToFileURL(
        require("node:path").join(__dirname, "index.html"),
      ).href,
    );
    await page.getByRole("button", { name: "New exploration" }).click();
    await page.getByLabel("Workspace name").fill("Review");
    await page.getByLabel("Design brief").fill("Quiet serif study");
    await page.getByLabel("Required copy").fill("Open space");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await page.waitForSelector("#tile19:enabled");
    await page.locator("#tile19").click();
    await page.locator("#mark").click();
    await page.getByLabel("Left %").fill("12");
    await page.getByLabel("Note (optional)").fill("Keep the margin");
    await page.locator("#keep").click();
    await page.waitForFunction(
      () => document.querySelector("#marks").textContent === "Marks (1)",
    );
    await page.reload();
    await page.locator("#marks").click();
    await page.waitForSelector(".crop");
    await page.locator("#fromMarks").click();
    await page.getByLabel("Variants").selectOption("100");
    await page.getByRole("button", { name: "Generate", exact: true }).click();
    await page.waitForSelector("#tile99:enabled");
    await page.locator("#tile99").click();
    await page.locator("#compare").click();
    await page.waitForSelector("#sourceBoard canvas");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#switch").click();
    await page.locator("#switch").click();
    const download = page.waitForEvent("download");
    await page.locator("#export").click();
    const file = await (await download).path();
    const png = require("fs").readFileSync(file);
    assert.equal(png.readUInt32BE(16), 1080);
    assert.equal(png.readUInt32BE(20), 1350);
    await page.locator("#marks").click();
    await page.locator("#closeTray").click();
    await page.locator("#back").click();
    for (const size of ["10", "50"]) {
      await page.locator("#nextRound").click();
      await page.getByLabel("Variants").selectOption(size);
      await page.getByRole("button", { name: "Generate", exact: true }).click();
      await page.waitForSelector("#tile" + (size - 1) + ":enabled");
    }
    assert.deepEqual(errors, []);
    console.log(
      "Passed batch sizes, marking, persistence, follow-up, comparison, mobile and PNG dimensions.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
