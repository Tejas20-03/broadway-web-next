import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Product, Category, Area, Outlet, BlogPost } from '../types';
import {
  fetchMenuData,
  fetchAreas,
  fetchOutlets,
  fetchAllOutlets,
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
  fetchSavedAddresses,
  updateCustomerInfo,
  deleteAccount,
  deleteSavedAddress,
  checkNumber,
  verifyCode,
  placeOrder,
  submitContactUs,
  submitBirthdayEvent,
  submitCateringEvent,
  submitCorporateEvent,
  submitFranchiseRequest,
  fetchGeoCodeArea,
  checkVoucher,
  fetchOrderStatus,
  fetchReOrderDetails,
  type City,
  type HotDeal,
  type BirthdayDeal,
  type Order,
  type CustomerInfo,
  type SavedAddress,
  type PendingOrder,
  type SuggestiveItem,
  type OrderPayload,
  type GeoCodeResult,
  type VoucherResult,
  type OrderStatus,
  type ReOrderDetails,
  type ContactUsPayload,
  type BirthdayEventPayload,
  type CateringEventPayload,
  type CorporateEventPayload,
  type FranchiseRequestPayload,
} from '../services/api';

type CustomError = { status: 'CUSTOM_ERROR'; error: string };
const err = (e: unknown): { error: CustomError } => ({
  error: { status: 'CUSTOM_ERROR', error: String(e) },
});

export const broadwayApi = createApi({
  reducerPath: 'broadwayApi',
  baseQuery: fakeBaseQuery<CustomError>(),
  tagTypes: ['Orders', 'Customer', 'Wallet', 'Addresses'],
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

    getAllOutlets: builder.query<Outlet[], void>({
      queryFn: async () => {
        try { return { data: await fetchAllOutlets() }; } catch (e) { return err(e); }
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

    getHotDeals: builder.query<HotDeal[], string | void>({
      queryFn: async (city) => {
        try { return { data: await fetchHotDeals(city || 'Karachi') }; } catch (e) { return err(e); }
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

    getSavedAddresses: builder.query<SavedAddress[], string>({
      queryFn: async (phone) => {
        try { return { data: await fetchSavedAddresses(phone) }; } catch (e) { return err(e); }
      },
      providesTags: ['Addresses'],
      keepUnusedDataFor: 60,
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

    placeOrder: builder.mutation<{ success: boolean; orderId?: string; encOrderId?: string; deliveryTime?: string; orderAmount?: number; paymentUrl?: string; message?: string }, OrderPayload>({
      queryFn: async (payload) => {
        try { return { data: await placeOrder(payload) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Orders'],
    }),

    submitContactUs: builder.mutation<{ success: boolean; message?: string }, ContactUsPayload>({
      queryFn: async (payload) => {
        try { return { data: await submitContactUs(payload) }; } catch (e) { return err(e); }
      },
    }),

    submitBirthdayEvent: builder.mutation<{ success: boolean; message?: string }, BirthdayEventPayload>({
      queryFn: async (payload) => {
        try { return { data: await submitBirthdayEvent(payload) }; } catch (e) { return err(e); }
      },
    }),

    submitCateringEvent: builder.mutation<{ success: boolean; message?: string }, CateringEventPayload>({
      queryFn: async (payload) => {
        try { return { data: await submitCateringEvent(payload) }; } catch (e) { return err(e); }
      },
    }),

    submitCorporateEvent: builder.mutation<{ success: boolean; message?: string }, CorporateEventPayload>({
      queryFn: async (payload) => {
        try { return { data: await submitCorporateEvent(payload) }; } catch (e) { return err(e); }
      },
    }),

    submitFranchiseRequest: builder.mutation<{ success: boolean; message?: string }, FranchiseRequestPayload>({
      queryFn: async (payload) => {
        try { return { data: await submitFranchiseRequest(payload) }; } catch (e) { return err(e); }
      },
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

    deleteSavedAddress: builder.mutation<{ success: boolean; message?: string }, string>({
      queryFn: async (addressId) => {
        try { return { data: await deleteSavedAddress(addressId) }; } catch (e) { return err(e); }
      },
      invalidatesTags: ['Addresses'],
    }),

    // ── Voucher (CheckVoucherV2) ──────────────────────────────────────────────
    checkVoucher: builder.mutation<VoucherResult, {
      voucherCode: string;
      locationData: { ordertype: string | null; city: string | null; area: string | null; outlet: string | null };
      cartData: any[];
    }>({
      queryFn: async ({ voucherCode, locationData, cartData }) => {
        try { return { data: await checkVoucher(voucherCode, locationData, cartData) }; } catch (e) { return err(e); }
      },
    }),

    // ── Live order status polling (CheckOrderStatusV1) ────────────────────────
    getOrderStatus: builder.query<OrderStatus | null, string>({
      queryFn: async (orderId) => {
        try { return { data: await fetchOrderStatus(orderId) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 0,
    }),

    // ── ReOrder details (ReOrderV1) ───────────────────────────────────────────
    getReOrderDetails: builder.query<ReOrderDetails | null, string>({
      queryFn: async (orderId) => {
        try { return { data: await fetchReOrderDetails(orderId) }; } catch (e) { return err(e); }
      },
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGetMenuQuery,
  useGetProductOptionsQuery,
  useGetCitiesQuery,
  useGetAreasQuery,
  useGetOutletsQuery,
  useGetAllOutletsQuery,
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
  useGetSavedAddressesQuery,
  useCheckNumberMutation,
  useVerifyCodeMutation,
  usePlaceOrderMutation,
  useSubmitContactUsMutation,
  useSubmitBirthdayEventMutation,
  useSubmitCateringEventMutation,
  useSubmitCorporateEventMutation,
  useSubmitFranchiseRequestMutation,
  useUpdateCustomerInfoMutation,
  useDeleteAccountMutation,
  useDeleteSavedAddressMutation,
  useLazyGetGeoCodeAreaQuery,
  useCheckVoucherMutation,
  useGetOrderStatusQuery,
  useLazyGetOrderStatusQuery,
  useGetReOrderDetailsQuery,
} = broadwayApi;
