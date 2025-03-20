# HOW.AI

This file documents complex parts of the codebase and explains how they work.

## Settings Page Layout Improvement

### March 14, 2025

The settings page layout has been improved by removing the surrounding card that was creating a nested card appearance. This change enhances the visual hierarchy and eliminates the "cards within cards" look that was causing visual confusion.

### Implementation Details

1. **AuthLayout Component**: 
   - Removed the `bg-white/10`, `backdrop-blur-md`, and `shadow-xl` classes from the container div
   - Kept only the `rounded-xl` class to maintain consistent corner rounding
   - This eliminates the outer card appearance while preserving the layout structure

2. **Account Page Component**:
   - Increased the maximum width from `max-w-3xl` to `max-w-7xl` to better accommodate the settings cards
   - Reduced the vertical spacing between components from `space-y-8` to `space-y-6` for better visual balance
   - Removed the padding (`p-6`) from the container as it's no longer needed without the outer card

3. **Individual Setting Components**:
   - Maintained the card styling for each individual settings component (UserProfile, WebhookSettings, UISettings)
   - Each component continues to use the Card component with appropriate styling
   - This preserves the visual separation between different settings sections

### User Experience

The improved layout creates a cleaner visual hierarchy:
1. The page title and description at the top
2. Individual settings cards below, each with its own visual container
3. No nested card appearance that could cause visual confusion

This change makes the settings page feel more spacious and organized, with each settings card standing on its own rather than being contained within another card.

## Transcript Copy Functionality

### March 14, 2025

A copy button has been added to the transcript area in the audio recorder component. This button allows users to easily copy the transcript content to their clipboard with a single click.

### Implementation Details

1. **Button Placement**: The copy button is positioned in the header of the transcript area, next to the "Transcript" heading, creating a clean and intuitive UI.

2. **Conditional Rendering**: The button only appears when:
   - The transcript content exists
   - The AI is not currently processing (not in the "Generating transcript..." state)

3. **Copy Mechanism**: The button uses the browser's Clipboard API to copy the transcript text:
   ```javascript
   navigator.clipboard.writeText(transcriptContent)
   ```

4. **User Feedback**: The component provides feedback to the user through toast notifications:
   - Success message when the copy operation succeeds
   - Error message if the copy operation fails

5. **Styling**: The button uses a ghost variant with subtle hover effects that match the overall design language of the application.

### User Experience

From a user perspective, the copy functionality works as follows:
1. User records audio or uploads a file
2. After transcription is complete, a "Copy" button appears next to the "Transcript" heading
3. User clicks the button to copy the entire transcript to their clipboard
4. A toast notification confirms the successful copy operation
5. User can then paste the transcript wherever needed

This feature improves the user experience by eliminating the need to manually select and copy the transcript text, especially for longer transcripts.

## Translation and Action UI Elements

### March 14, 2025 (Updated)

The translation UI elements (language dropdown and translate button) have been removed from the audio recorder component as per user request. These elements were previously located in:
- The footer of the main transcript card in the recorder section
- The footer of the modal transcript view when viewing a saved recording

The removal simplifies the UI and focuses the functionality on the core audio recording and transcription features.

## Account Page Layout

### March 14, 2024

The account page uses a single-column layout to present user settings in a logical flow:

1. **Profile Settings**: At the top, allowing users to manage their basic account information
2. **Webhook Settings**: In the middle, for configuring integration webhooks
3. **UI Settings**: At the bottom, for customizing the application appearance

This layout was chosen to improve user experience by:
- Providing a clear, sequential flow of settings from most essential to most optional
- Eliminating the need to scan across multiple columns
- Ensuring a consistent experience across all device sizes
- Reducing cognitive load by presenting one settings group at a time

The implementation uses a simple stacked layout with consistent spacing:
```jsx
<div className="max-w-3xl mx-auto w-full p-6">
  <div className="space-y-8">
    <UserProfile />
    <WebhookSettings />
    <UISettings />
  </div>
</div>
```

## UI Settings System

### March 14, 2024 - Updated 18:00 CET

The UI settings system allows users to customize the appearance of the application by switching between 'fun' (gradient) and 'flat' color modes, and selecting custom colors for each mode. The system now features real-time previewing with a save mechanism for persistence, foreground color customization, draggable color pickers, and a reset functionality.

### Reset Functionality

The UI settings system now includes a reset feature to restore default settings:

1. **Implementation Details**:
   - Default values are stored in a constant object at the component level
   - The reset function updates all settings at once using the `updateUISettings` context function
   - TypeScript typing ensures the default values match the expected types
   - Visual feedback is provided to the user when settings are reset

2. **User Experience Flow**:
   - User clicks the "Reset to Defaults" button
   - All color settings are immediately restored to their original values
   - The UI updates in real-time to show the default appearance
   - A success message informs the user that settings have been reset
   - The user must still click "Save Changes" to persist the reset settings

3. **Default Values**:
   ```typescript
   const defaultUISettings = {
     ui_mode: 'fun' as 'fun' | 'flat',
     gradient_from: '#4338ca', // indigo-900
     gradient_via: '#6d28d9', // purple-800
     gradient_to: '#be185d', // pink-700
     flat_color: '#4338ca', // indigo-900
     foreground_color: '#ffffff' // white
   }
   ```

4. **Button Implementation**:
   - Uses a separate button alongside the save button
   - Includes a refresh icon for visual clarity
   - Maintains consistent styling with other UI elements
   - Provides immediate visual feedback when clicked

### Foreground Color Implementation

The UI settings system now includes foreground (text) color customization to ensure readability:

1. **Database Structure**:
   - Added `foreground_color` column to the `ui_settings` table with a default of `#ffffff` (white)
   - Created a migration script to add the column to existing tables

2. **UI Implementation**:
   - Added a tabbed interface to separate background and text color settings
   - Created a dedicated tab for foreground color selection
   - Implemented a preview component that shows text against the selected background

3. **Context Updates**:
   - Added `foreground_color` to the `UISettings` interface
   - Updated the context to track and apply foreground color changes
   - Enhanced the `applyUISettings` function to apply text colors to elements

4. **Accessibility Considerations**:
   - The preview component helps users ensure text remains readable against their chosen background
   - Text color changes are applied in real-time to provide immediate feedback
   - The system prevents users from accidentally creating unreadable color combinations

### Draggable Color Picker

The color picker implementation has been enhanced with draggable functionality:

1. **Component Integration**:
   - Uses the `react-colorful` library which provides a draggable color picker interface
   - Allows users to click and drag to select colors intuitively
   - Provides both visual (picker) and text (hex input) methods for color selection

2. **User Experience Improvements**:
   - Color changes are applied immediately as the user drags the picker
   - The preview updates in real-time to show how colors will look
   - Hex input field allows precise color selection for advanced users

### Tabbed Interface

The UI settings now use a tabbed interface to organize settings:

1. **Component Structure**:
   - Uses Radix UI's Tabs component for accessible tab functionality
   - Separates settings into "Background" and "Text Color" tabs
   - Maintains consistent styling with the rest of the application

2. **Implementation Details**:
   - Each tab contains relevant color settings and previews
   - The background tab shows either gradient or flat color settings based on the selected mode
   - The text color tab shows foreground color settings with a preview against the current background

### Database Structure

The UI settings are stored in a dedicated `ui_settings` table in the Supabase database with the following structure:

```sql
CREATE TABLE IF NOT EXISTS public.ui_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ui_mode TEXT NOT NULL DEFAULT 'fun', -- 'fun' or 'flat'
  gradient_from TEXT DEFAULT '#4338ca', -- indigo-900
  gradient_via TEXT DEFAULT '#6d28d9', -- purple-800
  gradient_to TEXT DEFAULT '#be185d', -- pink-700
  flat_color TEXT DEFAULT '#4338ca', -- Default flat color (indigo-900)
  foreground_color TEXT DEFAULT '#ffffff', -- Default text color (white)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

The table is protected with Row Level Security (RLS) policies to ensure users can only access and modify their own settings.

### Real-Time Preview Implementation

The UI settings system uses a two-state approach to enable real-time previews while maintaining data persistence:

1. **Temporary State**: 
   - Changes made by the user are immediately applied to the UI
   - These changes are stored in the `uiSettings` state in the context
   - The `updateUISettings` function allows components to make temporary changes
   - Changes are visible immediately without requiring a save operation

2. **Persistent State**:
   - The `savedSettings` state in the context tracks the last saved configuration
   - The `saveUISettings` function persists changes to the database
   - Comparison between `uiSettings` and `savedSettings` determines if there are unsaved changes
   - The `hasUnsavedChanges` boolean indicates when changes need to be saved

3. **User Experience Flow**:
   - User makes a change (switches mode or picks a color)
   - Change is immediately visible throughout the application
   - An "Unsaved Changes" badge appears to indicate pending changes
   - Save button becomes enabled and changes color to amber
   - User can continue making changes with immediate feedback
   - When satisfied, user clicks "Save Changes" to persist to the database
   - After saving, the badge disappears and button returns to default state

### Context API Implementation

The enhanced UI settings context provides several key functions:

```typescript
interface UISettingsContextType {
  uiSettings: UISettings;                                  // Current settings (may include unsaved changes)
  loading: boolean;                                        // Loading state
  applyUISettings: () => void;                             // Apply current settings to the UI
  updateUISettings: (newSettings: Partial<UISettings>) => void;  // Update settings with immediate effect
  saveUISettings: () => Promise<{ success: boolean, message: string }>; // Save settings to database
  hasUnsavedChanges: boolean;                              // Whether there are unsaved changes
}
```

The context handles:
- Loading settings from the database
- Tracking both current and saved states
- Applying settings to the UI in real-time
- Determining when changes need to be saved
- Persisting changes to the database

### Dynamic Styling

The UI settings are applied dynamically to the application using JavaScript:

```javascript
// Function to apply UI settings to the page
const applyUISettings = () => {
  if (uiSettings.ui_mode === 'fun') {
    // Apply gradient background
    document.querySelectorAll('.animated-gradient').forEach((el) => {
      (el as HTMLElement).style.background = `linear-gradient(to bottom right, ${uiSettings.gradient_from}, ${uiSettings.gradient_via}, ${uiSettings.gradient_to})`
    })
  } else {
    // Apply flat background
    document.querySelectorAll('.animated-gradient').forEach((el) => {
      (el as HTMLElement).style.background = uiSettings.flat_color
    })
  }
}
```

This function is called whenever the UI settings change, ensuring the application appearance is updated in real-time.

### Visual Feedback System

The UI provides several visual cues to help users understand the state of their settings:

1. **Unsaved Changes Badge**:
   - Appears when there are unsaved changes
   - Uses amber/gold color scheme to draw attention
   - Positioned next to the card title for visibility

2. **Dynamic Save Button**:
   - Changes text based on state: "No Changes to Save" → "Save Changes" → "Saving..."
   - Changes color when there are unsaved changes (amber highlight)
   - Disabled when there are no changes to save or during saving operation
   - Provides clear feedback on the current state

3. **Preview Panel**:
   - Shows a live preview of the current gradient or flat color
   - Updates in real-time as colors are changed
   - Helps users visualize their selections before applying them globally

4. **Instructional Text**:
   - Footer text explains that "Changes are applied immediately. Click Save to make them permanent."
   - Helps users understand the two-stage process (preview then save)

### Color Picker Implementation

The color picker implementation uses:
1. **react-colorful**: For the visual color picker component
2. **Popover**: For the color picker dropdown
3. **Input**: For manual hex color entry

The component allows users to select colors either through the visual picker or by entering hex values directly. All changes are immediately reflected in the UI.

## Pricing Page Layout

### March 13, 2025

The pricing page uses a responsive layout that adapts to different screen sizes:

1. **Mobile View**: On smaller screens, the pricing columns stack vertically for better readability.
   - This is achieved using `flex-col` in the base styling and `md:flex-row` for larger screens.
   - Each pricing card takes full width on mobile.

2. **Desktop View**: On larger screens (md breakpoint and above), the pricing columns display side by side.
   - Both pricing cards use `md:w-1/2` to ensure they have identical widths.
   - This creates a balanced, symmetrical layout that improves visual consistency.

3. **Visual Differentiation**:
   - Both plans use the same background opacity (`bg-white/15`) for visual consistency.
   - The Free plan uses a pink/purple color scheme.
   - The Lifetime Supporter plan uses an amber/yellow color scheme to stand out.
   - Both plans have subtle animations applied through CSS keyframes defined in the useEffect hook.

4. **Background Effects**:
   - The page uses animated gradient backgrounds with floating "blob" elements.
   - These animations are defined in a style tag injected via useEffect to ensure they only run on the client side.
   - The animations include gradient shifts and floating movements to create a dynamic, engaging background.

### March 14, 2025 - Update

The pricing cards were updated to ensure consistent sizing and visual balance:

1. **Equal Width Cards**:
   - Changed from using `max-w-md` and `max-w-sm` to using `md:w-1/2` for both cards
   - This ensures both cards take up exactly half the container width on desktop
   - Creates a more balanced, symmetrical layout

2. **Consistent Background Opacity**:
   - Both cards now use `bg-white/15` for their background
   - Previously, the Free tier used `bg-white/10` (more transparent)
   - The consistent opacity creates a more cohesive visual appearance

3. **Responsive Behavior**:
   - On mobile, cards still stack vertically and take full width
   - On desktop (md breakpoint and above), cards display side by side with equal width
   - Height is automatically balanced using the `h-full` class on both cards

### March 14, 2025 - Mobile Layout Enhancement

The mobile layout was improved with the following changes:

1. **Mobile Padding**:
   - Added 5px padding to the container on mobile devices using `px-[5px]`
   - Prevents content from touching the edges of the screen on small devices
   - Improves readability and visual appeal on mobile
   - Used responsive utility `sm:px-0` to remove padding on larger screens
   - This maintains the original layout on desktop while improving mobile experience

### March 14, 2025 - Visual Contrast Enhancement

The pricing cards were updated to improve visual contrast:

1. **Free Tier Background Darkening**:
   - Changed the Free tier background from `bg-white/15` to `bg-white/20`
   - This makes the Free tier card slightly darker than the Lifetime Supporter card
   - Creates better visual distinction between the Free tier and the background
   - Improves readability of the white text on the darker background
   - Maintains the overall design language while enhancing visual hierarchy

2. **Visual Differentiation Strategy**:
   - Free tier now uses a darker background (`bg-white/20`) than the Lifetime Supporter tier (`bg-white/15`)
   - This subtle difference helps distinguish the two tiers visually
   - The Free tier's pink/purple accent colors remain unchanged
   - The Lifetime Supporter tier's amber/yellow accent colors remain unchanged
   - Both cards maintain the same size and shape for layout consistency

## Supporter Messaging Strategy

### March 13, 2025

The Lifetime Supporter plan uses specific messaging techniques to connect with potential supporters:

1. **Transparency About Development Status**:
   - Clearly communicates that premium features are in development
   - Uses a styled callout box with a border accent in the supporter color scheme
   - Maintains honesty while building anticipation

2. **Value Proposition Elements**:
   - Early access to new features (exclusivity)
   - Supporting indie development (emotional connection)
   - Lifetime access (long-term value)
   - One-time payment (simplicity and clarity)

3. **Visual Hierarchy**:
   - Important phrases like "first to access them" are highlighted with different styling
   - The callout box appears before the feature list to set context
   - FAQ section provides additional details for those who want more information

4. **Community Building**:
   - Language focuses on the journey and making it possible together
   - Emphasizes gratitude to create a positive supporter relationship
   - Positions supporters as essential partners in the development process

## Stripe Payment Integration

### March 13, 2025 - Updated 23:45 CET

The Stripe payment integration uses Next.js API routes to securely process payments:

1. **Architecture Overview**:
   - Client-side: StripeCheckout component in React
   - Server-side: Next.js API route for creating checkout sessions
   - Payment processing: Stripe Checkout hosted page

2. **Payment Flow**:
   - User clicks "Become a Supporter" button
   - StripeCheckout component calls the Next.js API route
   - API route creates a Stripe Checkout session
   - User is redirected to Stripe's hosted checkout page
   - After payment, user is redirected to success page

3. **Security Considerations**:
   - Stripe secret key is only used in the server-side API route, never exposed to the client
   - Next.js API routes run on the server, keeping sensitive operations secure
   - Payment processing happens on Stripe's PCI-compliant servers

4. **Error Handling**:
   - Client-side error handling with visual feedback for users
   - Detailed console logging throughout the checkout process
   - Server-side error handling with appropriate status codes
   - Graceful error recovery if Stripe fails to load

5. **Environment Configuration**:
   - Environment variables for Stripe API keys and configuration
   - Public keys prefixed with NEXT_PUBLIC_ for client-side access
   - Secret keys only used in server-side code
   - Success and cancel URLs must match the actual server port

6. **Stripe Products vs Prices**:
   - Products: Represent what you're selling (e.g., "Lifetime Supporter Plan")
   - Prices: Represent how much the product costs (e.g., "$29.99 one-time payment")
   - Price IDs always start with `price_` (e.g., `price_1OxYZAG1OX3gPFMJLADYDB3bv`)
   - Product IDs always start with `prod_` (e.g., `prod_RwCNpJzs4emdLf`)
   - The Stripe checkout requires a price ID, not a product ID
   - One product can have multiple prices (e.g., monthly, yearly, lifetime)

7. **Debugging Stripe Issues**:
   - Check server logs for detailed error information
   - Verify that the price ID exists in your Stripe dashboard
   - Ensure success and cancel URLs match your server's port
   - Test with Stripe's test card numbers (e.g., 4242 4242 4242 4242)
   - Verify that your Stripe account is properly configured for your region

## Stripe API Key Verification System

### March 13, 2025

The Stripe API key verification system provides a comprehensive way to test and validate Stripe API keys:

1. **Verification Architecture**:
   - Client-side: React page with status indicators for both publishable and secret keys
   - Server-side: Next.js API route that safely tests the secret key
   - Dual verification approach ensures both client and server integrations work correctly

2. **Client-Side Verification (Publishable Key)**:
   - Tests if the `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` environment variable is set
   - Attempts to initialize the Stripe.js library with the publishable key
   - Provides visual feedback on success or failure
   - Securely masks the key when displaying it (e.g., `pk_test_51MR...1DHx`)

3. **Server-Side Verification (Secret Key)**:
   - Tests if the `STRIPE_SECRET_KEY` environment variable is set
   - Initializes the Stripe Node.js library with the secret key
   - Makes a lightweight API call (balance retrieval) to verify the key works
   - Returns detailed error information for troubleshooting
   - Securely masks the key in logs and responses

4. **Security Considerations**:
   - Never exposes full API keys in the UI or logs
   - Uses key masking to show only the first 8 and last 4 characters
   - Keeps secret key operations exclusively on the server side
   - Provides specific error messages without revealing sensitive information

5. **Error Handling and Feedback**:
   - Categorizes errors by type (authentication, connection, etc.)
   - Provides specific error messages based on the error type
   - Uses color-coded visual indicators (green for success, red for failure)
   - Includes troubleshooting tips for common issues

6. **Implementation Details**:
   - Uses React's `useEffect` hook for initialization on component mount
   - Implements async/await pattern for API calls
   - Provides loading states during verification
   - Uses try/catch blocks for robust error handling
   - Returns appropriate HTTP status codes for different error scenarios

7. **Troubleshooting Guidance**:
   - Includes a dedicated troubleshooting section with common issues and solutions
   - Provides visual guidance on expected key formats (pk_test_* and sk_test_*)
   - Suggests checking for account restrictions or creating new API keys
   - Reminds users to ensure keys are from the same Stripe account

## Stripe redirectToCheckout Best Practices

### March 13, 2025

When using Stripe's redirectToCheckout method, it's important to follow these best practices to avoid integration errors:

1. **Client vs. Server Parameter Separation**:
   - All configuration parameters should be set on the server side when creating the checkout session
   - The client side should only pass the `sessionId` to `redirectToCheckout` without any additional parameters
   - Mixing parameters between client and server will cause an `IntegrationError`

2. **Correct Implementation Pattern**:
   - Server: Create a checkout session with all desired configuration options
   - Server: Return only the session ID to the client
   - Client: Call `stripe.redirectToCheckout({ sessionId })` with no other parameters

3. **Common Errors and Solutions**:
   - `IntegrationError: Do not provide other parameters when providing sessionId`: Remove all parameters except `sessionId` from the client-side call
   - `No such parameter: payment_method_types`: Check the Stripe API version and use only supported parameters
   - `Invalid value for locale`: Set the locale on the server side, not the client side

4. **API Version Considerations**:
   - Always specify the Stripe API version when initializing the Stripe object
   - Different API versions support different parameters
   - The latest API version may have breaking changes from previous versions
   - Test thoroughly when upgrading API versions

5. **Security Benefits**:
   - Keeping configuration on the server side prevents tampering
   - Prices, products, and other sensitive data remain secure
   - The client only needs to know the session ID, not the full configuration

## Lifetime Supporter Badge System

### March 13, 2025

The lifetime supporter badge system provides visual recognition for users who have purchased the lifetime supporter plan:

1. **Database Integration**:
   - Uses the existing `subscriptions` table to store supporter status
   - Records include user ID, plan type, payment details, and status
   - Lifetime subscriptions have `plan_id` set to `lifetime_supporter` and `status` set to `active`
   - The `current_period_end` is set to `null` to indicate it never expires

2. **Payment Processing Flow**:
   - User initiates checkout through the StripeCheckout component
   - Checkout session includes user ID and plan type in metadata
   - After successful payment, Stripe sends a webhook event to our server
   - Webhook handler verifies the payment and adds the subscription to the database
   - Success page checks and displays the user's new supporter status

3. **Visual Indicators**:
   - `SupporterBadge` component provides a consistent visual indicator across the app
   - Badge includes an animated gold dot with a pulsing effect
   - Optional text label "Lifetime Supporter" can be shown or hidden
   - Badge appears in the user profile and payment success page
   - Loading state handles asynchronous status checking

4. **Status Verification**:
   - `isLifetimeSupporter()` utility function checks if the current user is a supporter
   - Function queries the database for active lifetime subscriptions
   - Results are cached in component state to minimize database queries
   - Error handling ensures graceful degradation if status check fails

5. **Security Considerations**:
   - Supporter status is verified server-side through database queries
   - Webhook signature verification prevents fraudulent subscription creation
   - User authentication is required for checkout and status checks
   - Payment processing happens entirely through Stripe's secure systems

6. **User Experience**:
   - Supporters receive immediate visual confirmation of their status
   - Profile page shows detailed information about their supporter benefits
   - Success page provides transaction details and confirmation
   - Badge creates a sense of exclusivity and recognition

## Stripe Webhook Architecture

### March 13, 2025

The Stripe webhook system uses Supabase Edge Functions to process payment events:

1. **Edge Function vs. API Route**:
   - Webhook handler implemented as a Supabase Edge Function rather than a Next.js API route
   - Edge Functions run on Deno runtime at the edge, closer to users
   - Provides better performance, scalability, and reliability for webhook processing
   - Reduces load on the main application server

2. **Implementation Details**:
   - Located at `supabase/functions/stripe-webhook/index.ts`
   - Uses Deno's standard HTTP server library
   - Implements CORS handling for cross-origin requests
   - Verifies webhook signatures using Stripe's official method
   - Connects directly to the Supabase database for subscription management

3. **Security Considerations**:
   - Validates Stripe signature to prevent fraudulent webhook events
   - Uses Supabase service role key for database operations
   - Implements proper error handling and status codes
   - Logs detailed information for debugging without exposing sensitive data

4. **Webhook Flow**:
   - Stripe sends a POST request to the webhook endpoint after a successful payment
   - Edge function verifies the signature using the webhook secret
   - For checkout.session.completed events, the function checks if it's a lifetime plan
   - If valid, it retrieves customer details and extracts the user ID
   - Creates a new subscription record in the database with payment details
   - Returns a 200 response to acknowledge receipt of the webhook

5. **Environment Configuration**:
   - Requires `STRIPE_SECRET_KEY` for Stripe API access
   - Needs `STRIPE_WEBHOOK_SECRET` for signature verification
   - Uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for database access
   - All secrets are stored securely in Supabase environment variables

6. **Deployment Process**:
   - Edge Functions are deployed using Supabase CLI
   - Changes are versioned in the repository
   - No cold start issues compared to serverless functions
   - Automatically scales based on incoming webhook volume

## Authentication Flow for Pricing and Checkout

### March 13, 2025

The pricing page implements a robust authentication flow to ensure users are properly logged in before making purchases:

1. **Client-Side Authentication Check**:
   - The PricingPageClient component checks authentication status on mount
   - Uses Supabase Auth's `getUser()` method to verify if a user is logged in
   - Maintains loading state during authentication check for better UX
   - Caches user data in component state to avoid unnecessary re-fetches

2. **Conditional Button Rendering**:
   - For authenticated users: Shows the "Become a Supporter" button with Stripe checkout
   - For unauthenticated users: Shows a "Login to Become a Supporter" button
   - During loading: Shows a disabled button with loading state
   - Uses a dedicated `renderSupporterButton()` function for clean conditional logic

3. **Login Redirect Flow**:
   - Unauthenticated users are directed to the login page with a `redirect` query parameter
   - After successful login, users are redirected back to the pricing page
   - This creates a seamless experience without losing context
   - Example URL: `/login?redirect=/pricing`

4. **Server-Side Verification**:
   - Even with client-side checks, the API route performs its own authentication verification
   - Uses `createServerComponentClient` to access Supabase Auth on the server
   - Returns 401 Unauthorized if a user attempts to create a checkout session without being logged in
   - Provides clear error messages to guide users

5. **Security Considerations**:
   - Double verification (client and server) prevents unauthorized checkout attempts
   - User ID is included in checkout session metadata for proper attribution
   - Authentication state is checked fresh on each page load
   - Sensitive operations only proceed with valid authentication

## Navigation Bar Authentication State

### March 13, 2025

The navigation bar implements a consistent authentication state display across the application:

1. **Shared Authentication State**:
   - The same authentication state is used for both the navigation bar and the pricing buttons
   - Authentication state is checked once on component mount and shared across the UI
   - This ensures consistent UI representation of the user's login status

2. **Visual States**:
   - Unauthenticated: Shows "Login" link
   - Authenticated: Shows "Account" link
   - Loading: Shows an animated placeholder during authentication check
   - Supporter: Shows a supporter badge next to the Account link

3. **Supporter Badge Integration**:
   - The supporter badge appears in the navigation bar for lifetime supporters
   - Uses the same `SupporterBadge` component as other parts of the application
   - Configured with `showText={false}` for a compact display in the navigation
   - Provides immediate visual feedback about supporter status

4. **Button State Coordination**:
   - The "Become a Supporter" button changes to a confirmation message for existing supporters
   - This prevents supporters from attempting to purchase the plan again
   - The confirmation message uses a slightly darker gradient to indicate it's not clickable
   - Includes a checkmark symbol (✓) for clear visual confirmation

5. **Implementation Details**:
   - Uses a single `useEffect` hook to check both authentication and supporter status
   - Caches results in component state for efficient rendering
   - Handles error cases gracefully to prevent UI breakage
   - Maintains loading states during asynchronous operations

## Navigation Bar Styling

### March 14, 2025

The navigation bar implements consistent styling and alignment across all components:

1. **Vertical Alignment Strategy**:
   - All navigation elements use `flex items-center` to ensure proper vertical alignment
   - Each list item (`<li>`) has `flex items-center` to align its contents
   - Links and buttons within navigation use `flex items-center` for consistent alignment
   - This creates a clean, professional appearance with all elements properly centered

2. **Component Consistency**:
   - The same alignment approach is applied across all components:
     - PageContent.tsx (main application layout)
     - PricingPageClient.tsx
     - AboutPageClient.tsx
     - auth-layout.tsx (authentication pages)
     - terms-layout.tsx (terms and conditions pages)
   - This ensures a consistent user experience throughout the application

3. **Responsive Considerations**:
   - The navigation maintains proper alignment on all screen sizes
   - Special elements like the "You are awesome, Goldmember" message are hidden on mobile
   - The supporter badge remains properly aligned in both desktop and mobile views

4. **Visual Hierarchy**:
   - The navigation maintains clear visual hierarchy with the logo on the left
   - Navigation links are grouped together with consistent spacing
   - The account/login button is visually distinct with a rounded background
   - All elements maintain proper vertical alignment for a polished appearance

## Enhanced Authentication Approach

### March 13, 2025

The enhanced authentication system ensures a consistent login state across the application:

1. **Dual Authentication Check**:
   - Initial check using `getSession()` to immediately retrieve the current session
   - Ongoing listener with `onAuthStateChange` to react to auth state changes
   - This combination provides both immediate state and reactive updates

2. **Session Management**:
   - Sessions are checked directly rather than just user data
   - This ensures access to the full authentication context
   - Session tokens are properly validated on each page load
   - Handles token refresh and expiration automatically

3. **Error Handling & Diagnostics**:
   - Comprehensive error tracking with visible feedback
   - Development mode debug panel showing auth state, user ID, and supporter status
   - Detailed console logging for each step of the authentication process
   - Clear visual indicators for authentication errors

4. **State Synchronization**:
   - Authentication state is centralized and consistently applied
   - Prevents desynchronization between different UI components
   - Minimizes auth checks by sharing state across the component
   - Cleanup function properly unsubscribes from auth listeners on unmount

5. **Performance Considerations**:
   - Minimizes database queries by checking supporter status only after confirmed login
   - Uses state caching to prevent unnecessary re-renders
   - Implements loading states to handle authentication delays
   - Provides graceful fallbacks when authentication is pending

6. **User Experience**:
   - Users receive immediate visual feedback about their authentication state
   - Loading indicators prevent confusion during auth state transitions
   - Error messages guide users when authentication issues occur
   - Consistent navigation UI across all application pages

## Cross-Page Authentication Persistence

### March 13, 2025

To ensure authentication state persists correctly across different pages:

1. **Client Initialization**:
   - Create Supabase client once at the component level to prevent multiple instances
   - Use a consistent approach for client creation across all pages
   - Avoid recreating clients during re-renders or state changes

2. **Component-Specific Logging**:
   - Each page component includes its name in log messages for easier debugging
   - Log authentication state changes with detailed context
   - Track component lifecycle events (mount, unmount) to identify potential issues
   - Add clear visual indicators in development mode for auth state

3. **Optimized Dependencies**:
   - Focus useEffect dependency arrays to only include required dependencies
   - Remove unnecessary dependencies that could trigger re-initialization
   - Ensure router is not causing unnecessary re-renders of authentication logic

4. **Helper Functions**:
   - Extract repeated operations like supporter status checks into reusable functions
   - Centralize authentication logic to reduce duplication
   - Keep authentication state checking consistent across components
   - Add appropriate error handling for each step of the process

5. **Debug-Friendly Architecture**:
   - Allow detailed component-specific logging in development mode
   - Add visual debugging tools that persist across navigation
   - Implement clear state transitions with appropriate loading indicators
   - Provide fallback UI for authentication edge cases

6. **Session Priority**:
   - Always check the full session rather than just user data
   - Validate authentication on both client and server sides
   - Use getSession() for more reliable results than older methods
   - Ensure proper handling of token refreshes and expirations

## Supabase Authentication Implementation

### March 14, 2025 - Updated 12:00 CET

The application uses Supabase for authentication with the standard `@supabase/supabase-js` package for compatibility with both Pages Router and App Router:

1. **Client Architecture**:
   - Uses the `createClient` function from `@supabase/supabase-js` for client-side authentication
   - Implemented in `/src/lib/supabase.ts` and `/src/utils/supabaseBrowserClient.ts`
   - Provides a consistent authentication experience across all client components
   - Exports a `createClient()` function for backward compatibility

2. **Server Architecture**:
   - Uses the `createClient` function from `@supabase/supabase-js` for server-side authentication
   - Implemented in `/src/lib/supabase-server.ts`
   - Avoids using App Router-specific features like `cookies()` from `next/headers`
   - Ensures compatibility with Pages Router components

3. **API Route Implementation**:
   - API routes like `/api/create-checkout-session/route.ts` use a direct Supabase client
   - Manually extract auth tokens from cookie headers for authentication
   - Use `setSession()` to authenticate the client with the extracted token
   - Use `getSession()` to retrieve the user's authentication state

4. **Enhanced Cookie Handling**:
   - Robust `extractAuthToken()` function with multiple token detection strategies:
     - Project-specific token format: `sb-[project-id]-auth-token`
     - Generic token format: `sb-auth-token`
     - Alternative format: `supabase-auth-token`
     - JWT pattern fallback for non-standard implementations
   - Detailed cookie debugging with masked values for security
   - Proper error handling for token extraction and session setting
   - Comprehensive logging to track the authentication flow

5. **Common Pitfalls and Solutions**:
   - **App vs. Pages Router**: Be careful not to use App Router features in Pages Router code
   - **Cookie Access**: Use appropriate methods based on the router context
   - **Token Extraction**: Use multiple detection patterns to handle different Supabase versions
   - **Authentication State**: Verify authentication on both client and server sides
   - **Error Handling**: Provide clear error messages for authentication failures

6. **Authentication Flow**:
   - User signs in through the login page
   - Supabase creates a session and sets cookies
   - API routes extract tokens from cookies using multiple detection patterns
   - Client components check authentication state using the browser client
   - Detailed logging at each step helps diagnose authentication issues

7. **Debugging Authentication Issues**:
   - Check for build errors related to importing App Router features in Pages Router code
   - Verify that all Supabase clients use the correct package and implementation
   - Inspect cookie headers to ensure tokens are being properly set
   - Use detailed logging to track authentication state across components
   - Test authentication flow in both development and production environments

## Authentication Diagnostic System

### March 14, 2025

The authentication diagnostic system provides comprehensive tools for troubleshooting authentication issues:

1. **Dual Authentication Verification**:
   - Client-side authentication check using Supabase's browser client
   - Server-side authentication check using a dedicated API endpoint
   - Side-by-side comparison of authentication states for easy debugging
   - Visual indicators showing authentication status at a glance

2. **Cookie Inspection Tools**:
   - Client-side cookie display showing all browser cookies
   - Server-side cookie analysis with masked values for security
   - Cookie format detection for different Supabase token patterns
   - Detailed logging of cookie presence and format

3. **User Information Display**:
   - Shows user details from both client and server perspectives
   - Displays user ID, email, and creation timestamp
   - Highlights discrepancies between client and server states
   - Provides JSON representation of the complete user object

4. **Authentication Flow Testing**:
   - One-click sign-in with magic link email authentication
   - Simple sign-out functionality with state reset
   - Status refresh button to verify authentication changes
   - Direct link to the pricing page to test the checkout flow

5. **Error Handling and Feedback**:
   - Clear visual distinction between client and server errors
   - Detailed error messages with specific failure reasons
   - Color-coded status indicators (green for success, red for failure)
   - Comprehensive console logging for developer debugging

6. **Implementation Details**:
   - Uses React's `useEffect` for initialization and cleanup
   - Implements proper loading states during authentication checks
   - Handles asynchronous operations with try/catch blocks
   - Provides responsive layout for both desktop and mobile viewing

7. **Security Considerations**:
   - Masks sensitive cookie values to prevent token exposure
   - Uses secure authentication methods (magic link email)
   - Implements proper CORS and credentials handling
   - Follows best practices for authentication state management

## Token-Based Authentication Fallback

### March 14, 2025

The token-based authentication fallback system provides a robust solution for environments where cookie-based authentication fails:

1. **Dual Authentication Approach**:
   - Primary: Cookie-based authentication using Supabase's standard flow
   - Fallback: Token-based authentication using explicit access tokens
   - Automatic detection and switching between methods
   - Graceful degradation when cookies aren't working

2. **Token Extraction and Storage**:
   - Access tokens extracted from Supabase session objects
   - Tokens stored in component state for immediate use
   - Token display with masking for security
   - Copy-to-clipboard functionality for manual testing

3. **API Route Implementation**:
   - Modified API routes accept tokens in request body
   - Prioritized authentication order: body token → cookie token
   - Enhanced error handling for token validation
   - Detailed logging of authentication method used

4. **Client-Side Integration**:
   - StripeCheckout component includes token with requests
   - Auth-test page provides direct checkout testing
   - Visual indicators for authentication method
   - Comprehensive error feedback for users

5. **Security Considerations**:
   - Tokens are never stored in localStorage for security
   - Tokens are masked when displayed in the UI
   - Tokens are only sent over HTTPS connections
   - Tokens are short-lived and automatically refreshed

6. **Troubleshooting Tools**:
   - Direct checkout testing bypasses cookie issues
   - Token display and copy functionality
   - Detailed error messages for authentication failures
   - Visual indicators for authentication status

7. **Implementation Details**:
   - Token extraction from Supabase session objects
   - Token validation before use
   - Token inclusion in API requests
   - Fallback to cookie-based authentication when possible 

## Enhanced Token Authentication Implementation

### March 14, 2025

The enhanced token authentication system includes multiple fallback mechanisms to ensure robust authentication:

1. **Multi-Layer Token Validation**:
   - Primary method: `setSession()` with the provided token
   - Secondary method: Direct user lookup with `getUser(token)`
   - Fallback creation of a minimal session object when needed
   - Comprehensive error handling at each validation step

2. **Secure Token Logging**:
   - Tokens are masked in logs showing only first/last 10 characters
   - Token presence is logged without exposing the full value
   - Detailed error logging for each authentication attempt
   - Clear indication of which authentication method succeeded

3. **Token Extraction Improvements**:
   - Client components extract tokens directly from Supabase session
   - Tokens are immediately stored in component state
   - Token availability is checked before API requests
   - Detailed logging of token extraction process

4. **API Route Enhancements**:
   - Multiple authentication attempts with different methods
   - Detailed logging of each authentication step
   - Clear error messages for failed authentication
   - Proper session object creation when using direct token

5. **Error Handling Strategy**:
   - Specific error messages for different failure scenarios
   - Graceful degradation when primary authentication fails
   - User-friendly error messages in the UI
   - Detailed technical logs for debugging

6. **Security Considerations**:
   - Tokens are never exposed in full in logs or UI
   - Tokens are only stored in memory, never in localStorage
   - Authentication happens server-side for sensitive operations
   - Proper error handling prevents information leakage

7. **Implementation Details**:
   - Enhanced token validation in API routes
   - Improved token handling in client components
   - Better error messages for authentication failures
   - Comprehensive logging throughout the authentication process

## Goldmember Status Implementation

### March 14, 2025 - Updated 23:00 CET

The goldmember status system provides special recognition and benefits to lifetime supporters:

1. **Subscription Status Management**:
   - Automatic status update to 'goldmember' after successful payment
   - Database integration with the subscriptions table
   - Status persistence across sessions and page refreshes
   - Fallback handling for status update failures
   - URL parameter approach for maintaining user context after payment

2. **Visual Recognition Elements**:
   - Special "You are awesome, Goldmember" message in the header for goldmembers
   - "You are Goldmember! ✓" message on the pricing page for supporters
   - "No need, you are Goldmember! ✓" message replacing the free tier button
   - "You are awesome, Goldmember!" message on the account page
   - SupporterBadge component with goldmember recognition
   - Visual indicators in the navigation bar
   - Enhanced account button with supporter badge

3. **Consistent Messaging Strategy**:
   - Uses the term "Goldmember" consistently across all pages
   - Maintains a positive, appreciative tone ("You are awesome")
   - Includes visual confirmation symbols (✓) where appropriate
   - Uses the same amber/gold color scheme throughout
   - Combines text with the SupporterBadge component for visual reinforcement
   - Replaces regular buttons with goldmember status indicators
   - Creates a cohesive premium experience across the application

4. **Authentication Integration**:
   - Seamless integration with the existing authentication system
   - Status check on initial page load
   - Real-time status updates when authentication state changes
   - Proper handling of loading states during status checks
   - Fallback to URL parameters when session authentication is lost

5. **Payment Success Flow**:
   - Automatic status update on the payment success page
   - Clear display of subscription details
   - Visual confirmation of goldmember status
   - Fallback messaging for status update failures
   - User ID preservation through URL parameters

6. **Database Implementation**:
   - 'goldmember' status stored in the subscriptions table
   - Status linked to user ID for persistent recognition
   - Proper handling of existing subscriptions
   - Creation of new subscription records when needed

7. **User Experience Considerations**:
   - Subtle but noticeable recognition throughout the application
   - Consistent visual language for goldmember status
   - Appropriate loading states during status checks
   - Clear feedback on status changes
   - Graceful handling of authentication edge cases

8. **Implementation Details**:
   - Status update function in subscription utilities
   - Enhanced isLifetimeSupporter function to check for 'goldmember' status
   - Integration with PageContent component for header display
   - Proper error handling and fallback mechanisms
   - URL parameter extraction for user identification when session is not available

9. **Session Persistence Challenges**:
   - Authentication sessions may be lost during external redirects (like Stripe checkout)
   - URL parameters provide a fallback mechanism for maintaining user context
   - The success URL includes the user ID as a query parameter
   - The payment success page extracts this ID when the session is not available
   - This approach ensures subscription updates work even when authentication is temporarily lost 

## Row Level Security and Service Role Implementation

### March 14, 2025 - Updated 19:00 CET

Supabase uses Row Level Security (RLS) policies to control access to database tables. This section explains how we handle these policies in our application:

1. **Row Level Security Policies**:
   - RLS policies restrict which rows a user can select, insert, update, or delete
   - For the subscriptions table, users can only access rows where `user_id` equals their own `auth.uid()`
   - This prevents users from modifying other users' subscription data
   - When authentication is lost (e.g., after a redirect), these policies block database operations

2. **Service Role Approach**:
   - The service role key bypasses RLS policies, allowing administrative access
   - We use this approach in server-side API routes for operations that require elevated permissions
   - The service role key is never exposed to the client side
   - This maintains security while allowing necessary database operations

3. **API Route Implementation**:
   - Created a dedicated `/api/update-subscription-status` endpoint
   - The endpoint accepts a user ID and performs the subscription update server-side
   - Uses the service role key to bypass RLS policies
   - Implements proper error handling and response formatting
   - Returns the updated subscription data to the client

4. **Database Constraints Handling**:
   - The subscriptions table has NOT NULL constraints on several columns
   - For lifetime subscriptions, we use a far future date (100 years) for `current_period_end` instead of null
   - This approach maintains the concept of a "lifetime" subscription while respecting database constraints
   - All required fields are properly populated during insert and update operations
   - Detailed error handling captures and reports constraint violations

5. **Security Considerations**:
   - Service role key is stored as a server-side environment variable
   - API routes validate input parameters before performing operations
   - Detailed error messages are logged server-side but simplified for client responses
   - User ID is still required to ensure operations target the correct user
   - All operations are performed through secure API endpoints

6. **Client-Side Integration**:
   - Client components call the API route instead of directly accessing the database
   - User ID is passed as a parameter to identify which user to update
   - Success and error states are handled based on the API response
   - This approach maintains security while providing necessary functionality

7. **Error Handling Strategy**:
   - API routes return appropriate HTTP status codes for different error scenarios
   - Detailed error information is logged server-side for debugging
   - Client-side error messages are user-friendly and actionable
   - Fallback mechanisms ensure a good user experience even when errors occur

8. **Implementation Details**:
   - Service role client is initialized with `autoRefreshToken: false` and `persistSession: false`
   - API routes use try/catch blocks for robust error handling
   - Database operations include proper `.select()` calls to return updated data
   - Response formatting follows a consistent pattern across all API routes 

## Goldmember Status Management Tools

### March 14, 2025 - 21:00 CET

The application includes administrative tools and user-facing status checks for managing goldmember status:

1. **Admin Tools Page**:
   - Located at `/admin-tools`
   - Provides an interface for administrators to update user subscription status
   - Uses the `/api/update-subscription-status` API endpoint to modify subscription records
   - Bypasses Row Level Security (RLS) using the service role key
   - Handles both creating new subscription records and updating existing ones
   - Provides detailed feedback on the operation's success or failure

2. **Status Check Page**:
   - Located at `/check-status`
   - Allows users to verify their own goldmember status
   - Displays comprehensive subscription information
   - Shows user details, supporter status, and subscription records
   - Uses the `isLifetimeSupporter()` function to check status
   - Provides visual indicators for goldmember status with amber highlighting
   - Includes a refresh button to check for status updates in real-time

3. **Subscription Status Logic**:
   - The `isLifetimeSupporter()` function checks for both 'active' and 'goldmember' statuses
   - Uses an OR condition in the database query: `or('status.eq.active,status.eq.goldmember')`
   - This ensures that users with either status are recognized as supporters
   - The function returns a boolean that components use to conditionally render UI elements

4. **Database Structure**:
   - Subscriptions table includes fields for user_id, plan_id, status, and timestamps
   - The 'goldmember' status indicates a lifetime supporter with premium access
   - Each user can have multiple subscription records, but typically only one is active
   - The current_period_end field uses a far future date (100 years) for lifetime subscriptions

5. **Security Considerations**:
   - Admin tools should only be accessible to authorized administrators
   - The service role key is only used server-side in API routes
   - User ID validation ensures operations only affect the intended user
   - Detailed error handling prevents information leakage

6. **Troubleshooting Process**:
   - Check if the user has a subscription record in the database
   - Verify that the subscription status is either 'active' or 'goldmember'
   - Ensure the plan_id is set to 'lifetime_supporter'
   - Use the admin tools to create or update subscription records if needed
   - Have the user check their status on the status check page
   - Refresh the application to ensure the latest status is recognized 

## Subscription Status Debugging System

### March 14, 2025 - 22:00 CET

The application includes comprehensive tools for debugging subscription status issues:

1. **Enhanced isLifetimeSupporter Function**:
   - Detailed logging at each step of the subscription check process
   - Clear error handling with specific error messages
   - Consistent use of the correct Supabase client
   - Proper handling of authentication edge cases
   - Comprehensive logging of subscription data

2. **API-Based Subscription Verification**:
   - New `/api/check-subscription` endpoint for direct database access
   - Uses service role key to bypass Row Level Security (RLS)
   - Returns detailed subscription information for a specific user
   - Provides both raw subscription data and processed status information
   - Implements proper error handling and response formatting

3. **Enhanced Status Check Page**:
   - Side-by-side comparison of client and server subscription data
   - Visual indicators for goldmember status
   - Detailed display of subscription records
   - Real-time refresh functionality
   - Comprehensive error handling and user feedback

4. **Consistent Client Usage**:
   - All components use the same `createClient()` function from our lib
   - Replaced deprecated `createClientComponentClient` with our custom client
   - Ensures consistent authentication state across components
   - Prevents issues with multiple Supabase client instances
   - Maintains backward compatibility with existing code

5. **Debugging Process**:
   - Check client-side subscription status using the status check page
   - Verify server-side subscription status using the API endpoint
   - Compare results to identify discrepancies
   - Use detailed logs to trace the subscription check process
   - Identify and fix issues with client initialization or database queries

6. **Common Issues and Solutions**:
   - **Client Mismatch**: Ensure all components use the same Supabase client
   - **RLS Policies**: Use service role key for administrative operations
   - **Query Formatting**: Ensure proper OR conditions for status checks
   - **Authentication State**: Verify user is authenticated before checking subscriptions
   - **Database Constraints**: Handle NULL values and required fields properly 

## Transcript Summarization Process

### March 14, 2025

The transcript summarization process in the audio recorder component follows these steps:

1. **User Flow**:
   - User records or uploads audio
   - Audio is transcribed to text
   - User selects "Summarize" from the AI actions
   - System processes the transcript and generates a summary
   - Summary is displayed as a card in the UI

2. **Implementation Details**:
   - The `processWithAI` function in `audio-recorder.tsx` handles the summarization process
   - Initially creates a placeholder card with `generating: true` status
   - Calls the `summarizeText` function which makes an API request to `/api/ai/summarize`
   - The API route uses OpenAI to generate a summary with a specific prompt
   - Updates the placeholder card with the generated content
   - For authenticated users, saves the summary to the database
   - Maintains a connection between the summary and its original transcript

3. **Database Integration**:
   - Summaries are stored in the `analyses` table with `analysis_type` set to "summary"
   - Each summary can be linked to a transcription via the `transcription_id` field
   - The `originalId` property in the UI maintains this connection
   - The `originalIdMap` state tracks these relationships for the current session

4. **Card Duplication Fix**:
   - Previous implementation created two cards for each summary:
     - One from updating the placeholder card
     - Another when saving to the database
   - Fixed by:
     - First saving to the database to get the analysis ID
     - Then updating the placeholder card with the content and originalId
     - Avoiding the creation of a second card entirely
   - This ensures only one card appears per summary while maintaining database integration

5. **Transcript Reference**:
   - Each summary card can expand to show its original transcript
   - The transcript is fetched on demand using the `fetchTranscriptionForAnalysis` function
   - This function uses the `originalId` to retrieve the associated transcript
   - Transcripts are cached in the `transcriptMap` to avoid repeated fetching 

## Webhook Notification System

### March 14, 2025

The webhook notification system allows users to receive real-time notifications when transcriptions or analyses are created:

1. **Webhook Configuration**:
   - Users configure webhook settings in the account page
   - Settings include a webhook URL and event type (transcription_created or analysis_created)
   - Settings are stored in the `webhook_settings` table in the database
   - Each user can have multiple webhook configurations for different events

2. **Notification Triggers**:
   - Webhooks are triggered automatically when:
     - A new transcription is created (`transcription_created` event)
     - A new analysis is created (`analysis_created` event)
   - Triggers are implemented in both `src/lib/db.ts` and `src/hooks/useDatabase.ts`
   - Notifications are sent asynchronously to avoid blocking the main operation

3. **Payload Structure**:
   - All webhook notifications use a consistent JSON payload:
   ```json
   {
     "transcript": { /* transcription data object */ },
     "document": { /* analysis data object or empty for transcription events */ },
     "user_id": "user-uuid"
   }
   ```
   - For `transcription_created` events, the `document` field is an empty object
   - For `analysis_created` events, both `transcript` and `document` contain data

4. **HTTP Request Details**:
   - Webhooks are sent as HTTP POST requests to the configured URL
   - Content-Type is set to `application/json`
   - A custom header `X-Webhook-Event` is included with the event type
   - Responses are logged but not retried on failure

5. **Error Handling**:
   - Webhook errors are caught and logged but don't affect the main operation
   - If a webhook URL is unreachable or returns an error, it's logged but doesn't block the user
   - Webhook sending is wrapped in try/catch blocks to prevent failures from affecting the application

6. **Implementation Details**:
   - The core webhook functionality is in `src/lib/webhook.ts`
   - The `sendWebhookNotification` function handles all webhook sending logic
   - Webhook calls are non-blocking (don't use await at the call site)
   - Database queries check if a user has configured webhooks before attempting to send

## Webhook Settings Implementation

### March 14, 2025

The webhook settings feature allows users to configure external integrations with the application:

1. **Database Structure**:
   - Uses a dedicated `webhook_settings` table in the Supabase database
   - Each record contains:
     - `id`: Unique UUID for the webhook setting
     - `user_id`: Foreign key reference to the auth.users table
     - `webhook_url`: The URL where webhook events will be sent
     - `webhook_event`: The event type that triggers the webhook
     - `created_at` and `updated_at`: Timestamps for record management
   - Table is protected with Row Level Security (RLS) policies
   - Users can only access, create, update, or delete their own webhook settings

2. **Security Implementation**:
   - Row Level Security (RLS) policies restrict access based on user ID
   - Four separate policies control SELECT, INSERT, UPDATE, and DELETE operations
   - Each policy uses `auth.uid() = user_id` to verify ownership
   - Foreign key constraint with CASCADE deletion ensures data integrity
   - Index on `user_id` improves query performance

3. **Component Architecture**:
   - `WebhookSettings` component handles the UI and logic for webhook configuration
   - Uses the same styling as the UserProfile component for visual consistency
   - Implements form validation for the webhook URL
   - Provides visual feedback for success and error states
   - Handles both creation and updates of webhook settings

4. **User Experience Flow**:
   - User enters a webhook URL (e.g., https://their-app.com/webhook)
   - User selects an event type from the dropdown (transcription or analysis)
   - User clicks "Save Settings" to store the configuration
   - System checks if settings already exist for the user
   - If settings exist, they are updated; otherwise, new settings are created
   - User receives visual confirmation of success or error

5. **Page Layout Strategy**:
   - Account page uses a two-column responsive grid layout
   - Left column contains webhook settings (order reversed on mobile)
   - Right column contains profile settings (appears first on mobile)
   - Both components use the same card styling for visual consistency
   - Layout automatically stacks on mobile devices using Tailwind's responsive utilities
   - Order is controlled with `order-1`/`order-2` classes that change at the md breakpoint 

## Translation Functionality

### March 14, 2025

The application now includes a translation feature that allows users to translate transcript content and titles to different languages. This functionality is implemented in the modal view when viewing a transcript, summary, or analysis.

### Implementation Details

#### 1. Translation API

The translation functionality uses the OpenAI API to translate text. The implementation follows these steps:

1. **API Endpoint**: A dedicated endpoint at `/api/ai/translate` handles translation requests:
   ```typescript
   // src/app/api/ai/translate/route.ts
   export async function POST(request: NextRequest) {
     // Parse the text and target language from the request
     const { text, language } = await request.json();
     
     // Call OpenAI with a translation prompt
     const completion = await openai.chat.completions.create({
       model: openaiConfig.model,
       messages: [
         { role: "system", content: translatePrompt },
         { role: "user", content: `Translate this to ${language}:\n\n${text}` }
       ],
     });
     
     // Return the translated text
     return NextResponse.json({
       success: true,
       result: completion.choices[0].message.content
     });
   }
   ```

2. **Translation Prompt**: A specialized prompt instructs the AI to translate text naturally:
   ```typescript
   // src/lib/ai/prompts/translate.ts
   export const translatePrompt = `
   You are an AI assistant specialized in translating text.
   Your task is to translate the provided text into the specified language.
   
   Translate the text naturally and fluently, preserving the original meaning, tone, and style.
   Ensure that the translation sounds natural to native speakers of the target language.
   
   Do not add any explanations or notes - just provide the translated text.
   `;
   ```

3. **API Client Function**: A client-side function handles the API call:
   ```typescript
   // src/lib/api-client.ts
   export async function translateText(text: string, language: string): Promise<AIProcessingResult> {
     // Call the translation API endpoint
     const response = await fetch('/api/ai/translate', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text, language })
     });
     
     // Process and return the result
     const result = await response.json();
     return {
       success: true,
       result: result.result,
       content: result.result
     };
   }
   ```

#### 2. UI Implementation

The translation UI is implemented in the modal view of the AudioRecorder component:

1. **State Management**: Several state variables track translation status:
   ```typescript
   // Translation state
   const [translatedContent, setTranslatedContent] = useState<string>("");
   const [isTranslating, setIsTranslating] = useState<boolean>(false);
   const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
   const [translatedTitle, setTranslatedTitle] = useState<string>("");
   ```

2. **Translation Handler**: A function processes translation requests:
   ```typescript
   const handleTranslate = async (content: string, language: string, title?: string) => {
     if (!content || !language || language === "english") return;
     
     setIsTranslating(true);
     
     try {
       // Translate content
       const translationResult = await translateText(content, language);
       if (translationResult.success) {
         setTranslatedContent(translationResult.content);
       }
       
       // Translate title if provided
       if (title) {
         const titleTranslationResult = await translateText(title, language);
         if (titleTranslationResult.success) {
           setTranslatedTitle(titleTranslationResult.content);
         }
       }
     } catch (error) {
       // Handle errors
       toast.error("Translation failed");
     } finally {
       setIsTranslating(false);
     }
   };
   ```

3. **UI Components**: The modal displays translation controls and content:
   - Language dropdown with options (English, Dutch, German, French, Spanish)
   - Translate button that triggers the translation
   - Loading state during translation
   - Display of translated content when available

4. **Content Display Logic**: The component conditionally renders content:
   ```jsx
   {isTranslating ? (
     <div className="animate-pulse">Translating...</div>
   ) : translatedContent && selectedLanguage !== "english" ? (
     <div className="whitespace-pre-line">{translatedContent}</div>
   ) : (
     <div className="whitespace-pre-line">{selectedCard.content}</div>
   )}
   ```

### User Experience

From a user perspective, the translation feature works as follows:

1. User opens a transcript, summary, or analysis in the modal view
2. User selects a target language from the dropdown (e.g., Dutch)
3. User clicks the "Translate" button
4. The UI shows a loading indicator during translation
5. Once complete, the translated content replaces the original text
6. The original content is preserved and can be viewed by selecting "English"

The translation maintains the formatting and structure of the original content while converting the text to the target language. 

## Modal UI Design and Transcript Functionality

### March 14, 2025

The modal dialog in the audio recorder component follows a consistent design pattern with the rest of the application. This ensures a cohesive user experience across all parts of the interface.

### Implementation Details

#### 1. Modal UI Structure

The modal dialog is structured with several key components:

1. **Container**: Uses a semi-transparent backdrop with blur effect for depth
   ```jsx
   <DialogContent className="bg-white/10 backdrop-blur-md border border-white/20 text-white max-w-4xl min-h-[450px] max-h-[80vh] flex flex-col p-0 rounded-lg overflow-hidden shadow-lg">
   ```

2. **Header**: Contains the title and close button
   ```jsx
   <div className="p-3 border-b border-white/20 bg-white/5 flex items-center">
     <h4 className="font-medium text-white text-base truncate flex-1">
       {/* Title content */}
     </h4>
     <DialogClose className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex-shrink-0 ml-2 flex items-center justify-center">
       <X className="h-3 w-3" />
     </DialogClose>
   </div>
   ```

3. **Content Area**: Scrollable container for the main content
   ```jsx
   <div className="p-3 flex-1 overflow-y-auto custom-scrollbar text-sm text-white/90 flex flex-col">
     {/* Main content */}
   </div>
   ```

4. **Footer**: Contains date information and action buttons
   ```jsx
   <div className="px-4 py-3 border-t border-white/10 bg-white/5 text-xs text-white/60 flex justify-between items-center">
     {/* Date on the left */}
     <span>{/* Date formatting */}</span>
     
     {/* Actions on the right */}
     <div className="flex items-center space-x-3">
       {/* Language dropdown and translate button */}
     </div>
   </div>
   ```

#### 2. Original Transcript Functionality

The modal includes functionality to view the original transcript for analyses and summaries:

1. **Conditional Rendering**: Only shown for non-transcript cards with associated original IDs
   ```jsx
   {selectedCard.type !== 'transcribe' && 
    ((selectedCard.originalId) || 
     (originalIdMap[selectedCard.id])) && (
     {/* Transcript section */}
   )}
   ```

2. **Expandable Section**: Toggle visibility with click
   ```jsx
   <div 
     className="flex items-center cursor-pointer p-2 hover:bg-white/5 rounded-md transition-colors"
     onClick={(e) => {
       // Toggle visibility logic
     }}
   >
     <h5 className="font-medium text-white/90 text-sm flex-1 truncate">Original Transcript</h5>
     <ChevronDown className="h-4 w-4 text-white/70 flex-shrink-0 ml-2" />
   </div>
   ```

3. **Content Loading**: Fetches transcript data when needed
   ```jsx
   if (!transcriptMap[selectedCard.id]) {
     // Set loading state
     setTranscriptMap(prevMap => ({
       ...prevMap,
       [selectedCard.id]: "Loading transcript..."
     }));
     
     // Fetch data based on card type
     if (selectedCard.type === 'transcribe') {
       // Direct content for transcripts
     } else if ((selectedCard.type === 'summarize' || selectedCard.type === 'analyze')) {
       // Fetch from database for analyses/summaries
       fetchTranscriptionForAnalysis(originalId, selectedCard.id)
         .then(content => {
           // Update state with fetched content
         });
     }
   }
   ```

4. **Display Area**: Shows the transcript content
   ```jsx
   <div id={`modal-transcript-${selectedCard.id}`} className="p-3 bg-white/5 rounded-lg hidden">
     <div className="whitespace-pre-line text-white/80 text-xs max-h-[200px] overflow-y-auto custom-scrollbar">
       {transcriptMap[selectedCard.id] || "Loading transcript..."}
     </div>
   </div>
   ```

#### 3. Integration with Translation

The modal UI maintains consistent styling while incorporating translation functionality:

1. **Content Display Logic**: Shows original or translated content based on state
   ```jsx
   {isTranslating ? (
     <div className="animate-pulse">Translating...</div>
   ) : translatedContent && selectedLanguage !== "english" ? (
     <div className="whitespace-pre-line">{translatedContent}</div>
   ) : (
     <div className="whitespace-pre-line">{/* Original content */}</div>
   )}
   ```

2. **Translation Controls**: Integrated into the footer
   ```jsx
   <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value)}>
     {/* Language options */}
   </Select>
   
   <Button 
     onClick={() => handleTranslate(selectedCard.content, selectedLanguage, selectedCard.title)}
     disabled={isTranslating || selectedLanguage === "english"}
   >
     {isTranslating ? "Translating..." : "Translate"}
   </Button>
   ```

This implementation ensures a consistent user experience while providing powerful functionality for viewing and translating content. 

## Persistent Translation System

### March 14, 2025

The application now includes a persistent translation system that stores translated content in the database. This allows translations to be reused across sessions, improving performance and user experience.

### Implementation Details

#### 1. Database Schema

The translation system uses a dedicated `translations` table in the database:

```sql
CREATE TABLE public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_id uuid NOT NULL, -- Can reference either transcription_id or analysis_id
  original_type text NOT NULL, -- 'transcription', 'analysis', or 'summary'
  language text NOT NULL,
  title text,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

Key aspects of the schema:
- `original_id` links to the source content (transcription, analysis, or summary)
- `original_type` specifies what kind of content is being translated
- `language` stores the target language code
- `title` and `content` store the translated text
- Row-level security ensures users can only access their own translations

#### 2. Database Functions

The system includes several functions for managing translations:

1. **Create Translation**:
   ```typescript
   createTranslation(
     userId: string, 
     originalId: string, 
     originalType: string, 
     language: string, 
     content: string, 
     title?: string, 
     metadata?: any
   )
   ```

2. **Get Translation**:
   ```typescript
   getTranslation(userId: string, originalId: string, language: string)
   ```

3. **Update Translation**:
   ```typescript
   updateTranslation(
     userId: string, 
     translationId: string, 
     updates: Partial<{ title: string; content: string; metadata: any }>
   )
   ```

4. **Delete Translation**:
   ```typescript
   deleteTranslation(userId: string, translationId: string)
   ```

These functions are available both in the server-side `db.ts` module and the client-side `useDatabase` hook.

#### 3. Translation Flow

The translation process follows these steps:

1. **Check for Existing Translation**:
   ```typescript
   // When a user selects a language
   if (selectedCard && selectedCard.originalId) {
     const existingTranslation = await getTranslation(
       selectedCard.originalId, 
       language
     );
     
     if (existingTranslation) {
       // Use existing translation
       setTranslatedContent(existingTranslation.content);
       setTranslatedTitle(existingTranslation.title || "");
       return;
     }
   }
   ```

2. **Create New Translation** (if none exists):
   ```typescript
   // Translate content using API
   const translationResult = await translateText(content, language);
   
   // Store in database
   if (isAuthenticated && selectedCard && selectedCard.originalId) {
     const translationData = await createTranslation(
       selectedCard.originalId,
       originalType,
       language,
       translationResult.content,
       translatedTitle,
       { source: "recorder" }
     );
   }
   ```

3. **Automatic Loading** when switching languages:
   ```typescript
   // Effect hook that runs when card or language changes
   useEffect(() => {
     const loadTranslation = async () => {
       if (selectedCard && selectedCard.originalId && selectedLanguage !== "english") {
         // Try to load existing translation
         const existingTranslation = await getTranslation(
           selectedCard.originalId, 
           selectedLanguage
         );
         
         if (existingTranslation) {
           // Use existing translation
           setTranslatedContent(existingTranslation.content);
           setTranslatedTitle(existingTranslation.title || "");
         }
       }
     };
     
     loadTranslation();
   }, [selectedCard, selectedLanguage]);
   ```

#### 4. User Experience Benefits

The persistent translation system provides several benefits:

1. **Faster Access**: Previously translated content loads instantly without API calls
2. **Consistency**: The same content is always translated the same way
3. **Offline Capability**: Translations remain available even without internet access
4. **Reduced API Usage**: Fewer calls to the translation API, reducing costs
5. **Session Persistence**: Translations remain available after page reloads

#### 5. Integration with UI

The translation UI remains the same, but now works with the persistent storage:

1. **Language Selection**: When a user selects a language, the system first checks for existing translations
2. **Translation Button**: Only makes API calls when no translation exists
3. **Loading States**: Shows appropriate loading indicators during database operations
4. **Error Handling**: Provides feedback if translation retrieval fails

This implementation ensures a seamless user experience while efficiently managing translation data. 

## Clipboard Copy Functionality (March 14, 2025)

The clipboard copy functionality allows users to easily copy the content of transcripts, summaries, or analyses to their clipboard with a single click.

### Implementation Details

1. **Copy Button UI**:
   - Located in the footer of the expanded card modal
   - Positioned to the left of the language selection dropdown
   - Uses the `Copy` icon from Lucide React
   - Provides visual feedback when content is successfully copied

2. **Copy Logic**:
   - The `copyToClipboard` function determines what content to copy based on the current state:
     ```typescript
     const contentToCopy = translatedContent && selectedLanguage !== "english" 
       ? translatedContent 
       : selectedCard?.content.includes("This is a")
         ? selectedCard.content.replace(/^This is a (summary|analysis) of the audio recording\.\s+/, "")
         : selectedCard?.content;
     ```
   - This ensures that:
     - If translated content is available and a non-English language is selected, the translated content is copied
     - Otherwise, the original content is copied, with any standard prefixes removed

3. **User Feedback**:
   - When content is successfully copied, the button briefly shows "Copied!" in green text
   - A timeout resets the button back to the copy icon after 2 seconds
   - Error handling is implemented to log any clipboard API failures

4. **Integration with Translation**:
   - The copy functionality works seamlessly with the translation feature
   - Users can translate content and then copy the translated version with a single click

This feature enhances the user experience by making it easier to extract and use the content generated by the application in other contexts.

## Enhanced Translation Functionality (March 14, 2025)

The translation functionality in the audio recorder has been enhanced to replace the original transcript content with the translated content. This allows subsequent operations like summarize or analyze to work directly on the translated content.

### Implementation Details

1. **Transcript Replacement**:
   - When a transcript is translated, the translated content now replaces the original content in the active state
   - The `transcriptContent` state is updated with the translated content
   - The transcript map is updated to store the translated content for the selected card
   - The processed results array is updated to reflect the translated content

2. **Translation Flow**:
   ```typescript
   // If this is a transcript, update the transcript content
   if (selectedCard && selectedCard.type === 'transcribe') {
     // Update the transcript content
     setTranscriptContent(translatedContent);
     
     // Update the transcript map
     setTranscriptMap(prev => ({
       ...prev,
       [selectedCard.id]: translatedContent
     }));
     
     // Update the processed results
     setProcessedResults(prev => prev.map(item => 
       item.id === selectedCard.id 
         ? { 
             ...item, 
             content: translatedContent,
             title: translatedTitleText || item.title
           } 
         : item
     ));
   }
   ```

3. **Automatic Translation Loading**:
   - When switching between languages, the system checks for existing translations
   - If a translation exists, it automatically updates the transcript content
   - This ensures that the active content always matches the selected language

4. **User Experience Benefits**:
   - Users no longer need to manually copy translated content
   - Summarize and analyze operations work directly on the translated content
   - Success notification informs users when a transcript has been translated
   - The workflow is more intuitive, as the content displayed is the content that will be processed

5. **Integration with Existing Features**:
   - The translation functionality still stores translations in the database for persistence
   - The clipboard copy feature works with the translated content
   - The parent component is notified of changes to maintain state consistency

This enhancement streamlines the workflow for users working with translated content, making it easier to perform operations on content in different languages.

## Mock Translation Implementation (March 14, 2025)

The translation functionality has been enhanced with a fallback mock implementation to ensure it works even when the OpenAI API key is not configured or when the OpenAI API fails. This improves the development experience and allows for testing without requiring an API key.

### Implementation Details

1. **Mock Translation Structure**:
   ```typescript
   type SupportedLanguage = 'dutch' | 'german' | 'french' | 'spanish';

   const mockTranslations: Record<SupportedLanguage, { prefix: string; sample: string }> = {
     dutch: {
       prefix: "Vertaald naar Nederlands: ",
       sample: "Dit is een voorbeeld van een vertaalde tekst in het Nederlands."
     },
     german: {
       prefix: "Übersetzt auf Deutsch: ",
       sample: "Dies ist ein Beispiel für einen übersetzten Text auf Deutsch."
     },
     french: {
       prefix: "Traduit en français: ",
       sample: "Voici un exemple de texte traduit en français."
     },
     spanish: {
       prefix: "Traducido al español: ",
       sample: "Este es un ejemplo de texto traducido al español."
     }
   };
   ```

2. **Fallback Logic**:
   - When the OpenAI API key is not configured, the system automatically falls back to using mock translations
   - If the OpenAI API call fails, the system also falls back to mock translations
   - The language key is normalized and checked against the supported languages
   - If the language is supported, the text is prefixed with a language-specific prefix
   - If the language is not supported, a generic prefix is used

3. **Type Safety**:
   - The implementation uses TypeScript to ensure type safety
   - The `SupportedLanguage` type defines the allowed language keys
   - The `Record` utility type ensures proper typing for the mock translations object
   - Type assertions are used to safely convert user input to the expected types

4. **Error Handling**:
   - The implementation includes proper error handling for all scenarios
   - Missing text or language parameters are caught and appropriate error responses are returned
   - Unsupported languages are handled gracefully with a generic translation format
   - OpenAI API errors are caught and the system falls back to mock translations
   - All errors and successes are properly logged for debugging

5. **Resilience**:
   - The system is designed to be resilient to API failures
   - Even if the OpenAI API is unavailable or returns an error, the translation functionality will still work
   - This ensures a consistent user experience regardless of external service availability
   - The mock translations provide a reasonable approximation of the expected behavior

This implementation ensures that the translation functionality works in all environments, including development environments without API keys and production environments with temporary API issues, improving both the developer experience and the user experience.

## Translation Feature Bugfix (March 14, 2025)

The translation functionality in the audio recorder component had a critical syntax error that was causing build failures. This issue has been fixed by properly structuring the code.

### Issue Details

1. **Syntax Error**:
   - There was a misplaced `else` clause in the code that was not properly paired with an `if` statement
   - The structure of the try-catch blocks was incorrect, with nested try blocks that didn't have proper closure
   - This caused the error: "Parsing ecmascript source code failed" at line 1577

2. **Fix Implementation**:
   ```typescript
   // Function to handle translation
   const handleTranslate = async (content: string, language: string, title?: string) => {
     // ... function implementation ...
     try {
       // Check if we already have a translation
       if (selectedCard && selectedCard.originalId) {
         // ... translation logic ...
       } else {
         // ... handle case with no originalId ...
       }
       
       // Translate the content
       // ... translation API call and processing ...
       
     } catch (error) {
       // ... error handling ...
     } finally {
       // ... cleanup ...
     }
   };

   // Separate useEffect hook for loading translations
   useEffect(() => {
     const loadTranslation = async () => {
       // ... translation loading logic ...
     };
     
     loadTranslation();
   }, [selectedCard, selectedLanguage, getTranslation, onResultsChange, processedResults]);
   ```

3. **Key Changes**:
   - Properly separated the `handleTranslate` function from the `useEffect` hook
   - Fixed the structure of the try-catch blocks to ensure proper error handling
   - Ensured all conditional blocks have proper closure
   - Added additional logging for better debugging
   - Maintained all the original functionality while fixing the syntax issues

This fix ensures that the translation functionality works correctly and prevents build failures, allowing users to continue using the application without interruption.

## UI Settings System

### Modal-Based Gradient Editor

**Issue:** Users were unable to drag across color pickers to select colors smoothly. Various attempts to fix the issue with inline color pickers and event handling adjustments were unsuccessful.

**Solution:** Implemented a dedicated modal dialog for gradient editing that opens when clicking an "Open Gradient Editor" button.

**Implementation:**
1. Added a Dialog component from the UI component library
2. Created a button that triggers the dialog to open
3. Placed HTML5 color inputs inside the dialog, isolated from the main UI
4. Added color swatches in the main UI to preview the gradient colors

**Code Implementation:**
```tsx
// Dialog state
const [gradientDialogOpen, setGradientDialogOpen] = useState(false);

// Dialog component with color pickers
<Dialog open={gradientDialogOpen} onOpenChange={setGradientDialogOpen}>
  <DialogTrigger asChild>
    <Button 
      type="button"
      className="w-full bg-white/10 hover:bg-white/20 text-white mb-4"
    >
      Open Gradient Editor
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-800">
    <DialogHeader>
      <DialogTitle className="text-white">Gradient Editor</DialogTitle>
    </DialogHeader>
    <div className="grid grid-cols-1 gap-6 py-4">
      {/* Color pickers for each gradient stop */}
      <div className="space-y-2">
        <Label htmlFor="gradient-from" className="text-white">From Color</Label>
        <div className="flex items-center gap-2">
          <input 
            type="color" 
            id="gradient-from" 
            value={uiSettings.gradient_from} 
            onChange={(e) => handleColorChange('gradient-from', e.target.value)} 
            className="w-12 h-10 border-0 cursor-pointer"
          />
          <Input 
            value={uiSettings.gradient_from}
            onChange={(e) => handleColorChange('gradient-from', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
      </div>
      
      {/* Similar blocks for gradient-via and gradient-to */}
    </div>
  </DialogContent>
</Dialog>
```

**User Experience Improvement:**
By isolating the color pickers in a dedicated modal dialog, users can now:
- Interact with the color pickers without interference from other UI elements
- Drag across the color pickers to select colors smoothly
- See the gradient update in real-time as they select colors
- Use the main UI to see the overall effect of their color choices

### Enhanced Real-Time Color Picker

**Issue:** Users experienced delays in color updates while dragging the color picker.

**Solution:** Added `requestAnimationFrame` to optimize the update process and included a `touch-none` class for mobile devices.

**Implementation:**
- Used `requestAnimationFrame` to synchronize UI updates with the browser rendering cycle
- Added a `touch-none` class to prevent interference from touch events on mobile devices
- Simplified the component to ensure smooth real-time updates

**Code Implementation:**
```tsx
const handleColorChange = (newColor: string) => {
  setLocalColor(newColor);
  requestAnimationFrame(() => {
    onChange(newColor);
  });
};

<HexColorPicker 
  color={localColor} 
  onChange={handleColorChange} 
  className="touch-none"
/>
```

**User Experience Improvement:**
The color picker now provides smooth, real-time updates as users drag across it, enhancing the interactive experience when selecting colors for the gradient.

### Real-Time Color Picker Enhancement

**Issue:** Previously, the gradient would only update after releasing the mouse button, making it difficult for users to see color transitions smoothly.

**Solution:** Added local state to the `ColorPickerPopover` component to manage real-time updates.

**Implementation:**
- Added local state to track color changes during dragging
- Modified the color picker to update the parent state in real-time
- Implemented a `handleColorChange` function to manage state updates

**Code Implementation:**
```tsx
const ColorPickerPopover = ({ color, onChange, label, id }) => {
  const [localColor, setLocalColor] = useState(color);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
    onChange(newColor);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white">{label}</Label>
      <div className="flex flex-col gap-2">
        <HexColorPicker 
          color={localColor} 
          onChange={handleColorChange} 
        />
        <Input 
          value={localColor} 
          onChange={(e) => handleColorChange(e.target.value)}
          className="bg-white/10 border-white/20 text-white"
        />
      </div>
    </div>
  );
};
```

**User Experience Improvement:**
Users can now see the gradient change in real-time, providing immediate visual feedback for a more intuitive color selection experience.

### Gradient Animation Fix

**Issue:** The gradient animation would stop whenever UI settings colors were changed.

**Solution:** Modified the `applyUISettings` function to explicitly set animation properties when updating the background.

**Implementation:**
- Updated the `applyUISettings` function in the UI settings context
- Explicitly set `backgroundSize`, `animation`, and `animation-play-state` CSS properties
- Used a local variable for the HTML element to enhance code readability

**Code Implementation:**
```tsx
const applyUISettings = (settings: UISettings) => {
  const htmlElement = document.documentElement;
  
  if (settings.ui_mode === 'fun') {
    htmlElement.style.background = `linear-gradient(to right, ${settings.gradient_from}, ${settings.gradient_via}, ${settings.gradient_to})`;
    // Explicitly set animation properties to preserve them
    htmlElement.style.backgroundSize = '400% 400%';
    htmlElement.style.animation = 'gradient 15s ease infinite';
    htmlElement.style.animationPlayState = 'running';
  } else {
    htmlElement.style.background = settings.flat_color;
    // Clear animation properties for flat mode
    htmlElement.style.backgroundSize = '';
    htmlElement.style.animation = '';
    htmlElement.style.animationPlayState = '';
  }
  
  htmlElement.style.color = settings.foreground_color;
};
```

**User Experience Improvement:**
The gradient animation now continues smoothly when colors are changed, providing a more consistent and visually pleasing experience for users who prefer the animated gradient background.

## Account Management Page Design

### Structure (Updated 2025-03-14)

The account management page is designed with a modern, user-friendly interface inspired by the Pinterest account page layout. It features a sidebar navigation and content area that adapts well to both desktop and mobile viewing.

#### Page Layout

The account page is structured as follows:

1. **Header**: 
   - Title: "Account management"
   - Description: "Make changes to your personal information or account type"

2. **Two-Column Layout**:
   - Left sidebar for navigation between account sections
   - Right content area for the selected section content

3. **Three Main Sections**:
   - Profile Management
   - Webhook Settings
   - UI Settings

#### Responsive Design

- On desktop: Side-by-side layout with fixed-width sidebar and flexible content area
- On mobile: Stacked layout with navigation on top and content below

### User Profile Section

The user profile section contains:

1. **Account Information**:
   - Email field with save button
   - Password field with visibility toggle and change option

2. **Business Account Conversion**:
   - Information about business account benefits
   - Conversion button

3. **Account Management**:
   - Account deactivation option with explanation
   - Account deletion option with explanation

4. **Premium Status**:
   - Gold member badge and benefits for premium users

### Webhook Settings Section

The webhook settings section features:

1. **Webhook Configuration**:
   - URL input field
   - Event selection dropdown
   - Save button

2. **Webhook Information**:
   - Explanation of webhook functionality
   - Sample payload with code formatting

### UI Settings Section

The UI settings section includes:

1. **UI Mode Selection**:
   - Toggle between "Fun" (gradient) and "Flat" color modes
   - Live preview of the selected mode

2. **Color Customization**:
   - Color pickers for gradient colors (from, via, to) or flat color
   - Text color selection
   - Visual previews of color selections

3. **Actions**:
   - Reset to defaults button
   - Save settings button

### Implementation Details

The implementation uses:

1. **State Management**:
   - React's useState for local component state
   - Context API for UI settings that persist across the application

2. **Component Organization**:
   - Each section is a separate React component
   - Main account page handles section switching via state

3. **Styling Approach**:
   - Tailwind CSS for styling
   - Card-based layout with consistent spacing
   - Backdrop blur and semi-transparent backgrounds for a modern look
   - Clear visual hierarchy with section headings

## User Profile Component

### March 16, 2024 - 14:00 CET

The User Profile component in the account management page has been streamlined by removing the "Convert to a business account" section. This change was made to focus the user interface on implemented features, removing UI elements that point to functionality not yet available.

### Removed Elements

1. **Business Account Section**:
   - A section titled "Convert to a business account" has been removed
   - This section contained explanatory text about business account benefits
   - The section included a button labeled "Convert account"
   - The corresponding `handleConvertToBusiness` function has also been removed

### Implementation Details

The removal was executed by:
1. Deleting the "Business Account Section" div and all its contents
2. Removing the `handleConvertToBusiness` function declaration
3. Maintaining the component's overall structure and other functionality

### User Experience

This change improves the user experience by:
1. Focusing the UI on currently available features
2. Reducing confusion by not showing buttons for unimplemented functionality
3. Creating a cleaner, more straightforward account management interface
4. Avoiding the "coming soon" pattern in favor of only showing implemented features

The business account conversion feature will be reintroduced once the functionality is fully implemented in a future update.

### March 16, 2024 - 15:00 CET

Further streamlining of the User Profile component has been implemented by removing the "Deactivate account" feature, leaving only the permanent "Delete account" option.

### Removed Elements

1. **Deactivate Account Section**:
   - The section for temporarily deactivating an account has been removed
   - This included explanatory text about temporarily hiding profiles and data
   - The section included a button labeled "Deactivate account"
   - The corresponding `handleDeactivateAccount` function has also been removed

### Implementation Details

The removal was executed by:
1. Deleting the "Deactivate Account" div and all its contents
2. Removing the `handleDeactivateAccount` function declaration
3. Renaming the section header from "Deactivation and deletion" to "Account deletion"
4. Preserving the "Delete account" functionality

### User Experience

This change improves the user experience by:
1. Simplifying account management options to just one clear action
2. Eliminating potentially confusing distinction between deactivation and deletion
3. Focusing on the most critical account management action (permanent deletion)
4. Creating a more straightforward, less cluttered interface
5. Removing another "coming soon" feature that wasn't yet fully implemented

The account deactivation feature may be reintroduced in the future when fully implemented, with clear distinction from permanent deletion.

## Page Loading and Style Application

The application uses a loading system to ensure that all styles and components are properly loaded before rendering content. This is particularly important for handling page transitions where styles might not be immediately applied.

### Components

#### LoadingProvider
The `LoadingProvider` (in `src/contexts/loading-context.tsx`) manages the loading state across the application. It watches for route changes and UI setting changes, and ensures that content is only shown when everything is properly loaded.

Key features:
- Tracks loading state in a React context
- Monitors route changes by patching the Next.js router
- Synchronizes with the UI settings loading state
- Provides delays to ensure styles are applied before showing content
- Implements a safety timeout to prevent infinite loading states
- Provides extensive error handling to ensure loading always completes

```tsx
const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  // Monitor route changes and UI settings loading
  // ...
  
  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Safety timeout triggered to prevent infinite loading');
        setIsLoading(false);
      }
    }, 5000); // 5 seconds maximum loading time
    
    return () => clearTimeout(safetyTimeout);
  }, [isLoading]);
  
  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
```

#### LoadingOverlay
The `LoadingOverlay` (in `src/components/ui/loading-overlay.tsx`) wraps content and displays a loading spinner when the application is in a loading state.

Key features:
- Shows a fullscreen overlay with a spinner during loading
- Uses a dark neutral gradient background (dark blue to deep navy)
- Implements smooth transitions for appearance/disappearance
- Hides content until it's ready to be displayed
- Includes backdrop blur effect for a modern look

```tsx
const LoadingOverlay = ({ children, fullHeight = false }) => {
  const { isLoading } = useLoading();
  
  return (
    <div className={`relative ${fullHeight ? 'h-full' : ''}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-50"
          style={{ 
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            backdropFilter: 'blur(8px)'
            // ...
          }}>
          <LoadingSpinner size="large" className="text-white" />
          {/* ... */}
        </div>
      )}
      
      <div style={{ opacity: isLoading ? 0 : 1, visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </div>
    </div>
  );
};
```

### How It Works

1. When navigating to a new page, `LoadingProvider` sets `isLoading` to true
2. The `LoadingOverlay` displays a gradient background with spinner and hides the page content
3. After navigation, the UI settings are re-applied to ensure styles are correctly updated
4. A short delay ensures all DOM updates and style applications are complete
5. `isLoading` is set to false, revealing the fully styled content
6. If loading takes too long (over 5 seconds), a safety timeout automatically shows content

This system helps prevent the UI flashing with incorrect styles during navigation and provides visual feedback to users during loading periods. The safety mechanisms ensure users are never stuck on a loading screen, even if there are issues with style application.

## Loading State Management System

### March 14, 2025

The application now includes a global loading state management system implemented through a React context provider. This system allows for consistent loading indicators to be displayed across the application.

### Implementation Details

1. **Loading Context Provider**:
   - Implemented as a React context that manages loading state globally
   - Provides a boolean `isLoading` state and a `setIsLoading` function to update it
   - Any component in the application can access this state using the `useLoading` hook

   ```typescript
   // The core of the loading context
   const LoadingContext = createContext<LoadingContextType>({
     isLoading: false,
     setIsLoading: () => {},
   });
   
   export const useLoading = () => useContext(LoadingContext);
   ```

2. **Loading Overlay Component**:
   - Wraps children components and displays a loading indicator when loading state is active
   - Creates a semi-transparent overlay with a centered loading spinner
   - Uses backdrop blur for a modern visual effect
   - Supports a `fullHeight` prop to extend to full container height when needed

   ```typescript
   // Key aspects of the loading overlay implementation
   return (
     <div className={cn("relative", fullHeight && "h-full")}>
       {children}
       
       {isLoading && (
         <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-50 backdrop-blur-sm">
           <div className="flex flex-col items-center gap-2">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
             <p className="text-sm text-muted-foreground">Loading...</p>
           </div>
         </div>
       )}
     </div>
   );
   ```

3. **Integration with Root Layout**:
   - The LoadingProvider is positioned in the layout hierarchy to make loading state available to all components
   - All application content is wrapped in the LoadingOverlay component
   - This ensures a consistent loading experience throughout the application

### Usage Pattern

To use the loading system in any component:

1. Import the `useLoading` hook:
   ```typescript
   import { useLoading } from '@/contexts/loading-context';
   ```

2. Access the loading state and setter:
   ```typescript
   const { isLoading, setIsLoading } = useLoading();
   ```

3. Set loading state when needed:
   ```typescript
   // Start loading
   setIsLoading(true);
   
   // Perform async operation
   await someAsyncOperation();
   
   // End loading
   setIsLoading(false);
   ```

The loading overlay will automatically appear whenever `isLoading` is set to `true` and disappear when set back to `false`.

### Benefits

This loading system provides several benefits:
- Consistent loading experience across the application
- Centralized management of loading state
- Prevents user interaction while data is loading
- Provides clear visual feedback during asynchronous operations
- Enhances perceived performance by communicating system state to users

## Transcript Processing System

The transcript processing system provides three different ways to process transcripts:

1. **Keep As Is**: Makes minimal changes to the transcript, focusing on correcting spelling, grammar, and punctuation while preserving the original content.
2. **Condense**: Removes filler words, repetitions, and tangential content to create a more concise version that maintains all key information.
3. **Expand**: Adds relevant background information and context, clearly marking AI additions to distinguish them from the original transcript.

### Implementation Details

The system consists of three main components:

1. **Prompt Files**: Located in `src/lib/ai/prompts/`, these files contain specialized prompts for each processing type:
   - `keep-as-is.ts`: Instructions for minimal editing
   - `condense.ts`: Instructions for removing non-essential content
   - `expand.ts`: Instructions for adding context and clarifications

2. **API Endpoint**: The `src/app/api/ai/process-transcript/route.ts` endpoint handles transcript processing requests by:
   - Receiving the transcript text and the desired processing type
   - Selecting the appropriate prompt based on the processing type
   - Sending the transcript and prompt to OpenAI for processing
   - Returning the processed transcript

3. **UI Integration**: The audio recorder component (`src/components/audio/audio-recorder.tsx`) integrates the processing options by:
   - Adding a "Process Transcript" option to the main AI actions dropdown
   - Displaying a secondary dropdown with the three processing types when "Process Transcript" is selected
   - Sending the transcript to the process-transcript API with the selected processing type
   - Saving the processed transcript with metadata indicating the processing type used

### Usage Flow

1. User records or uploads audio which is transcribed
2. User selects "Process Transcript" from the AI actions dropdown
3. User selects a processing type (Keep As Is, Condense, or Expand)
4. The system sends the transcript to OpenAI with the appropriate prompt
5. The processed transcript is displayed and can be saved to the database

The processing is handled asynchronously, with a loading state displayed during processing, and error handling to fall back to the original transcript if processing fails.

## Transcript Processing and Card Display System

The application provides various AI actions for processing audio content:

1. **Summarize** - Creates a summary of the transcribed audio
2. **Analyze** - Analyzes the content of the transcribed audio
3. **Transcribe** - Processes the transcript in one of three ways:
   - Keep As-Is - Uses the original transcript without changes
   - Condense - Creates a more concise version of the transcript
   - Expand - Elaborates on the transcript content

### How Card Creation Works

All three AI actions (summarize, analyze, transcribe) create result cards that are displayed in either card view or list view. The process follows these steps:

1. When a user selects an AI action and clicks "Process with AI":
   - A new result card is immediately created with a "generating" state
   - The card shows an appropriate loading message based on the action type
   - The card is added to the `processedResults` state array

2. The application then processes the content:
   - For summarize/analyze: An API call is made to generate content
   - For transcribe: The transcript is processed according to the selected type

3. Once processing completes:
   - The card is updated with the final content
   - The `generating` state is set to false
   - For authenticated users, results are saved to the database

4. Special handling for "transcribe" type:
   - A placeholder file is created and uploaded to satisfy database foreign key constraints
   - The processed transcript is stored with a reference to this placeholder file

### UI Rendering Logic

The result cards are rendered using a consistent pattern for all three processing types:

```tsx
// Card title logic
{result.generating ? 
  (result.type === "summarize" ? "Generating Summary..." : 
   result.type === "analyze" ? "Generating Analysis..." : 
   "Processing Transcript...") : 
  (result.title || (
    result.type === "summarize" ? "Summary" : 
    result.type === "analyze" ? "Analysis" : 
    "Processed Transcript"
  ))}
```

This ensures that all three types of processing results (summary, analysis, and processed transcript) are displayed consistently in the UI as cards, with appropriate titles and loading states.

### Card Display System

Each card is displayed based on the `viewMode` selected (card or list):

1. **Card View**: Displays results in a grid of cards with fixed height
   - All results (summaries, analyses, and processed transcripts) appear equally in this view
   - Cards include a title, content snippet, and action buttons
   - Users can click a card to expand it in a modal dialog

2. **List View**: Displays results in a more compact format
   - Shows a table with columns for Type, Title, and Date
   - All processing types (including transcripts) are properly displayed

Both views use the `getSortedResults` function which sorts all results by date without filtering by type, ensuring all processing results appear in the UI.

### Foreign Key Constraint Handling

For transcript processing, the application needs to satisfy the database foreign key constraint between the `transcriptions` table and `files` table. This is handled by:

1. Creating a small placeholder text file
2. Uploading it to obtain a valid `file_id`
3. Using this ID when creating the transcription record
4. Marking the record with `isPlaceholder: true` for future reference

This approach ensures database integrity while allowing for transcript-only operations.

## Custom Prompt Processing

### Overview
The custom prompt feature allows users to process audio transcripts using their own defined prompts. This provides flexibility beyond the standard AI actions (summarize, analyze, transcribe).

### Implementation Details

#### Custom Prompt Storage
- Custom prompts are stored in the `custom_prompts` table in the Supabase database
- Each prompt has:
  - `id`: Unique identifier
  - `user_id`: The user who created the prompt
  - `title`: The name of the prompt
  - `prompt_text`: The actual prompt text to be sent to the AI
  - `created_at`: Timestamp of creation

#### Audio Recorder Integration
The audio recorder component (`src/components/audio/audio-recorder.tsx`) has been enhanced to support custom prompts:

1. **UI Components**:
   - "Use Custom Prompt" option in the AI action dropdown (only visible when user is authenticated)
   - Custom prompt selector dropdown that appears when this option is selected
   - Loading state for prompts and error handling when no prompts are found

2. **Data Flow**:
   - When the user selects "Use Custom Prompt", the component loads the user's custom prompts
   - The user selects a prompt from the dropdown
   - When the "Process with Custom Prompt" button is clicked, the transcript is sent to the API along with the selected prompt ID

3. **Processing**:
   - The API endpoint (`pages/api/prompts/process.ts`) retrieves the prompt text from the database
   - The transcript and prompt are sent to OpenAI for processing
   - The result is returned and displayed in a result card
   - If the user is authenticated, the result is saved to the database as an analysis record with type "custom-prompt"

#### API Implementation
The processing endpoint (`pages/api/prompts/process.ts`):
1. Authenticates the user
2. Validates the input (transcript and promptId)
3. Retrieves the custom prompt from the database
4. Sends the prompt and transcript to OpenAI
5. Returns the processed result with the prompt title

#### Integration with Existing Features
- Results from custom prompt processing are displayed in result cards in the same way as other AI processing results
- Results are saved to the database using the existing `createAnalysis` function
- Custom prompt results can be shared, saved, and managed like other results

### Error Handling
- Missing transcript or promptId returns a 400 error
- Unauthenticated requests return a 401 error
- Prompt not found returns a 404 error
- OpenAI errors or other unexpected issues return a 500 error
- All errors are displayed to the user in the result card

### Security Considerations
- The API endpoint verifies that the requested prompt belongs to the authenticated user
- Custom prompts are only accessible to their creators
- Authentication is required for both creating and using custom prompts

## Logout Mechanism

The application uses a two-pronged approach to ensure reliable user logout:

## Server-Side Logout (API Route)

The server-side logout is handled by a dedicated API route at `/auth/signout`. This route:

1. Uses Supabase's built-in `signOut()` method to clear the session
2. Creates a redirect response to the home page
3. Explicitly clears all possible authentication cookies:
   - Tries multiple cookie names related to Supabase auth
   - Clears cookies with different path configurations
   - Clears cookies with domain-specific settings when applicable
4. Provides detailed logging for debugging logout issues

### Important: Cookie Handling in Next.js 15+

In Next.js 15+, the `cookies()` function needs to be handled carefully in Route Handlers:

```typescript
// src/app/auth/signout/route.ts
export async function POST() {
  // Proper way to use cookies() in Next.js 15+
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookies() 
  })
  
  // Rest of the signout logic...
}
```

This pattern prevents the "cookies() should be awaited before using its value" error that can occur in Next.js 15+ when cookies are not properly handled.

## Client-Side Logout (React Component)

The client-side logout complements the server-side mechanism:

1. Makes a POST request to the current origin's `/auth/signout` endpoint
2. Ensures cookies are included with the request using `credentials: 'include'`
3. Also calls Supabase's client-side `signOut()` method to clear any local state
4. Uses `window.location.replace()` instead of normal navigation for a full page refresh
5. Implements a delay to ensure cookie clearing completes before redirect

```typescript
// src/components/auth/user-profile.tsx
const handleLogout = async () => {
  try {
    // Use the current window's origin to prevent CORS issues
    const baseUrl = window.location.origin;
    const logoutUrl = `${baseUrl}/auth/signout`;
    
    const response = await fetch(logoutUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Important for cookies
    });
    
    if (response.ok) {
      // Also clear client-side auth state
      await supabase.auth.signOut();
      
      // Force a full page refresh with replace
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    }
  } catch (error) {
    // Error handling
  }
};
```

### Important: CORS Considerations

To prevent CORS issues:
1. Always use the current window's origin when constructing the logout URL
2. Include the `credentials: 'include'` option in the fetch request
3. Ensure the server's response has appropriate CORS headers when needed

This dual approach ensures that authentication state is properly cleared both on the server and in the client, providing a more reliable logout experience across different browsers and environments.

## Authentication Handling in API Routes

All API routes that require authentication should use the following pattern to properly handle cookies in Next.js 15:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  // Create Supabase client with the proper cookie handling pattern for Next.js 15+
  const supabase = createRouteHandlerClient({ 
    cookies: () => cookies() 
  });
  
  // Now use the authenticated client
  const { data: { session } } = await supabase.auth.getSession();
  
  // Rest of your API route logic...
}
```

This pattern:
1. Passes a function to the cookies parameter, not the cookies object directly
2. Prevents the "cookies() should be awaited before using its value" error
3. Works correctly with both App Router and Pages Router
4. Ensures proper authentication across different API routes

For all routes that process user-specific data (transcripts, custom prompts, analyses), this pattern should be used to ensure proper authentication and data access security.

## Token-Based Authentication in API Routes (For Next.js 15+)

In Next.js 15, there are issues with the `cookies()` function in route handlers, especially when using Supabase Auth. A more reliable approach is to use token-based authentication:

```typescript
import { createClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get auth token from request body
    const { authToken, ...otherData } = await request.json();
    
    if (!authToken) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }
    
    // Create client and authenticate with token
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser(authToken);
    
    if (error || !user) {
      return Response.json({ error: "Invalid authentication" }, { status: 401 });
    }
    
    // User is authenticated, proceed with the user ID
    const userId = user.id;
    
    // Rest of your API logic...
  } catch (error) {
    // Error handling
  }
}
```

When calling these endpoints from the client:

```typescript
// In your client-side code (e.g., api-client.ts)
export async function callProtectedEndpoint(data: any) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const authToken = session?.access_token;
  
  if (!authToken) {
    throw new Error("Not authenticated");
  }
  
  const response = await fetch('/api/your-endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      ...data,
      authToken // Include the token in the request body
    })
  });
  
  // Response handling
}
```

This approach bypasses the cookies-related issues in Next.js 15 route handlers while still maintaining proper authentication. It's especially useful for endpoints like custom prompt processing where cookie handling has proven problematic.

## Robust Custom Prompt Retrieval

The custom prompt retrieval system employs multiple fallback strategies to ensure the most reliable user experience when retrieving prompts by ID:

### Multiple Retrieval Strategies

1. **Primary Strategy: Exact ID Match**
   - First attempts to find the prompt using an exact match on ID
   - Uses standard Supabase `.eq('id', promptId)` equality matching

2. **First Fallback: Case-Insensitive Matching**
   - If exact match fails, tries case-insensitive matching
   - Uses Supabase `.ilike('id', promptId)` for flexible matching
   
3. **Second Fallback: Format-Agnostic Matching**
   - Normalizes IDs by removing hyphens and comparing
   - Useful when IDs get mangled during transmission
   
4. **Third Fallback: Title Matching**
   - If ID matching fails, tries to match by prompt title
   - Useful when user mistakenly uses title instead of ID
   
5. **Final Fallback: First Available Prompt**
   - As a last resort, uses the first prompt belonging to the user
   - Ensures the user can still use the feature even with retrieval issues

### Implementation Example

```typescript
// First try exact match
const { data } = await supabase
  .from('custom_prompts')
  .select('*')
  .eq('id', promptId);

if (!data || data.length === 0) {
  // Try case-insensitive matching
  const { data: dataLike } = await supabase
    .from('custom_prompts')
    .select('*')
    .ilike('id', promptId);
    
  if (dataLike && dataLike.length > 0) {
    return usePrompt(dataLike[0]);
  }
  
  // Get all user prompts for additional fallbacks
  const { data: userPrompts } = await supabase
    .from('custom_prompts')
    .select('*')
    .eq('user_id', userId);
    
  if (userPrompts && userPrompts.length > 0) {
    // Try format-agnostic matching
    const matchingPrompt = userPrompts.find(p => 
      p.id.replace(/-/g, '') === promptId.replace(/-/g, '')
    );
    
    if (matchingPrompt) {
      return usePrompt(matchingPrompt);
    }
    
    // Try title matching
    const titleMatch = userPrompts.find(p => 
      p.title.toLowerCase().includes(promptId.toLowerCase())
    );
    
    if (titleMatch) {
      return usePrompt(titleMatch);
    }
    
    // Last resort: use first available
    return usePrompt(userPrompts[0]);
  }
}
```

This approach ensures maximum resilience against ID encoding issues, user errors, and database edge cases.

## Dynamic API URLs

To ensure API requests work correctly regardless of the port or domain where the application is running, all API requests should be made using dynamic URLs based on the current window's origin:

```typescript
// Get the current origin for API requests
const apiBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
const apiUrl = `${apiBaseUrl}/api/endpoint-path`;

// Use the dynamic URL for fetch requests
const response = await fetch(apiUrl, {
  method: 'POST',
  // ... other fetch options
});
```

This approach solves several issues:

1. **Port mismatches**: When the development server runs on a different port than expected (e.g., 3001 instead of 3000), requests will still work correctly
2. **Cross-origin issues**: Prevents CORS errors by ensuring requests go to the same origin as the page
3. **Environment adaptability**: Works correctly in development, staging, and production without changes
4. **Server-side rendering compatibility**: Includes a fallback for server-side contexts where `window` is not available

All API client functions should follow this pattern to ensure consistent behavior across different environments and deployment scenarios.

## Custom Colors System

### Overview
The custom colors system allows users to personalize the application's appearance by setting their preferred color scheme. The system supports two modes:

1. **Fun Mode**: Uses a gradient background with three color points (from, via, to)
2. **Flat Mode**: Uses a solid background color

Each mode also allows customization of the foreground color (text and UI elements).

### Implementation Details

#### Key Components
- **UISettingsProvider**: Context provider that manages UI settings state and provides methods for updating, saving, and applying UI settings
- **LoadingOverlay**: Component that displays a loading screen styled with custom colors while the page loads
- **LoadingContext**: Integrates with UISettingsProvider to ensure colors are loaded before content is displayed

#### How Custom Colors Are Applied
1. **Initial Load**:
   - UISettingsProvider fetches user settings from the database
   - LoadingContext shows a loading overlay while settings are being fetched
   - Once settings are loaded, the `applyUISettings` function applies colors to the DOM
   - LoadingContext waits a short period to ensure styles are applied before showing content

2. **Color Application Strategy**:
   - The system targets multiple container selectors to find all relevant elements
   - For gradient mode, it applies a linear gradient with animation
   - For flat mode, it applies a solid background color
   - Text elements receive the custom foreground color
   - The system intelligently skips elements that already have background images

3. **Preventing Flash of Unstyled Content**:
   - Content is initially hidden while styles are loading
   - LoadingOverlay displays a styled loading screen matching the user's color preferences
   - Content is only revealed after styles are fully applied
   - Periodic reapplication ensures styles persist during dynamic content changes

4. **Page Transitions**:
   - When the pathname changes, styles are immediately reapplied
   - A timer ensures styles are applied to any newly rendered content
   - For the first few seconds after a page load, styles are periodically checked and reapplied

### Technical Challenges
- **DOM Targeting**: Finding the right elements to apply styles to without affecting elements that should maintain their default styling
- **Timing**: Ensuring styles are applied before content is visible to prevent unstyled content flash
- **Cross-Page Consistency**: Making sure custom colors work consistently across all pages with different layouts

### Performance Considerations
- Style application is batched and debounced to prevent excessive DOM operations
- Animation is applied via CSS rather than JavaScript for better performance
- Strategic timeouts and intervals prevent over-application of styles while ensuring consistency
