export function getApiBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_AUDITFLOW_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/u, '');
  }

  return 'http://localhost:5116';
}
