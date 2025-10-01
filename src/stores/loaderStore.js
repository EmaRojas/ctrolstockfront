import { defineStore } from 'pinia';

export const useLoaderStore = defineStore('loader', {
  state: () => ({
    loading: false
  }),
  actions: {
    show() { this.loading = true; },
    hide() { this.loading = false; }
  }
});
