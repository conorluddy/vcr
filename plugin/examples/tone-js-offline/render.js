import * as Tone from 'tone';

const events = [
  { note: 'C4', onset: 0.1, frequency: 261.6256 },
  { note: 'E4', onset: 0.45, frequency: 329.6276 },
  { note: 'G4', onset: 0.8, frequency: 391.9954 }
];

window.renderToneOffline = async () => {
  const toneBuffer = await Tone.Offline(({ transport }) => {
    transport.bpm.value = 120;
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.02, sustain: 0.6, release: 0.05 }
    }).toDestination();
    for (const event of events) {
      transport.schedule((time) => synth.triggerAttackRelease(event.note, '8n', time, 0.8), event.onset);
    }
    transport.start(0);
  }, 1.2, 1, 48000);
  const audioBuffer = toneBuffer.get();
  return {
    sampleRate: audioBuffer.sampleRate,
    duration: audioBuffer.duration,
    channels: audioBuffer.numberOfChannels,
    samples: Array.from(audioBuffer.getChannelData(0))
  };
};
