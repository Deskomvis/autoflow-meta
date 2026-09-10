const DEFAULT_SITE_URL = 'https://autoflow.roketmedia.id';

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? process.env.APP_URL;

  return (configured ?? DEFAULT_SITE_URL).replace(/\/+$/, '');
}
