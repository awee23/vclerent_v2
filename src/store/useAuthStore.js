import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // State
  authMode: 'login', // 'login' | 'register'
  phone: '',
  otp: '',
  user: null,
  isVerified: false,
  step: 'welcome', // welcome | phone | otp | phone-verified | register | ktp | sim | terms | done | home | vehicle-detail

  // Selected vehicle for Phase 3 (Detail & Booking)
  selectedVehicle: null,

  // ─── Booking Activity Log ───────────────────────────────────────────────────
  // Each entry: { id, noTransaksi, vehicle, deliveryMethod, startDate, endDate,
  //   durationDays, durationLabel, deliveryLoc, deliveryCoords, pickupLoc,
  //   pickupCoords, grandTotal, serviceFee, discount, ppn, totalRentalPrice,
  //   insuranceCost, driverCost, deliveryFee, paymentStatus, status, rating,
  //   createdAt, customer }
  bookingLogs: [],

  addBookingLog: (entry) =>
    set((state) => ({
      bookingLogs: [entry, ...state.bookingLogs],
    })),

  updateBookingLogStatus: (id, status) =>
    set((state) => ({
      bookingLogs: state.bookingLogs.map((b) =>
        b.id === id ? { ...b, status } : b
      ),
    })),

  updateBookingLogRating: (id, rating) =>
    set((state) => ({
      bookingLogs: state.bookingLogs.map((b) =>
        b.id === id ? { ...b, rating } : b
      ),
    })),

  // Booking & Logistics Data (Phase 3)
  bookingData: {
    method: 'pickup', // 'pickup' | 'delivery'
    pickupLocation: 'Pool Viclerent Pusat, Jl. Sudirman No. 12, Jakarta',
    deliveryAddress: '',
    deliveryFee: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    durationDays: 1,
    insuranceFee: 50000,
    totalPrice: 0,
  },

  // Registration data
  userData: {
    namaLengkap: '',
    email: '',
    password: '',
    phone: '',
    nik: '',
    ktpNama: '',
    ktpTglLahir: '',
    ktpAlamat: '',
    ktpFile: null,
    simNomor: '',
    simNama: '',
    simMasaBerlaku: '',
    simAlamat: '',
    simJenis: '',
    simFile: null,
    servicePermissionsAgreed: false,
  },

  // Actions
  setAuthMode: (authMode) => set({ authMode }),
  setPhone: (phone) => set({ phone }),
  setOtp: (otp) => set({ otp }),
  setStep: (step) => set({ step }),
  setUser: (user) => set({ user }),
  setVerified: (val) => set({ isVerified: val }),
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  updateBookingData: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    })),
  updateUserData: (data) =>
    set((state) => ({
      userData: { ...state.userData, ...data },
    })),

  reset: () =>
    set({
      authMode: 'login',
      phone: '',
      otp: '',
      user: null,
      isVerified: false,
      step: 'welcome',
      selectedVehicle: null,
      bookingLogs: [],
      bookingData: {
        method: 'pickup',
        pickupLocation: 'Pool Viclerent Pusat, Jl. Sudirman No. 12, Jakarta',
        deliveryAddress: '',
        deliveryFee: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        durationDays: 1,
        insuranceFee: 50000,
        totalPrice: 0,
      },
      userData: {
        namaLengkap: '',
        email: '',
        password: '',
        phone: '',
        nik: '',
        ktpNama: '',
        ktpTglLahir: '',
        ktpAlamat: '',
        ktpFile: null,
        simNomor: '',
        simNama: '',
        simMasaBerlaku: '',
        simAlamat: '',
        simJenis: '',
        simFile: null,
        servicePermissionsAgreed: false,
      },
    }),
}))

export default useAuthStore
