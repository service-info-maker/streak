import {writable} from "svelte/store";
import {PAGES} from "./shared"

export const currentPage = writable(PAGES.HOME);
export const currentMonth = writable("January");
export const currentBlog = writable("Introduction")
