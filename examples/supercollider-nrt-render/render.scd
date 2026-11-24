// === NON-REALTIME RENDER ===
// Run headless: sclang -D render.scd. Builds an OSC score and renders it twice with Score.recordNRT (scsynth -N), no audio device.
// Notes are the "// note" lines below; analyse.py parses them against the README table.
(
var sampleRate = 48000;
var durationS = 4.0;
var exampleDirectory = PathName(thisProcess.nowExecutingPath).pathOnly;
var outputDirectory = exampleDirectory +/+ "output";
var notes = [
    [0.25, 440.0, 0.5, 0.5], // note
    [1.00, 330.0, 0.5, 0.3], // note
    [1.75, 660.0, 0.4, 0.4], // note
    [2.50, 880.0, 0.4, 0.2], // note
    [3.25, 550.0, 0.6, 0.6], // note
];
var sineDef = SynthDef(\vcrSineEnv, { |out = 0, freq = 440, dur = 0.5, amp = 0.5|
    var env = EnvGen.ar(Env.linen(0.01, dur - 0.06, 0.05, amp), doneAction: 2);
    var sig = SinOsc.ar(freq, 0, env);
    Out.ar(out, [sig, sig]);
});
var score = List.new;
var options = ServerOptions.new.numOutputBusChannels_(2).numInputBusChannels_(0);
var renderTo;

score.add([0.0, [\d_recv, sineDef.asBytes]]);
score.add([0.0, [\g_new, 1, 0, 0]]);
notes.do { |note, index|
    score.add([note[0], [\s_new, \vcrSineEnv, 1000 + index, 0, 1, \freq, note[1], \dur, note[2], \amp, note[3]]]);
};

Score.program = Platform.resourceDir +/+ "scsynth";

renderTo = { |wavName, next|
    Score(score).recordNRT(
        outputDirectory +/+ "score.osc",
        outputDirectory +/+ wavName,
        nil,
        sampleRate,
        "WAV",
        "int16",
        options,
        "",
        durationS,
        { |exitCode|
            if (exitCode != 0 or: { File.exists(outputDirectory +/+ wavName).not }) {
                ("supercollider-nrt-render: scsynth failed for " ++ wavName ++ " (exit " ++ exitCode ++ ")").error;
                1.exit;
            };
            next.value;
        }
    );
};

renderTo.value("render-a.wav", {
    renderTo.value("render-b.wav", {
        "supercollider-nrt-render: rendered output/render-a.wav and output/render-b.wav".postln;
        0.exit;
    });
});
)
