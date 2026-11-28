// Entry for components/bundle.js: one classic script that exposes the components as window.VCRStudio.
import * as VCRStudio from "./index";

declare global {
  interface Window {
    VCRStudio: typeof VCRStudio;
  }
}

window.VCRStudio = VCRStudio;
