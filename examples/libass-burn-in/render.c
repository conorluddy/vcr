// Render one hand-written ASS track with libass at a list of times, composite its bitmaps over a
// generated solid background, and write per frame: a binary PPM (P6), a libass coverage PGM (P5) and
// one JSON line of measurements on stdout. Times are processed in the order given, in one process,
// so libass state carried between seeks is exercised.
//
// usage: render <track.ass> <fonts-dir> <out-dir> <time-ms>...
#include <ass/ass.h>
#include <stdarg.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define FRAME_WIDTH 640
#define FRAME_HEIGHT 360
#define FRAME_PIXELS (FRAME_WIDTH * FRAME_HEIGHT)
#define BACKGROUND_RED 24
#define BACKGROUND_GREEN 28
#define BACKGROUND_BLUE 36

// === PUBLIC API ===

typedef struct {
    int imageCount;
    long changedPixels;
    int hasChangedBox;
    int changedMinX, changedMinY, changedMaxX, changedMaxY;
    int coverageMin, coverageMax;
    long partialCoveragePixels;
} FrameMeasurement;

// === RENDERING ===

static void printLibassMessage(int level, const char *format, va_list args, void *data) {
    (void)data;
    fprintf(stderr, "libass[%d]: ", level);
    vfprintf(stderr, format, args);
    fprintf(stderr, "\n");
}

static void fillBackground(uint8_t *rgb, uint8_t *coverage) {
    for (int pixel = 0; pixel < FRAME_PIXELS; pixel++) {
        rgb[pixel * 3 + 0] = BACKGROUND_RED;
        rgb[pixel * 3 + 1] = BACKGROUND_GREEN;
        rgb[pixel * 3 + 2] = BACKGROUND_BLUE;
        coverage[pixel] = 0;
    }
}

// libass colour is RRGGBBAA where AA is transparency (0 = opaque); the bitmap holds glyph coverage.
static void compositeImage(const ASS_Image *image, uint8_t *rgb, uint8_t *coverage) {
    const int sourceAlpha = 255 - (image->color & 0xFF);
    const int sourceRed = (image->color >> 24) & 0xFF;
    const int sourceGreen = (image->color >> 16) & 0xFF;
    const int sourceBlue = (image->color >> 8) & 0xFF;
    for (int row = 0; row < image->h; row++) {
        const int destinationY = image->dst_y + row;
        if (destinationY < 0 || destinationY >= FRAME_HEIGHT) continue;
        for (int column = 0; column < image->w; column++) {
            const int destinationX = image->dst_x + column;
            if (destinationX < 0 || destinationX >= FRAME_WIDTH) continue;
            const int pixel = destinationY * FRAME_WIDTH + destinationX;
            const int alpha = image->bitmap[row * image->stride + column] * sourceAlpha / 255;
            if (alpha == 0) continue;
            const int inverseAlpha = 255 - alpha;
            rgb[pixel * 3 + 0] = (uint8_t)((sourceRed * alpha + rgb[pixel * 3 + 0] * inverseAlpha) / 255);
            rgb[pixel * 3 + 1] = (uint8_t)((sourceGreen * alpha + rgb[pixel * 3 + 1] * inverseAlpha) / 255);
            rgb[pixel * 3 + 2] = (uint8_t)((sourceBlue * alpha + rgb[pixel * 3 + 2] * inverseAlpha) / 255);
            coverage[pixel] = (uint8_t)(alpha + coverage[pixel] * inverseAlpha / 255);
        }
    }
}

static FrameMeasurement measureFrame(const ASS_Image *firstImage, const uint8_t *rgb, const uint8_t *coverage) {
    FrameMeasurement measurement = {0};
    measurement.coverageMin = 255;
    measurement.coverageMax = 0;
    measurement.changedMinX = FRAME_WIDTH;
    measurement.changedMinY = FRAME_HEIGHT;
    measurement.changedMaxX = -1;
    measurement.changedMaxY = -1;
    for (const ASS_Image *image = firstImage; image != NULL; image = image->next) measurement.imageCount++;
    for (int pixel = 0; pixel < FRAME_PIXELS; pixel++) {
        const int x = pixel % FRAME_WIDTH;
        const int y = pixel / FRAME_WIDTH;
        const int isChanged = rgb[pixel * 3 + 0] != BACKGROUND_RED || rgb[pixel * 3 + 1] != BACKGROUND_GREEN ||
                              rgb[pixel * 3 + 2] != BACKGROUND_BLUE;
        if (isChanged) {
            measurement.changedPixels++;
            if (x < measurement.changedMinX) measurement.changedMinX = x;
            if (y < measurement.changedMinY) measurement.changedMinY = y;
            if (x > measurement.changedMaxX) measurement.changedMaxX = x;
            if (y > measurement.changedMaxY) measurement.changedMaxY = y;
        }
        const int value = coverage[pixel];
        if (value < measurement.coverageMin) measurement.coverageMin = value;
        if (value > measurement.coverageMax) measurement.coverageMax = value;
        if (value > 0 && value < 255) measurement.partialCoveragePixels++;
    }
    measurement.hasChangedBox = measurement.changedPixels > 0;
    return measurement;
}

static int writeBinaryImage(const char *path, const char *header, const uint8_t *pixels, size_t byteCount) {
    FILE *file = fopen(path, "wb");
    if (file == NULL) {
        fprintf(stderr, "render: cannot open %s for writing; check the output directory exists\n", path);
        return 0;
    }
    fputs(header, file);
    const size_t written = fwrite(pixels, 1, byteCount, file);
    fclose(file);
    if (written != byteCount) {
        fprintf(stderr, "render: short write to %s\n", path);
        return 0;
    }
    return 1;
}

static void printMeasurementJson(int timeMs, const FrameMeasurement *measurement) {
    printf("{\"tMs\":%d,\"imageCount\":%d,\"changedPixels\":%ld,", timeMs, measurement->imageCount,
           measurement->changedPixels);
    if (measurement->hasChangedBox) {
        printf("\"changedBox\":[%d,%d,%d,%d],", measurement->changedMinX, measurement->changedMinY,
               measurement->changedMaxX, measurement->changedMaxY);
    } else {
        printf("\"changedBox\":null,");
    }
    printf("\"coverageMin\":%d,\"coverageMax\":%d,\"partialCoveragePixels\":%ld}\n", measurement->coverageMin,
           measurement->coverageMax, measurement->partialCoveragePixels);
}

static int renderOneTime(ASS_Renderer *renderer, ASS_Track *track, int timeMs, const char *outDir,
                         uint8_t *rgb, uint8_t *coverage) {
    fillBackground(rgb, coverage);
    int changed = 0;
    const ASS_Image *firstImage = ass_render_frame(renderer, track, timeMs, &changed);
    for (const ASS_Image *image = firstImage; image != NULL; image = image->next) {
        compositeImage(image, rgb, coverage);
    }
    const FrameMeasurement measurement = measureFrame(firstImage, rgb, coverage);
    char path[1024];
    snprintf(path, sizeof(path), "%s/t-%05d.ppm", outDir, timeMs);
    if (!writeBinaryImage(path, "P6\n640 360\n255\n", rgb, FRAME_PIXELS * 3)) return 0;
    snprintf(path, sizeof(path), "%s/t-%05d.pgm", outDir, timeMs);
    if (!writeBinaryImage(path, "P5\n640 360\n255\n", coverage, FRAME_PIXELS)) return 0;
    printMeasurementJson(timeMs, &measurement);
    return 1;
}

// === MAIN ===

int main(int argc, char **argv) {
    if (argc < 5) {
        fprintf(stderr, "usage: render <track.ass> <fonts-dir> <out-dir> <time-ms>...\n");
        return 2;
    }
    const char *trackPath = argv[1];
    const char *fontsDir = argv[2];
    const char *outDir = argv[3];

    ASS_Library *library = ass_library_init();
    if (library == NULL) {
        fprintf(stderr, "render: ass_library_init failed\n");
        return 1;
    }
    ass_set_message_cb(library, printLibassMessage, NULL);
    ass_set_fonts_dir(library, fontsDir);

    ASS_Track *track = ass_read_file(library, (char *)trackPath, NULL);
    if (track == NULL) {
        fprintf(stderr, "render: libass could not read %s; check the path and the [V4+ Styles] format\n", trackPath);
        return 1;
    }

    ASS_Renderer *renderer = ass_renderer_init(library);
    ass_set_frame_size(renderer, FRAME_WIDTH, FRAME_HEIGHT);
    ass_set_storage_size(renderer, FRAME_WIDTH, FRAME_HEIGHT);
    // No system font provider: the only fonts are those loaded from fonts-dir, so no system face can match.
    ass_set_fonts(renderer, NULL, "JetBrains Mono", ASS_FONTPROVIDER_NONE, NULL, 0);

    uint8_t *rgb = malloc((size_t)FRAME_PIXELS * 3);
    uint8_t *coverage = malloc((size_t)FRAME_PIXELS);
    if (rgb == NULL || coverage == NULL) {
        fprintf(stderr, "render: out of memory for a 640x360 frame\n");
        return 1;
    }

    int exitCode = 0;
    for (int argument = 4; argument < argc; argument++) {
        const int timeMs = atoi(argv[argument]);
        if (!renderOneTime(renderer, track, timeMs, outDir, rgb, coverage)) {
            exitCode = 1;
            break;
        }
    }

    free(rgb);
    free(coverage);
    ass_free_track(track);
    ass_renderer_done(renderer);
    ass_library_done(library);
    return exitCode;
}
