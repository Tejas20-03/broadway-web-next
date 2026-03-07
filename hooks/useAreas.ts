import { useGetAreasQuery, useGetOutletsQuery, useGetPickupOutletsQuery } from '../store/apiSlice';

export function useAreas(city: string) {
  const { data: areas = [], isLoading } = useGetAreasQuery(city, { skip: !city });
  return { areas, isLoading };
}

export function useOutlets(city: string) {
  const { data: outlets = [], isLoading } = useGetOutletsQuery(city, { skip: !city });
  return { outlets, isLoading };
}

export function usePickupOutlets(city: string) {
  const { data: outlets = [], isLoading } = useGetPickupOutletsQuery(city, { skip: !city });
  return { outlets, isLoading };
}
