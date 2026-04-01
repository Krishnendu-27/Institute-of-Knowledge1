import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUiStateStore = create(
  persist(
    (set, get) => ({
      appName: "Institute-of-knowledge",
      isDarkMode: false,
      toggleDarkmode: () =>
        set((state) => ({
          isDarkMode: !state.isDarkMode,
        })),
    }),
    {
      name: "theme",
    },
  ),
);

export default useUiStateStore;
