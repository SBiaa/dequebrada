import "server-only";

/**
 * Episódios do canal do De Quebrada no YouTube.
 * - Com YOUTUBE_API_KEY: lista TODOS os vídeos longos (sem shorts) pela YouTube Data API.
 * - Sem a chave: usa o feed RSS público dos vídeos longos do canal (só os 15 mais recentes).
 * O resultado fica em cache por 1 hora.
 */

export type Episode = {
  id: string;
  title: string;
  publishedAt: string;
  thumbnail: string;
  description?: string;
};

const CACHE = { next: { revalidate: 3600 } } as const;
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

export function channelId(): string | null {
  const id = process.env.YOUTUBE_CHANNEL_ID?.trim();
  return id && /^UC[A-Za-z0-9_-]{22}$/.test(id) ? id : null;
}

export function isVideoId(id: string): boolean {
  return VIDEO_ID.test(id);
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fromRss(channel: string): Promise<Episode[]> {
  // Feed da playlist "UULF" = só vídeos longos (os episódios), sem shorts.
  let res = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${channel.slice(2)}`, CACHE);
  if (!res.ok) res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`, CACHE);
  if (!res.ok) return [];
  const xml = await res.text();
  const entries = xml.split("<entry>").slice(1);
  return entries
    .filter((e) => !e.includes("/shorts/"))
    .map((e) => {
      const id = e.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? "";
      return {
        id,
        title: decode(e.match(/<title>([^<]*)<\/title>/)?.[1] ?? ""),
        publishedAt: e.match(/<published>([^<]+)<\/published>/)?.[1] ?? "",
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        description: decode(e.match(/<media:description>([^<]*)<\/media:description>/)?.[1] ?? ""),
      };
    })
    .filter((v) => isVideoId(v.id));
}

type PlaylistResponse = {
  nextPageToken?: string;
  items?: {
    snippet: {
      title: string;
      description: string;
      publishedAt: string;
      resourceId: { videoId: string };
      thumbnails?: Record<string, { url: string }>;
    };
    status?: { privacyStatus?: string };
  }[];
};

async function fromApi(channel: string, key: string, max = 500): Promise<Episode[]> {
  // "UULF" + id do canal = playlist de vídeos longos do canal (sem shorts e sem lives).
  const playlist = `UULF${channel.slice(2)}`;
  const out: Episode[] = [];
  let page: string | undefined;
  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.search = new URLSearchParams({
      part: "snippet,status",
      playlistId: playlist,
      maxResults: "50",
      key,
      ...(page ? { pageToken: page } : {}),
    }).toString();
    const res = await fetch(url, CACHE);
    if (!res.ok) break;
    const data = (await res.json()) as PlaylistResponse;
    for (const item of data.items ?? []) {
      if (item.status?.privacyStatus === "private") continue;
      const s = item.snippet;
      const id = s.resourceId.videoId;
      if (!isVideoId(id)) continue;
      out.push({
        id,
        title: s.title,
        publishedAt: s.publishedAt,
        description: s.description,
        thumbnail: s.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      });
    }
    page = data.nextPageToken;
  } while (page && out.length < max);
  return out;
}

export async function listEpisodes(): Promise<Episode[]> {
  const channel = channelId();
  if (!channel) return [];
  const key = process.env.YOUTUBE_API_KEY;
  try {
    if (key) {
      const all = await fromApi(channel, key);
      if (all.length) return all;
    }
    return await fromRss(channel);
  } catch (e) {
    console.error("Falha ao buscar episódios do YouTube", e);
    return [];
  }
}

/** URL do player sem cookies de rastreamento até o play. */
export function embedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}
