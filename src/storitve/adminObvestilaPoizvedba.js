import { pridobiAdminObvestila } from './podatki';

// Scope the cache to the signed-in admin; prefetch and the page share one request.
export function adminObvestilaPoizvedba(uporabnikId) {
  return {
    queryKey: ['admin-obvestila', uporabnikId],
    queryFn: ({ signal }) => pridobiAdminObvestila(signal),
    enabled: Boolean(uporabnikId),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1
  };
}
