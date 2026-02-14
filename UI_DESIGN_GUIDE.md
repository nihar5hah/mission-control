# Mission Control UI Design Guide

## Design Philosophy

The new UI follows a **Linear-inspired minimalist aesthetic** with refined details and smooth micro-interactions. The design emphasizes clarity, polish, and intentional whitespace over unnecessary decoration.

### Design System

**Typography**
- Display/Headings: Sora (600-700 weight) - Clean, modern sans-serif
- Body: Sora (400-500 weight) - Highly legible at all sizes
- Code: Source Code Pro - Monospace for technical content

**Color Palette**
- Background: `#0F0F0F` - Deep black with minimal contrast
- Foreground: `#FAFAFA` - Near white
- Primary: `#5E6AD2` - Calming blue (Linear-inspired)
- Success: `#5EAD5E` - Soft green
- Warning: `#D4A853` - Amber
- Danger: `#E55454` - Coral red
- Info/Running: `#5E8FAD` - Cool blue

**Spacing & Layout**
- Max width: 7xl (80rem) - Content never stretches too wide
- Padding: 6 units (24px) - Generous margins
- Gap sizes: 3 units (12px) between items
- Border radius: lg (8px) to xl (12px) - Soft corners

### Component Behaviors

**Cards & Containers**
- Background: `#161616` with `border-[#262626]`
- Hover state: Border brightens to `#333`, bg lightens to `#1A1A1A`
- Smooth 200ms transitions on all state changes

**Buttons**
- Primary: Blue gradient with hover lift effect
- Secondary: Subtle borders with bg change on hover
- All buttons scale down slightly on click (whileTap)

**Status Indicators**
- Completed: Green checkmark with solid color
- Running: Animated rotating lightning bolt
- Failed: Red circle with center dot
- Pending: Neutral circle outline

### Animations

All animations use Framer Motion for optimal performance.

**Page Transitions**
- TabVariants: Fade + subtle slide (300ms)
- Container stagger: 50ms between items (delayChildren: 0.1s)

**Micro-interactions**
- Hover: Cards slide right slightly (x: 4)
- Hover: Icons scale up (1.1x)
- Click: Buttons compress (scale: 0.95)
- Loading: Continuous 360° rotation (1s)

**Entrance Animations**
- Header: Slide down + fade (400ms)
- Tabs: Slide up + fade (400ms)
- Content items: Staggered slide up (40ms stagger)

### Interactive Elements

**Tab Navigation**
- Custom layout animation for active state
- Spring physics for smooth transitions
- Badge counts update in real-time

**Search Input**
- Focus ring appears with primary color
- Slight upward movement on hover
- Placeholder text hints at searchable fields

**Status Buttons**
- Color-coded backgrounds with 15% opacity
- Border colors match text colors
- Scale animation on hover

### Accessibility

- All interactive elements are keyboard accessible
- Focus states are clearly visible with ring color
- Color contrasts exceed WCAG AA standards
- Motion respects `prefers-reduced-motion`

### Customization Points

To change the overall aesthetic:

1. **Colors**: Update CSS variables in `globals.css`
2. **Fonts**: Change font imports at top of `globals.css`
3. **Animations**: Modify Framer Motion variants in `page.tsx`
4. **Spacing**: Adjust Tailwind padding/margin classes
5. **Borders**: Update border colors in card classes

### Performance Notes

- Framer Motion animations run on GPU (transform/opacity only)
- No heavy re-renders during animations
- Real-time data updates don't trigger full page re-renders
- Staggered animations prevent motion overload

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (GPU acceleration enabled)
- Mobile: Touch interactions fully supported
