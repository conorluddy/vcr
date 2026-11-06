# Sound Design, Music and Mix for Short-Form Video — VCR Reference (`references/sound-design/`)

Short-form video needs one audio master. Measure it with ITU-R BS.1770 and deliver it with a true peak of no more than −1 dBTP (−2 dBTP is safer). Its integrated loudness should sit near the −14 LUFS reference that YouTube and Spotify play back at. Build it so the piece still works muted. Tie every sound accent to a visual event, with the audio arriving no more than about one frame early.

> **Status:** seed document for the `SOUND-*` pillar of VCR, version 0.1, researched 2026-11-06.
> **Scope:** audio for code-first motion graphics and short-form video of any length. That covers narration (recorded and TTS), music (licensed and original), SFX (recorded and deterministic-synthesised), mix, loudness, sync, delivery, measurement and critique. Brand-specific choices belong in project briefs, not here.
> **Confidence tiers:**
> - `standard`: published standard or style guide, checked against the primary document.
> - `platform`: published by a platform or vendor, or observed from platform behaviour; may change without notice.
> - `heuristic`: practitioner rule of thumb, secondary source, or a derivation made in this document.
>
> **Evidence labels:** **[behaviour]** means evidence about what audiences or platforms actually do (studies, platform data, measurements). **[taste]** means expert craft opinion.
> **Known gaps:** TikTok and Instagram do not publish loudness targets. The figures that circulate for them are unverified folklore (see §1.4).\[1\] The ITU-R BT.1359-1 text was checked through secondary sources that quote it, not the ITU PDF itself.

---

## TL;DR

- **One loudness-safe master beats many "platform masters."** Spotify publishes −14 LUFS playback normalisation. YouTube's player data shows loud uploads turned down to −14 LUFS and quiet ones not turned up. TikTok and Instagram publish nothing. Deliver one master at about −14 LUFS integrated (±1 LU), with true peak ≤ −1 dBTP, and nothing is lost on any of them. Never chase −9 LUFS "for TikTok": that number has no traceable source.
- **True peak is the hard ceiling, loudness is the soft target.** EBU R 128 s1 limits short-form content to "−1 dBTP" and Spotify asks for "below −2dB" true peak on masters louder than −14 LUFS. Lossy re-encoding adds overshoot, so −1 dBTP is the bare minimum, not the goal.
- **Voice wins, always.** Under narration, keep the music bed at least 20 dB below the voice (the WCAG 1.4.7 AAA figure).\[2\] Practitioners measure 18–31 dB.\[3\] Duck with about 10–30 ms attack and 300–600 ms release; a release that is too short causes "pumping."\[4\]\[5\]
- **Sync is asymmetric.** Viewers notice audio that arrives *early* far sooner than audio that arrives late. ITU-R BT.1359-1 puts detectability at +45 ms early and −125 ms late. In VCR, put SFX onsets on the event frame or up to one frame after it, never before.
- **Design for mute first, reward sound-on second.** The famous "85% watch muted" figure comes from a few publishers reporting their 2016 Facebook feed views. TikTok's own commissioned research reports 93% of users with sound on. Placement decides how much the sound has to carry, but every piece must still read with the sound off.
- **Sound changes what people see.** In the sound-induced flash illusion (Shams et al., *Nature* 2000), one flash paired with two beeps is seen as two flashes. SFX are not decoration: they change how fast, how heavy and how numerous motion looks. That is also why over-scoring makes motion feel cheap.
- **Agents fail predictably.** Typical failures: a whoosh on every transition, music wall-to-wall under narration, mastering to an unverified "platform LUFS," judging sync from still frames, and non-seeded procedural audio that differs between renders.

---

## Key findings (top ten)

1. **Short-form broadcast loudness** is "−23.0 LUFS ±0.5 LU", maximum true peak "−1 dBTP" and maximum short-term loudness "−18.0 LUFS (+5.0 LU on the relative scale)". Loudness Range "shall not be specified" for short-form content, which R 128 s1 defines as "up to approximately 2 minutes, typically shorter than 30 seconds" (EBU R 128 s1 v2.0, 2016).\[6\] `standard`
2. **Spotify** adjusts "tracks to -14 dB LUFS, according to the ITU 1770 standard". It leaves "1 dB headroom for lossy encodings" when applying positive gain, and recommends that louder masters "keep True Peak below -2dB" (Spotify for Artists).\[7\]\[8\] `platform`
3. **YouTube publishes no loudness target.** Its "Stats for nerds" "content loudness" readout (Ian Shepherd, Production Advice) and an independent 26-video check (Mark Studios, 20 Oct 2026) both show louder videos turned down to −14 LUFS and quieter videos not raised.\[9\]\[10\] `platform` (observed)
4. **TikTok and Instagram** have published no LUFS target. The −14, −13, −12 and −9 LUFS figures that circulate are guesses from community testing (secondary sources agree on this point).\[1\]\[11\] `heuristic`/unverified
5. **ATSC A/85** (US TV, CALM Act) recommends −24 LKFS, accepts "approximately ±2 dB" of measurement variation, and says the "true-peak level should be kept below -2 dB TP". Long-form content is dialogue-anchored; short-form is measured on the full mix.\[12\] A 2026-07 revision adds a streaming annex (ATSC A/85:2013; A/85:2026-07). `standard`\[13\]
6. **A/V sync:** BT.1359-1 sets detectability at about +45 ms (audio early) / −125 ms (audio late) and acceptability at +90 / −185 ms. EBU R37 is tighter end-to-end (+40 / −60 ms), as quoted by secondary sources.\[14\]\[15\] `standard` (checked via secondary)
7. **Background under speech:** WCAG 2.2 SC 1.4.7 (AAA) says "background sounds are at least 20 decibels lower than the foreground speech content, with the exception of occasional sounds that last for only one or two seconds." `standard` (accessibility; its stated scope is audio-only content)\[2\]
8. **Sound alters vision.** "When a single visual flash is accompanied by multiple auditory beeps, the single flash is incorrectly perceived as multiple flashes" (Shams, Kamitani & Shimojo, *Nature* 408, 2000). The stimuli were 50 ms flashes and beeps 57 ms apart.\[16\] **[behaviour]**
9. **Sound-off vs sound-on is placement-specific.** Digiday (May 2016) reported about 85% silent views for two Facebook publishers and 50–80% for a third.\[17\] TikTok says "93% of users enjoy the platform with sound on" and that users are "15% more likely to skip an ad that doesn't have sound" (TikTok Marketing Science, platform-commissioned).\[18\] **[behaviour]**, `platform`
10. **Narration and on-screen text:** "people learn more deeply from graphics and narration than from graphics, narration, and on-screen text… supported in 16 out of 16 experimental tests, yielding a median effect size of 0.86" (Mayer & Fiorella, 2014, redundancy principle).\[19\] Typical speech runs about 150 wpm, and audiobooks are "spoken at a rate of 140-180 wpm" (Brysbaert, 2019).\[20\]\[21\] **[behaviour]**

---

## 1. Loudness standards and platform normalisation

### 1.1 The measurement: ITU-R BS.1770 and EBU Mode
- **What it is.** BS.1770 defines K-weighted, gated loudness (LKFS/LUFS; the two units are numerically identical) and true peak (dBTP), which is estimated by oversampling.\[1\]\[22\] EBU Tech 3341 ("EBU Mode") standardises how meters display momentary (400 ms), short-term (3 s) and integrated values, so that different meters agree.
- **Gating.** The integrated measurement uses an absolute gate at −70 LUFS and a relative gate. In ATSC's words: "A low level absolute 'gate' was added to exclude any content below -70 LKFS, effectively freezing the integration period."\[12\] Consequence: silence does not drag the integrated value down. A piece that is mostly silent with loud hits will measure loud.
- **True-peak meter under-read.** EBU Tech 3343 (2023 version) builds in a margin for an "under-read of about 0.5 dB (for a 4x oversampling true-peak meter; basic sample rate: 48 kHz)", and states that "The Maximum True-Peak Level in production shall not exceed −1 dBTP." Treat true-peak readings as ±0.5 dB at 48 kHz.

### 1.2 Broadcast standards (use when the brief says broadcast)
| Spec | Integrated | True peak | Other | Scope |
|---|---|---|---|---|
| EBU R 128 (programmes) | −23.0 LUFS | −1 dBTP max (production) | LRA measured, not capped | European TV/radio |
| EBU R 128 s1 (short-form ≤ ~2 min) | −23.0 LUFS ±0.5 LU | −1 dBTP | Max short-term −18.0 LUFS; LRA n/a | Ads, promos, stings, bumpers |
| EBU R 128 s3 (radio, 2023) | Production −23; distribution "within the range of −20.0 to −16.0 LUFS" | −1 dBTP | — | Radio |
| ATSC A/85 (2013 text) | −24 LKFS, "approximately ±2 dB" | "below -2 dB TP"\[12\] | Long-form: dialogue anchor; short-form: whole mix\[23\] | US TV, CALM Act\[24\] |

- **R 128 s1 detail that matters for VCR.** The maximum short-term loudness of −18 LUFS is +5 LU above target. It exists "to avoid overly dynamic short-form programmes, which would lead to audience complaints."\[6\] This is the only published standard that caps *loudness spikes* inside a short piece. It translates well into a VCR rule, relative to whatever integrated target you pick: max short-term ≤ integrated + 5 LU.
- **R 128 s1 also says** measurement is made over the whole programme "without emphasis on specific foreground elements such as voice, music or sound effects". Lower-than-target loudness is permitted "on purpose" if flagged.\[6\]
- **ATSC A/85 versions.** The 2013 text was fetched. The 2026-07 successor (approved 8 July 2026) was fetched only as far as its contents page, which lists "Clarified Loudness Measurement Guidelines", "Created Streaming Loudness Annex L" and a one-page summary (Annex M).\[13\] A secondary source (Fora Soft) says the 2026 text keeps −24 LKFS and −2 dBTP; that is unverified here.\[25\]

### 1.3 Streaming and platform playback normalisation
| Platform | Published? | Figure | Exact wording / evidence | Tier |
|---|---|---|---|---|
| Spotify | Yes | −14 LUFS (Normal); −11 Loud; −19 Quiet | "We adjust tracks to -14 dB LUFS, according to the ITU 1770 standard." Positive gain is limited by headroom: "leave 1 dB headroom for lossy encodings". Loud mode uses a limiter that engages "at -1 dB (sample values), with a 5 ms attack time and a 100 ms decay time." Masters louder than −14: "keep True Peak below -2dB". "The web player and 3rd-party devices… don't use loudness normalization."\[26\] | platform |
| YouTube | No published target | −14 LUFS observed, turn-down only | "Stats for nerds" shows "content loudness" in dB relative to YouTube's reference (Production Advice).\[9\] Mark Studios: "on all 26 public videos we checked on October 20, 2026, the volume adjustment YouTube stores was the video's loudness minus −14 LUFS".\[10\] Umbrella Creators: quiet videos at −23.9 and −24.3 LUFS were "not raised".\[27\] | platform (observed) |
| TikTok | No | none | Secondary sources agree: "TikTok has never published an official LUFS target or documented their normalisation behaviour."\[1\] | unverified |
| Instagram / Facebook Reels | No | none | Same; one secondary source says Meta uses xHE-AAC with dynamic loudness management (unverified).\[1\] | unverified |
| AES TD1008 (2021) / AES77-2023 | Yes (recommendation) | Speech −18 LUFS; track-normalised music −16 LUFS; interstitials −18\[28\] | Radio World summary: "–18 LUFS for speech-oriented programming and –16 LUFS for track-normalized music programming".\[29\] Peak (as quoted by Fora Soft): "Maximum True Peak level not exceed −1 dBTP at the codec input of lossy-encoded streams."\[30\] | standard (industry body), checked via summaries\[31\] |

**What this means.**
- YouTube turns loud uploads *down* and leaves quiet ones alone. A master at −20 LUFS plays about 6 dB quieter than its neighbours, and a master at −9 LUFS gains nothing but crushed transients. The asymmetry penalises quiet masters more than loud ones. Below −16 LUFS integrated, short-form will sound weak next to other feed content on YouTube.
- On Spotify-like players a quiet master can be raised, but only as far as true-peak headroom allows. Spotify's own example: a "-20 dB LUFS" track with true peak "-5 dB FS" is lifted only "up to -16 dB LUFS".\[7\]
- Upshot: −14 ±1 LUFS integrated with true peak ≤ −1 dBTP (ideally ≤ −2) is the one master that loses nothing on any known platform.

### 1.4 Folklore audit (what not to encode)
| Circulating claim | Status | Reason |
|---|---|---|
| "TikTok normalises to −14 LUFS" | unverified | No TikTok document; community-measured.\[1\] |
| "TikTok/Instagram favour −10 to −12 LUFS" (OpusClip blog) | unverified | Marketing blog, no method.\[32\] |
| "TikTok has no normalisation; master at −7 to −9 LUFS" (songbrain.ai) | unverified, contradicted by other secondary testing | No method; conflicts with sources reporting that some loudness management happens.\[1\]\[33\] |
| "Shorts/Reels/TikTok ≈ −13 LUFS" (Boya mic blog) | unverified | Vendor blog.\[34\] |
| "YouTube is −16 LUFS" (several FFmpeg tutorials) | contradicted | Player data shows a −14 LUFS reference.\[10\]\[35\] |
| "Spotify Quiet = −23 LUFS" (undetectr blog) | contradicted | Spotify states −19 dB LUFS.\[26\]\[36\] |

**Agent failure mode.** Picking the loudest number from a blog "for TikTok" and limiting the mix to −9 LUFS. The result is distortion after re-encode, flattened transients and no audible gain wherever normalisation is applied.

### 1.5 True peak after lossy encoding
- **Mechanism.** Inter-sample peaks sit above the highest stored sample. Lossy codecs (AAC, Opus, Vorbis) reconstruct an altered waveform, which adds further overshoot, and the overshoot grows as bitrate falls.\[30\]\[37\]
- **Field evidence. [behaviour]** In Umbrella Creators' 2026 sample, "True peak above 0 dBTP | 29 of 50 videos | … on the audio YouTube serves after its encoding".\[27\] Over half of the large-channel uploads clip in the delivered stream.
- **Practical ceiling.** −1 dBTP (EBU, AES); −2 dBTP (ATSC; Spotify for loud masters).\[38\] Overshoot sizes such as "+0.4 dB at AAC 128 kbps" appear only in illustrative secondary articles and are `heuristic`.\[30\]
- **VCR rule:** true peak ≤ −1.0 dBTP on the master *and* ≤ 0.0 dBTP measured on the decoded delivery file (`yuv420p` H.264 + AAC). If the delivery file fails, lower the master ceiling to −2 dBTP and re-encode.

---

## 2. Mix balance

### 2.1 Voice vs music bed
| Source | Figure | Tier |
|---|---|---|
| WCAG 2.2 SC 1.4.7 (AAA, audio-only content) | "at least 20 decibels lower than the foreground speech content, with the exception of occasional sounds that last for only one or two seconds" | standard (accessibility)\[2\] |
| Umbrella Creators (measured, 3 documentary channels) | "music beds sit about 24 to 31 dB under the voice" | heuristic **[behaviour]**\[3\] |
| Pristine Podcasts | "music under dialogue should sit around 15-20 dB below the voice level" | heuristic **[taste]**\[39\] |
| MusicVivo | "15 to 25 dB below the voice" | heuristic **[taste]**\[4\] |
| Pure Audio Insight | "−3dB and −12dB below your dialogue… can cause masking" | heuristic **[taste]**\[40\] |

**How to measure the gap.**
- Compute short-term (3 s) or momentary loudness of the voice stem and the music stem separately, over windows where voice is active.
- gap = median(voice LUFS) − median(music LUFS) over the voice-active windows.
- Pass: ≥ 20 LU for explainers, tutorials and accessibility-required work. ≥ 15 LU is acceptable for promos and ads where music carries energy, flagged as a minor finding.
- **Scope note.** WCAG 1.4.7 formally scopes itself to *prerecorded audio-only* content.\[41\] Applying it to video is a sensible extension, not a conformance requirement.
- **Expressive break.** In music-led pieces (music visuals, sizzle reels) where the voice is a lyric or a stinger, music can sit level with or above the voice. That works when the words are redundant with on-screen text or are not load-bearing.

### 2.2 Ducking
| Parameter | Practitioner values | Source |
|---|---|---|
| Depth (extra reduction beyond static gap) | 6–10 dB; 8–12 dB for intro/outro beds; 3–6 dB for "prominent" dramatic beds | MusicVivo; Pristine Podcasts\[4\]\[39\] |
| Attack | 5–10 ms; 10–30 ms; ~20 ms | Pristine; MusicVivo; Audio Tool Kit\[4\]\[5\]\[39\] |
| Hold | ~200 ms | Audio Tool Kit\[5\] |
| Release | 300–500 ms; 300–600 ms; 400–800 ms | Pristine; MusicVivo; Audio Tool Kit\[4\]\[5\]\[39\] |
| Ratio (sidechain compressor) | 3:1–6:1; 4:1–8:1 | MusicVivo; Pristine\[4\]\[39\] |
| FFmpeg measured preset | `sidechaincompress=threshold=0.05:ratio=8:attack=10:release=400` → music 17.0 dB lower during speech, "28.1 dB under the voice", and only 2.3 dB lower in pauses | DankDev (measured)\[42\] |

- **Failure modes.**
  - Attack too slow: DankDev measured that at `attack=200` the first 50 ms of every phrase had music "only 1.9 dB below its undocked level". The first syllable gets buried.\[42\]
  - Release too short: "pumping", the bed swelling between words.\[5\]
  - Depth too large: the bed vanishes and reappears, which reads as an edit.
- **VCR advantage.** Narration cue times are known in advance, so prefer **scripted gain automation** (keyframed ramps) over a reactive sidechain. Ramp down starting 50–150 ms before the first phoneme, hold, and ramp up 300–600 ms after the phrase ends. This is deterministic, and it never clips the first syllable. (`heuristic`, derived from the values above.)
- **Alternative: a static low bed.** Umbrella Creators found one documentary bed held "24 dB under" with no ducking at all.\[3\] That is valid when the gap is already ≥ 20 LU everywhere.

### 2.3 Intelligibility, masking and EQ carving `heuristic` **[taste]**
- Speech intelligibility depends mainly on consonant energy, roughly 1–4 kHz. Beds with dense melody or pads in that band mask speech even at a 20 dB gap. Practitioners say to go "toward 31 dB if the music is busy or has melody in the voice's range" (Umbrella Creators).\[3\]
- **Carving.** Cut the bed by 2–6 dB with a broad bell centred somewhere in 1.5–4 kHz while the voice is present. Or choose instrumentation that leaves the band free: sparse arrangements, low pads, or plucks sitting above 5 kHz. High-pass narration around 70–100 Hz to remove rumble. These ranges are craft convention; no primary standard was checked.
- **Lyrics under narration** are the worst masker. Two speech streams compete for the same perceptual channel. Treat lyrics under narration as a major finding unless the brief intends it.

### 2.4 Phone speakers vs headphones `heuristic`
- Phone speakers reproduce little below about 200 Hz (secondary: "most playback happens on phone speakers with minimal bass response below 200Hz").\[1\] A sub-bass hit or 808 that carries the impact on headphones disappears on a phone. Give every low-frequency impact a mid or upper harmonic layer (a transient click, a 200–800 Hz body) so it survives.
- Headphones expose wide stereo, phase tricks, hard-panned elements and low-level noise or hiss that phones hide.
- **Translation check:** listen to (or simulate) a phone by band-passing about 300 Hz–8 kHz, summing to mono and reducing level. The voice must stay clear and the key hits must still read.

### 2.5 Mono compatibility `heuristic`
- Many phones play mono or near-mono. Out-of-phase stereo content (wideners, Haas delays, mis-wired stereo SFX) cancels when summed.
- **Measure:** L/R correlation over 400 ms windows, and the loudness difference between the stereo mix and an (L+R)/2 mono fold-down. Flag a mono loudness drop of more than 3 LU or sustained negative correlation. These thresholds are heuristic, not from a fetched standard.

---

## 3. Sync

### 3.1 Perceptual tolerances
| Document | Audio early (lead) | Audio late (lag) | Meaning | Checked via |
|---|---|---|---|---|
| ITU-R BT.1359-1 (1998), detectability | +45 ms | −125 ms | "thresholds of detectability are about +45 ms to -125 ms"\[43\] | TV Technology; arXiv 2212.01686 |
| ITU-R BT.1359-1, acceptability | +90 ms | −185 ms | "thresholds of acceptability are about +90 ms to -185 ms on the average"\[43\] | TV Technology; NAB |
| EBU R37 (end of chain) | +40 ms | −60 ms | "within +40 ms and -60 ms"\[14\] | arXiv 2212.01686 |
| ATSC IS-191 (2003, DTV encoder input) | +15 ms | −45 ms | "should not lead the video signal by more than 15 milliseconds, or lag it by more than 45 milliseconds"\[43\] | TV Technology |
| Film for TV (BT.1359 Appendix) | ±22 ms | ±22 ms | "very tight at +/-22 milliseconds"\[43\] | TV Technology |

- **Why it's asymmetric. [behaviour]** In nature, light arrives before sound, so the brain accepts late audio but treats early audio as wrong.\[44\]
- **Content dependence.** A 2022 study of sports content found "humans are more sensitive to audio-video offset errors for speech stimuli", and that complex sports events tolerate more offset (arXiv 2212.01686).\[45\] Lip-sync, and the near-equivalent of hard visual impacts, are the strict cases.

### 3.2 Frame-accurate SFX placement in VCR
- **Frame quantisation.** One frame lasts 41.7 ms at 24 fps, 40 ms at 25, 33.3 ms at 30 and 16.7 ms at 60. Audio has sample resolution (48 kHz gives 0.02 ms), so audio can be placed more precisely than the picture can show.
- **Derived rule (`heuristic`, from BT.1359 and ATSC IS-191).**
  - Put the SFX *perceptual onset* (not the file start) at the visual event time `t_event`, or up to 1 frame after it.
  - Never more than 15 ms early (the ATSC IS-191 lead limit) for impacts.
  - Late by up to 1 frame at 24–30 fps is invisible. Late by more than 2 frames at 24 fps (> 83 ms) starts to read as "sluggish" for hard hits, though it stays within the BT.1359 detectability window for general events.
- **Perceptual onset ≠ file start.** Whoosh, riser and swell files often have 50–500 ms of pre-roll before the peak. Align the *peak or transient* to the event. A whoosh's peak should land on the frame of maximum visual velocity or the cut, not its start.
- **Where the visual event is.** It is the frame where the motion's derivative changes sharply: a contact, a stop, an overshoot apex, a cut, or an opacity jump. VCR can compute this from sampled transforms (§11).

### 3.3 Beats to frames
`frames_per_beat = fps × 60 / BPM`

| BPM | 24 fps | 25 fps | 30 fps | 60 fps |
|---|---|---|---|---|
| 90 | 16.0 | 16.667 | 20.0 | 40.0 |
| 100 | 14.4 | 15.0 | 18.0 | 36.0 |
| 120 | 12.0 | 12.5 | 15.0 | 30.0 |
| 128 | 11.25 | 11.719 | 14.0625 | 28.125 |
| 140 | 10.286 | 10.714 | 12.857 | 25.714 |

- **Integer-friendly pairs** avoid drift: 120 BPM at 24, 30 or 60 fps; 90 BPM at 24, 30 or 60; 100 BPM at 25 or 30. At 128 BPM the beat drifts across frame boundaries. Snap each accent to `round(beat_time × fps)`, never accumulate `frames_per_beat` additively. The worst-case snap error is half a frame (8.3 ms at 60 fps, 20.8 ms at 24 fps), inside every tolerance above, *provided the error is late, not early* (use `ceil` for impact accents if you want the strict rule).
- **Phrase level.** Cuts land best on downbeats and phrase boundaries (every 4 or 8 bars), not on every beat. Cutting on every beat at 120 BPM is a cut every 0.5 s, which reads as frantic unless it is the concept. `heuristic` **[taste]**
- **`markers`.** Use the scene contract's beat `markers` as the source of truth. Detect beats from the actual audio file (§11) and confirm they match the markers within ±10 ms. A mismatch means the markers were typed from a BPM guess, or the file has a lead-in offset.

---

## 4. SFX for motion graphics

### 4.1 Vocabulary and function
| SFX | Function | Sync point | Typical failure |
|---|---|---|---|
| Whoosh / swish | Sells velocity of a move or transition | Peak at max velocity or the cut | On every transition; peak lands at motion start |
| Riser | Builds anticipation toward a reveal or drop | Ends exactly at the hit/reveal (often with a short gap of silence before) | Riser that does not resolve; resolves late |
| Hit / impact / boom | Weight at a landing or reveal | Transient on contact frame | Sub-only hit that vanishes on phones; too many |
| UI click / tick / pop | Discrete state changes (button, toggle, counter) | Transient on state-change frame | Machine-gun clicks on count-ups; identical samples repeated |
| Sweetener (shimmer, sparkle, air, sub-drop) | Adds polish or emphasis under music | Aligned to the music grid | Layered on everything; cliché "sparkle on logo" |
| Texture / room tone | Continuity, removes "dead digital silence" | Continuous | Noise floor audible on headphones |

### 4.2 How sound shapes perceived motion **[behaviour]**
- **Sound-induced flash illusion.** One flash plus two beeps is seen as two flashes. The original stimuli were a disk flashed "50 milliseconds apart" with beeps "spaced 57 milliseconds apart" (Shams et al. 2000).\[16\] The authors attribute it to "cross-modal perceptual interactions as opposed to cognitive, attentional, or other origins" (Shams et al. 2002).\[46\] Shams, Ma & Beierholm (*NeuroReport* 16(17):1923–1927, 2005) model it as statistically optimal cue combination: "the sound-induced flash illusion is an epiphenomenon of this general, statistically optimal strategy." Audition is temporally more reliable, so it dominates *when* and *how many*.
- **Implications for motion graphics (inference, `heuristic`).**
  1. Sound sets the perceived *count* and *timing* of events. Two ticks on one bounce make it feel like two bounces, and a single hit on a stutter makes it feel like one event.
  2. Sound sets perceived *weight*. A low, long hit makes a small element feel heavy.
  3. Because audio dominates timing, a misaligned SFX makes the *animation* look wrong, not the audio. Reviewers will report "the motion feels off."

### 4.3 When sound makes motion feel cheap **[taste]** `heuristic`
- **Mickey-mousing everything.** Every element has a sound, so nothing has emphasis. Rule of thumb: sound the 1–3 most important events per 5 seconds, not every event.
- **Stock-library signatures.** Well-known "cinematic boom," "glitch transition" and "logo shimmer" packs are instantly recognisable and read as template work.
- **Identical repetition.** The same sample at the same pitch and level triggered repeatedly (count-ups, list builds) reads as mechanical. Vary pitch ±1–2 semitones, level ±1–3 dB and sample choice with a seeded RNG.
- **Scale mismatch.** A huge trailer impact on a small UI tooltip, or a tiny click on a full-frame reveal.
- **Fighting the music.** SFX off the musical grid, or in the same band as a prominent music element.
- **Expressive break.** Deliberately dense, Mickey-moused sound works in playful character animation and kinetic-type comedy, where hyper-sync *is* the joke. It succeeds when timing is frame-perfect and the palette is cohesive (one synth family, one foley family).

---

## 5. Music

### 5.1 Structure for short pieces `heuristic` **[taste]**
- **6–15 s social piece.** A hook within the first 1–2 s (no slow intro: feeds are swiped), one build, one payoff or drop aligned to the key visual reveal, and a button ending (a stinger or hard stop) on the final frame or CTA.
- **30–60 s explainer.** Intro (2–4 bars), a bed under narration that is sparse in the voice band, lift or lifts at section changes, a final resolve under the CTA.
- **Ending.** End on a resolved downbeat with the tail allowed to ring out past the last visual. If the video must end abruptly, end the music with a deliberate button, not a truncation. A truncated reverb tail is a common minor finding.

### 5.2 Tempo and mood
- Practitioner associations (not research-verified): about 60–90 BPM for calm, trust and premium; 100–120 for upbeat explainers and product; 120–140 for energetic promo and sport. Tempo interacts with edit pace: choose BPM so that cuts land on integer frames (§3.3).
- **Voice fit.** A dense, fast narrator (about 170+ wpm) wants a simpler, slower bed. Sparse narration lets the music carry more.
- **Agent failure mode: homogenised output.** Defaulting every piece to "upbeat corporate ukulele/pluck at 120 BPM." Derive mood from the brief's adjectives and the visual tempo, and justify it.

### 5.3 Seamless loops
- **Sample-accurate loop length.** The loop must be an exact number of bars, and for video loops also an exact number of frames. Choose BPM and bars so that `bars × beats_per_bar × 60 / BPM × fps` is an integer. Example: 4 bars of 4/4 at 120 BPM is 8.000 s, which is 240 frames at 30 fps.
- **Crossing the seam.** Reverb and delay tails from the end must wrap into the start. Render the loop twice and take the second pass (the "pre-roll render" technique), or apply circular convolution. Check for a waveform discontinuity at the seam: the sample-to-sample jump should be no larger than the signal's typical step, and short 2–10 ms equal-power fades are acceptable if needed.
- **Visual/audio seam alignment.** In a loop video, the audio seam must coincide with the visual seam, or the loop "hiccups" every cycle.

### 5.4 Licensing hazards `platform`
- **TikTok Music Terms.** General "Sounds" must not be used "for any commercial purpose–including associating the music with, or promoting, a brand or business–unless you have obtained the necessary rights." "Commercial Sounds" from the Commercial Music Library "can be used to promote a brand or for other commercial purposes" under separate CML terms.\[47\] Secondary sources report that updated terms took effect 25 July 2025 and that CML rights are TikTok-only. Do not cross-post CML audio to other platforms.\[48\]\[49\]
- **Platform audio is not portable.** A track added in-app on one platform is licensed (if at all) only for that platform's in-app use. A master rendered by VCR with embedded music needs a sync licence covering every platform it ships to.
- **Original or procedural beds** remove the licensing risk. They are preferable for series built on a shared look, where the same bed recurs across many episodes.
- **Agent rule.** Never embed a commercial recording without a licence record in the project brief. If music provenance is unknown, the reviewer files a **blocker**.

---

## 6. Procedural and synthesised audio

### 6.1 Synthesis basics for SFX `heuristic`
| Sound | Recipe |
|---|---|
| Whoosh | White/pink noise → band-pass with centre sweeping (e.g., 300 Hz → 3 kHz → 800 Hz) following the motion's velocity curve; amplitude envelope matching velocity; optional stereo pan following x-position |
| Riser | Noise + saw/sine stack; pitch and filter cutoff rising exponentially over 1–4 bars; volume crescendo; hard stop at the hit |
| Hit | Short pitched sine "kick" (fast pitch drop e.g. 150→45 Hz over ~80 ms) + noise transient (5–20 ms) + optional mid "body" layer for phone translation |
| UI click | 1–5 ms filtered noise or sine burst, fast decay; or FM blip (carrier:modulator ratio 1:2 to 1:3.5, short index envelope) |
| Shimmer | Several detuned high sines/FM bells with random (seeded) onset jitter, long reverb |

- **Envelopes.** ADSR, or exponential attack-decay curves. Driving SFX envelopes *from the animation's own easing curve* (sampled via `seek(t)`) gives tight audiovisual coupling that hand-placed samples cannot match.
- **FM.** Two-operator FM gives bells, blips and metallic hits cheaply. Inharmonic ratios give metallic tones; integer ratios give tonal ones.

### 6.2 What makes synthesised sound read as cheap **[taste]**
- Static spectra: no filter movement, no pitch drift.
- Pure sines and squares without saturation, noise or transient detail.
- Perfectly identical repeats, with no seeded micro-variation.
- No room or space: completely dry against a reverberant bed.
- Aliasing from naive oscillators at high pitch. Use band-limited oscillators (PolyBLEP or wavetable) or oversample.
- Clicks at note start and end from zero-length fades. Always apply ≥ 1–5 ms fades.

### 6.3 Generative beds `heuristic`
- Constrain to a key and scale, a chord progression (4–8 bars) and a tempo locked to the frame grid. Choose a sparse texture under the voice band and humanise timing ±5–15 ms (seeded).
- A generative bed must still have *structure*: intro, lift, resolve. Pure stochastic texture reads as hold music.

### 6.4 Determinism (hard requirement)
- Same seed + same code + same sample rate gives a **bit-identical** PCM output. To get there:
  - use a seeded PRNG (never `Math.random()` or wall-clock time);
  - render offline (OfflineAudioContext, or a native or Python renderer), never real-time capture;
  - use a fixed sample rate (48 kHz) and fixed block size;
  - avoid platform-dependent float paths where possible, or accept a tolerance.
- **Check.** Render twice and compare SHA-256 hashes of the PCM. If cross-machine float differences occur, fall back to the max absolute sample difference: ≤ 1e-6 (−120 dBFS) passes as "perceptually identical", and the finding is logged.
- **Web Audio caution.** Browser real-time audio during a Playwright frame-seek capture is *not* synchronised to the seeked timeline. Never record live tab audio. Render the audio separately from cue data and mux it in FFmpeg.

---

## 7. Narration (recorded and TTS)

### 7.1 Pacing
| Figure | Exact wording | Source | Tier |
|---|---|---|---|
| Audiobooks | "audiobooks are spoken at a rate of 140-180 wpm"\[21\] | Brysbaert 2019, *J. Memory and Language* | **[behaviour]** |
| ACX/Audible estimating | "most performers narrate about 9,300 words per hour"\[50\] (≈155 wpm, derived) | ACX Help | platform |
| Typical speech | "Humans generally speak at a rate of 150 words per minute"\[20\] | PMC playback-speed study citing Peelle & Davis 2012 | **[behaviour]** |
| Comprehension decline | "speech comprehension begins to decline at around 275 words per minute"\[20\] | same, citing Foulke & Sticht 1969 | **[behaviour]** |
| Moderate rate & credibility | "higher credibility… at the moderate speaking rate (172 wpm)"\[51\] | Scoping review summarising Simonds et al. | **[behaviour]** |
| Floor | "Any pace slower than 120 words sounds odd."\[52\] | Voice actor Kim Handysides | heuristic |

- **VCR rule.** Narration words ÷ (narration speech duration excluding pauses longer than 300 ms) should fall in 130–175 wpm for explainers. Above 180 wpm, flag "rushed". For ads, up to about 190 wpm is acceptable if the content is simple. Below 120 wpm, flag "dragging" unless the brief is meditative.
- **The real budget.** A 15 s spot at 150 wpm holds about 37 words *with no pauses*. Realistically, 25–32 words.

### 7.2 Pauses and prosody `heuristic` **[taste]**
- 300–700 ms between sentences, and 1–2 s before a key reveal or after a key claim, so the visual can land.
- **TTS failure modes.**
  - Uniform sentence-final falling pitch: a monotone "list reading" feel.
  - Wrong stress on brand or technical terms.
  - Unnatural breath or no breath.
  - Identical pause lengths everywhere.
  - Pronouncing numbers, units and acronyms wrongly ("1080p", "LUFS").
- **TTS mitigations.** SSML breaks and emphasis, phoneme overrides, sentence-by-sentence generation with per-sentence review, and fixed voice/model/seed settings recorded in the project brief for series consistency.

### 7.3 Narration vs on-screen text **[behaviour]**
- **Redundancy principle.** "people learn more deeply from graphics and narration than from graphics, narration, and on-screen text… 16 out of 16 experimental tests… median effect size of 0.86" (Mayer & Fiorella 2014).\[19\]
- **Modality principle.** "people learn more deeply from a multimedia message when the words are spoken rather than printed" (Mayer, Cambridge Handbook, 3rd ed.).\[53\]
- **Segmenting.** People learn better from "learner-paced segments rather than as a continuous unit". This is "most likely to apply when the material is complex, the presentation is fast-paced, and the learner is inexperienced".\[54\]
- **Boundary.** These are lab learning studies of explanatory content, not feed ads. A secondary summary notes the redundancy harm "may be eliminated when the presentation is slow-paced or under learner control."\[55\]
- **Tension with sound-off viewing.** Muted viewers *need* text, while sound-on learners are hurt by full redundant text. Resolutions:
  1. On-screen text shows **keywords and figures**, not the transcript, while narration carries the sentence.
  2. Captions are a separate, toggleable layer (platform captions) rather than burned-in duplicates of the narration, *except* on placements known to be muted-first. There, burned-in captions win, and the reviewer records the trade-off.
- **Placement against text (`heuristic`).** Narration naming an on-screen element should start within about 0–300 ms of the element's appearance, either simultaneously or just after. Narration that runs ahead of its visual by more than 1 s creates "where am I looking?" confusion.

### 7.4 Sparse vs continuous narration **[taste]**
- Sparse narration (a line every 5–10 s, with music or SFX carrying the gaps) suits product launches, title sequences and emotional pieces. Continuous narration suits explainers and tutorials.
- Wall-to-wall narration over wall-to-wall music in a 30 s spot is the commonest "dense, tiring" failure.

---

## 8. Sound-off vs sound-led placements

| Evidence | Figure | Context / caveats | Tier |
|---|---|---|---|
| Digiday (May 2016) via Tubefilter | LittleThings and Mic "both claimed that 85% of its views were silent"; PopSugar "between 50% and 80%"; MEC: branded "85% to 90%"\[17\] | Facebook feed, 2016 autoplay-muted era; publisher self-reports; 30-second views for Mic\[56\]\[57\] | **[behaviour]**, dated |
| Critique (ecommercefastlane) | "The 85% statistic is not a reliable figure for product videos in 2026"\[56\] | Secondary; correctly identifies origin | secondary |
| TikTok Marketing Science | "93% of users enjoy the platform with sound on"; "88% agree that sound is integral"; users "15% more likely to skip an ad that doesn't have sound"\[18\] | Platform-commissioned (Kantar, Nielsen); self-interested\[58\] | platform |
| Verizon Media & Publicis Media (2019), as reported by Broadcasting+Cable/Next TV (Jon Lafayette, 14 May 2019) and Forbes (T.J. McCue, 31 Jul 2019) | "92% view videos with the sound off on mobile and 83% watch with sound off"; "80% of consumers are more likely to watch an entire video when captions are available"; captions gave "8% … ad recall, a 10% lift in ad memory quality and a 13% lift in brand linkage"; Forbes: the study "polled 5,616 US consumers", "69% view video with sound off in public places and 25% … in private places" | Self-reported US consumer survey; report itself not fetched | secondary news report of survey |

**What this means for how much the sound should carry.**
- **Feed placements that autoplay muted** (Facebook/Instagram feed, LinkedIn, X, in-article web): the visual and text must carry 100% of the message. Sound is a bonus. Rule: no load-bearing information exists *only* in audio.
- **Sound-led placements** (TikTok, Reels and Shorts full-screen players, music visuals, YouTube pre-roll): sound strongly affects retention and is part of the hook, so invest in the first 1–2 s of audio. The mute-first rule still applies, because a meaningful share watch muted.
- **Rule (`heuristic`).** Every deliverable passes a *mute test*: the reviewer watches with sound off and must still extract the core message. Every sound-led deliverable passes a *blind-listen test*: audio alone conveys energy, structure and the key moments.

---

## 9. Silence and dynamics `heuristic` **[taste]**
- **Pre-hit silence.** A 100–500 ms drop-out (music and SFX cut) just before a reveal makes the hit feel bigger than any amount of limiting. This is the cheapest impact in sound design.
- **Contrast budget.** Within a short piece, keep at least one moment that is noticeably quieter (≥ 6 LU below the loud sections in short-term loudness) so the loud moments register. Hold this against the EBU s1 ceiling: short-term max ≤ integrated + 5 LU.
- **Unintended silence** is a bug. Examples: dead air at the head (audio starts later than video), gaps from mis-placed cues, or a dropped narration file. Platform previews and autoplay begin at t = 0, so the first 300 ms matters.
- **Digital black.** Pure zero-signal silence between sounds on headphones can feel like a dropout. A low room tone or bed tail (−60 to −50 LUFS) masks it. Optional, and judgement-based.
- **Expressive break.** Total silence as a deliberate beat (for example 1 s of nothing before a final line) works when it is clearly intentional: framed by sound on both sides and synced to a held visual.

---

## 10. Technical delivery
| Item | Value | Source / tier |
|---|---|---|
| Sample rate | 48 kHz | YouTube Help: "Sample rate: 48kHz"\[59\] (`platform`); video convention\[60\]\[61\] |
| Codec | AAC-LC (YouTube also lists Opus, Eclipsa Audio) | YouTube Help (`platform`)\[60\] |
| Upload bitrate | Mono 128 kbps; Stereo 384 kbps; 5.1 512 kbps | YouTube Help recommended upload encoding settings\[59\] (`platform`)\[62\] |
| Bit depth (masters) | 24-bit PCM for stems/masters; float for intermediate | heuristic |
| Channels | Stereo for social; check mono fold-down | heuristic |
| Clipping | 0 sample overs (≥ 0 dBFS) in master; TP ≤ −1 dBTP | EBU/AES; Spotify |
| Head/tail | Audio starts at t=0 (or deliberate pre-roll silence ≤ 100 ms); tails not truncated mid-reverb | heuristic |

- Delivery bitrates after the platform re-encodes are **not published**. Secondary claims ("~128–160 kbps", "192–256 kbps") are unverified.\[63\]\[64\]\[65\] Upload at the recommended 384 kbps AAC-LC stereo, or higher, so the platform's re-encode starts from a clean source.\[64\]\[66\]
- **ProRes 4444 alpha masters.** These usually carry no audio, or PCM audio. Deliver PCM WAV stems alongside, at 48 kHz/24-bit.
- **`yuv420p` H.264 web delivery.** Mux AAC-LC 48 kHz. Re-measure loudness and true peak *on the decoded MP4*, not just on the WAV.

---

## 11. Measurement: what an agent can compute

| Measurement | Tool / method | Output | Reliability |
|---|---|---|---|
| Integrated, short-term, momentary loudness, LRA, true peak | FFmpeg `ebur128` (e.g. `-af ebur128=peak=true -f null -`) | I (LUFS), LRA, per-100 ms M/S values, TP | High. An independent tool matched FFmpeg's ebur128 "within 0.1 LU" on integrated and LRA (Mark Studios). TP ±0.5 dB (Tech 3343 meter under-read note) |
| Loudness analysis pass | FFmpeg `loudnorm=print_format=json` (pass 1) | input_i, input_tp, input_lra, input_thresh | High for measurement. Note filter defaults: "I… Default value is -24.0", "LRA… Default value is 7.0", "TP… Default value is -2.0", and in dynamic mode audio is "upsampled to 192 kHz". Always set `I`, `TP`, `LRA` explicitly and `-ar 48000` |
| Normalisation | `loudnorm` pass 2 with `measured_*` and `linear=true` | normalised file | Medium. Linear mode "will revert to dynamic" if the target TP would be exceeded, which silently changes dynamics. Check the output JSON's `normalization_type` |
| Sample peak, RMS, DC offset, clipping count | FFmpeg `astats` | per-channel stats | High for sample-domain values; not true peak |
| Silence spans | FFmpeg `silencedetect` (noise threshold, min duration) | silence_start/end | High for digital silence; medium for "quiet" (threshold-dependent) |
| Stem gap (voice vs bed) | ebur128 short-term on each stem, masked by voice-activity windows | gap in LU | High if stems exist; low if estimated from the mix by source separation |
| Onsets / transients | Spectral-flux onset detection (e.g. librosa `onset_detect`), or high-pass energy derivative | onset times | Medium: ±10–20 ms typical; misses soft swells; over-detects in dense music |
| Beat tracking | librosa `beat_track` or similar | tempo, beat times | Medium: octave errors (half/double tempo) common; validate against `markers` |
| Cue vs visual event alignment | Cue list (known) vs visual events from sampled transforms | offset per event (ms) | High when both come from source data; medium when visual events are inferred from pixels |
| Spectral balance | STFT → average level in bands (sub <60, low 60–250, low-mid 250–500, mid 500–2k, presence 2–5k, air >8k) | band profile | Medium as a screen; judgement needed against genre and reference |
| Mono compatibility | L/R correlation; stereo vs mono-sum loudness | correlation, Δ LU | High as measurement; thresholds heuristic |
| Determinism | Render twice, hash PCM | equal / max diff | High |

**Unverified tool notes.** The FFmpeg `astats` and `silencedetect` option names were not re-checked against the FFmpeg documentation in this research pass. Verify them before relying on them.

---

## 12. Critique practice: vocabulary → measurement

| Term | What the listener means | Likely measurable correlate | Check |
|---|---|---|---|
| **Muddy** | Low-mid build-up, lack of clarity | Excess 200–500 Hz relative to 1–4 kHz; voice and bed overlap in low-mids | Band ratio low-mid/presence higher than reference by >3 dB (heuristic) |
| **Boomy** | Excess low end | Energy 60–200 Hz dominant | Band ratio |
| **Harsh / shrill** | Painful upper-mids | Excess 2–5 kHz, sibilance 5–9 kHz | Band peaks; de-esser need |
| **Thin** | Lacking body | Deficit 100–300 Hz | Band ratio |
| **Buried** (voice) | Voice not intelligible over bed | Voice–bed gap < 15–20 LU; masking in 1–4 kHz | SOUND-VOICE-BED-GAP |
| **Pumping** | Audible gain modulation | Bed short-term loudness oscillating at word rate; ducking release too short | Modulation of bed level in voice gaps |
| **Squashed / crushed / flat** | Over-compression | Low PLR (true peak − short-term loudness), LRA near 0–2 LU | TP − max short-term < ~6 dB (heuristic) |
| **Clipping / crunchy** | Distortion | Sample overs; TP > 0 dBTP on delivery | SOUND-CLIP, SOUND-TRUE-PEAK |
| **Late / sluggish / early** | Sync | Cue–event offset | SOUND-SYNC-LEAD/LAG |
| **Cheesy / stock / cheap** | Cliché SFX, overuse | SFX density; repeated identical samples | SOUND-SFX-DENSITY, SOUND-SFX-REPEAT |
| **Busy / cluttered** | Too many simultaneous layers | Count of overlapping active cues; spectral flatness high | Judgement + density |
| **Dead / dry** | No space | No reverb tail; abrupt silences | Judgement |
| **Jumpy** | Loudness jumps | Short-term range across cuts > ~6 LU unintentionally | SOUND-SHORT-TERM-MAX |
| **Wall-to-wall** | No dynamics/rests | No window below loud sections by ≥ 6 LU | SOUND-DYNAMIC-CONTRAST |

Findings should name the time range, the term, the measurement and a fix. Example: "0:04.2–0:09.8 voice buried: gap 11 LU (target ≥ 20); duck bed 9 dB more or carve 2–4 kHz."

---

## 13. Medium-specific guidance

### 9:16 social (TikTok, Reels, Shorts; 1080 × 1920)
- Hook audio in the first 1 s, with no fade-in from silence longer than about 100 ms.
- Assume phone speakers: mid-forward mix, a harmonic layer on every low hit, and a clear mono fold-down.
- Mute test is mandatory: burned-in captions or keyword text carry the meaning.
- Loudness: −14 ±1 LUFS integrated, TP ≤ −1 dBTP (−2 preferred), max short-term ≤ I + 5 LU.
- Platform-native trending audio is added in-app by the human, not baked by VCR. Commercial accounts use only licensed or CML-equivalent audio.

### 16:9 (YouTube, web, presentations, broadcast)
- Longer forms allow real dynamics and an intro. Viewers are more often on headphones or desktop speakers, so low end and stereo field matter more.
- YouTube: −14 LUFS reference, turn-down only. Avoid masters quieter than about −16 LUFS.
- Broadcast deliverables switch to R 128 (−23 LUFS, −1 dBTP; s1 limits for spots) or A/85 (−24 LKFS, < −2 dBTP) per the brief.

### Square (1:1, feeds)
- Treat as muted-first feed content: maximum visual self-sufficiency, with sound as a bonus.

### Stills
- No audio. Sound rules don't apply, except where a still is a poster frame for a video, in which case nothing applies.

### Loops (GIF-like, ambient, music visuals)
- Audio length = visual loop length to the sample, and the seam is click-free (§5.3).
- Integrated loudness over one loop equals the loudness over N loops, but the platform measures the uploaded file. Upload at least one full musical phrase.
- Avoid big one-shot hits that become annoying on repeat. Prefer evolving textures.

### Series (many episodes, shared look)
- Lock a sonic kit: bed family, SFX palette, TTS voice and settings, integrated target. Per-episode integrated loudness spread should be ≤ ±1 LU across the series.

---

## 14. The analysis / critique process (reviewer subagent)

**Ordered steps.**
1. **Read the brief.** Placement (muted-first vs sound-led), delivery spec (social / YouTube / broadcast), the narration script and the music licence record.
2. **Technical pass on the decoded delivery file** (not the WAV). Run ebur128 (I, LRA, max short-term, TP), check sample overs, sample rate and channel count, and run silencedetect at head, tail and internal gaps.
3. **Mute test.** Watch frames and motion with no audio. Is the message intact?
4. **Blind-listen test.** Audio only. Is the structure clear? Is the voice intelligible? Do the key moments land?
5. **Sync pass.** For every cue in the cue list, compute the offset against its visual event from sampled transforms. Spot-check 3–5 key hits by scrubbing at frame level. Never judge sync from stills.
6. **Balance pass.** Voice–bed gap per narration phrase, ducking behaviour in gaps (pumping), masking judgement.
7. **Translation pass.** Simulated phone (band-pass, mono, low level), plus headphone listen for noise, hiss and stereo artefacts.
8. **Design pass.** SFX density, repetition, cliché, music fit to mood and tempo, ending and button, dynamics and silence.
9. **Rights and determinism.** Licence provenance, and a hash comparison for procedural audio.
10. **Write findings.** Time range, vocabulary term, rule ID, measured value, target and a concrete fix. Order by severity.

**Severity guidance.**
| Severity | Examples |
|---|---|
| **Blocker** | Unlicensed or unknown-provenance music; clipping or TP > 0 dBTP on delivery; audio missing or offset by > 125 ms late or > 45 ms early; narration unintelligible; non-deterministic procedural audio in a series; message lost when muted on a muted-first placement |
| **Major** | Voice–bed gap < 15 LU; integrated off target by > 2 LU; key hit > 2 frames late or any frame early; pumping; lyrics under narration; truncated tail on final frame |
| **Minor** | Gap 15–20 LU; SFX repetition; mild harshness or muddiness; integrated off by 1–2 LU; stock-sounding sweetener |
| **Nit** | Taste: alternative SFX choice, tempo preference |

**Agent pitfalls the reviewer must avoid.**
- Judging sync or SFX fit from a contact sheet.
- Flagging every expressive break as a violation. Check the brief's intent first.
- Treating `heuristic` thresholds as blockers.
- Homogenising: "add a whoosh here" as a reflex fix.
- Measuring the WAV instead of the delivered MP4.

---

## 15. The creation process (workflow skill)

1. **Brief → audio role.** Decide placement (muted-first or sound-led), the audio's job (inform, energise, brand), and whether narration, music and SFX are each present.
2. **Script and timing.** Count narration words, compute duration at 140–160 wpm plus pauses, and fit them to the scene `duration`. Cut words before speeding up.
3. **Music decision.** Original or procedural (seeded) vs licensed (licence recorded). Pick BPM for frame-integer beats (§3.3) and set `markers` from the actual music file.
4. **Animate to the audio grid.** Key reveals on downbeats and phrase boundaries. Leave narration windows visually calmer.
5. **Cue sheet.** List each SFX with its visual event ID, `t_event` and the perceptual-onset offset of its sample. Sound only the important events (about 1–3 per 5 s).
6. **Build audio offline.** Render TTS or narration, the bed and SFX from the cue sheet with sample-accurate placement. Apply scripted ducking automation and seeded variation.
7. **Mix.** Voice first. Bed gap ≥ 20 LU under voice, EQ carve, phone-safe low end, one pre-hit silence for the main reveal.
8. **Master.** Normalise to the target (social: −14 LUFS; broadcast per spec) with a true-peak limiter at −1 dBTP (−2 for loud masters). Check max short-term ≤ I + 5 LU.
9. **Mux and encode.** FFmpeg with AAC-LC 48 kHz at 384 kbps stereo, video `yuv420p` H.264.
10. **Verify.** Re-measure the decoded MP4, run the cue/event sync check, the mute test, the hash determinism check (§19) and the checklists (§20).

---

## 16. Authoritative sources and canon

**Standards.**
- ITU-R BS.1770 (loudness and true-peak algorithms).
- EBU R 128, R 128 s1 (short-form), Tech 3341 (EBU Mode), Tech 3343 (production guidelines), R 128 s3 (radio).
- ATSC A/85 (2013; 2026-07 revision with streaming annex L).
- AES TD1008 and AES77-2023 (streaming loudness).
- ITU-R BT.1359-1 and EBU R37 (A/V timing).
- W3C WCAG 2.2 SC 1.4.7 (background audio).

**Platform documents.**
- Spotify for Artists, "Loudness normalization".
- YouTube Help, "Recommended upload encoding settings".
- TikTok Music Terms and Commercial Music Library Terms.
- TikTok Marketing Science sound research (self-interested).

**Research.**
- Shams, Kamitani & Shimojo, "What you see is what you hear" (*Nature* 2000) and "Visual illusion induced by sound" (2002). Hirst et al.'s twenty-year review of the illusion.
- Mayer, *Multimedia Learning*, and *The Cambridge Handbook of Multimedia Learning* (redundancy, modality and segmenting principles).
- Brysbaert (2019), reading and speaking rate meta-analysis.
- The arXiv sports A/V-sync acceptability study (2022).

**Practitioners and books (canon, not re-verified here).**
- Ian Shepherd (Production Advice) on streaming loudness and YouTube "Stats for nerds".
- Eelco Grimm (TD1008 contributor).
- Michel Chion, *Audio-Vision*: "synchresis", the fusion of a sound and a visual event; the conceptual basis for SFX in motion graphics.
- Walter Murch on sound and picture editing.
- Ric Viers, *The Sound Effects Bible*.
- Andy Farnell, *Designing Sound*: procedural audio, directly relevant to deterministic synthesis.
- Bob Katz, *Mastering Audio*: loudness and metering.

The books are listed from domain knowledge as canon; their contents were not fetched in this pass.

---

## 17. Encoding for an AI agent: rules table

| ID | Check | Threshold | Tier | Applies to | Measurable? |
|---|---|---|---|---|---|
| SOUND-LOUDNESS-INTEGRATED | Integrated loudness of delivery file | Social/streaming: −14 LUFS ±1 LU; broadcast EU: −23.0 ±0.5; US: −24 ±2 | platform (−14) / standard (−23, −24) | All deliverables with audio | Yes: ebur128 on decoded file |
| SOUND-LOUDNESS-FLOOR | Not too quiet for turn-down-only platforms | ≥ −16 LUFS integrated for YouTube/social | heuristic (from YouTube observed behaviour) | YouTube, social | Yes |
| SOUND-TRUE-PEAK | Max true peak | Master ≤ −1.0 dBTP (≤ −2.0 if I > −14 LUFS or ATSC); delivery ≤ 0.0 dBTP | standard / platform | All | Yes: ebur128 peak=true |
| SOUND-CLIP | Sample overs | 0 samples ≥ 0 dBFS; no runs of ≥ 3 consecutive full-scale samples | heuristic | All | Yes: astats/numpy |
| SOUND-SHORT-TERM-MAX | Loudness spikes | Max short-term ≤ integrated + 5 LU | standard (EBU R 128 s1, relative form) | Short-form ≤ ~2 min | Yes |
| SOUND-LRA-SHORTFORM | Do not gate short-form on LRA | LRA not used as pass/fail for pieces ≤ ~2 min | standard (R 128 s1) | Short-form | Rule for the checker itself |
| SOUND-VOICE-BED-GAP | Voice vs background during speech | ≥ 20 LU (explainer/accessibility); ≥ 15 LU (promo, minor below 20) | standard (WCAG 1.4.7, extended) / heuristic | Narrated pieces | Yes with stems |
| SOUND-DUCK-ATTACK | Bed reaches ducked level by voice onset | Ducked within ≤ 30 ms of first phoneme (scripted: ramp starts 50–150 ms before) | heuristic | Narrated pieces with ducking | Yes with stems + VAD |
| SOUND-DUCK-PUMP | No bed swell between words | Bed short-term rise in intra-phrase gaps (< 300 ms) ≤ 3 dB | heuristic | Ducked beds | Yes, medium reliability |
| SOUND-LYRIC-UNDER-VOICE | No sung lyrics under narration | 0 overlap of vocal music with narration | heuristic | Narrated pieces | Partially (vocal detection); else judgement |
| SOUND-SYNC-LEAD | Audio not early | Cue onset − visual event ≥ −15 ms (impacts); never < −45 ms | standard (ATSC IS-191 / BT.1359) | All synced cues, lip-sync | Yes: cue list vs sampled transforms |
| SOUND-SYNC-LAG | Audio not too late | ≤ +1 frame for hits (pass); > +2 frames at 24 fps (> 83 ms) major; > 125 ms blocker | standard (BT.1359) / heuristic | All synced cues | Yes |
| SOUND-BEAT-ALIGN | Accents land on beats | Visual accent frame within ±½ frame of round(beat × fps); markers match detected beats ±10 ms | heuristic | Music-synced pieces | Yes |
| SOUND-BPM-FRAME-GRID | Beat grid fits fps | Prefer BPM with integer or simple fractional frames per beat; otherwise snap per beat, no accumulation | heuristic | Music-synced pieces | Yes (arithmetic) |
| SOUND-SFX-PEAK-ALIGN | SFX aligned by perceptual peak, not file start | Transient/peak within the sync window of the event | heuristic | SFX | Yes (onset detection on SFX file) |
| SOUND-SFX-DENSITY | Not every event sounded | ≤ ~3 featured SFX per 5 s unless brief says hyper-sync | heuristic | Motion graphics | Yes (count); judgement on exceptions |
| SOUND-SFX-REPEAT | Repeated samples varied | Repeats within 2 s vary pitch/level/sample (seeded) | heuristic | UI clicks, count-ups | Yes (hash identical segments) |
| SOUND-LOW-END-TRANSLATION | Low hits survive phones | Each sub-heavy hit has ≥ −12 dB energy (relative to its peak band) in 200–800 Hz | heuristic | 9:16, square | Yes (band analysis) |
| SOUND-MONO-COMPAT | Mono fold-down safe | Mono-sum loudness drop ≤ 3 LU; no sustained negative correlation | heuristic | All stereo | Yes |
| SOUND-HEAD-START | Audio begins with picture | Audible content or deliberate silence ≤ 100 ms at t=0 on sound-led placements | heuristic | Social | Yes (silencedetect) |
| SOUND-TAIL-INTACT | No truncated tails | Last 200 ms: level falling to < −50 LUFS momentary or a deliberate button | heuristic | All | Yes; judgement for "button" |
| SOUND-SILENCE-UNINTENDED | No accidental dead air | Internal digital silence > 300 ms only if in cue sheet as intentional | heuristic | All | Yes (silencedetect vs cue sheet) |
| SOUND-DYNAMIC-CONTRAST | Not wall-to-wall | ≥ 1 window ≥ 6 LU below the loudest short-term window (pieces ≥ 10 s) | heuristic | All except loops/ambient | Yes |
| SOUND-NARRATION-WPM | Narration pace | 130–175 wpm explainers; flag > 180 or < 120 | heuristic (anchored to Brysbaert, ACX) | Narration | Yes (transcript/ASR + VAD) |
| SOUND-NARRATION-TEXT-REDUNDANCY | No full-transcript text duplicating narration (sound-on placements) | On-screen text ≤ keywords/figures while narration speaks, unless placement is muted-first | standard-derived (Mayer, research) / heuristic | Explainers | Partially (text vs transcript overlap via DOM/textBounds) |
| SOUND-NARRATION-VISUAL-LEAD | Narration not far ahead of its visual | Reference to element starts within 0–300 ms after the element appears; never > 1 s before | heuristic | Narrated explainers | Yes if script tags element IDs |
| SOUND-MUTE-LEGIBLE | Message survives mute | All load-bearing info has a visual/text carrier | heuristic (from placement data) | All, mandatory for feed | Judgement (+ check that narration keywords appear as text) |
| SOUND-SAMPLE-RATE | Delivery sample rate | 48 kHz | platform (YouTube) | All video | Yes (ffprobe) |
| SOUND-AAC-BITRATE | Upload audio bitrate | AAC-LC ≥ 384 kbps stereo (128 mono) | platform (YouTube) | Web delivery | Yes (ffprobe) |
| SOUND-LOOP-SEAM | Seamless audio loop | Length = visual loop to the sample; seam jump within normal sample step; no click | heuristic | Loops | Yes |
| SOUND-SYNTH-DETERMINISM | Procedural audio reproducible | Two renders bit-identical (or max diff ≤ 1e-6) | heuristic (VCR requirement) | Procedural SFX/music | Yes (hash) |
| SOUND-NO-LIVE-CAPTURE | Audio not recorded from real-time tab | Audio rendered offline from cues and muxed | heuristic (VCR requirement) | Browser scenes | Yes (pipeline check) |
| SOUND-LICENSE-RECORD | Music provenance recorded | Every non-original track has licence covering every target platform; no platform in-app-only audio baked in | platform (TikTok Music Terms) | All with music | Judgement/record check |
| SOUND-SERIES-CONSISTENCY | Episodes match | Integrated spread ≤ ±1 LU; same kit/voice settings | heuristic | Series | Yes |

---

## 18. How to measure in VCR

| Rule | Inputs | Calculation | Sampling | Failure modes |
|---|---|---|---|---|
| SOUND-LOUDNESS-*, SOUND-TRUE-PEAK, SOUND-SHORT-TERM-MAX | Decoded delivery MP4 (and master WAV) | `ffmpeg -i out.mp4 -map 0:a -af ebur128=peak=true:framelog=verbose -f null -` → I, LRA, TP; parse per-100 ms S values for max | Whole file | Mono files measured as 1 channel read ~3 dB low unless `dual_mono` (loudnorm) / correct channel layout; TP meter ±0.5 dB; very short (< 3 s) files make short-term max meaningless |
| SOUND-CLIP | Master WAV (float or 24-bit), delivery decode | Count samples with abs ≥ 1.0 (−0 dBFS); runs of consecutive | Every sample | Float masters can exceed 1.0 without "clipping" until conversion; check after final bit-depth conversion |
| SOUND-VOICE-BED-GAP, SOUND-DUCK-* | Stems: voice.wav, bed.wav (post-automation), narration cue times | VAD on voice (energy > −45 dBFS, 30 ms frames); per 400 ms window momentary LUFS for each stem; gap = median difference in voice-active windows; pump = bed level variance in short voice gaps | 100 ms hop | No stems → must estimate via source separation (low reliability); VAD mis-labels breaths; LUFS on sparse windows noisy—use medians |
| SOUND-SYNC-LEAD/LAG, SOUND-SFX-PEAK-ALIGN | Cue list (time, SFX file, event ID); element transforms sampled across frames via `seek(t)`; SFX file onset analysis | Visual event time = frame where |Δvelocity| or Δopacity peaks (or scripted event time from the timeline); audio event = cue time + SFX's internal peak offset; offset = audio − visual | Every frame around each event (±10 frames), at render fps, plus sub-frame by evaluating `seek()` at 1 ms steps if the scene supports it | Eased motion has no single "event frame" (use contact/apex); canvas-drawn objects lack DOM transforms (need scene-exposed state or pixel diff); pixel-diff events quantise to frames |
| SOUND-BEAT-ALIGN, SOUND-BPM-FRAME-GRID | Music file; `markers`; scene accent times | Beat tracking (librosa) → beat times; compare to markers (±10 ms); accent frames vs round(beat × fps) | Whole track | Octave errors; tempo changes; markers offset by file lead-in; swing grooves |
| SOUND-SFX-DENSITY, SOUND-SFX-REPEAT | Cue list; rendered SFX stem | Count featured cues per 5 s sliding window; hash/cross-correlate cue renders for identical repeats | Cue-level | "Featured" vs background ambiguity—tag cues in cue sheet |
| SOUND-LOW-END-TRANSLATION, spectral checks | Master WAV | STFT (4096, hop 1024) → band energies per hit window | Per hit (±200 ms) and global average | Genre-dependent targets; reference-matching beats absolute thresholds |
| SOUND-MONO-COMPAT | Master WAV stereo | Pearson correlation L/R per 400 ms; ebur128 of (L+R)/2 vs stereo | 400 ms windows | Intentionally wide ambience produces low correlation without real cancellation; use loudness delta as primary |
| SOUND-HEAD-START, SOUND-TAIL-INTACT, SOUND-SILENCE-UNINTENDED | Delivery decode; cue sheet | `silencedetect` (e.g., −60 dB, 0.3 s); compare spans to intentional-silence list | Whole file | Encoder priming/padding can add silence or offset at head—measure on decoded file and compare to video t=0 |
| SOUND-NARRATION-WPM | Narration WAV, script text | words / (speech time minus pauses > 300 ms) × 60 | Per sentence and overall | TTS numbers expand ("1080p" → 3+ words); ASR errors if no script |
| SOUND-NARRATION-TEXT-REDUNDANCY, SOUND-NARRATION-VISUAL-LEAD | DOM text at time t / `textBounds()`; narration word timestamps (forced alignment) | Token overlap between visible text and words spoken in same window; time from element first-visible to first mention | Per narration phrase; DOM sampled at each phrase start/end | Canvas text without `textBounds()` invisible to DOM; paraphrase defeats token overlap |
| SOUND-SAMPLE-RATE, SOUND-AAC-BITRATE | Delivery MP4 | `ffprobe -show_streams` codec_name, sample_rate, bit_rate | Once | VBR AAC reports average bitrate |
| SOUND-LOOP-SEAM | Loop audio | length_samples == frames × 48000 / fps; |x[0] − x[−1]| vs median |Δx|; listen at seam ×3 | Seam ±50 ms | 48000/fps non-integer at some rates (e.g. 48000/24 = 2000 OK; 48000/30 = 1600 OK; 48000/25 = 1920 OK; 48000/60 = 800 OK) |
| SOUND-SYNTH-DETERMINISM | Two renders | SHA-256 of PCM; else max abs diff | Whole file | Different hardware float paths; resampler versions |

---

## 19. VCR-specific rendering and delivery notes

- **Seeked rendering has no audio clock.** Playwright seeks `window.__scene.seek(t)` and screenshots each frame. Any Web Audio, `<audio>` or `<video>` playing in the page is not tied to `t`. Rule: audio is **never captured from the browser**. Generate it offline from the cue list and timeline, and mux it with FFmpeg (`SOUND-NO-LIVE-CAPTURE`).
- **Single source of truth for time.** The cue list should reference the same timeline labels or events that the scene uses (GSAP labels, Anime.js timeline offsets, WAAPI `currentTime`). Export `markers` and event times from the scene, and generate the audio from them, not the reverse, unless the piece is music-led. In that case, beat times from the analysed music file drive the scene.
- **Fixed fps quantisation.** Visual events exist only at frame times `n / fps`. Snap audio cues to the *rendered frame time of the event*, not the continuous animation time, or audio can land up to one frame early relative to what the viewer sees. Prefer `ceil` to the frame for impact cues (this satisfies the lead limit).
- **Motion blur and still frames.** Reviewers and agents must evaluate sync on the *encoded video* played at speed or scrubbed frame by frame, never on stills. A still contact sheet cannot show audio-visual fusion (§4.2).
- **Samples per frame.** At 48 kHz: 2000 samples per frame at 24 fps, 1920 at 25, 1600 at 30, 800 at 60. All are integers, so frame-locked audio edits are sample-exact. (At 29.97 fps this breaks; avoid NTSC rates unless delivery requires them.)
- **`yuv420p` H.264 + AAC.** Encode audio as AAC-LC 48 kHz at 384 kbps stereo or higher. Measure loudness and true peak on the decoded MP4. The AAC encoder can add true-peak overshoot and has encoder delay/priming that may shift audio relative to video by a small amount. The size of that shift was not verified here, so measure head offset on the decoded file.
- **ProRes 4444 alpha masters.** Ship audio as separate 48 kHz/24-bit WAV stems (voice, music, SFX, mix) plus a cue sheet JSON, so compositors can remix.
- **Platform re-encode.** Platforms re-encode audio (codec and bitrate unpublished for TikTok and Instagram). Keep 1–2 dB of true-peak headroom and avoid content that depends on fragile high-frequency detail or stereo tricks.
- **Determinism.** Seed every procedural element: synth noise, humanisation, SFX variation. Store seeds in the scene config next to the visual seeds, so that a re-render reproduces picture *and* sound.

---

## 20. Master checklists

**Analysis (reviewer).**
- [ ] Delivery MP4 measured: SOUND-LOUDNESS-INTEGRATED, SOUND-LOUDNESS-FLOOR, SOUND-TRUE-PEAK, SOUND-SHORT-TERM-MAX, SOUND-CLIP
- [ ] Format: SOUND-SAMPLE-RATE, SOUND-AAC-BITRATE
- [ ] Mute test passed: SOUND-MUTE-LEGIBLE
- [ ] Voice clear: SOUND-VOICE-BED-GAP, SOUND-DUCK-ATTACK, SOUND-DUCK-PUMP, SOUND-LYRIC-UNDER-VOICE
- [ ] Sync on moving picture: SOUND-SYNC-LEAD, SOUND-SYNC-LAG, SOUND-SFX-PEAK-ALIGN, SOUND-BEAT-ALIGN
- [ ] Design: SOUND-SFX-DENSITY, SOUND-SFX-REPEAT, SOUND-DYNAMIC-CONTRAST
- [ ] Translation: SOUND-LOW-END-TRANSLATION, SOUND-MONO-COMPAT
- [ ] Edges: SOUND-HEAD-START, SOUND-TAIL-INTACT, SOUND-SILENCE-UNINTENDED, SOUND-LOOP-SEAM
- [ ] Narration: SOUND-NARRATION-WPM, SOUND-NARRATION-TEXT-REDUNDANCY, SOUND-NARRATION-VISUAL-LEAD
- [ ] Rights and reproducibility: SOUND-LICENSE-RECORD, SOUND-SYNTH-DETERMINISM, SOUND-NO-LIVE-CAPTURE, SOUND-SERIES-CONSISTENCY
- [ ] Findings written with time range, term, rule ID, value, target, fix; severities assigned

**Creation (workflow skill).**
- [ ] Placement and audio role decided; muted-first carriers planned (SOUND-MUTE-LEGIBLE)
- [ ] Script fits duration at 130–175 wpm (SOUND-NARRATION-WPM)
- [ ] Music provenance recorded (SOUND-LICENSE-RECORD); BPM chosen for frame grid (SOUND-BPM-FRAME-GRID); markers from the audio file (SOUND-BEAT-ALIGN)
- [ ] Cue sheet keyed to scene events; SFX aligned by peak (SOUND-SFX-PEAK-ALIGN); sparse featured cues (SOUND-SFX-DENSITY); seeded variation (SOUND-SFX-REPEAT, SOUND-SYNTH-DETERMINISM)
- [ ] Offline render and mux, no tab capture (SOUND-NO-LIVE-CAPTURE)
- [ ] Mix: gap ≥ 20 LU, scripted ducking (SOUND-VOICE-BED-GAP, SOUND-DUCK-ATTACK), phone-safe lows (SOUND-LOW-END-TRANSLATION), mono check (SOUND-MONO-COMPAT), one deliberate contrast or silence (SOUND-DYNAMIC-CONTRAST)
- [ ] Master −14 ±1 LUFS / ≤ −1 dBTP, or the broadcast spec (SOUND-LOUDNESS-INTEGRATED, SOUND-TRUE-PEAK, SOUND-SHORT-TERM-MAX)
- [ ] Encode AAC-LC 48 kHz 384 kbps; re-measure decoded file; sync check; hash check

---

## 21. Caveats

- **Platform targets are moving and mostly unpublished.**
  - Spotify's figures are official but can change.
  - YouTube's −14 LUFS is inferred from player data, and the "turn-down only" behaviour comes from small samples (26 and 5 videos in two 2026 checks).
  - TikTok and Instagram behaviour is undocumented. Re-verify at least yearly.
- **BT.1359-1 was not read in the original.** The +45/−125 and +90/−185 ms figures come from multiple consistent secondary quotations. One patent text gives −190 ms for acceptability; most sources give −185 ms. EBU R37's +40/−60 ms is likewise secondary-quoted.
- **ATSC A/85:2026-07** was confirmed to exist with a streaming annex. Its numeric targets were checked only in the 2013 text.
- **AES TD1008** figures (−18 speech, −16 music) and its −1 dBTP codec-input quote were checked via a Radio World summary and a Fora Soft quotation, not the full PDF text.
- **WCAG 1.4.7** is AAA, scoped to audio-only content, and expressed in "decibels" without a metric. Applying it as LU on short-term loudness to video is this document's interpretation.
- **Sound-off statistics** are old (2016), platform-specific, self-reported or commissioned. There is no neutral, current, cross-platform measurement of mute rates by placement. The 85% figure should not be cited as current.
- **Ducking values, EQ bands, tempo-mood mappings, SFX density limits and mono thresholds** are practitioner heuristics from secondary sources, which agree broadly but not exactly.
- **Mayer's principles** come from lab learning studies of explanatory material. Their transfer to 15 s ads is unproven.
- **Sound-induced flash illusion.** Its relevance to motion design is an inference from basic perception research, not a study of motion graphics.
- **Likely to go out of date:** platform loudness behaviour, TikTok CML terms, YouTube upload recommendations (the page now notes some features apply to Content Manager partners), and codec choices (Opus/xHE-AAC adoption).

---

## 22. Verification ledger (checked 2026-11-06)

| Claim | Result | Checked against |
|---|---|---|
| R 128 s1: −23.0 LUFS ±0.5 LU; −1 dBTP; max short-term −18.0 LUFS (+5 LU); LRA not applicable; short-form "up to approximately 2 minutes, typically shorter than 30 seconds" | confirmed | EBU R 128 s1 v2.0 (Jan 2016) PDF, fetched |
| R 128: −23 LUFS, −1 dBTP production | confirmed | EBU Tech 3343 PDF (search extract) |
| TP meter under-read ~0.5 dB (4× oversampling; basic sample rate 48 kHz) | confirmed | EBU Tech 3343-2023 (tech.ebu.ch/docs/tech/tech3343.pdf) |
| R 128 s3 radio distribution −20.0 to −16.0 LUFS | confirmed | EBU R 128 s3 (2023) PDF (search extract) |
| Spotify −14 dB LUFS; Loud −11, Quiet −19; 1 dB headroom; Loud-mode limiter −1 dB, 5 ms/100 ms; TP below −2 dB for loud masters; web player not normalised | confirmed | Spotify for Artists support article (search extract of official page) |
| YouTube −14 LUFS reference, turn-down only | confirmed as observed behaviour; no official document found | Mark Studios (26 videos, 20 Oct 2026); Umbrella Creators (2026); Production Advice "Stats for nerds" |
| YouTube "−16 LUFS" | contradicted | Same observed data |
| TikTok / Instagram LUFS target | not found (no official source) | Secondary sources (Dan Murtagh, TrackGleam) state none published |
| 29 of 50 YouTube videos > 0 dBTP after YouTube encoding | confirmed (secondary measurement) | Umbrella Creators loudness study |
| ATSC A/85: −24 LKFS, "approximately ±2 dB", TP "below -2 dB TP" | confirmed (2013 text) | ATSC A/85:2013 PDF (search extract) |
| ATSC A/85:2026-07 exists, adds streaming Annex L | confirmed | ATSC A/85:2026-07 PDF, fetched (front matter) |
| A/85:2026 keeps −24 / −2 dBTP | unverified | Only secondary (Fora Soft); numeric sections not fetched |
| BT.1359-1 detectability +45/−125 ms; acceptability +90/−185 ms | confirmed via secondary | TV Technology; arXiv 2212.01686; NAB TV TechCheck |
| EBU R37 +40/−60 ms | confirmed via secondary | arXiv 2212.01686 |
| ATSC IS-191 +15/−45 ms | confirmed via secondary | TV Technology |
| WCAG 1.4.7 "at least 20 decibels lower…" | confirmed | W3C WCAG 2.2 and Understanding SC 1.4.7 |
| AES TD1008: speech −18, music −16 LUFS | confirmed via secondary | Radio World; AES PDF (search extract) |
| TD1008 "−1 dBTP at the codec input" | unverified (quoted by secondary only) | Fora Soft article |
| Shams et al. 2000 illusion; 50 ms / 57 ms stimulus spacing | confirmed | Nature abstract page; Gale preview |
| Shams, Ma & Beierholm 2005: illusion as "statistically optimal strategy" | confirmed (abstract) | Semantic Scholar listing of *NeuroReport* 16(17):1923–1927 (PubMed fetch blocked) |
| FFmpeg loudnorm defaults I −24, LRA 7, TP −2; 192 kHz upsampling; linear reverts to dynamic | confirmed (docs mirror) | FFmpeg filter docs mirror (ayosec.github.io, v8/v9) |
| ebur128 vs independent meter within 0.1 LU | confirmed (secondary) | Mark Studios |
| astats / silencedetect options | unverified | Not re-checked this pass |
| Digiday 85% (LittleThings, Mic), 50–80% (PopSugar), 85–90% branded (MEC) | confirmed (reporting of 2016 article) | Tubefilter; Marketing Dive |
| TikTok 93% sound-on, 88% sound integral, 15% more likely to skip | confirmed (platform claim) | TikTok Ads "5 Creative tips" page |
| 92% mobile sound-off, 83% sound off overall, 80% more likely to finish with captions; n = 5,616 (Verizon Media/Publicis Media 2019) | confirmed (secondary news report of self-reported survey) | Broadcasting+Cable/Next TV (14 May 2019); Forbes (31 Jul 2019) |
| TikTok Music Terms on general vs Commercial Sounds | confirmed | TikTok Music Terms (EEA) |
| CML terms effective 25 July 2025 | unverified (secondary) | Velveteen guide |
| YouTube upload audio: AAC-LC/Opus/Eclipsa; 48 kHz; 128/384/512 kbps | confirmed | YouTube Help "Recommended upload encoding settings" (fetched by research subagent) |
| Audiobooks 140–180 wpm; oral reading 183 wpm | confirmed | Brysbaert 2019 |
| ACX ~9,300 words/hour | confirmed (snippet of official help page) | ACX Help; ACX blog |
| Speech ~150 wpm; comprehension declines ~275 wpm | confirmed | PMC10330257 |
| Mayer redundancy 16/16 tests, median d = 0.86 | confirmed | Cambridge Handbook ch. 12 abstract |
| Ducking 10 ms / 400 ms / ratio 8 → 17.0 dB duck, 28.1 dB under voice | confirmed (single secondary measurement) | DankDev blog |
| Music bed 24–31 dB under voice in documentary channels | confirmed (secondary measurement) | Umbrella Creators |
| AAC overshoot "+0.4 dB at 128 kbps" | unverified (illustrative) | Fora Soft example, no data |

---

## 23. Sources

The numbered list below matches the escaped `\[n\]` markers in the text. Every document checked is named in the verification ledger (§22) and the canon (§16). Primary documents used: EBU R 128 s1 v2.0, EBU Tech 3343, EBU R 128 s3, ATSC A/85:2013 and A/85:2026-07, W3C WCAG 2.2 SC 1.4.7, Spotify for Artists "Loudness normalization", YouTube Help "Recommended upload encoding settings", TikTok Music Terms, TikTok Marketing Science pages, Shams et al. (*Nature* 2000), FFmpeg filter documentation, Brysbaert (2019), ACX Help, PMC10330257, and the Cambridge Handbook of Multimedia Learning. Secondary sources are labelled where they are used.

1. [LUFS Loudness Standards for 50+ Platforms - Free Lookup](https://danmurtagh.com/lufs-loudness-standards)
2. [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
3. [How loud should background music be under a YouTube voiceover?](https://umbrellacreators.com/blog/background-music-volume-under-voiceover)
4. [Background Music Volume for Voiceover: Levels and Ducking](https://musicvivo.com/blog/music-under-voiceover)
5. [Audio Ducking Explained](https://audio-tool-kit.com/blog/audio-ducking)
6. <https://tech.ebu.ch/files/live/sites/tech/files/shared/r/r128s1v2_0.pdf>
7. [Loudness normalization on Spotify - Spotify](https://support.spotify.com/us/artists/article/loudness-normalization/)
8. [Loudness normalization on Spotify](https://support.spotify.com/bd-en/artists/article/loudness-normalization)
9. [YouTube Stats For Nerds - EXACT volume normalization values revealed, and how to find them - Production Advice](https://productionadvice.co.uk/stats-for-nerds/)
10. [Free LUFS Meter Online: Check Video Loudness for YouTube](https://www.markstudios.com/tools/lufs-meter)
11. [How to Master for TikTok, Reels & Shorts (LUFS Guide 2026)](https://trackgleam.com/learn/master-for-tiktok-reels-shorts)
12. [ATSC A/85:2013 Establishing and Maintaining Audio Loudness 12 March 2013 1](https://www.atsc.org/wp-content/uploads/2015/03/Techniques-for-establishing-and-maintaining-audio-loudness.pdf)
13. <https://www.atsc.org/wp-content/uploads/2026/07/A85-2026-07.pdf>
14. [A subjective study of the perceptual acceptability of audio-video desynchronization in sports videos](https://arxiv.org/html/2212.01686v1)
15. [10/05/09 TV TechCheck](https://nab.org/xert/scitech/2009/TVTechCheck/TV100509.asp)
16. [Illusions: What you see is what you hear - Document - Gale OneFile: Health and Medicine](https://go.gale.com/ps/i.do?aty=open-web-entry&id=GALE%7CA188051406&issn=00280836&it=r&linkaccess=abs&p=HRCA&sid=googleScholar&sw=w&userGroupName=anon%7E13fa7ec6&v=2.1)
17. [Report: 85% Of Facebook’s Video Views Are Occurring Without Any Volume - Tubefilter](https://www.tubefilter.com/2016/05/17/85-percent-facebook-video-views-without-volume/)
18. [5 Creative tips for TikTok ads that break through the clutter](https://ads.tiktok.com/business/creativecenter/quicktok/online/5_creative_tips/pc/en)
19. [Principles for Reducing Extraneous Processing in Multimedia Learning: Coherence, Signaling, Redundancy, Spatial Contiguity, and Temporal Contiguity Principles (Chapter 12) - The Cambridge Handbook of Multimedia Learning](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/CD5B7AE1279A9AB81F8EEBB53DBEC86E)
20. [The Effect of Video Playback Speed on Learning and Mind-Wandering in Younger and Older Adults - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC10330257/)
21. [Researchgate](https://www.researchgate.net/profile/Marc-Brysbaert/publication/335174808_How_many_words_do_we_read_per_minute_A_review_and_meta-analysis_of_reading_rate/links/5d550950299bf16f0738e6bb/How-many-words-do-we-read-per-minute-A-review-and-meta-analysis-of-reading-rate.pdf)
22. [EBU R 128](https://en.wikipedia.org/wiki/EBU_R_128)
23. [ATSC A/85 Loudness Spec Updated: What's Changed And What You Need To Do](https://www.production-expert.com/production-expert-1/atsc-a/85-loudness-spec-updated-whats-changed-and-what-you-need-to-do)
24. [The Mixer's Guide to Loudness for Broadcast](https://www.izotope.com/en/learn/the-mixers-guide-to-loudness-for-broadcast.html)
25. [EBU R128, BS.1770 & ATSC A/85: Loudness Normalization 2026](https://www.forasoft.com/learn/audio-for-video/articles-audio/loudness-normalization-ebu-r128-bs1770-atsc-a85)
26. [Loudness normalization](https://artists.spotify.com/help/article/loudness-normalization)
27. [YouTube Loudness Check: 50 videos, median -16.3 LUFS (2026)](https://umbrellacreators.com/tools/youtube-loudness-checker)
28. [Loudness Guidelines for Audio Streaming and On-Demand Audio Distribution](https://www.aesmelbourne.org.au/wp-content/uploads/2022/12/Melbourne-AES-loudness-presentation-final.pdf)
29. [Streaming Audio Loudness Guidelines Explained - Radio World](https://www.radioworld.com/tech-and-gear/tech-tips/streaming-audio-loudness-guidelines-explained)
30. [True Peak, dBTP and the Inter-Sample Peak Problem - Fora Soft](https://www.forasoft.com/learn/audio-for-video/articles-audio/true-peak-dbtp-inter-sample)
31. [AES Publishes Loudness Guidelines for Online Audio - Radio World](https://www.radioworld.com/news-and-business/headlines/aes-publishes-loudness-guidelines-for-online-audio)
32. [10 Best Loudness Normalizers for Social Video (LUFS) - OpusClip Blog](https://www.opus.pro/blog/best-loudness-normalizers)
33. [LUFS for Spotify, TikTok & Apple Music — Loudness Guide 2026](https://www.songbrain.ai/guides/lufs-for-spotify-and-tiktok)
34. [How to Set Wireless Mic Gain for YouTube & TikTok Loudness](https://www.boyamic.com/blogs/wireless-mic-gain-for-youtube-tiktok)
35. [FFmpeg - How to properly normalize audio volume with loudnorm - Korben](https://korben.info/en/ffmpeg-normalize-audio-volume-loudnorm.html)
36. [LUFS for Spotify: The Complete Loudness Guide for Every Streaming Platform — Undetectr](https://undetectr.com/blog/lufs-for-spotify)
37. [True peak (dBTP) and inter-sample peaks, explained](https://audiolab.tools/insights/true-peak-dbtp-inter-sample-peaks)
38. [ATSC A/85 & CALM Act — US Broadcast Loudness Standard](https://www.criticallisteninglab.com/en/learn/loudness/atsc-a85)
39. [Choosing and Ducking Music Beds Under Podcast Dialogue](https://app.pristinepodcasts.com/blog/music-bed-ducking-podcast-editing)
40. [How Loud Should Background Music Be? dB Levels for Clear Voiceovers](https://pureaudioinsight.com/blogs/content-production/background-music-volume-how-loud-should-it-be)
41. [Understanding Success Criterion 1.4.7: Low or No Background Audio](https://w3c.github.io/wcag21/understanding/low-or-no-background-audio.html)
42. [How to Duck Music Under a Voice-Over in ffmpeg: sidechaincompress Settings, Measured - DankDev Blog](https://www.dankdev.com/Blog/ffmpeg-duck-music-under-voice)
43. [A/V Synchronization: How Bad Is Bad?](https://www.tvtechnology.com/opinions/av-synchronization-how-bad-is-bad)
44. [Method of audio-video synchronization](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7471337)
45. [A subjective study of the perceptual acceptability of audio-video desynchronization in sports videos](https://arxiv.org/pdf/2212.01686)
46. [Sound-Induced Flash Illusion - The Illusions Index](https://www.illusionsindex.org/i/sound-induced-flash-illusion)
47. [Music Terms of Service](https://www.tiktok.com/legal/page/global/music-terms-eea/en)
48. [TikTok Commercial Music Library: CML Opt-In & Royalty Terms](https://www.velveteen.fm/guides/tiktok-for-musicians/tiktok-commercial-music-library-explained)
49. [TikTok's 2025 Commercial Music Library: What Brands Still Get Wrong](https://sriplaw.com/blog/tiktoks-2025-commercial-music-library-what-brands-still-get-wrong/)
50. [Narrate an audiobook](https://help.acx.com/s/article/how-long-will-my-narrated-audiobook-be)
51. [Speech speed in audiovisual resources in the learning process of university students: a scoping review - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12978316/)
52. [Tips In Timing In eLearning Videos Words Per Minute](https://kimhandysidesvoiceover.com/2022/08/16/timing-in-elearning-videos/)
53. [www.cambridge.org](https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning/A9E77D0172F905AC957689D1771E2888)
54. [Segmenting Principle (Chapter 9) - Multimedia Learning](https://www.cambridge.org/core/books/abs/multimedia-learning/segmenting-principle/37240877DDA0362355ADB39936027982)
55. [Multimedia Learning (2009) — Ch. 4-8 (Richard E. Mayer)](https://dixieching.wordpress.com/2010/01/14/multimedia-learning-2009-ch-4-8-richard-e-mayer/)
56. [Adding Subtitles To Product Videos In 2026: The Sound Off Stat Everyone Quotes Is From 2016](https://ecommercefastlane.com/adding-subtitles-to-product-videos/)
57. [Is it true that 85% of people watch videos without sound on Facebook ? par SousTitreur, service de sous-titrage en français](https://st4.ca/blog/85-really-facebook-without-sound)
58. [Volume 1: Evolution of Sound](https://ads.tiktok.com/business/en/blog/evolution-of-sound-volume-1)
59. [YouTube recommended upload encoding settings - YouTube Help](https://support.google.com/youtube/answer/1722171?hl=en)
60. [YouTube Upload Settings: File Formats and Codecs](https://longstories.ai/blog/youtube-upload-settings-file-formats-codecs)
61. [Export Settings for YouTube: Format, Bitrate and Frame Rate](https://kudoflix.com/blog/2026/10/26/export-settings-for-youtube/)
62. [YouTube Recommended Upload Encoding Settings (2026)](https://www.markstudios.com/blog/youtube-export-settings-2026-bitrate-codec-upload-quality)
63. [YouTube Recommended Upload Settings 2026: Official Encoding Guide](https://vibbit.ai/blog/youtube-upload-best-settings)
64. [Best Audio Format for YouTube Uploads in 2026](https://audioutils.com/blog/best-audio-format-for-youtube-upload)
65. [Reels vs Shorts: Audio Settings Compared](https://audioforgepro.com/blog/instagram-reels-vs-youtube-shorts-audio-comparison)
66. [Best Video Format for YouTube Uploads in 2026 (Resolution, Codec & Settings)](https://streamersize.com/blog/best-video-format-for-youtube/)
