import { useGetMenuQuery } from '../store/apiSlice';

export function useMenu(city = 'Karachi', area = 'Bahadurabad', outlet?: string) {
  const { data, isLoading } = useGetMenuQuery({ city, area, outlet });
  return {
    categories: data?.categories ?? [],
    products: data?.products ?? [],
    isLoading,
  };
}
