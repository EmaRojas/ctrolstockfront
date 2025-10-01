import Navbar from "./components/Navbar.vue";
import Loader from "./components/Loader.vue";
import { useLoaderStore } from "./stores/loaderStore";
export default (await import('vue')).defineComponent({
    components: { Navbar, Loader },
    setup() {
        const loader = useLoaderStore();
        return { loader };
    }
});
const __VLS_ctx = {};
let __VLS_elements;
const __VLS_componentsOption = { Navbar, Loader };
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_elements.div, __VLS_elements.div)({});
const __VLS_0 = {}.Loader;
/** @type {[typeof __VLS_components.Loader, ]} */ ;
// @ts-ignore
Loader;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    show: (__VLS_ctx.loader.loading),
}));
const __VLS_2 = __VLS_1({
    show: (__VLS_ctx.loader.loading),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
// @ts-ignore
[loader,];
const __VLS_5 = {}.Navbar;
/** @type {[typeof __VLS_components.Navbar, ]} */ ;
// @ts-ignore
Navbar;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
const __VLS_10 = {}.RouterView;
/** @type {[typeof __VLS_components.RouterView, typeof __VLS_components.routerView, ]} */ ;
// @ts-ignore
RouterView;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
var __VLS_dollars;
let __VLS_self;
