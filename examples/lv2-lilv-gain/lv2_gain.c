#include <lv2/core/lv2.h>

#include <stdint.h>
#include <stdlib.h>

#define PLUGIN_URI "https://example.org/vcr/mono-gain"

typedef struct {
  const float *gain;
  const float *input;
  float *output;
} MonoGain;

static LV2_Handle instantiate(const LV2_Descriptor *descriptor,
                              double sample_rate,
                              const char *bundle_path,
                              const LV2_Feature *const *features) {
  (void)descriptor;
  (void)sample_rate;
  (void)bundle_path;
  (void)features;
  return calloc(1, sizeof(MonoGain));
}

static void connect_port(LV2_Handle instance, uint32_t port, void *data) {
  MonoGain *self = (MonoGain *)instance;
  if (port == 0) self->gain = (const float *)data;
  else if (port == 1) self->input = (const float *)data;
  else if (port == 2) self->output = (float *)data;
}

static void run(LV2_Handle instance, uint32_t sample_count) {
  const MonoGain *self = (const MonoGain *)instance;
  const float gain = self->gain ? *self->gain : 1.0f;
  for (uint32_t i = 0; i < sample_count; ++i) {
    self->output[i] = self->input[i] * gain;
  }
}

static void cleanup(LV2_Handle instance) {
  free(instance);
}

static const LV2_Descriptor descriptor = {
  PLUGIN_URI,
  instantiate,
  connect_port,
  NULL,
  run,
  NULL,
  cleanup,
  NULL,
};

LV2_SYMBOL_EXPORT const LV2_Descriptor *lv2_descriptor(uint32_t index) {
  return index == 0 ? &descriptor : NULL;
}
