/**
 * Custom Heroicons resolver for unplugin-vue-components
 *
 * Automatically imports Heroicons based on naming conventions:
 *
 * @example
 * // 16x16 solid only
 * <UserIcon16 />        // imports from @heroicons/vue/16/solid
 * <ArrowRightIcon16 />  // imports from @heroicons/vue/16/solid
 *
 * @example
 * // 20x20 solid only
 * <UserIcon20 />        // imports from @heroicons/vue/20/solid
 * <ArrowRightIcon20 />  // imports from @heroicons/vue/20/solid
 *
 * @example
 * // 24x24 outline (default)
 * <UserIcon />          // imports from @heroicons/vue/24/outline
 * <UserIcon24 />        // imports from @heroicons/vue/24/outline
 * <ArrowRightIcon />    // imports from @heroicons/vue/24/outline
 *
 * @example
 * // 24x24 solid
 * <UserIcon24Solid />        // imports from @heroicons/vue/24/solid
 * <ArrowRightIcon24Solid />  // imports from @heroicons/vue/24/solid
 *
 * @returns {Object} Resolver configuration for unplugin-vue-components
 */
export function HeroiconsResolver() {
  return {
    type: 'component' as const,
    resolve: (name: string) => {
      // Match Heroicons pattern (IconName + Icon suffix)
      if (name.endsWith('Icon')) {
        // Handle different size and style variants
        if (name.endsWith('16Icon')) {
          // 16x16 solid only
          const iconName = name.slice(0, -6) + 'Icon' // Remove '16', keep 'Icon'
          return {
            name: iconName,
            from: '@heroicons/vue/16/solid',
          }
        } else if (name.endsWith('20Icon')) {
          // 20x20 solid only
          const iconName = name.slice(0, -6) + 'Icon' // Remove '20', keep 'Icon'
          return {
            name: iconName,
            from: '@heroicons/vue/20/solid',
          }
        } else if (name.endsWith('24SolidIcon')) {
          // 24x24 solid
          const iconName = name.slice(0, -10) + 'Icon' // Remove '24Solid', keep 'Icon'
          return {
            name: iconName,
            from: '@heroicons/vue/24/solid',
          }
        } else if (name.endsWith('24Icon')) {
          // 24x24 outline (default for 24)
          const iconName = name.slice(0, -6) + 'Icon' // Remove '24', keep 'Icon'
          return {
            name: iconName,
            from: '@heroicons/vue/24/outline',
          }
        } else {
          // Default: 24x24 outline
          return {
            name: name,
            from: '@heroicons/vue/24/outline',
          }
        }
      }
    },
  }
}
