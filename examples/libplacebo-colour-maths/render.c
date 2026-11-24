// Prints libplacebo's CPU-only colour and tone-map results as JSON on stdout.
// Only pure CPU functions are called: no pl_context, no GPU, no rendering.
// The inputs below are mirrored in expected/reference.json; keep them in step.

#include <stdbool.h>
#include <stddef.h>
#include <stdio.h>

#include <libplacebo/colorspace.h>
#include <libplacebo/common.h>
#include <libplacebo/config.h>
#include <libplacebo/tone_mapping.h>

// === PUBLIC API ===

static const float COLOURS_LINEAR[][3] = {
    {1.0f, 0.0f, 0.0f},  {0.0f, 1.0f, 0.0f},   {0.0f, 0.0f, 1.0f},  {1.0f, 1.0f, 1.0f},
    {0.5f, 0.25f, 0.125f}, {0.2f, 0.6f, 0.1f}, {0.9f, 0.1f, 0.4f},
};
static const size_t COLOUR_COUNT = sizeof(COLOURS_LINEAR) / sizeof(COLOURS_LINEAR[0]);

static const float PQ_NITS[] = {0.1f, 1.0f, 5.0f, 20.0f, 100.0f, 203.0f, 400.0f, 600.0f, 1000.0f};
static const size_t PQ_NITS_COUNT = sizeof(PQ_NITS) / sizeof(PQ_NITS[0]);

static const float TONE_MAP_INPUT_PEAK_NITS = 1000.0f;
static const float TONE_MAP_OUTPUT_PEAK_NITS = 100.0f;

static void printPrimaries(const char *key, const struct pl_raw_primaries *primaries);
static void printMatrix(const char *key, pl_matrix3x3 matrix);
static void printColours(const char *key, const struct pl_raw_primaries *from, const struct pl_raw_primaries *to);
static void printToneMap(void);

int main(void) {
    const struct pl_raw_primaries *bt709 = pl_raw_primaries_get(PL_COLOR_PRIM_BT_709);
    const struct pl_raw_primaries *bt2020 = pl_raw_primaries_get(PL_COLOR_PRIM_BT_2020);
    if (bt709 == NULL || bt2020 == NULL) {
        fprintf(stderr, "libplacebo returned no primaries for BT.709 or BT.2020\n");
        return 1;
    }

    printf("{\n");
    printf("  \"libplacebo\": \"%s\",\n", pl_version());
    printPrimaries("primaries709", bt709);
    printPrimaries("primaries2020", bt2020);
    printMatrix("rgb2xyz709", pl_get_rgb2xyz_matrix(bt709));
    printMatrix("rgb2xyz2020", pl_get_rgb2xyz_matrix(bt2020));
    printMatrix("mapping709To2020", pl_get_color_mapping_matrix(bt709, bt2020, PL_INTENT_RELATIVE_COLORIMETRIC));
    printMatrix("mapping2020To709", pl_get_color_mapping_matrix(bt2020, bt709, PL_INTENT_RELATIVE_COLORIMETRIC));
    printColours("colours709To2020", bt709, bt2020);
    printColours("colours2020To709", bt2020, bt709);
    printToneMap();
    printf("}\n");
    return 0;
}

// === PIPELINE ===

static void printPrimaries(const char *key, const struct pl_raw_primaries *primaries) {
    printf("  \"%s\": {\"red\": [%.9g, %.9g], \"green\": [%.9g, %.9g], \"blue\": [%.9g, %.9g], \"white\": [%.9g, %.9g]},\n",
           key,
           primaries->red.x, primaries->red.y,
           primaries->green.x, primaries->green.y,
           primaries->blue.x, primaries->blue.y,
           primaries->white.x, primaries->white.y);
}

// Flattens row-major, so reference.json and check.mjs read it as nine numbers.
static void printMatrix(const char *key, pl_matrix3x3 matrix) {
    printf("  \"%s\": [", key);
    for (int row = 0; row < 3; row++) {
        for (int column = 0; column < 3; column++) {
            const bool isFirst = row == 0 && column == 0;
            printf("%s%.9g", isFirst ? "" : ", ", matrix.m[row][column]);
        }
    }
    printf("],\n");
}

static void printColours(const char *key, const struct pl_raw_primaries *from, const struct pl_raw_primaries *to) {
    const pl_matrix3x3 mapping = pl_get_color_mapping_matrix(from, to, PL_INTENT_RELATIVE_COLORIMETRIC);
    printf("  \"%s\": [\n", key);
    for (size_t index = 0; index < COLOUR_COUNT; index++) {
        float vector[3] = {COLOURS_LINEAR[index][0], COLOURS_LINEAR[index][1], COLOURS_LINEAR[index][2]};
        pl_matrix3x3_apply(&mapping, vector);
        const bool isLast = index + 1 == COLOUR_COUNT;
        printf("    [%.9g, %.9g, %.9g]%s\n", vector[0], vector[1], vector[2], isLast ? "" : ",");
    }
    printf("  ],\n");
}

// Last key in the object, so no trailing comma.
static void printToneMap(void) {
    const struct pl_tone_map_params params = {
        .function = &pl_tone_map_bt2390,
        .constants = {PL_TONE_MAP_CONSTANTS},
        .input_scaling = PL_HDR_PQ,
        .output_scaling = PL_HDR_NITS,
        .input_min = 0.0f,
        .input_max = pl_hdr_rescale(PL_HDR_NITS, PL_HDR_PQ, TONE_MAP_INPUT_PEAK_NITS),
        .output_min = 0.0f,
        .output_max = TONE_MAP_OUTPUT_PEAK_NITS,
    };
    printf("  \"pqToneMap\": {\"function\": \"%s\", \"points\": [\n", pl_tone_map_bt2390.name);
    for (size_t index = 0; index < PQ_NITS_COUNT; index++) {
        const float inputPq = pl_hdr_rescale(PL_HDR_NITS, PL_HDR_PQ, PQ_NITS[index]);
        const float outputNits = pl_tone_map_sample(inputPq, &params);
        const bool isLast = index + 1 == PQ_NITS_COUNT;
        printf("    {\"inNits\": %.9g, \"inPq\": %.9g, \"outNits\": %.9g}%s\n", PQ_NITS[index], inputPq, outputNits, isLast ? "" : ",");
    }
    printf("  ]}\n");
}
