import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, Category, Area, Outlet, BlogPost } from '../types';
import {
  fetchMenuData,
  fetchAreas,
  fetchOutlets,
  fetchPickupOutlets,
  fetchBlogPosts,
  fetchProductOptions,
  fetchHotDeals,
  fetchBirthdayDeals,
  fetchPendingOrders,
  fetchSuggestiveItems,
  fetchCities,
  fetchBanners,
  fetchMyOrders,
  fetchMyWallet,
  fetchCustomerInfo,
  updateCustomerInfo,
  deleteAccount,
  checkNumber,
  verifyCode,
  placeOrder,
  fetchGeoCodeArea,
  type City,
  type HotDeal,
  type BirthdayDeal,
  type Order,
  type CustomerInfo,
  type PendingOrder,
  type SuggestiveItem,
  type OrderPayload,
  type GeoCodeResult,
} from '../services/api';

type CustomError = { status: 'CUSTOM_ERROR'; error: string };
const err = (e: unknown): { error: CustomError } => ({
  error: { status: 'CUSTOM_ERROR', error: String(e) },
});

export const broadwayApi = createApi({
  reducerPath: 'broadwayApi',
  baseQuery: fakeBaseQuery<CustomError>(),
  tagTypes: ['Orders', 'Customer', 'Wallet'],
  endpoints: (builder) => ({
    // ── Queries ─────────────────────────────────────────────────────────────
    getMenu: builder.query<{ categories: Category[]; products: Product[] }, { city: string; area: string; outlet?: string }>({
      queryFn: async ({ city, area, outlet }) => {
        try { return { data: await fetchMenuData(city, area, outlet) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 300,
    }),

    getProductOptions: builder.query<Partial<Product>, { itemId: string; city: string; area: string }>({
      queryFn: async ({ itemId, city, area }) => {
        try { return { data: await fetchProductOptions(itemId, city, area) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 300,
    }),

    getCities: builder.query<City[], void>({
      queryFn: async () => {
        try { return { data: await fetchCities() }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 3600,
    }),

    getAreas: builder.query<Area[], string>({
      queryFn: async (city) => {
        try { return { data: await fetchAreas(city) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 600,
    }),

    getOutlets: builder.query<Outlet[], string>({
      queryFn: async (city) => {
        try { return { data: await fetchOutlets(city) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 600,
    }),

    getPickupOutlets: builder.query<Outlet[], string>({
      queryFn: async (city) => {
        try { return { data: await fetchPickupOutlets(city) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 600,
    }),

    getBanners: builder.query<string[], string>({
      queryFn: async (city) => {
        try { return { data: await fetchBanners(city) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 300,
    }),

    getBlogPosts: builder.query<BlogPost[], void>({
      queryFn: async () => {
        try { return { data: await fetchBlogPosts() }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 600,
    }),

    getHotDeals: builder.query<HotDeal[], void>({
      queryFn: async () => {
        try { return { data: await fetchHotDeals() }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 60,
    }),

    getBirthdayDeals: builder.query<BirthdayDeal[], void>({
      queryFn: async () => {
        try { return { data: await fetchBirthdayDeals() }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 1800,
    }),

    getSuggestiveItems: builder.query<SuggestiveItem[], { city: string; area: string }>({
      queryFn: async ({ city, area }) => {
        try { return { data: await fetchSuggestiveItems(city, area) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 300,
    }),

    getPendingOrders: builder.query<PendingOrder[], string>({
      queryFn: async (phone) => {
        try { return { data: await fetchPendingOrders(phone) }; } catch (e) { return err(e); }
      },
      providesTags: ['Orders'],
      keepUnusedDataFor: 60,
    }),

    getMyOrders: builder.query<Order[], string>({
      queryFn: async (phone) => {
        try { return { data: await fetchMyOrders(phone) }; } catch (e) { return err(e); }
      },
      providesTags: ['Orders'],
      keepUnusedDataFor: 60,
    }),

    getMyWallet: builder.query<number, string>({
      queryFn: async (phone) => {
        try { return { data: await fetchMyWallet(phone) }; } catch (e) { return err(e); }
      },
      providesTags: ['Wallet'],
      keepUnusedDataFor: 60,
    }),

    getCustomerInfo: builder.query<CustomerInfo | null, string>({
      queryFn: async (phone) => {
        try { return { data: await fetchCustomerInfo(phone) }; } catch (e) { return err(e); }
      },
      providesTags: ['Customer'],
      keepUnusedDataFor: 120,
    }),

    getGeoCodeArea: builder.query<GeoCodeResult, { lat: number; lng: number }>({
      queryFn: async ({ lat, lng }) => {
        try { return { data: await fetchGeoCodeArea(lat, lng) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 60,
    }),

    // ── Mutations ────────────────────────────────────────────────────────────
    checkNumber: builder.mutation<{ success: boolean; isNewCustomer?: boolean; message?: string }, string>({
      queryFn: async (phone) => {
        try { return { data: await checkNumber(phone) }; } catch (e) { return err(e); }
      },
    }),

    verifyCode: builder.mutation<
      { success: boolean; walletCode?: string; message?: string },
      { name: string; phone: string; email: string; code: string }
    >({
      queryFn: async ({ name, phone, email, code }) => {
        try { return { data: await verifyCode(name, phone, email, code) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Customer'],
    }),

    placeOrder: builder.mutation<{ success: boolean; orderId?: string; message?: string }, OrderPayload>({
      queryFn: async (payload) => {
        try { return { data: await placeOrder(payload) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Orders'],
    }),

    updateCustomerInfo: builder.mutation<boolean, { name: string; email: string; phone: string }>({
      queryFn: async ({ name, email, phone }) => {
        try { return { data: await updateCustomerInfo(name, email, phone) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Customer'],
    }),

    deleteAccount: builder.mutation<boolean, string>({
      queryFn: async (phone) => {
        try { return { data: await deleteAccount(phone) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Customer', 'Orders'],
    }),
  }),
});

export const {
  useGetMenuQuery,
  useGetProductOptionsQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useGetOutletsQuery,
  useGetPickupOutletsQuery,
  useGetBannersQuery,
  useGetBlogPostsQuery,
  useGetHotDealsQuery,
  useGetBirthdayDealsQuery,
  useGetSuggestiveItemsQuery,
  useGetPendingOrdersQuery,
  useLazyGetPendingOrdersQuery,
  useGetMyOrdersQuery,
  useGetMyWalletQuery,
  useGetCustomerInfoQuery,
  useCheckNumberMutation,
  useVerifyCodeMutation,
  usePlaceOrderMutation,
  useUpdateCustomerInfoMutation,
  useDeleteAccountMutation,
  useLazyGetGeoCodeAreaQuery,
} = broadwayApi;
