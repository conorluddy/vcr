// Page code: create an Omakase player, load the MP4, expose seekToFrame for the checker.
import { OmakasePlayer, ChromingTheme, MediaTemporalFormat } from "@byomakase/omakase-player";
import { firstValueFrom } from "rxjs";

const player = new OmakasePlayer({ playerHtmlElementId: "player", chromingTheme: ChromingTheme.CHROMELESS });

declare global {
  interface Window {
    __ready: Promise<{ duration: number }>;
    __seekToFrame: (frame: number) => Promise<number>;
  }
}

window.__ready = (async () => {
  const media = await firstValueFrom(player.loadMainMedia(new URLSearchParams(location.search).get("src") ?? ""));
  return { duration: media.duration ?? 0 };
})();

window.__seekToFrame = async (frame) => {
  await firstValueFrom(player.player.seekTo(frame, MediaTemporalFormat.FRAME_COUNT));
  return player.player.getCurrentTime(MediaTemporalFormat.FRAME_COUNT) as number;
};
