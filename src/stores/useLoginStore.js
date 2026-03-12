import { create } from "zustand";

export const useLoginStore = create((set) => ({
  isOpen: false,
  step: 1, // 1: Email/Captcha, 2: OTP
  openModal: () => set({ isOpen: true, step: 1 }),
  closeModal: () => set({ isOpen: false }),
  nextStep: () => set({ step: 2 }),
}));
