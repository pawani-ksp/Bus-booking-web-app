import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Static public pages — prerendered at build time
  { path: 'landing',         renderMode: RenderMode.Prerender },
  { path: 'login',           renderMode: RenderMode.Prerender },
  { path: 'register',        renderMode: RenderMode.Prerender },
  { path: 'bus-list',        renderMode: RenderMode.Prerender },
  { path: 'bus-station-map', renderMode: RenderMode.Prerender },
  { path: 'route-map',       renderMode: RenderMode.Prerender },
  { path: 'bus-rating',      renderMode: RenderMode.Prerender },

  // Everything else renders on the server per request
  { path: '**', renderMode: RenderMode.Server }
];
