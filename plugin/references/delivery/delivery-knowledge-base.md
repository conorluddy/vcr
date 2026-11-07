# DELIVERY: Delivery, Encoding and Platform Specifications for Motion Graphics and Short-Form Video

> **Starting profile:** Progressive CFR H.264 MP4 with limited-range BT.709 and AAC-LC is a proposed SDR social-video starting point. Check the actual destination and upload route; this combination alone does not establish acceptance or visual quality. Masters, alpha, HDR and stills need their own profiles (§1, §4, §11).
>
> **Scope.** This pillar covers how a finished piece becomes files: masters, delivery encodes, platform upload specifications, what platforms do to uploads, colour signalling, banding, frame timing, A/V offset, captions as files, stills delivery, and measurement. It does not cover loudness targets (`SOUND-*`), caption styling (`TYPO-CAPTION-*`), safe-zone layout (`TYPO-SAFE`, `vcr lint`), motion design (`MOTION-*`) or pacing (`PACE-*`). It proposes to take ownership of the delivery rules currently scattered as `TYPO-RANGE`, `TYPO-CHROMA`, `ART-DEL-*`, `SOUND-SAMPLE-RATE`, `SOUND-AAC-BITRATE` and `MOTION-FPS-001` (see §1.3).
>
> **Confidence tiers.** `standard` = a published standard or style guide, checked against the primary source. `platform` = published by a platform or vendor; may change without notice; every platform figure here carries the date it was checked (2026-11-06 unless stated). `heuristic` = practitioner rule of thumb or secondary source. Sources are named inline (publisher and page title) and in the verification ledger (§18).
>
> **Report limits.** Some sources could be read only as search snippets: the Instagram Help Center body, YouTube's thumbnail and Shorts pages, LinkedIn's help pages and Apple TN2258. The ITU, SMPTE, ISO and W3C standards and the Netflix Partner Help Center were not opened. Every affected figure is marked in the ledger. The numbers inside the existing scattered rules were not available, so §1.3 proposes ownership without judging their values.

## TL;DR

- **One delivery encode fits almost everywhere:** 1080 × 1920 (or 1920 × 1080 / 1080 × 1080), H.264 High Profile, `yuv420p`, limited range, BT.709 tags, constant 30 or 60 fps, closed GOP with a keyframe at least every 2 s, 2 B-frames, `+faststart`, AAC-LC 48 kHz stereo at 128–384 kbps, bitrate well above the platform's own recommendation. This file meets the published intake rules of YouTube, Vimeo, X, LinkedIn, TikTok and Instagram's API as checked on 2026-11-06. The tight constraints are X's (`AAC LC` only, no open GOP, 4:2:0 only, ≤ 60 fps) and Instagram's API (no edit lists, ≤ 1920 columns, 300 MB, 25 Mbps VBR maximum).\[1\]\[2\]
- **Every platform re-encodes, so the upload is an input, not the output.** YouTube documents that it converts full range to limited, maps unsupported colour spaces to BT.709, treats missing tags as BT.709, converts sRGB transfer to BT.709 transfer and "may remove some noise to achieve streaming bitrates".\[3\]\[4\] The damage that matters for motion graphics is banding in gradients, smeared chroma on fine saturated type (especially red), crushed shadows, mushy grain and blocking in fast full-frame motion. These are predictable, and an agent can preview them locally by re-encoding at platform-like bitrates and measuring with CAMBI, `blockdetect` and `signalstats`.
- **Most "washed out", "too dark" and "out of sync" failures are signalling errors, not pixel errors.** Missing or mismatched colour tags, full-range data flagged as limited (or the reverse), BT.601 matrix maths on HD frames, and AAC encoder priming handled by an edit list the platform ignores all cause them. Every one of them is checkable with `ffprobe` before upload, so VCR should gate delivery on a machine check, not on eyeballing a single still.

## Key findings

1. **YouTube's recommended SDR colour space is BT.709 for all three of transfer, primaries and matrix ("H.273 value: 1"), and YouTube "converts full color range to limited color range".** Untagged uploads are assumed BT.709. RGB matrix uploads are "not recommended", and "sRGB TRC will convert to BT.709 TRC" (YouTube Help, "YouTube recommended upload encoding settings", checked 2026-11-06).
2. **YouTube's container rules are "No Edit Lists (or the video might not get processed correctly)" and "moov atom at the front of the file (Fast Start)".** Video rules: H.264 High Profile, "2 consecutive B frames", "Closed GOP. GOP of half the frame rate.", CABAC, 4:2:0, progressive (same page, checked 2026-11-06). Instagram's Graph API repeats "no edit lists, moov atom at the front of the file" (Meta for Developers, IG User Media reference, checked 2026-11-06 via research subagent).
3. **YouTube's SDR bitrate recommendations are 8 Mbps at 1080p for 24/25/30 fps and 12 Mbps for 48/50/60 fps.** At 720p they are 5 and 7.5 Mbps, and audio is 384 kbps stereo (same page, checked 2026-11-06). These are floors for a good upload, not caps: "No bitrate limit is required".
4. **X is the strictest intake.** "Pixel format: Only YUV 4:2:0 is supported", audio "must be AAC with Low Complexity profile (High-Efficiency AAC is not supported)", "must be mono or stereo, not 5.1 or greater", "Must not have open GOP", "must be 60 FPS or less", "Pixel aspect ratio: must have 1:1" (X Developer Platform, "Best practices", checked 2026-11-06).
5. **Instagram's Help Center and API disagree on frame rate.** The Help Center says "Reels should have a minimum frame rate of 30 FPS" (search snippet only; page body would not load), while the Graph API spec says "Frame rate: 23-60 FPS".\[1\]\[5\]\[6\] A 24 or 25 fps VCR render is legal through the API but below the Help Center's stated minimum.
6. **TikTok's own limits depend on the upload route.** TikTok Studio on the web requires "MP4 or WebM", "720x1280 resolution or higher", "Up to 30 minutes", "Less than 10 GB" (TikTok Help Center, "Tools for creators"). The Content Posting API allows "Minimum of 23 FPS / Maximum of 60 FPS", "Maximum of 4GB" and codecs "H.264 (recommended) / H.265 / VP8 / VP9" (TikTok for Developers, Media Transfer Guide, "Last updated August 4, 2026"). Both were checked 2026-11-06 via the research subagent.
7. **HDR is a trap for code-first motion graphics.** YouTube requires "10 bits or 12 bits", "Rec. 2020" primaries, "Rec. 2020 non-constant luminance" matrix and "PQ or HLG (Rec. 2100)". It warns that mastering in P3 then tagging Rec. 2020 "will result in an oversaturated look with shifted hues", and that the metadata tool "will badly distort your videos" if misapplied (YouTube Help, "Upload High Dynamic Range (HDR) videos", checked 2026-11-06). Browser-rendered sRGB frames are SDR, so tagging them HDR is always wrong.
8. **Apple's HLS authoring spec is the best public statement of streaming-safe encoding.** "Key frames (IDRs) SHOULD be present every two seconds", "Frame rates above 60 fps SHALL NOT be used", "Streams SHOULD use a single color space", and H.264 "SHOULD be less than or equal to High Profile, Level 4.1" for maximum compatibility (Apple Developer, "HLS authoring specification for Apple devices", checked 2026-11-06).
9. **ProRes 4444 is the right alpha master.** Apple calls 4444 and 4444 XQ "the only ProRes codecs that support alpha channels", with "a mathematically lossless alpha channel of up to 16 bits" and a target of "approximately 330 Mbps for 4:4:4 sources at 1920x1080 and 29.97 fps" (Apple Support, "About Apple ProRes", published March 3, 2025, fetched 2026-11-06).
10. **Banding is now measurable.** Netflix's CAMBI scores banding from 0 (none) upward, with 24 the maximum observed ("unwatchable"), and "a CAMBI score around 5 is where banding starts to become slightly annoying" (Netflix/vmaf `cambi.md`, search snippet 2026-11-06).\[7\] Netflix's Technology Blog post "CAMBI, a banding artifact detector" (October 2021) reports that "CAMBI provides a high correlation with MOS while … VMAF and PSNR have very little correlation", and VMAF v1 (June 2026) folds CAMBI in (Netflix Technology Blog, snippets). Use CAMBI, not VMAF v0 or PSNR, to gate gradients.

---

## 1. The delivery model

### 1.1 Three files, not one

| Artefact | Purpose | Recommended form | Tier |
|---|---|---|---|
| **Mezzanine master** | Archive and source for every future encode | ProRes 4444 (alpha) or ProRes 422 HQ (opaque) `.mov`, or a lossless PNG sequence plus WAV. Same resolution and fps as authored | heuristic (industry practice), with ProRes facts `platform` (Apple) |
| **Delivery encode** | What gets uploaded | MP4, H.264 High, `yuv420p`, limited range, BT.709 tagged, CFR, closed GOP, `+faststart`, AAC-LC 48 kHz | platform (YouTube, X, Meta API) |
| **Sidecars** | Captions, stems, cover still, manifest | SRT and/or WebVTT, WAV stems, PNG/JPEG cover, JSON manifest with checksums | platform (caption formats) and heuristic (manifest) |

Never upload the master to a social platform. LinkedIn states that ProRes "may be able to upload it, but it will not be able to process" (LinkedIn Help, "Video sharing troubleshooting", snippet, 2026-11-06).\[8\] Never re-derive a master from a delivery encode, because every lossy generation compounds (`DELIVERY-MASTER-MEZZANINE`).

### 1.2 The pipeline in VCR terms

1. Seek → screenshot (8-bit sRGB PNG per frame) at fixed fps.
2. Optional alpha path: PNG with alpha → ProRes 4444 (`prores_ks -profile:v 4444 -pix_fmt yuva444p10le`).
3. Mezzanine: PNG sequence + mixed WAV → ProRes 422 HQ or 4444.
4. Delivery: mezzanine → RGB-to-YCbCr conversion with an explicit BT.709 matrix and limited range → H.264 → MP4 with explicit tags.
5. QC: `ffprobe` metadata gate → decoded-frame checks → simulated platform re-encode → CAMBI, `blockdetect` and `signalstats` comparisons → human review of motion at speed.

### 1.3 Which scattered rules this pillar should own

| Existing rule | Proposed owner | Reason |
|---|---|---|
| `TYPO-RANGE` | `DELIVERY-RANGE-LIMITED` | Range is a property of the encode and its tags, not of typography. Typography keeps the *consequence* (thin light text on dark fills breaking down), but the check runs on the delivery file. |
| `TYPO-CHROMA` | `DELIVERY-CHROMA-SUBSAMPLING` plus `DELIVERY-RED-CHROMA` | 4:2:0 subsampling is an encoding decision. Typography should cite DELIVERY for the threshold and keep the design guidance (minimum stroke weight for saturated text). |
| `ART-DEL-*` | DELIVERY, except palette choices | Art direction keeps colour *intent*; DELIVERY owns gamut, tags, profiles and still export. |
| `SOUND-SAMPLE-RATE` | `DELIVERY-AUDIO-SAMPLE-RATE` | 48 kHz is a container/platform intake requirement (YouTube, Vimeo, Instagram API). SOUND keeps the production sample rate of stems. |
| `SOUND-AAC-BITRATE` | `DELIVERY-AUDIO-BITRATE` | Platform-specified encode parameter. SOUND keeps loudness (`SOUND-*` R 128 / BS.1770 targets). |
| `MOTION-FPS-001` | `DELIVERY-FPS-NATIVE`, `DELIVERY-FPS-CONSTANT`, `DELIVERY-FPS-MAX` | Delivery owns the frame-rate *contract* (CFR, platform limits, integer rates). MOTION keeps the *choice* of 24/30/60 for a look. The legacy ID has a digit, which breaks the naming convention, and should be renamed. |

The numbers inside those existing rules were not supplied with this brief, so this document neither agrees nor disagrees with them. Where they differ from the thresholds below, the platform-dated figures here should win, and the old rule should become an alias.

---

## 2. Platform upload specifications

All figures were checked on 2026-11-06. "Fetched" means the page body was read; "snippet" means only a search-engine excerpt was available, which counts as weaker evidence. Official figures come first; third-party claims are labelled.

### 2.1 YouTube (long-form and Shorts)

**Official (YouTube Help, "YouTube recommended upload encoding settings", fetched).** The page notes the features are framed for Content Manager partners, but the settings are the general recommendation.

- **Container:** "MP4". "No Edit Lists (or the video might not get processed correctly)". "moov atom at the front of the file (Fast Start)".
- **Audio:** "AAC-LC or Opus or Eclipsa Audio". Channels: "Stereo or Stereo + 5.1 or Stereo + Eclipsa Audio". "Sample rate: 48kHz". Bitrates: "Mono 128 kbps", "Stereo 384 kbps", "5.1 512 kbps".
- **Video:** "H.264", "Progressive scan (no interlacing)", "High Profile", "2 consecutive B frames", "Closed GOP. GOP of half the frame rate.", "CABAC", "Variable bitrate. No bitrate limit is required", "Chroma subsampling: 4:2:0".
- **Frame rate:** "Content should be encoded and uploaded in the same frame rate it was recorded." "Common frame rates include: 24, 25, 30, 48, 50, 60 frames per second (other frame rates are also acceptable)."
- **SDR bitrates (standard / high frame rate):**

| Resolution | 24, 25, 30 fps | 48, 50, 60 fps |
|---|---|---|
| 8K | 80 - 160 Mbps | 120 to 240 Mbps |
| 2160p (4K) | 35–45 Mbps | 53–68 Mbps |
| 1440p (2K) | 16 Mbps | 24 Mbps |
| 1080p | 8 Mbps | 12 Mbps |
| 720p | 5 Mbps | 7.5 Mbps |
| 480p | 2.5 Mbps | 4 Mbps |
| 360p | 1 Mbps | 1.5 Mbps |

- **HDR bitrates:** 1080p "10 Mbps" / "15 Mbps"; 2160p "44–56 Mbps" / "66–85 Mbps"; 480p and 360p "Not supported".
- **Aspect:** "The standard aspect ratio for YouTube on a computer is 16:9. When uploading other aspect ratios such as vertical or square, the player automatically adapts itself".
- **Colour:** see §4.3.
- **4K note:** "To view new 4K uploads in 4K, use a browser or device that supports VP9."

**Shorts (YouTube Help, "Upload YouTube Shorts", snippet):** select a file "Up to 3 minutes" "With a square or vertical aspect ratio."\[9\] Third-party guides attribute an "uploaded on or after October 15, 2024" qualifier to YouTube Help answer 15424877 (secondary, not fetched).\[10\]

**Thumbnails (YouTube Help, "Add custom thumbnails", snippet, truncated):** "We recommend your custom thumbnails: Have a resolution of 3840 x 2160 pixels for videos and 2160 x …" (truncated). For Shorts, "the recommended aspect ratio is 9:16."\[11\] Many third-party guides still quote 1280 × 720 and a 2 MB limit.\[12\]\[13\] Two secondary sources give a split limit: Have Camera Will Travel says "Maximum file size: 2MB on mobile, 50MB on desktop (10MB for podcast thumbnails on mobile)", and BreakReach (updated September 2026) says "3840 × 2160 pixels (16:9), up to 50 MB from a computer". **Status:** the 4K recommendation is partially confirmed; the file-size limit is unverified.

**Live (for reference only; not VCR's use case):** "Keyframe frequency: Recommended 2 seconds Do not exceed 4 seconds" (YouTube Help, live encoder settings, snippet).

### 2.2 TikTok

**Official:**
- **TikTok Studio web upload** (TikTok Help Center, "Tools for creators", fetched by subagent): "Uploaded videos must be: In MP4 or WebM file format; 720x1280 resolution or higher; Up to 30 minutes in length; Less than 10 GB". Also: "tool availability varies across the app and web experiences."
- **Content Posting API** (TikTok for Developers, "Media Transfer Guide", "Last updated August 4, 2026", fetched by subagent):
  - Formats: "MP4 (recommended) / WebM / MOV".
  - Codecs: "H.264 (recommended) / H.265 / VP8 / VP9".
  - Frame rate: "Minimum of 23 FPS / Maximum of 60 FPS".
  - Picture size: "Minimum of 360 pixels for both height and width / Maximum of 4096 pixels for both height and width".
  - Duration: "All TikTok creators can post 3-minute videos, while some have access to post 5-minute or 10-minute videos. The longest video a developer can send via the initialize Upload Video endpoint is 10 minutes."
  - Size: "Maximum of 4GB".
  - Photos: "WebP / JPEG", "Maximum 1080p", "Maximum of 20MB for each image".
- **Cover:** Studio offers "Cover: Select a cover image for your video" (TikTok Support, fetched).

**Not published by TikTok:** audio codec and sample rate requirements, colour handling, re-encode ladder, playback resolution cap. **Third-party claims (secondary, unverified):** in-app limits of "72 MB for Android" and "287.6 MB" for iOS; "TikTok will downscale to 1080p on upload" for 4K; Studio up to "60 minutes and 30GB" (attributed to Creator Academy).\[14\]\[15\]\[16\] These figures conflict with each other and with the Help Center, so do not build rules on them.\[17\]

### 2.3 Instagram (Reels, feed, Stories)

**Official, Help Center** ("Reel size & aspect ratios", help.instagram.com/1038071743007909; snippet only, because the page body did not load):
- "You can upload a reel with an aspect ratio between 1.91:1 and 9:16."
- "Reels should have a minimum frame rate of 30 FPS (frames per second) and minimum resolution of 720 pixels."
- Cover: "The recommended size for cover photos is 420px by 654px (or 1:1.55 ratio)."

**Official, Graph API Reels specification** (Meta for Developers, IG User Media reference, fetched by subagent; the page showed API v25.0 while a snippet showed v26.0):
- "Container: MOV or MP4 (MPEG-4 Part 14), no edit lists, moov atom at the front of the file."
- "Audio codec: AAC, 48khz sample rate maximum, 1 or 2 channels (mono or stereo)."
- "Video codec: HEVC or H264, progressive scan, closed GOP, 4:2:0 chroma subsampling."
- "Frame rate: 23-60 FPS."
- "Picture size: Maximum columns (horizontal pixels): 1920. Required aspect ratio is between 0.01:1 and 10:1 but we recommend 9:16 to avoid cropping or blank space."
- "Video bitrate: VBR, 25Mbps maximum". "Audio bitrate: 128kbps".
- "Duration: 15 mins maximum, 3 seconds minimum". "File size: 300MB maximum".
- **Reel cover via API:** "Format: JPEG", "File size: 8MB maximum", "Color Space: sRGB. Images that use other color spaces will be converted to sRGB." Cropping: "we crop the image and use the middle most 9:16 rectangle as the cover photo for the reel. If you share a reel to your feed, we crop the image and use the middle most 1:1 square".
- **Stories via API:** same codec and container rules, "Duration: 60 seconds maximum, 3 seconds minimum", "File size: 100MB maximum", "25Mbps maximum".

**Ads (secondary):** third-party summaries of Meta's Ads Guide cite "H.264, square pixels, fixed frame rate, progressive scan, and stereo AAC audio at 128 kbps or higher", 4 GB maximum, and 1440 × 2560 recommended for Reels ads.\[18\]\[19\] These were not checked against Meta directly. The Reels safe-zone figures (14 % top, 35 % bottom, 6 % sides) belong to `TYPO-SAFE`, not here.\[20\]

### 2.4 X

**Official (X Developer Platform, "Best practices", fetched):**
- **Recommended:** "Video Codec: H264 High Profile"; "Frame Rates: 30 FPS, 60 FPS"; "Video Resolution: 1280x720 (landscape), 720x1280 (portrait), 720x720 (square). Subscribed users can upload a 1080p video and get 1080p playback. Unsubscribed users can upload a 720p video and get a 720p playback."; "Minimum Video Bitrate: 5,000 kbps"; "Minimum Audio Bitrate: 128 kbps"; "Audio Codec: AAC LC".
- **Hard rules ("Advanced"):** "Frame rate: must be 60 FPS or less"; "Dimensions: must be between 32x32 and 1280x1024"; "Duration: must be at least 0.5 seconds"; "Aspect ratio: must be between 1:3 and 3:1"; "Pixel aspect ratio: must have 1:1"; "Pixel format: Only YUV 4:2:0 is supported"; audio "AAC with Low Complexity profile. (High-Efficiency AAC is not supported)", "mono or stereo, not 5.1 or greater"; "Must not have open GOP"; "Must use progressive scan".
- **Limits:** default accounts "Video on a Post … 0.5 seconds–20 minutes … 8 GB"; Premium/verified "0.5 seconds–125 minutes … 16 GB". "Post-video caps match the X app."
- **Images:** "JPG, PNG, GIF, WEBP", "Image size: <= 5 MB", GIF "<= 15 MB", GIF "Resolution: <= 1280x1080", "Number of frames: <= 350".
- **Internal contradiction:** the hard dimension rule "between 32x32 and 1280x1024" excludes the recommended portrait "720x1280" (1280 tall) and 1080p uploads that the same page endorses for subscribers.\[2\] Treat the 1280 × 1024 line as stale. Verify any 1080 × 1920 upload with a test post.

**Media Studio (X Help, snippet):** "Recommended video bitrate: 5-8 mbps", "Maximum video framerate: 60 FPS", "Subtitles: CEA 608/708 embedded, .SRT sidecar".

### 2.5 LinkedIn

**Official (LinkedIn Help, snippets):**
- **Member posts** ("Video sharing troubleshooting"): "Maximum file size: 5GB", "Minimum file size: 75KB", "Maximum video duration: 15 minutes when uploading from desktop and 10 minutes when uploading from the LinkedIn mobile app", "Minimum video duration: 3 seconds", "Resolution range: 256x144 to 4096x2304", "Aspect ratio: 1:2.4 - 2.4:1", "Frame rates: 10fps - 60 fps".
- **Pages and Career Pages:** the same limits plus "Max video duration - 10 minutes" and "Bit rates - 192 KBPS – 30 MBPS". The page also says "We no longer support AVI, QuickTime, or MOV files." Ship MP4.
- **Video ads:** "File format | MP4", "Codec format | H.264 or VP8", "Audio format | AAC or MPEG4", "Video captions | Must be in SRT format". Thumbnail: "JPG or PNG Maximum file size: 2 MB The aspect ratio and resolution of the video thumbnail and video should match." Recommended sizes: 16:9 "640 x 360 pixels" to "1920 x 1080 pixels"; 1:1 "360 x 360" to "1920 x 1920"; 4:5 "(Recommended ratio)" "360 x 450" to "1080 x 1350".

### 2.6 Vimeo

**Official (Vimeo Help Center, "Video and audio compression guidelines", fetched):**
- **Codecs:** "H.264, Apple ProRes 422 (HQ), or H.265 (HEVC)". For H.264, "choose the 'High Profile' H.264 setting instead of 'Main Profile.'" "the H.264 video codec only supports resolutions up to 4K."
- **Frame rate:** "Keep the native frame rate and choose a constant frame rate". "If your footage exceeds 60 FPS, we will automatically reduce the frame rate."
- **Bitrate (Mbps):** "SD 2 – 5", "720p 5 – 10", "1080p 10 – 20", "2K 20 – 30", "4K 30 – 60", "8K 50 – 80". "We recommend setting the constant rate factor (CRF) to 18 or below." ProRes example: "ProRes HQ for 1080p at 29.97 fps has a target bit rate of 220 Mbps in Final Cut."
- **Colour:** "All accepted, but we recommend BT.2020 (Rec. 2020) or BT.709 (Rec. 709)". HDR: "we only support the PQ (SMPTE 2084) or HLG transfer function"; for PQ include "Mastering Display Color Volume metadata (SMPTE 2086)" and "Content Light Level Information metadata (CEA 861.3)".
- **Bit depth:** "we recommend a bit depth of 10 or greater"; HDR "needs to have a bit depth of 10 or greater".
- **Scan:** "Vimeo converts all videos to progressive for playback."
- **Audio:** "AAC-LC", "320 kb/s CBR" (noted as "higher than necessary to achieve transparent audio quality"), "48 kHz". "The sample rate will be converted to 48 kHz if it is different in the uploaded file."
- **Pixels:** "pixel aspect ratio of 1:1, or square pixels."

**Implication:** Vimeo is the one platform where a ProRes 422 HQ or 10-bit HEVC upload is explicitly welcomed, and it is the best home for gradient-heavy pieces.

### 2.7 Cross-platform intake matrix (official figures only)

| | YouTube | TikTok (Studio / API) | Instagram (API) | X | LinkedIn (posts) | Vimeo |
|---|---|---|---|---|---|---|
| Container | MP4, no edit lists, faststart | MP4/WebM; API +MOV | MP4/MOV, no edit lists, faststart | not stated (MP4 implied) | MP4 (Pages: no MOV) | most accepted |
| Video codec | H.264 High | API: H.264 rec., H.265, VP8, VP9 | H.264 or HEVC | H.264 High | ads: H.264 or VP8 | H.264 High, ProRes 422 HQ, HEVC |
| Chroma | 4:2:0 | not stated | 4:2:0 | 4:2:0 only | not stated | 10-bit recommended |
| GOP | closed, half frame rate | not stated | closed | no open GOP | not stated | not stated |
| fps | native | API 23–60 | 23–60 (Help: min 30) | ≤ 60; rec. 30/60 | 10–60 | native, CFR, > 60 reduced |
| Max size | not stated here | Studio < 10 GB; API 4 GB | 300 MB | 8 GB / 16 GB | 5 GB | plan-dependent |
| Max duration | Shorts ≤ 3 min | Studio 30 min; API 10 min | 15 min | 20 min / 125 min | 15 min desktop | plan-dependent |
| Audio | AAC-LC/Opus, 48 kHz, 384 kbps st. | not stated | AAC, ≤ 48 kHz, 128 kbps, ≤ 2 ch | AAC-LC, ≥ 128 kbps, ≤ 2 ch | ads AAC | AAC-LC 320 kbps, 48 kHz |
| Colour stated | BT.709 SDR | no | cover sRGB only | no | no | BT.709/BT.2020 |

---

## 3. What platforms do to uploads

### 3.1 Documented behaviour (platform tier)

- **Re-encode always.** X: "All uploads are processed for optimization across multiple platforms." YouTube produces multiple renditions, and VP9 is required for 4K viewing. Vimeo transcodes and converts audio to 48 kHz. YouTube's HDR page: "YouTube will detect the HDR metadata and process it, producing HDR transcodes for HDR devices and an SDR downconversion for other devices."
- **Resolution caps.** X caps unsubscribed playback at 720p. Instagram API caps width at 1920 columns. TikTok publishes no playback cap.
- **Frame rate.** Vimeo reduces > 60 fps. X and Apple HLS forbid > 60 fps. No platform documents converting 24↔30, but Instagram's Help Center says Reels "should have a minimum frame rate of 30 FPS" without saying what happens below that.
- **Colour.** YouTube: unspecified transfer → assumes BT.709; unspecified matrix/primaries → assumes BT.709; mixed BT.601/BT.709 → uses the matrix to override the primaries; unsupported spaces → "converts … to BT.709 by mapping pixel values"; BT.2020 without an HDR transfer → BT.709 (8-bit); full → limited range; RGB matrix → set to unspecified then inferred; sRGB transfer → BT.709 transfer. Instagram covers: non-sRGB → converted to sRGB.
- **HDR.** YouTube downconverts to SDR for non-HDR devices. Without ST 2086/MaxFALL/MaxCLL on PQ, "we use the values for the Sony BVM-X300 mastering display". An optional `.cube` LUT can hint the SDR downconversion, with "no spatial or temporal control".
- **Noise and grain.** YouTube: "YouTube's video processing may remove some noise to achieve streaming bitrates. You can get more control by denoising your video before rendering it for upload."
- **Audio normalisation.** No platform page fetched for this pillar documents a loudness normalisation target. Defer loudness to `SOUND-*`. Do not invent platform LUFS figures.
- **Cover frames.** Instagram crops covers to the "middle most 9:16" for Reels and "middle most 1:1" for feed.\[1\] TikTok Studio, X Media Studio and YouTube let you pick a frame or upload an image.\[17\]\[21\] Every platform falls back to an automatically chosen frame if you supply nothing, and none publishes the selection algorithm.

### 3.2 What survives and what degrades (mechanism-based; heuristic unless noted)

| Content | Survives? | Mechanism | Mitigation |
|---|---|---|---|
| Flat fills, bold sans type ≥ medium weight | Yes | Low entropy; cheap to encode | — |
| Smooth large gradients (sky, vignette, glow) | **Degrades: banding** | 8-bit quantisation plus encoder flattening of low-contrast regions; worse after a re-encode at a lower bitrate | Dither or noise before encode (§5); avoid long, low-slope gradients on dark backgrounds; measure CAMBI |
| Fine type, hairlines, 1-px strokes | Degrades: shimmer, softening | Platform downscale (e.g., X 720p) plus 4:2:0 chroma halving | Stroke ≥ 2 px at 1080 width (see `TYPO-*` for type sizes); avoid sub-pixel motion on thin strokes |
| Saturated red/blue text on contrasting colour | **Degrades: chroma smear** | 4:2:0 stores colour at half resolution both ways, so colour edges spread across 2-px blocks; red has low luma, so its edge is carried mostly by chroma | Add luma contrast (outline/shadow) or avoid pure-red text on blue or black |
| Grain, noise, particles, confetti | **Degrades: smeared or blocky** | High entropy; YouTube documents noise removal | Make grain larger and sparser, or accept it softening; never rely on per-pixel grain |
| Fast full-frame motion, whip pans, strobing | Degrades: blocking, mosquito noise | Bitrate starvation in high-motion GOPs | Higher upload bitrate; 60 fps costs YouTube's 12 vs 8 Mbps budget; prefer fewer moving pixels |
| Dark scenes with subtle detail | Degrades: crush, blocking in shadows | Encoders allocate fewer bits to dark flat regions; display gamma mismatch | Lift shadow detail slightly; check `signalstats` YLOW |
| Pure black/white extremes | Clips if range is mis-signalled | Full/limited confusion | `DELIVERY-RANGE-LIMITED` |
| Thin horizontal lines ≤ 1 px, fine checkerboards | Moiré, twitter | Downscale aliasing | Avoid sub-2-px periodic patterns |

**Published measurements:** apart from YouTube's noise-removal statement and Netflix's CAMBI findings, no first-party, platform-specific measurement of what each platform does to motion-graphics content was found.\[4\] Third-party "TikTok downscales 4K to 1080p" claims are unverified. VCR should generate its own evidence with the local simulation in §8.4 and, ideally, with download-and-compare tests on private uploads.

---

## 4. Colour pipeline

### 4.1 The SDR chain VCR actually has

1. **Authoring:** browsers composite in sRGB and screenshot to 8-bit sRGB PNG (unless a scene uses wide-gamut CSS colours, which are then clipped or converted on capture; heuristic).
2. **Conversion:** RGB → Y′CbCr using the **BT.709 matrix** and **limited ("tv") range**.
3. **Signalling:** tag `color_primaries=bt709`, `color_trc=bt709`, `colorspace=bt709`, `color_range=tv`. These are YouTube's recommended "H.273 value 1" for each.
4. **Display:** viewers' devices decode with BT.709 and display with their own transfer behaviour.

**sRGB vs BT.709 transfer.** The sRGB and BT.709 OETFs differ, and BT.1886 defines the reference display EOTF for HD. YouTube states "sRGB TRC will convert to BT.709 TRC".\[3\] The practical rule: **do not tag `iec61966-2-1` (sRGB) transfer on delivery video.** Tag `bt709` and keep the pixel values as rendered. Practitioners widely report that browser-authored graphics tagged this way match web previews closely on most phones; that is heuristic, so verify on target devices. The exact BT.709/BT.1886/sRGB curve parameters were not re-checked against ITU documents in this session (ledger: unverified).

### 4.2 Limited vs full range

- **Limited (tv/MPEG) range** puts 8-bit luma at code values 16–235 and chroma at 16–240. **Full (pc/JPEG) range** uses 0–255. These are BT.601/BT.709 conventions, not re-checked against ITU text this session.
- **Failure 1: "washed out".** Limited-range data is flagged or interpreted as full range. Black displays as dark grey (16/255) and white as light grey (235/255), so contrast drops.
- **Failure 2: "crushed / too contrasty".** Full-range data is flagged as limited. Values below 16 and above 235 clip, shadow and highlight detail vanish, and saturation increases.
- **Platform fact:** "YouTube converts full color range to limited color range." Full range is never an advantage on upload, and it adds a conversion step that can go wrong elsewhere.
- **Rule:** deliver limited range, tagged `tv` (`DELIVERY-RANGE-LIMITED`). Verify with `signalstats`: on a frame known to contain pure black and white, YMIN ≈ 16 and YMAX ≈ 235 in a correct limited-range file. Values persistently at 0/255 mean the file is effectively full range.

### 4.3 Primaries, transfer and matrix tags

| Tag | `ffprobe` field | Correct SDR value | What goes wrong when missing or wrong |
|---|---|---|---|
| Primaries | `color_primaries` | `bt709` | Players guess. Mis-tagging BT.2020 on SDR makes YouTube convert it to BT.709 (8-bit), which desaturates. |
| Transfer | `color_transfer` | `bt709` | Unspecified → YouTube assumes BT.709. Other players may assume sRGB or 2.2, causing gamma shift ("too dark"/"too light"). |
| Matrix | `color_space` | `bt709` | **The most common silent error.** Converting with BT.601 maths but tagging (or defaulting to) BT.709 shifts hues: reds go orange, greens shift. It is subtle on greys and obvious on brand colours. |
| Range | `color_range` | `tv` | Washed out or crushed (§4.2). |

**FFmpeg specifics (heuristic: widely reported practitioner behaviour, check against the installed FFmpeg version).** When converting RGB PNGs to `yuv420p` without specifying a matrix, swscale's default matrix for the conversion has historically been BT.601. Output tags are often left "unknown" unless set. VCR should always do both:

    -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"
    -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv

The `-colorspace/-color_*` flags write metadata only. The `scale` options change the maths. Both are needed. Alternatives are `zscale` (zimg: `zscale=matrix=709:transfer=709:primaries=709:range=limited`) and the `colorspace` filter for YCbCr→YCbCr conversions. Choose one path per pipeline and test it with a colour-bar round trip (§8.3).

### 4.4 Display P3 and wide gamut

- Browsers can author in Display P3 (CSS `color(display-p3 …)`), and phones display P3. **No social platform fetched here documents preserving P3 in SDR video.** YouTube maps unsupported primaries to BT.709. Apple's HLS spec lists "DCI-P3" as a permitted single colour space for HLS, which is not the same as social intake.
- **Rule:** deliver video in BT.709 primaries (`DELIVERY-WIDE-GAMUT`). If a design depends on P3-only colours (e.g., a neon green outside sRGB), expect it to clip to the nearest BT.709 colour. Check the clipped version during design, not after upload.
- **Stills:** Instagram converts non-sRGB covers to sRGB. Export stills in sRGB with an embedded sRGB ICC profile (`DELIVERY-STILL-SRGB`).

### 4.5 HDR (PQ, HLG): when not to use it

- **Requirements (YouTube, fetched):** "Color depth: 10 bits or 12 bits"; "Color primaries: Rec. 2020"; "Color matrix: Rec. 2020 non-constant luminance"; "EOTF: PQ or HLG (Rec. 2100)"; frame rates "23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60". PQ "should also contain" "SMPTE ST 2086 mastering metadata" and "CEA 861-3 MaxFALL and MaxCLL". Recommended codecs: "VP9 Profile 2", "AV1", "HEVC/H.265". ProRes and "H.264 10-bit" "require very high bitrates".
- **Vimeo:** PQ or HLG only, ≥ 10-bit, ST 2086 + CEA 861.3 for PQ.
- **Apple HLS:** HDR HEVC "MUST be HDR10, HLG, or Dolby Vision", and "SDR streams MUST be provided".
- **Why not, for VCR (heuristic, with platform evidence):** browser frames are 8-bit sRGB SDR, so there is no HDR signal to deliver. Tagging SDR pixels as PQ or HLG makes players stretch them, and YouTube warns its metadata tool "will badly distort your videos" if the video wasn't graded in HDR. HDR encodes are also downconverted for most viewers by an automated process YouTube admits "might not deliver the perfect result". Social short-form intake (X, TikTok API, Instagram API) documents no HDR path.
- **Legitimate exception:** a Blender scene rendered to EXR and graded in Rec. 2100 for a YouTube or Vimeo long-form showcase, delivered alongside an SDR version. That is a deliberate project-brief decision, never a default (`DELIVERY-HDR-AVOID`, `DELIVERY-HDR-METADATA`).

---

## 5. Banding and dither

- **Cause:** 8 bits gives 256 code values per channel, and limited range uses only 220 luma steps. A gradient spanning a small value range across many pixels (e.g., #101820 → #182430 across 1920 px) has only a handful of distinct steps, so each step is a wide visible band. Encoders then flatten low-contrast regions further. Re-encoding at a lower bitrate (the platform pass) removes the residual noise that was hiding the bands. Banding is "highly dependent on the viewing environment — the brighter the display, and the dimmer the ambient light, the more visible banding is" (Netflix `cambi.md`, snippet).
- **Measurement:** CAMBI, where 0 = none and "around 5" = "slightly annoying" and 24 = maximum observed (Netflix, snippet). CAMBI supports "8, 10, 12 and 16" bit inputs. VMAF v0 and PSNR "have very little correlation" with banding MOS (Netflix Technology Blog, "CAMBI, a banding artifact detector", October 2021, snippet). VMAF v1 (June 2026) integrates CAMBI (Netflix blog, snippet).
- **Dither strategies (heuristic):**
  1. **Author-side noise:** add low-amplitude (≈ ±1–2 code values) static or animated noise over gradient layers in the scene (canvas, SVG `feTurbulence`, or a shader). Animated noise survives encoding worse than static noise but hides banding better at playback. Measure both.
  2. **Conversion-side dither:** render or convert at higher precision and dither down to 8-bit at the RGB→YUV step (zimg/`zscale` supports dithering, e.g. `dither=error_diffusion`). This helps the master-to-delivery step but is partly erased by the platform re-encode.
  3. **Encoder settings:** x264 `--tune grain` or a lower `--aq-mode`/higher `--aq-strength` preserve noise better. 10-bit encodes (`yuv420p10le`) avoid banding in the upload but most social platforms output 8-bit anyway (YouTube converts BT.2020 SDR to 8-bit BT.709).
  4. **Design-side:** shorten gradient spans, increase contrast between endpoints, avoid dark-to-dark gradients across full frames, and use texture.
- **How much bitrate fixes it:** **no published figure was found.** Bitrate alone does not fix 8-bit quantisation banding. It only preserves dither noise that masks it. Treat "upload at 2–3× the platform recommendation" as a folk heuristic with no traceable origin. Measure instead: encode at the platform-recommended bitrate, compute CAMBI on the decoded output, and increase noise amplitude or bitrate until CAMBI < 5 (`DELIVERY-BANDING`, `DELIVERY-DITHER`).\[7\]
- **Agent pitfall:** judging banding on a single PNG frame. The PNG has no compression, so it can look clean while the encode bands. Always judge the decoded delivery file and the simulated re-encode.

---

## 6. Codecs, containers and encoder settings

### 6.1 H.264 (AVC): the default delivery codec

| Parameter | Recommendation | Source / tier |
|---|---|---|
| Profile | High | YouTube, X, Vimeo, Apple HLS (`platform`) |
| Level | ≤ 4.1 where possible for compatibility; never above 5.2 | Apple HLS: "SHOULD be less than or equal to High Profile, Level 4.1"; "MUST be less than or equal to High Profile, Level 5.2" (`platform`) |
| Pixel format | `yuv420p` (8-bit 4:2:0); even width and height | YouTube, X, Instagram API (`platform`); even dimensions are an x264/4:2:0 constraint (`heuristic`) |
| Entropy | CABAC | YouTube (`platform`) |
| B-frames | 2 | YouTube "2 consecutive B frames" (`platform`) |
| GOP | Closed; keyframe interval ≤ 2 s; YouTube asks for "GOP of half the frame rate" (0.5 s) | YouTube, X, Instagram API, Apple HLS (`platform`) |
| Rate control | CRF ≤ 18 (Vimeo) or 2-pass VBR at ≥ the platform recommendation; cap at platform maxima (Instagram API 25 Mbps VBR) | Vimeo, Meta (`platform`); 2-pass is `heuristic` |
| Scan | Progressive | all (`platform`) |
| Container flags | `-movflags +faststart` | YouTube, Instagram API (`platform`) |

**Level arithmetic (unverified against ITU-T H.264 Annex A this session):** 1080 × 1920 at 60 fps is 8,160 macroblocks per frame × 60 = 489,600 MB/s. This exceeds the Level 4.1 limit of 245,760 MB/s and needs Level 4.2 (522,240 MB/s), per H.264 Table A-1 as encoded in FFmpeg's `libavcodec/h264_levels.c` (seen in a search snippet; the page did not render). At 30 fps it fits Level 4.0/4.1. Let x264 choose the level automatically and record it in the manifest. Do not force 4.1 on 60 fps vertical content.

**"Half the frame rate" GOP:** YouTube's "GOP of half the frame rate" means 15 frames at 30 fps (0.5 s) and 30 frames at 60 fps. That is shorter than Apple's 2 s IDR cadence. A 0.5 s closed GOP costs some efficiency but satisfies everyone. Use `-g <fps/2> -keyint_min <fps/2> -sc_threshold 0` (or keep scene-cut detection on and still cap at fps/2), plus `-bf 2` and x264's default closed GOP (`open-gop` off) (`DELIVERY-GOP-CLOSED`, `DELIVERY-KEYFRAME-INTERVAL`).

**CRF vs constrained bitrate:** CRF gives constant quality and a variable size. Motion-graphics scenes with large flat areas produce very low bitrates at CRF 18, which can fall *below* X's "Minimum Video Bitrate: 5,000 kbps" recommendation and YouTube's 8 Mbps reference. Because the platform re-encode starts from that file, a starved upload compounds the damage. **Rule:** use CRF ≤ 18 with a floor, e.g. `-crf 16 -maxrate <platform max> -bufsize <2× maxrate>`, or switch to 2-pass VBR targeting the platform recommendation when the CRF result falls below it (`DELIVERY-BITRATE-FLOOR`). The floor is a platform recommendation, not a hard requirement.

### 6.2 H.265 (HEVC)

Accepted by TikTok's API, Instagram's API ("HEVC or H264"), Vimeo and YouTube (HDR). It is not listed by X. Use HEVC only for 10-bit or HDR deliveries to YouTube or Vimeo, or when a size cap bites (Instagram API 300 MB). In MP4 for Apple compatibility, tag `hvc1` (Apple HLS: use `'hvc1'` rather than `'hev1'`; `-tag:v hvc1`).

### 6.3 VP9 and AV1

YouTube plays 4K via VP9 and recommends VP9 Profile 2 or AV1 for HDR upload. TikTok's API accepts VP8/VP9. LinkedIn ads accept VP8. **No platform requires VP9 or AV1 for SDR upload.** H.264 is universal. Use VP9 primarily for **web alpha** (WebM with `yuva420p`) where a browser needs a transparent video overlay. It is not a social delivery format.

### 6.4 Alpha masters

| Format | Alpha | Notes |
|---|---|---|
| ProRes 4444 / 4444 XQ | Yes, "mathematically lossless" up to 16-bit | "approximately 330 Mbps" (4444) / "approximately 500 Mbps" (XQ) at 1080p29.97 for 4:4:4 without alpha; alpha "typically adds just a few percent" (Apple). Industry-standard interchange for NLEs. |
| PNG sequence | Yes, lossless 8/16-bit | Largest, simplest, frame-accurate. Best archival master for browser renders. |
| VP9 WebM with alpha | Yes, lossy | Browser playback overlays; not for editorial interchange. |
| ProRes 422 family | **No** | Apple: 4444 and 4444 XQ are "the only ProRes codecs that support alpha channels". |
| H.264 | **No** | Never promise alpha in an H.264 deliverable. |

**Alpha pitfalls (heuristic):** premultiplied vs straight alpha mismatch causes dark or light fringes on soft edges. Record which convention the master uses in the manifest. Chromium screenshots with `omitBackground` yield straight alpha in PNG.

### 6.5 Containers

- **MP4 (ISO/IEC 14496-14 on ISO BMFF 14496-12):** delivery default. `+faststart` moves `moov` to the front.
- **MOV:** master container (ProRes). Rejected by LinkedIn Pages, and avoid it for social.
- **WebM:** TikTok Studio and API accept it; useful for VP9 alpha on the web.
- **Edit lists (`elst`):** used to trim encoder priming and offset streams. YouTube and Instagram's API both say *no edit lists* (§7.4).

---

## 7. Frame rate and timing

### 7.1 Integer vs NTSC rates

- VCR renders 24, 25, 30 or 60 fps. These integer rates are accepted by every platform checked. YouTube lists "24, 25, 30, 48, 50, 60". Vimeo and Apple HLS also list 23.976/29.97/59.94.
- **Use NTSC-fractional rates only when** a deliverable is going to broadcast or must cut with 29.97/59.94 camera footage. Otherwise, integer rates keep frame times exact (t = n/fps), which suits the seek contract (`DELIVERY-FPS-NATIVE`).
- **Platform floor conflicts:** Instagram Help says Reels "should have a minimum frame rate of 30 FPS". X recommends "30 FPS, 60 FPS". TikTok API and Instagram API accept 23–60. LinkedIn accepts 10–60. **Recommendation:** for 9:16 social series, default to 30 fps. Use 60 for fast motion only when the bitrate budget allows (YouTube recommends 12 vs 8 Mbps at 1080p). Use 24/25 for social only as a deliberate look, and test Reels intake.
- **Never exceed 60 fps** (X, Apple HLS, Vimeo reduction) (`DELIVERY-FPS-MAX`).

### 7.2 Constant vs variable frame rate

VCR's capture is inherently CFR. The risk is the mux: an FFmpeg command that reads PNGs without `-framerate` (or with timestamps from a wall clock) can produce VFR or wrong-rate timestamps. Vimeo: "Always choose a constant frame rate rather than a variable frame rate." Meta Ads (secondary) asks for a "fixed frame rate". **Check:** `ffprobe -show_entries stream=r_frame_rate,avg_frame_rate`, which must be equal, and all frame PTS deltas must be equal (`DELIVERY-FPS-CONSTANT`).

### 7.3 Duration and frame accuracy

- Expected frame count N = round(duration × fps). Frame n is sampled at t = n/fps for n = 0…N−1. The last frame shows t = (N−1)/fps, not `duration`. Decide per project whether the final pose must be held (render one extra frame) and record it in the manifest.
- **Check:** decoded frame count (`ffprobe -count_frames -show_entries stream=nb_read_frames`) = N; video stream duration = N/fps ± 1 frame; audio duration within one video frame of video duration (`DELIVERY-DURATION-MATCH`).
- Minimum durations: X "at least 0.5 seconds"; LinkedIn "3 seconds"; Instagram API "3 seconds minimum".

### 7.4 A/V start offset: edit lists and encoder priming

- **AAC priming:** AAC encoders prepend priming samples. Apple's TN2258, "AAC Audio – Encoder Delay and Synchronization", says "Apple chose to assume that the AAC bitstream always contained an encoding delay of 2112 samples", and that if a player does not compensate, "the audio will be 2112 samples behind the video." FFmpeg's native AAC encoder introduces 1024 samples (≈ 21.3 ms at 48 kHz) and signals it with an MP4 edit list (secondary: FFmpeg-user list; mcut PR).\[22\]\[23\]
- **The conflict:** YouTube and Instagram ask for no edit lists, but the edit list is how FFmpeg tells players to skip priming.\[1\]\[3\] Mozilla notes that players not honouring explicit signalling fall back to an "implicit encoder delay of 2112 frames" (secondary).\[24\] The result is that the same file can be out of sync by up to 2112 samples on one player and correct on another. Mediabunny's "Project Sync" post measured "exactly 44 milliseconds of offset … At 48 kHz, this works out to exactly 2112 audio samples", and notes "FFmpeg's AAC encoder actually only adds the minimum required delay of 1024 samples."
- **Practical rule (heuristic):** for YouTube and Instagram uploads, mux with `-use_editlist 0` (mov/mp4 muxer option). Measure the resulting audio offset by decoding a known click at t = 0 against a known flash frame, and require |offset| ≤ 1 video frame (33 ms at 30 fps). If it fails, pre-shift the audio by the measured priming (`DELIVERY-EDIT-LIST`, `DELIVERY-AV-OFFSET`). The lip-sync tolerance figures in EBU/ITU recommendations were not re-checked this session, so the one-frame threshold is VCR's own heuristic.
- **Start time:** `ffprobe -show_entries stream=start_time` should be 0 (or equal) for both streams.

---

## 8. Measurement

### 8.1 Metadata, container and timing inspection

Separate these passes. Headers report declared properties; container parsing checks box layout; timestamps test cadence; frame/bitstream inspection tests GOP claims. `-show_frames` uses decoding in [FFmpeg's implementation](https://github.com/FFmpeg/FFmpeg/blob/master/fftools/ffprobe.c), so the entire pass is not a decode-free metadata check. Colour tags alone cannot establish correct pixel conversion. The commands below are worked examples, not shipped VCR checks.

    ffprobe -v error -show_entries format=format_name,duration,size,bit_rate:stream=codec_name,profile,level,pix_fmt,width,height,sample_aspect_ratio,r_frame_rate,avg_frame_rate,field_order,color_range,color_space,color_transfer,color_primaries,sample_rate,channels,bit_rate,start_time,nb_frames -of json delivery.mp4

Checks: codec/profile (`h264`, `High`), level, `pix_fmt=yuv420p`, even dimensions, `sample_aspect_ratio=1:1`, CFR, `field_order=progressive`, the four colour tags, `aac` with profile `LC`, `sample_rate=48000`, `channels≤2`, duration/frame count, size vs platform cap. Container structure: `moov` before `mdat` (faststart) and absence of `elst` can be checked by parsing atoms (e.g., `ffprobe -v trace` output, or a small MP4 box parser). GOP: `ffprobe -select_streams v -show_frames -show_entries frame=key_frame,pict_type,pts_time` gives keyframe spacing. Open GOP is detectable when non-IDR I-frames are followed by leading B-frames, which is hard; rely on encoder flags (`open_gop=0` in x264 SEI) and record them.

### 8.2 Decoded-signal filters (FFmpeg, per frame)

| Filter | Measures | Use in DELIVERY | Reliability for motion graphics |
|---|---|---|---|
| `signalstats` | YMIN/YLOW/YAVG/YHIGH/YMAX, SATMAX, `brng` (out-of-broadcast-range pixels), YDIF (temporal change) | Range errors, crushed blacks, clipped whites, frozen frames | High for range. `brng` flags legitimate 0–15/236–255 values only if the file is meant to be limited. |
| `ebur128` | Integrated/short-term loudness, true peak | Hand off to `SOUND-*` | Standard (BS.1770); thresholds owned by SOUND. |
| `idet` | Interlaced vs progressive classification, repeated fields | Confirm progressive | High; renders should be 100 % progressive. Any "TFF/BFF" majority indicates a pipeline bug. |
| `blockdetect` | Blockiness via pixel-grid periodicity (default periods "[3,24]") | Detect blocking after simulated re-encode | Medium. Flat graphics with grid-like designs (tiles, pixel art) cause false positives. Compare against the master's score, not an absolute. |
| `blurdetect` | Edge-width blur (Marziliano et al.) | Detect "soft" | Medium-low. Intentional blur, depth of field and soft brand imagery raise the score; use differential (master vs delivery) only. |
| `deband` | Removes banding (not a metric) | Not for QC; never apply silently to deliverables | — |

### 8.3 Full-reference metrics

- **VMAF (Netflix).** Designed and trained largely on camera content. Secondary sources say predictions are "less reliable" for "screen recordings and text, … animation". Use it to compare encodes *of the same piece*, not as an absolute pass mark. VMAF v1 (June 2026) adds CAMBI and chroma features (Netflix blog, snippet), and is preferable to v0 for gradients and colour.
- **CAMBI.** Use as the banding gate (< 5 target; heuristic threshold anchored to Netflix's "slightly annoying" description).
- **SSIM / PSNR.** Cheap, deterministic, insensitive to banding and temporal artefacts. Good for *regression* (did the pipeline change pixels?), e.g. a master→delivery PSNR drop of more than N dB vs the last approved build. Poor as a perceptual gate.
- **Colour round-trip test:** render a known chart (pure R/G/B/C/M/Y, 0/16/128/235/255 greys, brand swatches) as a VCR scene, run the delivery pipeline, decode back to RGB with BT.709 limited, and compute the per-swatch ΔE (CIEDE2000). A matrix error (BT.601 vs BT.709) shows as large ΔE on saturated swatches and near-zero on greys, which is a distinctive signature.

### 8.4 Simulating a platform re-encode locally (heuristic)

No platform publishes its encoder settings. Approximate them with a ladder bracketed by published figures:

- **YouTube-like:** downscale to the target rung, H.264 or VP9 at ≈ 50–100 % of YouTube's *upload* recommendation (playback bitrates are lower than upload bitrates, but the exact ratios are not published).
- **X-like (unsubscribed):** scale to 720 × 1280 and encode at "2048K" video and "128K" audio, X's own recommendation table for 720p portrait. This is the most aggressive documented figure and a good worst case.
- **Apple HLS ladder** as a public proxy for streaming rungs: 1080p at "6000" or "7800" kbps H.264, 720p at "3000"/"4500".

Run the delivery file through the simulation, then compute CAMBI, `blockdetect`, `signalstats` and VMAF against the master. Present the human reviewer with a side-by-side **in motion** (`DELIVERY-REENCODE-PREVIEW`). **Reliability:** this predicts *direction and location* of damage (which shots band, which type smears) better than absolute appearance.

---

## 9. Masters, versions, manifests

- **Archive per piece:** mezzanine master (ProRes 4444 if any alpha is ever needed, else ProRes 422 HQ, or a PNG sequence); final mixed WAV (48 kHz, 24-bit) plus stems (dialogue/VO, music, SFX) as WAV; captions as SRT and WebVTT; cover stills (PNG master + platform JPEGs); the scene source commit hash; the render manifest. Heuristic: Netflix Partner Help Center delivery specs are the practitioner canon for this, but were not fetched this session.
- **Naming (heuristic):** `<project>_<episode>_<deliverable>_<aspect>_<WxH>_<fps>p_<codec>_<colour>_<loudness?>_v<NNN>.<ext>`, e.g. `acme_ep012_main_9x16_1080x1920_30p_h264_bt709_v003.mp4`. Rules: lowercase, no spaces, zero-padded versions, never "final". The aspect token uses `9x16` not `9:16` (colons break filesystems). Note: rule *IDs* forbid digits, but file names may use them.
- **Versioning:** bump the version on any pixel or audio change. Metadata-only remuxes get a suffix (`v003r1`). Keep superseded versions until the delivery is confirmed live.
- **Checksums:** compute SHA-256 for every file in the manifest at render time, and verify after every copy/upload staging step (`DELIVERY-CHECKSUM`). MD5 is common in post houses for speed, but SHA-256 is preferred where a collision-resistant hash matters (heuristic).
- **Manifest (JSON; heuristic schema):** for each file, record path, SHA-256, bytes, role (master/delivery/sidecar), platform target, the `ffprobe` summary (codec, profile, level, pix_fmt, colour tags, fps, frames, duration, audio format), encode command, FFmpeg version, scene commit, render fps, `__scene.duration`, the frame-hold policy, alpha convention, measured QC values (CAMBI p95, YMIN/YMAX, A/V offset, loudness from SOUND), and the rule IDs passed/failed (`DELIVERY-MANIFEST`).

---

## 10. Captions and metadata at delivery

- **Sidecar formats:** SRT (simplest, universally accepted: LinkedIn ads "Must be in SRT format"; X Media Studio ".SRT sidecar"); WebVTT (W3C; web players, HLS); TTML/IMSC (W3C; broadcast and OTT interchange). X Media Studio also accepts embedded "CEA 608/708". W3C specs were not re-fetched this session.
- **Burned-in vs sidecar:** social short-form is often watched muted, and some placements give no sidecar route for organic posts (secondary: Instagram organic Reels have no SRT upload; X does not allow alt text on video, per a third-party guide).\[5\]\[25\] For 9:16 social, **burn in** the captions and still archive a sidecar. For YouTube, Vimeo and LinkedIn, **upload a sidecar** (searchable, toggleable, translatable), and burn in only stylised kinetic type that is part of the design. Never do both visibly at once, because double captions are a common agent error (`DELIVERY-CAPTION-SIDECAR`, `DELIVERY-CAPTION-BURN`). Styling, reading speed and placement belong to `TYPO-CAPTION-*` and `A11Y-*`.
- **Sidecar timing:** cue times must be in the same timebase as the delivered file. If any head trim or pre-roll is added at delivery, shift every cue. Vimeo OTT notes an "01" hour timecode prefix "will offset your timecode for SRT by 1 hour", so start SRT at 00:00:00,000.
- **Metadata fields that matter:** title, description, language of audio and captions, and the cover. In-file metadata (`title`, `creation_time`) is largely ignored by social platforms (heuristic). Do not rely on it, and strip GPS/device metadata from any camera-derived stills (privacy; heuristic).

---

## 11. Stills delivery

| Use | Format | Size | Source / tier |
|---|---|---|---|
| YouTube video thumbnail | JPG/PNG | YouTube Help recommends "3840 x 2160" (snippet, truncated); third parties cite 1280 × 720, 2 MB (classic), and Have Camera Will Travel and BreakReach cite 2 MB on mobile and 50 MB on desktop (unverified) | platform (partial) |
| YouTube Shorts thumbnail | — | "recommended aspect ratio is 9:16" | platform |
| Instagram Reel cover | JPEG (API) | Help: "420px by 654px (or 1:1.55 ratio)" (snippet); API: "8MB maximum", sRGB, centre 9:16 and 1:1 crops | platform |
| LinkedIn ad thumbnail | JPG/PNG | "Maximum file size: 2 MB"; match video aspect and resolution | platform |
| X image | JPG/PNG/GIF/WEBP | "<= 5 MB" | platform |
| TikTok photo | WebP/JPEG | "Maximum 1080p", "Maximum of 20MB for each image" | platform |

**Format choice (heuristic):** PNG for flat graphics and type (lossless, no ringing around text); JPEG at quality ≥ 85 for photographic or gradient-heavy covers under size caps; WebP/AVIF only where explicitly accepted (X and TikTok accept WebP; no fetched platform page lists AVIF).\[2\]\[26\] Always use sRGB with an embedded profile. Never use CMYK or untagged wide-gamut. Remove alpha from covers (flatten onto the intended background), because platforms flatten transparency unpredictably. sharp, ImageMagick and resvg all need explicit `withMetadata({icc:'srgb'})`/`-profile`/colour handling to embed profiles (tool behaviour heuristic; check the versions in use) (`DELIVERY-STILL-SRGB`, `DELIVERY-STILL-FORMAT`, `DELIVERY-THUMB-SIZE`).

**Cover frame design:** because Instagram crops a 9:16 cover to its centre 1:1 for the feed grid, keep the title and subject inside the centre square (`DELIVERY-COVER-FRAME`). An agent should export an explicit cover still rather than letting the platform pick a mid-transition frame.

---

## 12. Medium-specific guidance

### 12.1 9:16 social (TikTok, Reels, Shorts, Stories)

- 1080 × 1920, 30 fps default (Instagram's 30 fps floor), H.264 High, `yuv420p`, BT.709 tv, closed GOP ≤ 0.5 s, `+faststart`, no edit lists, AAC-LC 48 kHz stereo 128–384 kbps.
- **Size budget:** Instagram API 300 MB, Stories API 100 MB. At 25 Mbps max VBR, 300 MB holds ≈ 96 s, so long Reels need a lower bitrate (simple arithmetic: 300 MB × 8 / 25 Mbps).
- Duration: Shorts ≤ 3 min to classify as a Short; Instagram API ≤ 15 min; TikTok API ≤ 10 min.
- Burned-in captions; explicit cover still; centre-square-safe title (§11).
- X's best experience is 720 × 1280 for non-subscribers, but uploading 1080 × 1920 is fine if the post succeeds (see the §2.4 contradiction).

### 12.2 16:9 (YouTube, Vimeo, LinkedIn, X)

- 1920 × 1080 or 3840 × 2160. Consider a 4K upload for YouTube when fine type or gradients matter: YouTube's 4K rungs use VP9 and a 35–45 Mbps upload recommendation.\[3\] Whether 4K uploads also improve the 1080p rendition is practitioner folklore, unverified.
- Sidecar captions; 1280 × 720+ or 4K thumbnail.
- Vimeo: consider ProRes 422 HQ or 10-bit HEVC upload for gradient-heavy work.

### 12.3 Square (1:1)

- 1080 × 1080. Valid as a YouTube Short (square counts), as an Instagram feed post, on LinkedIn (1:1 ads up to 1920 × 1920) and on X (720 × 720 recommended).\[2\]\[27\]\[28\] On TikTok and Reels it plays letterboxed (secondary).

### 12.4 Stills

- §11. Export from the same render path as video frames (seek → screenshot) so colours match the video. Convert to sRGB-tagged PNG/JPEG. Flatten alpha.

### 12.5 Loops

- **Seam:** frame N−1 must flow into frame 0 (motion continuity is `MOTION-*`). DELIVERY checks that no duplicated frame exists at the seam (frame 0 ≠ frame N−1 unless designed as a hold), using `signalstats` YDIF ≈ 0 between the last and first frames as the duplicate signal.
- **Audio in loops:** AAC priming and padding create a gap at the loop point on many players. For seamless audio loops, prefer silent loops on social or accept the gap. GIF loops (X GIF ≤ 15 MB, ≤ 350 frames) carry no audio and a 256-colour palette, which bands heavily, so prefer MP4 (`DELIVERY-LOOP-SEAM`).
- X loops short videos automatically (secondary claim: "60 seconds or less", unverified).\[25\]

---

## 13. Analysis, creation, rules and measurement

**Upstream asset and research handoff.** [Image Direction §4–6](../image-direction/README.md) supplies placement-fit evidence and unresolved acquisition or provenance gaps (`IMAGE-PLACEMENT-FIT`, `IMAGE-GAPS-HANDED-OFF`). Delivery owns the encoded-file checks and delivery manifest; source-asset provenance is a separate shared concern. [Domain Exploration §3](../domain-exploration/README.md) and [Cultural Context §6](../cultural-context/README.md) supply source or cultural-reference recheck triggers when applicable. A technically valid encode does not verify claims, permissions or audience meaning. These reference criteria add no automatic delivery gates.

### 13.1 The critique process (how a delivery/QC engineer reviews)

Run the steps in order and stop at the first blocker.

1. **Identify the target.** Which platforms and placements, which account tier (X Premium?), which upload route (TikTok Studio vs API). Specs differ by route.
2. **Metadata gate (`ffprobe`).** Container, codec, profile/level, pix_fmt, dimensions, SAR, fps/CFR, scan, colour tags, audio codec/profile/rate/channels, duration, size, faststart, edit lists. Any hard-limit failure is a **Blocker**.
3. **Signal checks on the decoded file.** Range (YMIN/YMAX), `brng`, `idet`, frame count, black/frozen frames at head and tail, A/V offset with a sync marker, loudness via `SOUND-*`.
4. **Simulated platform re-encode.** CAMBI on gradient shots, `blockdetect` delta on fast shots, chroma-smear check on saturated text (zoomed crops).
5. **Watch at speed, full screen, on a phone-sized viewport, twice:** once for picture and once for sync. Judder, strobing and loop seams are only visible in motion. Never sign off motion from stills.
6. **Cover and sidecars.** Cover crop safety, caption timing on the delivered file, manifest checksums.
7. **Write findings** with severity, timecode or frame range, measurement and rule ID.

**Severity:**
- **Blocker:** platform will reject or mis-process (wrong codec, > size cap, > 60 fps, HE-AAC on X, VFR, interlaced, edit list on YouTube/Instagram if it causes offset, HDR-tagged SDR, wrong range tag).
- **Major:** visible to most viewers after the platform re-encode (CAMBI ≥ 5 on a hero shot, A/V offset > 1 frame, matrix error on brand colours, caption cues off by > 1 frame, cover cropping the title).
- **Minor:** visible only to trained eyes or on some devices (light blocking in a 6-frame transition, slight softness on 1-px rules).
- **Note:** preference or future-proofing (missing manifest field, non-standard name).

**Vocabulary → measurement map:**

| Term | Meaning | Measurement |
|---|---|---|
| **Washed out / milky / lifted blacks** | Limited data shown as full, or the gamma tag wrong | `color_range`, YMIN on black frames (≈16 shown as grey), ΔE on the chart |
| **Crushed** (blacks/whites) | Shadow or highlight detail clipped | YLOW/YMIN at 16 with flat histogram tails; full data flagged tv; `brng` |
| **Banded / contouring / posterised** | Steps in gradients | CAMBI (≥ 5 annoying) |
| **Blocky / macroblocking** | Visible codec block grid | `blockdetect` delta vs master |
| **Mosquito noise / ringing** | Halo around sharp edges and type | VMAF/SSIM local drop; visual crop |
| **Soft** | Detail lost (downscale, low bitrate, denoise) | `blurdetect` delta; resolution check |
| **Chroma bleed / smear** | Colour spills past luma edges | ΔE at text edges in zoomed crops; 4:2:0 check |
| **Judder / stutter** | Uneven motion cadence | Frame PTS deltas (CFR), duplicated frames (YDIF ≈ 0 mid-motion), fps conversion |
| **Strobing** | Fast motion without blur at low fps | Judgement plus `MOTION-*`; pixel displacement per frame |
| **Out of sync / lip sync** | A/V offset | Click-to-flash offset; `start_time`; edit-list presence |
| **Hue shift / wrong colours** | Matrix or primaries mismatch | ΔE on saturated swatches with neutral greys correct |
| **Dropped / duplicate frames** | Frame-count error | `nb_read_frames` vs N; YDIF |
| **Flash frame** | Stray single frame at a cut or the head/tail | Per-frame YAVG spike detection |

### 13.2 The creation process

1. **Brief:** list placements and routes; pick aspect(s), fps (default 30 for vertical social; 60 only for motion-led work) and duration limits per placement. Record them in the series brief (`BRIEF-*`), which holds the values; DELIVERY holds the checks.
2. **Design for the codec:** avoid long dark gradients, 1-px saturated lines and per-pixel grain. Add authored dither on gradients. Keep type stroke weights compatible with 4:2:0 (see `TYPO-*`).
3. **Render** at the delivery fps with a CFR timeline, and decide the frame-hold policy for the last frame.
4. **Master:** PNG sequence or ProRes 4444/422 HQ plus WAV stems; manifest stub.
5. **Encode** with the explicit BT.709 tv conversion and tags, the platform GOP/B-frame settings, CRF with a bitrate floor and cap, `+faststart`, and the chosen edit-list policy.
6. **Verify:** metadata gate → signal checks → simulated re-encode → watch at speed → cover and sidecars → manifest with checksums.
7. **Per-platform variants** only where a hard limit differs (e.g., an Instagram 300 MB cap, an X 720p variant for non-Premium accounts).

### 13.3 Rules table

| ID | Check | Threshold | Tier | Applies to | Measurable? |
|---|---|---|---|---|---|
| `DELIVERY-CONTAINER-MPFOUR` | Delivery container | MP4 (MOV only where accepted; never MOV for LinkedIn Pages) | platform | all social delivery | Yes: `format_name` |
| `DELIVERY-FASTSTART` | moov atom precedes mdat | moov first | platform (YouTube, Instagram API) | MP4 delivery | Yes: atom order |
| `DELIVERY-EDIT-LIST` | No `elst` edit list where forbidden | 0 edit lists for YouTube and Instagram | platform | YouTube, Instagram | Yes: atom parse |
| `DELIVERY-CODEC-AVC-HIGH` | Video codec/profile | H.264 High (HEVC allowed for YouTube HDR, Vimeo, Instagram, TikTok) | platform | all | Yes: `codec_name`, `profile` |
| `DELIVERY-LEVEL` | H.264 level | ≤ 4.1 preferred; ≤ 5.2 hard (Apple HLS) | platform | streaming-bound delivery | Yes: `level` |
| `DELIVERY-CHROMA-SUBSAMPLING` | Pixel format | `yuv420p` (8-bit 4:2:0) for social; 4:4:4 only in masters | platform | social delivery | Yes: `pix_fmt` |
| `DELIVERY-EVEN-DIMENSIONS` | Width and height even | both even | heuristic | 4:2:0 encodes | Yes |
| `DELIVERY-SAR-SQUARE` | Square pixels | SAR 1:1 | platform (X, Vimeo) | all | Yes: `sample_aspect_ratio` |
| `DELIVERY-PROGRESSIVE` | No interlacing | `field_order=progressive`; `idet` ≈ 100 % progressive | platform | all | Yes |
| `DELIVERY-COLOR-TAGS` | Primaries, transfer, matrix tagged | all = `bt709` for SDR | platform (YouTube) | all SDR video | Yes: `ffprobe` |
| `DELIVERY-COLOR-MATRIX-MATH` | RGB→YUV used the BT.709 matrix | Chart ΔE00 small on saturated swatches (heuristic target ≤ 2) | heuristic | VCR pipeline | Yes: round-trip chart |
| `DELIVERY-RANGE-LIMITED` | Range is limited and tagged `tv` | `color_range=tv`; black ≈ Y 16, white ≈ Y 235 | platform (YouTube converts full→limited); code values standard (unverified this session) | all video | Yes: `signalstats` |
| `DELIVERY-LEGAL-RANGE` | Pixels outside the legal range | `brng` ≈ 0 except intentional super-whites (none in VCR) | heuristic | limited-range delivery | Yes: `signalstats` `brng` |
| `DELIVERY-WIDE-GAMUT` | No P3/BT.2020 primaries in SDR delivery | primaries = bt709 | platform (YouTube maps others to BT.709) | SDR video | Yes |
| `DELIVERY-HDR-AVOID` | No HDR tags on SDR-authored content | transfer ∉ {smpte2084, arib-std-b67} unless the brief opts in | platform (YouTube HDR page) and heuristic | all | Yes |
| `DELIVERY-HDR-METADATA` | HDR deliveries complete | 10/12-bit, BT.2020 primaries + ncl matrix, PQ/HLG; PQ has ST 2086 + MaxFALL/MaxCLL | platform | opt-in HDR (YouTube, Vimeo) | Yes |
| `DELIVERY-FPS-NATIVE` | Delivery fps = authored fps | equal; integer 24/25/30/60 | platform (YouTube "same frame rate") | all | Yes |
| `DELIVERY-FPS-CONSTANT` | CFR | `r_frame_rate` = `avg_frame_rate`; equal PTS deltas | platform (Vimeo, Meta) | all | Yes |
| `DELIVERY-FPS-MAX` | Frame rate ceiling | ≤ 60 | platform (X, Apple, Vimeo) | all | Yes |
| `DELIVERY-FPS-FLOOR-REELS` | Reels frame-rate floor | ≥ 30 (Help Center) / ≥ 23 (API) | platform (conflicting) | Instagram Reels | Yes |
| `DELIVERY-GOP-CLOSED` | Closed GOP | no open GOP | platform (YouTube, X, Instagram) | all | Partly: encoder flags; frame analysis |
| `DELIVERY-KEYFRAME-INTERVAL` | Keyframe spacing | ≤ fps/2 frames for YouTube; ≤ 2 s everywhere | platform | all | Yes: keyframe PTS |
| `DELIVERY-BFRAMES` | Consecutive B-frames | 2 | platform (YouTube) | YouTube | Partly: frame types |
| `DELIVERY-BITRATE-FLOOR` | Upload bitrate at or above the platform recommendation | ≥ 8 Mbps 1080p30 / 12 Mbps 1080p60 (YouTube); ≥ 5 Mbps (X) | platform (recommendation) | YouTube, X | Yes: `bit_rate` |
| `DELIVERY-BITRATE-CAP` | Upload bitrate under the platform cap | ≤ 25 Mbps VBR (Instagram API); ≤ 30 Mbps (LinkedIn Pages) | platform | Instagram, LinkedIn | Yes |
| `DELIVERY-FILESIZE-PLATFORM` | File size cap | Instagram API 300 MB (Stories 100 MB); TikTok API 4 GB / Studio < 10 GB; X 8 GB (Premium 16 GB); LinkedIn 5 GB, ≥ 75 KB | platform | per platform | Yes |
| `DELIVERY-DURATION-PLATFORM` | Duration within limits | Shorts ≤ 3 min; Instagram API 3 s–15 min; TikTok API ≤ 10 min, Studio ≤ 30 min; X 0.5 s–20 min; LinkedIn 3 s–15 min (desktop) | platform | per platform | Yes |
| `DELIVERY-RESOLUTION-PLATFORM` | Dimensions within limits | TikTok Studio ≥ 720 × 1280; TikTok API 360–4096 px per side; Instagram ≤ 1920 columns, ≥ 720 px; LinkedIn 256 × 144–4096 × 2304 | platform | per platform | Yes |
| `DELIVERY-ASPECT-PLATFORM` | Aspect ratio within limits | Instagram Reels 1.91:1–9:16; X 1:3–3:1; LinkedIn 1:2.4–2.4:1; Shorts square or vertical | platform | per platform | Yes |
| `DELIVERY-AUDIO-CODEC` | Audio codec/profile | AAC-LC (never HE-AAC for X) | platform | all | Yes: `codec_name`, `profile` |
| `DELIVERY-AUDIO-SAMPLE-RATE` | Audio sample rate | 48 kHz | platform (YouTube, Vimeo; Instagram "maximum") | all | Yes |
| `DELIVERY-AUDIO-CHANNELS` | Channel count | mono or stereo for social (X, Instagram) | platform | social | Yes |
| `DELIVERY-AUDIO-BITRATE` | AAC bitrate | ≥ 128 kbps (X, Instagram); 384 kbps stereo recommended (YouTube) | platform | all | Yes |
| `DELIVERY-AV-OFFSET` | A/V sync at the head | ≤ 1 video frame | heuristic | all with audio | Yes: click/flash test |
| `DELIVERY-DURATION-MATCH` | Frame count and stream durations | frames = N; audio/video durations within 1 frame | heuristic | all | Yes |
| `DELIVERY-BANDING` | Banding after simulated re-encode | CAMBI < 5 on every shot (p95) | heuristic (anchored to Netflix guidance) | gradient content | Yes: CAMBI |
| `DELIVERY-DITHER` | Gradients carry dither/noise | present on gradients spanning < N code values (project-set) | heuristic | gradient content | Partly: local variance |
| `DELIVERY-BLOCKING` | Blocking after simulated re-encode | `blockdetect` delta vs master below project threshold | heuristic | fast motion | Yes (relative) |
| `DELIVERY-SOFTNESS` | Softness after simulated re-encode | `blurdetect` delta below project threshold | heuristic | fine detail and type | Yes (relative) |
| `DELIVERY-RED-CHROMA` | Saturated small text survives 4:2:0 | luma contrast present at text edges | heuristic | saturated type | Partly (ΔE crops) plus judgement |
| `DELIVERY-REENCODE-PREVIEW` | A simulated re-encode was reviewed in motion | done for each target | heuristic | all | Process check |
| `DELIVERY-MASTER-MEZZANINE` | Mezzanine master archived | ProRes 4444/422 HQ or PNG sequence + WAV | heuristic | all pieces | Yes: manifest |
| `DELIVERY-MASTER-ALPHA` | Alpha deliverables use alpha-capable codecs | ProRes 4444/4444 XQ, PNG, or VP9 WebM; never ProRes 422 or H.264 | platform (Apple) | alpha masters | Yes: `pix_fmt` has `a` |
| `DELIVERY-CHECKSUM` | Every file has a verified SHA-256 | match after every copy | heuristic | all | Yes |
| `DELIVERY-MANIFEST` | Manifest complete | all fields in §9 | heuristic | all | Yes |
| `DELIVERY-NAMING` | File name follows the convention | pattern in §9 | heuristic | all | Yes: regex |
| `DELIVERY-CAPTION-SIDECAR` | Sidecar exists and is timed to the delivered file | SRT/WebVTT; first cue ≥ 0; offsets match | platform (LinkedIn, X) and heuristic | all with speech | Yes |
| `DELIVERY-CAPTION-BURN` | Burned captions on muted-first placements; not duplicated by a sidecar display | Superseded: use `A11Y-CAPTION-SIDECAR`. See the shared rule-owner table; historical proposal is not an active threshold. | heuristic (superseded proposal) | 9:16 social | Judgement plus OCR |
| `DELIVERY-COVER-FRAME` | Explicit cover supplied; title inside the centre 1:1 of a 9:16 cover | — | platform (Instagram crops) | Reels, Shorts, TikTok | Partly: bbox vs centre square |
| `DELIVERY-THUMB-SIZE` | Thumbnail size and format within limits | per §11 | platform | YouTube, LinkedIn, Instagram | Yes |
| `DELIVERY-STILL-SRGB` | Stills are sRGB with an embedded profile | sRGB ICC present | platform (Instagram converts) and heuristic | stills, covers | Yes |
| `DELIVERY-STILL-FORMAT` | Still format matches content | PNG for flat/type; JPEG q ≥ 85 for photo/gradient under caps | heuristic | stills | Partly |
| `DELIVERY-LOOP-SEAM` | No duplicate frame or audio gap at the loop point | YDIF(last, first) > 0 unless a hold is designed | heuristic | loops | Yes |
| `DELIVERY-FLASH-FRAME` | No stray single frames at head, tail or cuts | no isolated YAVG spikes | heuristic | all | Yes |

### 13.4 How to measure in VCR

| Rule | Inputs | Calculation | Sampling | Failure modes |
|---|---|---|---|---|
| Container/codec/pixfmt/SAR/tags/audio/size/duration (all `ffprobe` rules) | Decoded delivery video (metadata only) | Field comparison against the platform profile table | Once per file | Tags can be present but wrong (matrix maths). Pair with the chart round trip. `ffprobe` reports container-level tags that may differ from bitstream VUI; read both (`-show_streams` and `-show_frames` side data). |
| `DELIVERY-FASTSTART`, `DELIVERY-EDIT-LIST` | File bytes | Parse top-level atoms; find `moov` offset < `mdat` offset; search `trak/edts/elst` | Once | Fragmented MP4 has `moof` boxes; treat as pass for faststart only if `moov` is first. |
| `DELIVERY-KEYFRAME-INTERVAL`, `DELIVERY-BFRAMES` | Decoded frame list | Max gap between `key_frame=1` PTS; longest run of `pict_type=B` | All frames | Scene-cut keyframes make intervals irregular (fine if all ≤ max). |
| `DELIVERY-FPS-CONSTANT`, `DELIVERY-DURATION-MATCH` | Frame PTS list; audio stream duration; `__scene.duration`, fps | Std-dev of PTS deltas = 0; count = round(duration × fps) | All frames | Timebase rounding produces ±1 tick jitter; use a tolerance of 1 tick. |
| `DELIVERY-RANGE-LIMITED`, `DELIVERY-LEGAL-RANGE` | Decoded frames; scene knowledge of where pure black/white exist (DOM computed styles at time t) | `signalstats` YMIN/YMAX/brng on frames known to contain #000/#fff | Frames at known extremes plus 1 fps sampling | Scenes without true black/white give no reference. Inject a 2-frame chart slate in a test render instead. |
| `DELIVERY-COLOR-MATRIX-MATH` | Test scene with swatches → delivery pipeline → decode | Decode with BT.709 limited → RGB; ΔE00 per swatch vs source hex | One test per pipeline change | The decoder's own assumptions; ensure explicit `in_color_matrix`/`in_range` on decode. |
| `DELIVERY-BANDING` | Master frames + simulated re-encode | CAMBI per frame (libvmaf `--feature cambi`); p95 per shot | Every frame of gradient shots, else 2 fps | Animated noise raises/lowers CAMBI frame to frame; use per-shot p95. Viewing environment dominates perception. |
| `DELIVERY-BLOCKING`, `DELIVERY-SOFTNESS` | Master + simulated re-encode | `blockdetect`/`blurdetect` per frame; delta = re-encode − master | All frames of fast/detailed shots | Designed grids, pixel art and intentional blur cause false alarms; relative deltas only. |
| `DELIVERY-RED-CHROMA` | DOM text elements + computed colours at time t; rendered PNG; decoded delivery | For text with high chroma and low luma contrast, crop the bbox (use `textBounds()` for canvas) and compute ΔE00 between master and delivery crops | Each caption/title appearance, mid-hold frame | Anti-aliasing differences; motion blur; small crops are noisy. |
| `DELIVERY-AV-OFFSET` | Audio file + cue times (`markers`); decoded delivery | Insert (in a QC render) a 1-frame white flash and a click at the same marker; cross-correlate the decoded audio onset with the frame's YAVG spike | Head, middle, tail | Production renders lack sync markers; run the QC render with the same pipeline. Priming varies by encoder. |
| `DELIVERY-LOOP-SEAM`, `DELIVERY-FLASH-FRAME` | Decoded frames | YDIF between frame N−1 and frame 0; YAVG z-score spikes of length 1 | All frames | Legit hard cuts to white/black look like flash frames; whitelist cuts from scene markers. |
| `DELIVERY-COVER-FRAME` | Cover still; text bounds | Check that the title bbox ⊂ the centre square | Once | Text detection on raster covers needs OCR if bounds aren't known. |
| `DELIVERY-CHECKSUM`, `DELIVERY-MANIFEST`, `DELIVERY-NAMING` | Files + manifest | SHA-256 recompute; schema validation; regex | Every copy step | — |

---

## 14. VCR-specific rendering and delivery notes

- **Seeked frames have no shutter.** Each frame is an instantaneous sample, so fast motion strobes at 24/30 fps and fine detail moving fast creates temporal aliasing that codecs encode poorly. A still frame looks perfect and the motion looks harsh. Motion blur is a `MOTION-*` decision; DELIVERY notes that strobing content costs more bits and degrades more on re-encode.
- **Sub-pixel motion of thin strokes** produces per-frame anti-aliasing changes (shimmer), which become high-frequency temporal noise for the encoder. After 4:2:0 and a platform downscale, it reads as "crawling" edges. Prefer integer-pixel positions for slow-moving hairlines, or thicken them.
- **Screenshots are 8-bit sRGB.** There is no higher-precision path out of Chromium screenshots, so gradients are quantised before encoding. Add dither in the scene, not afterwards.
- **`yuv420p` conversion is VCR's single most important colour step.** Make it explicit (matrix, range, tags) and lock it with the chart round-trip test in CI.
- **Fixed fps capture means durations snap to frames.** `__scene.duration` must be a multiple of 1/fps, or the last frame policy must be explicit. Audio cue times (`markers`) should also be snapped to frame boundaries for sync checks.
- **Determinism helps QC.** Because any frame can be re-rendered, a failing CAMBI shot can be re-rendered with more dither and re-measured without re-encoding the whole piece.
- **Platform re-encode is out of VCR's control.** Optimise the *input* (clean, high bitrate, correct tags) and design content that survives (§3.2). Never "pre-compensate" by sharpening or boosting saturation. YouTube's own warning about noise removal implies sharpening artefacts will be amplified (heuristic inference).
- **Agent failure modes to guard against:**
  - Judging delivery quality from PNG frames instead of the decoded encode.
  - Over-applying "60 fps is better", which doubles motion detail and bitrate needs and can look like video rather than animation.
  - Tagging sRGB transfer or full range "because the source is sRGB/PNG".
  - Copying third-party spec numbers that conflict with platform pages.
  - Burning captions and uploading a sidecar for the same placement.
  - Making every piece a homogenised "safe" export that strips intentional grain or texture. Grain is a legitimate look; make it survive (coarser, lower frequency) rather than removing it.
  - Treating VMAF v0 scores as truth for flat graphics.
- **Legitimate rule breaks:** 24 fps on Reels for a filmic series (accept the Help Center floor risk and test); heavy grain as a style (accept softening, test with the re-encode preview); full-frame gradients as a brand signature (pay for it with dither and CAMBI checks); HDR for a Blender showcase on YouTube or Vimeo (with SDR master and complete metadata). A break succeeds when it is deliberate, recorded in the brief and verified on the simulated platform output.

---

## 15. Master checklists

### 15.1 Analysis checklist

1. Target platforms, routes and account tiers identified → per-platform profile selected.
2. `DELIVERY-CONTAINER-MPFOUR`, `DELIVERY-FASTSTART`, `DELIVERY-EDIT-LIST`.
3. `DELIVERY-CODEC-AVC-HIGH`, `DELIVERY-LEVEL`, `DELIVERY-CHROMA-SUBSAMPLING`, `DELIVERY-EVEN-DIMENSIONS`, `DELIVERY-SAR-SQUARE`, `DELIVERY-PROGRESSIVE`.
4. `DELIVERY-COLOR-TAGS`, `DELIVERY-RANGE-LIMITED`, `DELIVERY-LEGAL-RANGE`, `DELIVERY-WIDE-GAMUT`, `DELIVERY-HDR-AVOID`.
5. `DELIVERY-FPS-NATIVE`, `DELIVERY-FPS-CONSTANT`, `DELIVERY-FPS-MAX`, `DELIVERY-FPS-FLOOR-REELS`, `DELIVERY-GOP-CLOSED`, `DELIVERY-KEYFRAME-INTERVAL`, `DELIVERY-BFRAMES`.
6. `DELIVERY-BITRATE-FLOOR`, `DELIVERY-BITRATE-CAP`, `DELIVERY-FILESIZE-PLATFORM`, `DELIVERY-DURATION-PLATFORM`, `DELIVERY-RESOLUTION-PLATFORM`, `DELIVERY-ASPECT-PLATFORM`.
7. `DELIVERY-AUDIO-CODEC`, `DELIVERY-AUDIO-SAMPLE-RATE`, `DELIVERY-AUDIO-CHANNELS`, `DELIVERY-AUDIO-BITRATE`, `DELIVERY-AV-OFFSET`, `DELIVERY-DURATION-MATCH`; loudness via `SOUND-*`.
8. `DELIVERY-REENCODE-PREVIEW` → `DELIVERY-BANDING`, `DELIVERY-BLOCKING`, `DELIVERY-SOFTNESS`, `DELIVERY-RED-CHROMA`.
9. Watch at speed on a phone-sized viewport: judder, strobing, `DELIVERY-LOOP-SEAM`, `DELIVERY-FLASH-FRAME`.
10. `DELIVERY-COVER-FRAME`, `DELIVERY-THUMB-SIZE`, `DELIVERY-STILL-SRGB`, `DELIVERY-CAPTION-SIDECAR`, `DELIVERY-CAPTION-BURN`.
11. `DELIVERY-CHECKSUM`, `DELIVERY-MANIFEST`, `DELIVERY-NAMING`.
12. Write findings: severity, frame range, measurement, rule ID, fix.

### 15.2 Creation checklist

1. Brief lists placements, routes, aspect, fps, durations and HDR opt-in (default no) → values in `BRIEF-*`.
2. Design for 4:2:0 and re-encode: dithered gradients (`DELIVERY-DITHER`), luma contrast on saturated text (`DELIVERY-RED-CHROMA`), coarse grain.
3. Duration snapped to frames; frame-hold policy chosen (`DELIVERY-DURATION-MATCH`).
4. Render CFR at the delivery fps (`DELIVERY-FPS-NATIVE`, `DELIVERY-FPS-CONSTANT`).
5. Archive the master (`DELIVERY-MASTER-MEZZANINE`; alpha → `DELIVERY-MASTER-ALPHA`).
6. Encode with explicit BT.709 tv conversion and tags (`DELIVERY-COLOR-TAGS`, `DELIVERY-RANGE-LIMITED`), H.264 High, 2 B-frames, closed GOP of fps/2, CRF ≤ 18 with floor and cap, `+faststart`, edit-list policy, AAC-LC 48 kHz stereo.
7. Per-platform variants only where a hard limit differs.
8. Export the cover still (sRGB, centre-square-safe) and caption sidecars.
9. Run the analysis checklist; fix; re-render only failing shots.
10. Write the manifest with checksums and QC values.

---

## 16. Authoritative sources and canon

- **Platform intake pages (primary, volatile):** YouTube Help ("Recommended upload encoding settings", "Upload HDR videos", Shorts and thumbnail pages); TikTok Help Center and the TikTok for Developers Media Transfer Guide; Instagram Help Center and the Meta Graph API IG User Media reference; X Developer Platform "Best practices" and X Help Media Studio; LinkedIn Help (troubleshooting, Pages specs, ad specs); Vimeo Help Center compression guidelines. These are the only legitimate sources for platform thresholds. Re-check them quarterly.
- **Apple HLS Authoring Specification for Apple Devices:** the most rigorous public statement of streaming-safe encoding (levels, IDR cadence, frame rates, colour-space consistency, bitrate ladders). It supersedes TN2224.
- **Apple ProRes White Paper and "About Apple ProRes":** mezzanine and alpha facts.
- **Apple TN2258 (AAC encoder delay):** the canonical explanation of priming and the 2112-sample convention.
- **ITU-R BT.709, BT.1886, BT.2020, BT.2100; SMPTE ST 2084 and ST 2086; ITU-T H.273 (code points); ITU-T H.264/H.265 Annex A (levels); ISO/IEC 14496-12/-14 (MP4, edit lists):** the standards behind every tag and limit. They were not re-fetched this session; their values here are marked unverified where used.
- **FFmpeg documentation** (`ffmpeg-filters`: `signalstats`, `blockdetect`, `blurdetect`, `idet`, `ebur128`, `zscale`, `colorspace`, `scale`): the measurement toolkit.
- **Netflix VMAF repository, the CAMBI documentation and the Netflix Technology Blog** (CAMBI 2021; VMAF v1, June 2026): perceptual metrics and their limits.
- **W3C WebVTT, W3C TTML2/IMSC:** caption interchange.
- **Netflix Partner Help Center:** practitioner canon for masters, QC vocabulary and delivery discipline (not fetched this session).
- **EBU R 128 / ITU-R BS.1770:** only via `SOUND-*`.
- **Practitioners:** Jan Ozer / Streaming Learning Center (codec and ladder testing; secondary) and the Doom9 and FFmpeg-user communities (encoder behaviour; secondary, use with care).

---

## 17. Caveats

- **Platform documents disagree with themselves and each other.**
  - Instagram: Help Center ≥ 30 fps vs API 23–60 fps.
  - X: the 1280 × 1024 hard dimension limit vs a recommended 720 × 1280 portrait and 1080p for subscribers.
  - TikTok: Studio vs API limits; third-party in-app limits are unconfirmed.
  - LinkedIn: member posts accept MOV, Pages reject it.
- **Weak evidence:**
  - TikTok publishes no audio, colour or re-encode specification.
  - No platform publishes playback bitrate ladders or loudness normalisation on the pages checked.
  - "How much bitrate fixes banding" has no published answer.
  - VMAF reliability on motion graphics comes from secondary sources.
  - The FFmpeg default-matrix behaviour is from practitioner knowledge, and the H.264 level figures come from FFmpeg's copy of Table A-1, not ITU text.
- **Fetch gaps:** the Instagram Help Center body would not load (snippet only). YouTube's thumbnail and Shorts pages, LinkedIn's pages, Apple TN2258 and the ProRes white paper figures came from snippets. ITU/SMPTE/ISO/W3C standards and the Netflix Partner Help Center were not fetched.
- **Likely to go out of date:**
  - All platform durations and file sizes (TikTok and X change them often).
  - The X subscription-tier rules.
  - The Instagram API version (v25/v26).
  - YouTube's thumbnail recommendation (recently moved to 4K).
  - The VMAF v1 model names.
  - Re-verify platform rows at least quarterly and on any intake failure.
- **Scope of evidence:** platform rules are vendor statements (`platform`), not audience research. No audience-behaviour data on muted viewing or quality perception was gathered here. Claims about muted-first placements rest on secondary sources and `A11Y-*`/`SOUND-*` pillars.

---

## 18. Verification ledger

All checks dated 2026-11-06 unless noted.

| Claim | Result | Checked against |
|---|---|---|
| YouTube: MP4, no edit lists, moov at front | confirmed | YouTube Help "YouTube recommended upload encoding settings" (fetched) |
| YouTube: H.264 High, 2 B-frames, closed GOP of half frame rate, CABAC, 4:2:0, progressive | confirmed | same |
| YouTube: AAC-LC/Opus/Eclipsa, 48 kHz; mono 128, stereo 384, 5.1 512 kbps | confirmed | same |
| YouTube SDR 1080p 8 / 12 Mbps; 720p 5 / 7.5; 2160p 35–45 / 53–68 | confirmed | same |
| YouTube HDR 1080p 10 / 15 Mbps; 480p/360p not supported | confirmed | same |
| YouTube SDR colour BT.709 (H.273 value 1); unspecified → BT.709; full → limited; sRGB TRC → BT.709 TRC; BT.2020 SDR → BT.709 8-bit | confirmed | same |
| YouTube HDR: 10/12-bit, Rec. 2020, ncl matrix, PQ/HLG, ST 2086 + MaxFALL/MaxCLL, BVM-X300 default, P3 mis-tag warning, noise removal | confirmed | YouTube Help "Upload HDR videos" (fetched) |
| YouTube Shorts ≤ 3 min, square or vertical | confirmed (snippet) | YouTube Help "Upload YouTube Shorts" |
| YouTube thumbnail 3840 × 2160 recommended | partially confirmed (snippet truncated) | YouTube Help "Add custom thumbnails" |
| YouTube thumbnail 2 MB / 50 MB limits | unverified (secondary only) | third-party guides (Have Camera Will Travel; BreakReach, updated Sept 2026) |
| YouTube live keyframe 2 s, ≤ 4 s | confirmed (snippet) | YouTube Help live encoder settings |
| TikTok Studio: MP4/WebM, ≥ 720 × 1280, ≤ 30 min, < 10 GB | confirmed | TikTok Help Center "Tools for creators" (fetched by subagent) |
| TikTok API: MP4/WebM/MOV; H.264/H.265/VP8/VP9; 23–60 fps; 360–4096 px; ≤ 10 min via API; 4 GB | confirmed | TikTok for Developers Media Transfer Guide, updated 2026-08-04 (fetched by subagent) |
| TikTok in-app 72 MB / 287.6 MB; 4K → 1080p | unverified (secondary, conflicting) | third-party blogs |
| Instagram Reels 1.91:1–9:16, min 30 fps, min 720 px, cover 420 × 654 | confirmed (snippet only; page body not loadable) | Instagram Help Center 1038071743007909 |
| Instagram API Reels: MP4/MOV no edit lists faststart; AAC ≤ 48 kHz ≤ 2 ch; HEVC/H.264 closed GOP 4:2:0; 23–60 fps; ≤ 1920 cols; 25 Mbps VBR; 128 kbps; 3 s–15 min; 300 MB | confirmed | Meta IG User Media reference (fetched by subagent; v25.0) |
| Instagram API cover JPEG ≤ 8 MB sRGB; centre 9:16 / 1:1 crops; Stories ≤ 60 s, 100 MB | confirmed | same |
| Meta Ads 4 GB, 1440 × 2560 Reels, 128 kbps stereo AAC | unverified (secondary) | third-party summaries of Meta Ads Guide |
| X: H.264 High; 30/60 fps rec.; ≤ 60 fps; 4:2:0 only; AAC-LC, no HE-AAC; mono/stereo; no open GOP; progressive; SAR 1:1; 1:3–3:1; ≥ 0.5 s; 8 GB/20 min default, 16 GB/125 min Premium; min 5,000 kbps video, 128 kbps audio | confirmed | X Developer "Best practices" (fetched) |
| X dimension rule 32 × 32–1280 × 1024 vs recommended 720 × 1280 | contradicted (internal inconsistency) | same |
| X Media Studio 5–8 Mbps, SRT sidecar, CEA 608/708 | confirmed (snippet) | X Help Media Studio |
| LinkedIn posts: 75 KB–5 GB; 3 s–15 min desktop/10 min mobile; 256 × 144–4096 × 2304; 1:2.4–2.4:1; 10–60 fps; ProRes won't process | confirmed (snippet) | LinkedIn Help "Video sharing troubleshooting" |
| LinkedIn Pages: 192 kbps–30 Mbps; no AVI/QuickTime/MOV; ≤ 10 min | confirmed (snippet) | LinkedIn Help Pages video specs |
| LinkedIn ads: MP4, H.264 or VP8, AAC/MPEG4, SRT, thumbnail ≤ 2 MB | confirmed (snippet) | LinkedIn Help video ads specs |
| Vimeo: codecs, CFR, > 60 fps reduced, bitrate table, CRF ≤ 18, ProRes HQ 220 Mbps, BT.709/2020, PQ/HLG + 2086/861.3, ≥ 10-bit, AAC-LC 320 kb/s, 48 kHz converted | confirmed | Vimeo Help "Video and audio compression guidelines" (fetched) |
| Apple HLS: H.264 ≤ High 4.1 (SHOULD), ≤ High 5.2 (MUST); IDR every 2 s; > 60 fps SHALL NOT; VOD natural frame rate list; single colour space; SDR MUST be provided; 1080p ladder 6000/7800 kbps | confirmed | Apple HLS authoring spec (fetched) |
| AAC priming 2112 samples (Apple convention) | confirmed (snippet) | Apple TN2258 |
| FFmpeg native AAC priming 1024 samples, signalled by edit list | unverified (secondary, consistent across sources) | FFmpeg-user list; mcut PR; Mediabunny "Project Sync" |
| ProRes 4444 ≈ 330 Mbps, XQ ≈ 500 Mbps at 1080p29.97; alpha ≤ 16-bit lossless; only 4444/XQ carry alpha | confirmed | Apple Support "About Apple ProRes" (fetched, published 2025-03-03); Apple ProRes white paper (snippet) |
| CAMBI 0 = none, ~5 slightly annoying, 24 max; 8/10/12/16-bit | confirmed (snippet) | Netflix vmaf `cambi.md` |
| VMAF/PSNR poorly correlated with banding MOS | confirmed (snippet) | Netflix Tech Blog "CAMBI, a banding artifact detector" (October 2021) |
| VMAF v1 (June 2026) integrates CAMBI | confirmed (snippet) | Netflix Tech Blog "VMAF v1" |
| VMAF less reliable on animation/screen content | unverified (secondary) | Fora Soft explainer |
| FFmpeg `blockdetect` default periods [3,24]; `blurdetect` based on Marziliano; `signalstats` brng; `idet` | confirmed (snippet) | ffmpeg.org ffmpeg-filters |
| Limited range 16–235 luma / 16–240 chroma (8-bit) | unverified (not re-checked against ITU text) | BT.601/BT.709 (not fetched) |
| H.264 Level 4.1 MaxMBPS 245,760; 4.2 522,240 | confirmed (secondary: FFmpeg's copy of Table A-1, snippet) | FFmpeg `libavcodec/h264_levels.c` "H.264 table A-1"; ITU-T H.264 Annex A not fetched |
| swscale default BT.601 matrix for RGB→YUV | unverified (practitioner knowledge) | FFmpeg docs (not fetched) |
| Banding fix bitrate multiplier ("2–3×") | not found (folklore) | — |
| Platform loudness normalisation targets | not found on pages checked | defer to `SOUND-*` |

## 19. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. Every source is also named inline (publisher and page title) and in the verification ledger (§18).

1. <https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/>
2. <https://docs.x.com/x-api/media/quickstart/best-practices>
3. [YouTube recommended upload encoding settings - YouTube Help](https://support.google.com/youtube/answer/1722171?hl=en)
4. [Upload High Dynamic Range (HDR) videos - YouTube Help](https://support.google.com/youtube/answer/7126552?hl=en)
5. [Instagram Reels Video Specs - Current Upload Requirements](https://www.vidulk.com/video-specs/instagram-reels)
6. [Reel size & aspect ratios on Instagram](https://help.instagram.com/1038071743007909/?helpref=uf_share)
7. [vmaf/resource/doc/cambi.md at master · Netflix/vmaf · GitHub](https://github.com/Netflix/vmaf/blob/master/resource/doc/cambi.md)
8. [Video sharing troubleshooting](https://www.linkedin.com/help/linkedin/answer/a548372)
9. [Upload YouTube Shorts - Computer - YouTube Help](https://support.google.com/youtube/answer/12779649?hl=en&co=GENIE.Platform%3DDesktop)
10. [YouTube Shorts Size: 1080x1920, 9:16, 3 Min](https://saturaai.com/blog/youtube-shorts-video-size)
11. [Add custom thumbnails on YouTube - Computer - YouTube Help](https://support.google.com/youtube/answer/72431?hl=en)
12. [YouTube Thumbnail Size & Format (2026)](https://thumbnailtest.com/guides/youtube-thumbnail-size/)
13. [YouTube Thumbnail Size: Ultimate Guide to Dimensions & Design](https://www.pixexact.com/blog/youtube-thumbnail-size)
14. [tiktok video size](https://www.shopify.com/blog/tiktok-video-size)
15. [TikTok Video Size & Dimensions 2026 (Resolution + Specs)](https://www.screensnap.pro/blog/tiktok-video-size-guide)
16. [TikTok Video Size: Dimensions, Length and File Limits](https://www.lilachbullock.com/tiktok-video-size/)
17. <https://support.tiktok.com/en/using-tiktok/creating-videos/creator-tools-on-tiktok?lang=en>
18. [Meta ad sizes 2026: placements, ratios, and specs](https://www.addogs.ai/blog/meta-ad-sizes)
19. [Meta ad specs 2026 — Reels, Stories and Feed - Solid Labs](https://www.solidlabs.com/ad-specs/meta)
20. [Instagram Reels Size: 1080×1920 \[Updated September 2026\]](https://postfa.st/sizes/instagram/reels)
21. [Media Studio Library](https://help.x.com/en/using-x/media-studio-faqs)
22. [fix(media): trim AAC encoder priming from exported audio by mattppal · Pull Request #176 · mattppal/mcut · GitHub](https://github.com/mattppal/mcut/pull/176)
23. [\[FFmpeg-user\] Create an AAC stream matching the Core Media Audio packet format / priming etc?](https://ffmpeg-user.ffmpeg.narkive.com/QBOmvG3u/create-an-aac-stream-matching-the-core-media-audio-packet-format-priming-etc)
24. [1703812 - Use edit list to trim decoder delay in AAC files](https://bugzilla.mozilla.org/show_bug.cgi?id=1703812)
25. [X (Twitter) image size guide for brands (2026)](https://skedsocial.com/blog/twitter-post-size-guide)
26. [Media Transfer Guide | TikTok for Developers](https://developers.tiktok.com/docs/en/content-posting-api-media-transfer-guide)
27. [YouTube Shorts Dimensions & Size Guide (2026) - Hopper HQ](https://www.hopperhq.com/blog/youtube-shorts-dimensions/)
28. [Video ads advertising specifications](https://www.linkedin.com/help/linkedin/answer/a424737)
