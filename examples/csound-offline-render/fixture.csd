<CsoundSynthesizer>
<CsOptions>
</CsOptions>
<CsInstruments>
; One sine instrument: linear 5 ms attack, sustain at p5, 10 ms release to zero.
; No random opcodes and no realtime device, so the offline render is deterministic.
sr = 48000
ksmps = 64
nchnls = 1
0dbfs = 1

instr 1
  aenv linseg 0, 0.005, p5, p3 - 0.015, p5, 0.01, 0
  asig poscil aenv, p4, 1
  out asig
endin
</CsInstruments>
<CsScore>
; Sine table 1, 16384 points, GEN10 with one partial.
f 1 0 16384 10 1
f 0 3
; Notes: start (s), duration (s), frequency (Hz), amplitude. Predeclared in README and analyse.py.
i 1 0.0 0.4 220 0.5
i 1 0.5 0.4 330 0.5
i 1 1.0 0.4 440 0.5
i 1 1.5 0.4 660 0.5
i 1 2.0 0.4 880 0.5
i 1 2.5 0.4 1100 0.5
</CsScore>
</CsoundSynthesizer>
