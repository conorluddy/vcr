// Renders one inline SVG and one inline Lottie frame with ThorVG's software canvas.
// Usage: render <output-dir>. Writes raw ARGB8888 buffers and measured.json; check.mjs judges them.
#include <thorvg.h>
#include <thorvg_lottie.h>

#include <cstdint>
#include <cstdio>
#include <cstring>
#include <fstream>
#include <string>
#include <vector>

namespace {

// === PUBLIC API ===

constexpr uint32_t kCanvasWidth = 120;
constexpr uint32_t kCanvasHeight = 80;
constexpr float kLottieFrame = 5.0f;

constexpr const char* kSvgScene = R"SVG(<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">
  <defs>
    <linearGradient id="ramp" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000000"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="40" height="40" fill="#ff0000"/>
  <circle cx="90" cy="20" r="15" fill="#0000ff"/>
  <rect x="20" y="50" width="80" height="20" fill="url(#ramp)"/>
</svg>)SVG";

// A 20x20 blue square whose centre moves from x=10 to x=90 over 10 frames with a symmetric ease.
constexpr const char* kLottieScene = R"JSON({"v":"5.7.4","fr":10,"ip":0,"op":10,"w":120,"h":80,"nm":"tiny","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"box","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":1,"k":[{"i":{"x":[0.5],"y":[1]},"o":{"x":[0.5],"y":[0]},"t":0,"s":[10,40]},{"t":10,"s":[90,40]}]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]}},"ao":0,"shapes":[{"ty":"gr","it":[{"ty":"rc","d":1,"s":{"a":0,"k":[20,20]},"p":{"a":0,"k":[0,0]},"r":{"a":0,"k":0},"nm":"rect"},{"ty":"fl","c":{"a":0,"k":[0,0.5,1,1]},"o":{"a":0,"k":100},"r":1,"nm":"fill"},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100},"sk":{"a":0,"k":0},"sa":{"a":0,"k":0},"nm":"t"}],"nm":"group","np":2,"cix":2,"bm":0,"ix":1,"mn":"x","hd":false}],"ip":0,"op":10,"st":0,"bm":0}]})JSON";

struct PixelPosition {
  uint32_t x;
  uint32_t y;
};

constexpr PixelPosition kSvgPositions[] = {{20, 20}, {90, 20}, {20, 60}, {60, 60}, {99, 60}, {5, 70}};
constexpr PixelPosition kLottiePositions[] = {{50, 40}, {10, 40}, {90, 40}};

// === PIPELINE ===

// Draws the paint onto a transparent ARGB8888 software canvas. ThorVG owns the canvas and paint,
// and Initializer::term() releases them at process exit.
bool drawPaintToBuffer(tvg::Paint* paint, std::vector<uint32_t>& buffer) {
  tvg::SwCanvas* canvas = tvg::SwCanvas::gen();
  if (!canvas) return false;
  buffer.assign(kCanvasWidth * kCanvasHeight, 0);
  return canvas->target(buffer.data(), kCanvasWidth, kCanvasWidth, kCanvasHeight, tvg::ColorSpace::ARGB8888S) == tvg::Result::Success &&
         canvas->add(paint) == tvg::Result::Success &&
         canvas->draw(true) == tvg::Result::Success &&
         canvas->sync() == tvg::Result::Success;
}

bool writeBufferBytes(const std::string& path, const std::vector<uint32_t>& buffer) {
  std::ofstream file(path, std::ios::binary);
  if (!file) return false;
  file.write(reinterpret_cast<const char*>(buffer.data()), static_cast<std::streamsize>(buffer.size() * sizeof(uint32_t)));
  return file.good();
}

std::string argbHex(uint32_t pixel) {
  char text[9];
  std::snprintf(text, sizeof text, "%08x", pixel);
  return text;
}

std::string probesJson(const std::vector<uint32_t>& buffer, const PixelPosition* positions, size_t count) {
  std::string json = "[";
  for (size_t index = 0; index < count; ++index) {
    const PixelPosition position = positions[index];
    const uint32_t pixel = buffer[position.y * kCanvasWidth + position.x];
    if (index > 0) json += ",";
    json += "{\"x\":" + std::to_string(position.x) + ",\"y\":" + std::to_string(position.y) + ",\"argb\":\"" + argbHex(pixel) + "\"}";
  }
  return json + "]";
}

bool renderSvgPart(const std::string& outputDir, std::string& svgJson) {
  auto picture = tvg::Picture::gen();
  if (!picture) return false;
  const auto sceneLength = static_cast<uint32_t>(std::strlen(kSvgScene));
  if (picture->load(kSvgScene, sceneLength, "svg", nullptr, true) != tvg::Result::Success) {
    std::fprintf(stderr, "render: ThorVG could not load the inline SVG\n");
    return false;
  }
  std::vector<uint32_t> buffer;
  if (!drawPaintToBuffer(picture, buffer) || !writeBufferBytes(outputDir + "/svg.argb", buffer)) return false;
  svgJson = probesJson(buffer, kSvgPositions, sizeof kSvgPositions / sizeof kSvgPositions[0]);
  return true;
}

// Returns the measured Lottie object as JSON; "loader":"absent" means the build lacks the loader.
bool renderLottiePart(const std::string& outputDir, std::string& lottieJson) {
  auto animation = tvg::LottieAnimation::gen();
  if (!animation || !animation->picture()) {
    lottieJson = "{\"loader\":\"absent\"}";
    return true;
  }
  const auto sceneLength = static_cast<uint32_t>(std::strlen(kLottieScene));
  if (animation->picture()->load(kLottieScene, sceneLength, "lottie+json", nullptr, true) != tvg::Result::Success) {
    lottieJson = "{\"loader\":\"absent\"}";
    return true;
  }
  if (animation->frame(kLottieFrame) != tvg::Result::Success) return false;
  const auto totalFrame = static_cast<int>(animation->totalFrame());
  std::vector<uint32_t> buffer;
  if (!drawPaintToBuffer(animation->picture(), buffer) || !writeBufferBytes(outputDir + "/lottie-frame-5.argb", buffer)) return false;
  lottieJson = "{\"loader\":\"present\",\"frame\":" + std::to_string(static_cast<int>(kLottieFrame)) +
               ",\"totalFrame\":" + std::to_string(totalFrame) + ",\"probes\":" +
               probesJson(buffer, kLottiePositions, sizeof kLottiePositions / sizeof kLottiePositions[0]) + "}";
  return true;
}

bool writeMeasuredJson(const std::string& outputDir, const std::string& svgJson, const std::string& lottieJson) {
  const std::string body = "{\"canvas\":{\"width\":" + std::to_string(kCanvasWidth) + ",\"height\":" + std::to_string(kCanvasHeight) +
                           ",\"bytes\":" + std::to_string(kCanvasWidth * kCanvasHeight * 4) + "},\"svg\":{\"probes\":" + svgJson +
                           "},\"lottie\":" + lottieJson + "}\n";
  std::ofstream file(outputDir + "/measured.json", std::ios::binary);
  file << body;
  return file.good();
}

}  // namespace

int main(int argc, char** argv) {
  if (argc != 2) {
    std::fprintf(stderr, "usage: render <output-dir>\n");
    return 2;
  }
  const std::string outputDir = argv[1];
  if (tvg::Initializer::init(0) != tvg::Result::Success) {
    std::fprintf(stderr, "render: ThorVG engine failed to initialise\n");
    return 1;
  }
  std::string svgJson;
  std::string lottieJson;
  const bool rendered = renderSvgPart(outputDir, svgJson) && renderLottiePart(outputDir, lottieJson) &&
                        writeMeasuredJson(outputDir, svgJson, lottieJson);
  tvg::Initializer::term();
  if (!rendered) {
    std::fprintf(stderr, "render: a ThorVG call failed; see the messages above\n");
    return 1;
  }
  return 0;
}
