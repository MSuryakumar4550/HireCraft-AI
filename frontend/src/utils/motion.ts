import type { Variants } from 'framer-motion'

export const motionTokens = {
  duration: { fast: 0.15, base: 0.2, slow: 0.3 },
  ease: [0.2, 0, 0, 1] as const,
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow, ease: motionTokens.ease } },
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease } },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.base, ease: motionTokens.ease } },
  exit: { opacity: 0, y: -8, transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease } },
}
