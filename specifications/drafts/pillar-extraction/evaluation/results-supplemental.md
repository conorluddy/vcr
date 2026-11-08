# Supplemental synthetic artifact trial

This is a small infrastructure and handoff exercise, not an independent behavioural evaluation, reviewer calibration, safety certification, platform compliance check or human approval. The synthetic brief requests two seconds at 24 fps: a dark field with two distinct rectangles, a short tone followed by silence, landscape and portrait compositions, and a sidecar identifying the tone. The shapes have no quantitative meaning; their change from horizontal to vertical arrangement is an authored adaptation. No external assets, claims, lighting rig, material model or destination requirements are assumed. The still, flat shapes exercise appearance handoff only; they cannot evaluate lighting, material response or temporal treatment.

Local artifacts are ignored and reproducible under `output/pillar-evaluation/supplemental/`: `tone-silence.wav`, `landscape.mp4`, `portrait.mp4`, `captions.vtt`, and decoded first frames `landscape.png` and `portrait.png`. They are not committed. A single caption sidecar applies to both versions because their synthetic timing is identical; actual playback and sidecar integration were not checked.

## Construction

Using locally available ffmpeg and ffprobe, with no downloads:

```sh
mkdir -p output/pillar-evaluation/supplemental
ffmpeg -hide_banner -loglevel error -f lavfi -i 'aevalsrc=if(lt(t\,0.5)\,0.1*sin(2*PI*440*t)\,0):s=48000:d=2' -c:a pcm_s16le -y output/pillar-evaluation/supplemental/tone-silence.wav
ffmpeg -hide_banner -loglevel error -f lavfi -i 'color=c=0x202a36:s=320x180:r=24:d=2,drawbox=x=48:y=38:w=80:h=100:color=0x9cb6c3:t=fill,drawbox=x=160:y=58:w=112:h=60:color=0xe7c37a:t=fill' -i output/pillar-evaluation/supplemental/tone-silence.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart -shortest -y output/pillar-evaluation/supplemental/landscape.mp4
ffmpeg -hide_banner -loglevel error -f lavfi -i 'color=c=0x202a36:s=180x320:r=24:d=2,drawbox=x=40:y=50:w=100:h=90:color=0x9cb6c3:t=fill,drawbox=x=40:y=180:w=100:h=60:color=0xe7c37a:t=fill' -i output/pillar-evaluation/supplemental/tone-silence.wav -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart -shortest -y output/pillar-evaluation/supplemental/portrait.mp4
```

The WebVTT sidecar contains one cue, `[Tone]`, from 00:00:00.000 to 00:00:00.500. First frames were decoded with `ffmpeg -i <file> -frames:v 1 <image.png>` and inspected: both rectangles appear in each composition. This is a first-frame observation only.

## Evidence and handoff

`ffprobe -v error -show_entries stream=codec_name,codec_type,width,height,pix_fmt,r_frame_rate,avg_frame_rate,duration,nb_frames,sample_rate,channels -show_entries format=duration -of json <file>` reported H.264/yuv420p video, AAC mono audio at 48 kHz, 48 video frames, 24/1 nominal and average fps, and 2.000 seconds for each file. Landscape is 320 × 180 and portrait is 180 × 320. Decoded video frame timestamps from `ffprobe -select_streams v:0 -show_entries frame=best_effort_timestamp_time` run from 0.000000 to 1.958333 seconds; all 47 intervals differ from 1/24 second by at most 0.000000667 seconds, consistent with timestamp rounding.

Python's `wave` module read the source WAV as mono 16-bit PCM, 48 kHz, 96,000 samples. Samples 0–23,999 had peak absolute value 3,277 and RMS 2,317.05 in integer sample units; samples 24,000–95,999 had zero peak and RMS. These are source sample statistics, not integrated loudness, true peak, decoded AAC quality or audible sync measurements.

Adaptation has two expected and supplied cells, with deliberate recomposition; caption timing and audio need playback review for each delivered file. Delivery has metadata and decoded frame timestamp evidence, not a destination specification, full decoded-signal assessment or simulated upload. Accessibility has an authored sound label but no human caption review, full temporal safety analysis or conformance assessment. Review can cite these observations and gaps; a human decision remains separate. No finding has been resolved or approved.
