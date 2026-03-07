import { useGetMenuQuery } from '../store/apiSlice';

export function useMenu(city = 'Karachi', area = 'Bahadurabad') {
  const { data, isLoading } = useGetMenuQuery({ city, area });
  return {
    categories: data?.categories ?? [],
    products: data?.products ?? [],
    isLoading,
  };
}
