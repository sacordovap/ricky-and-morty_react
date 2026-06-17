import { create } from "zustand";
import { api } from "../../../common/services/api";

export const useCharacterStore = create((set, get) => ({
  characters: [],
  currentPage: 1,
  info: null,
  filters: { name: "", status: "", gender: "" },
  isLoading: false,

  fetchCharacters: async (page = 1) => {
    
    if (get().isLoading) return;
    set({ isLoading: true, currentPage: page });
    const activeFilters = Object.fromEntries(
      Object.entries(get().filters).filter(([_, v]) => v !== ""),
    );

    try {
      const response = await api.get("/character/", {
        params: { page, ...activeFilters },
      });
      set({
        characters: response.data.results || [],
        info: response.data.info,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching characters:", error);
      set({ characters: [], info: null, isLoading: false });
    }
  },

  fetchCharacterById: async (id) => {
    const { selectedCharacter, isLoading } = get();
    if (selectedCharacter && selectedCharacter.id === Number(id)) return;

    if (isLoading) return;

    set({ isLoading: true });
    try {
      const response = await api.get(`/character/${id}`);
      set({ selectedCharacter: response.data, isLoading: false });
    } catch (error) {
      console.error("Error fetching character:", error);
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    const nextFilters = { ...filters, ...newFilters };
    if (JSON.stringify(filters) === JSON.stringify(nextFilters)) return;

    set({ filters: nextFilters, currentPage: 1 });
    get().fetchCharacters(1);
  },
}));
