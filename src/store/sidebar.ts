import { tr } from 'element-plus/es/locale';
import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
	state: () => {
		return {
			collapse: true
		};
	},
	getters: {},
	actions: {
		handleCollapse() {
			this.collapse = !this.collapse;
		}
	}
});
