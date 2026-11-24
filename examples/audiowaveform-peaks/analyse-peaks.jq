# Predeclared checks for examples/audiowaveform-peaks (see README "Plan, before running").
# Input: the audiowaveform JSON. Arguments: constants from run.sh, and $artifacts (DAT header and values, PNG facts, hashes, rerun flag).
. as $root
| def pixel($index): {min: ($root.data[2 * $index] / $fullScale), max: ($root.data[2 * $index + 1] / $fullScale)};
  def pixelsOfSegment($segment): [range($segment * $pixelsPerSegment; ($segment + 1) * $pixelsPerSegment) as $index | pixel($index)];
  def isNear($value; $target; $tolerance): (($value - $target) | fabs) <= $tolerance;
  def isSilent($pixels): all($pixels[]; isNear(.min; 0; $zeroTolerance) and isNear(.max; 0; $zeroTolerance));
  def isTone($pixels; $amplitude): all($pixels[]; isNear(.max; $amplitude; $amplitudeTolerance) and isNear(.min; (0 - $amplitude); $amplitudeTolerance));
  def peakSummary($pixels): {min: ($pixels | map(.min) | min), max: ($pixels | map(.max) | max)};
  pixelsOfSegment(0) as $silencePixels
  | pixelsOfSegment(1) as $minus6Pixels
  | pixelsOfSegment(2) as $minus20Pixels
  | {
      json: {
        length: $root.length,
        samples_per_pixel: $root.samples_per_pixel,
        sample_rate: $root.sample_rate,
        bits: $root.bits,
        channels: $root.channels,
        data_values: ($root.data | length)
      },
      segments: {
        silence: peakSummary($silencePixels),
        minus_6_dbfs: peakSummary($minus6Pixels),
        minus_20_dbfs: peakSummary($minus20Pixels)
      },
      dat: {
        version: $artifacts.dat.version,
        flags: $artifacts.dat.flags,
        sample_rate: $artifacts.dat.sample_rate,
        samples_per_pixel: $artifacts.dat.samples_per_pixel,
        length: $artifacts.dat.length,
        bytes: $artifacts.dat.bytes
      },
      png: {
        width: $artifacts.png.width,
        height: $artifacts.png.height,
        format: $artifacts.png.format,
        alpha_min: $artifacts.png.alpha_min,
        alpha_max: $artifacts.png.alpha_max
      },
      sha256: $artifacts.sha256,
      checks: {
        json_header: ($root.length == $expectedLength and $root.samples_per_pixel == $samplesPerPixel and $root.sample_rate == $sampleRate and $root.bits == $bits and $root.channels == 1 and ($root.data | length) == $expectedDataValues),
        silence: isSilent($silencePixels),
        minus_6_dbfs: isTone($minus6Pixels; $minus6Amplitude),
        minus_20_dbfs: isTone($minus20Pixels; $minus20Amplitude),
        dat_header: ($artifacts.dat.version == 2 and $artifacts.dat.flags == 0 and $artifacts.dat.sample_rate == $sampleRate and $artifacts.dat.samples_per_pixel == $samplesPerPixel and $artifacts.dat.length == $expectedLength),
        dat_bytes: ($artifacts.dat.bytes == $expectedDatBytes),
        dat_matches_json: ($artifacts.dat.values == $root.data),
        png_dimensions: ($artifacts.png.width == $pngWidth and $artifacts.png.height == $pngHeight and $artifacts.png.format == "png"),
        png_alpha_range: ($artifacts.png.alpha_min == 0 and $artifacts.png.alpha_max == 255),
        rerun_identical: $artifacts.rerun_identical,
        distinct_hashes: (($artifacts.sha256 | to_entries | map(.value) | unique | length) >= 2)
      }
    }
