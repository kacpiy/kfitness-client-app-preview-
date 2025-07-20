// import { ref } from 'vue';
// import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';

// export const transitionName = ref('slide-left');
// export const isViewTransitionAPISupported = ref(false);

// export function doVueOwnTransition(to: RouteLocationNormalized, from: RouteLocationNormalized) {
//   const toDepth = to.path.split('/').length;
//   const fromDepth = from.path.split('/').length;
//   transitionName.value = toDepth < fromDepth ? 'slide-right' : 'slide-left';
// }

// export async function tryViewAPITransition(
//   to: RouteLocationNormalized,
//   from: RouteLocationNormalized,
//   next: NavigationGuardNext
// ) {
//   const isReduced = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

//   if (!isReduced) {
//     if (isViewTransitionAPISupported.value) {
//       // Start the View Transition and then call next() immediately
//       document.startViewTransition(() => {
//         // You should perform any layout changes here, but next() is already called
//       });

//       // Call next() to proceed with the navigation immediately
//       next();

//       // Optional: you can track the end of the transition if needed
//       document.startViewTransition().finished.then(() => {
//         console.log("Transition finished with View Transitions API");
//       });
//     } else {
//       // Fallback: Perform regular transition and call next()
//       doVueOwnTransition(to, from);
//       next(); // Ensure next() is called in fallback as well
//     }
//   } else {
//     next(); // Call next() when reduced motion is preferred
//   }
// }

