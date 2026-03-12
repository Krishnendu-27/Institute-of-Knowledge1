import { create } from "zustand";

const useUiStateStore = create((set, get) => ({
  isLoginButtonclicked: false,
  setIsLoginButtonclicked: () =>
    set({ isLoginButtonclicked: !get().isLoginButtonclicked }),
}));

export default useUiStateStore;
