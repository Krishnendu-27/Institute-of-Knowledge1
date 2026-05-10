// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// const useUiStateStore = create(
//   persist(
//     (set, get) => ({
//       appName: "Institute-of-knowledge",
//       isDarkMode: false,
//       toggleDarkmode: () =>
//         set((state) => ({
//           isDarkMode: !state.isDarkMode,
//         })),
//     }),
//     {
//       name: "theme",
//     },
//   ),
// );

// export default useUiStateStore;

import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUiStateStore = create(
  persist(
    (set) => ({
      appName: "Institute-of-knowledge",
      theme: "system",
      setTheme: (newTheme) => set({ theme: newTheme }),
    }),
    {
      name: "ui-theme",
    },
  ),
);

export default useUiStateStore;
