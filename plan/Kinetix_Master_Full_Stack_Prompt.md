# KINETIX — MASTER FULL-STACK WEBSITE & PLATFORM SPECIFICATION

## 1. ROLE

You are a senior full-stack product engineer, UI/UX designer, product architect, database architect, motion designer, and security engineer.

Your task is to design and build a complete production-ready web platform for **KINETIX**, an international career mobility and travel agency.

This is NOT a simple landing page.

KINETIX is a complete platform consisting of:

1. Public marketing website
2. Country and travel/work opportunity catalog
3. Program detail pages
4. Pricing and installment system
5. Customer application system
6. Document upload system
7. Referral / promo-code system
8. Sales Partner portal
9. Commission tracking system
10. Sales Partner levels and rewards
11. Customer discounts
12. Admin dashboard
13. Application management
14. Country/program management
15. Pricing management
16. Payment-plan management
17. Commission management
18. Analytics
19. Authentication and role-based permissions
20. Secure document storage
21. Kinetix AI assistant-ready architecture

The final product must feel like a **premium international mobility platform**, not a traditional travel agency website.

---

# 2. TECHNOLOGY STACK

## Frontend

Use:

- Next.js
- TypeScript
- App Router
- React
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons

Use reusable components and a scalable component architecture.

The application must be fully responsive.

Prioritize:

- Mobile
- Tablet
- Desktop
- Large screens

Mobile experience must be excellent because a large percentage of users will arrive from Instagram, TikTok, Facebook, WhatsApp, and other social platforms.

---

# 3. BACKEND

Use:

## Supabase

Use Supabase for:

- PostgreSQL database
- Authentication
- User management
- Storage
- Row Level Security
- Database functions
- Triggers where appropriate
- Realtime where useful

Do not build an unnecessary custom backend if Supabase can handle the requirement securely.

---

# 4. BRAND IDENTITY

Brand:

# KINETIX

The visual identity should communicate:

- Movement
- Career growth
- International opportunities
- Progress
- Trust
- Premium service
- Modern technology
- Global mobility

The website should NOT look like:

- A cheap travel agency
- A generic visa office
- A tourist booking website
- A generic SaaS dashboard
- A cryptocurrency website
- A template-based WordPress website

It should feel like a premium international mobility company.

---

# 5. COLOR SYSTEM

The primary visual system must use:

## Deep Dark Navy

Main brand color.

Use it for:

- Hero backgrounds
- Navigation
- Footer
- Major CTAs
- Dark sections
- Dashboard navigation
- Premium cards

## Warm Beige

Use as the main accent.

Use it for:

- Highlights
- Active states
- Small labels
- Borders
- Decorative elements
- Important numbers
- Selected states
- Premium visual details

## Off-White

Use for:

- Main page backgrounds
- Content sections
- Cards
- Large whitespace areas

The combination should feel:

**Dark Navy + Warm Beige + Off-White**

Do NOT overuse gradients.

Avoid excessive neon colors.

Avoid excessive glassmorphism.

Avoid rainbow gradients.

---

# 6. TYPOGRAPHY

Use a modern premium sans-serif typography system.

Typography should have:

- Large editorial headlines
- Strong hierarchy
- Comfortable line height
- Clean body text
- High readability

Headlines should feel confident and premium.

Example:

"Your next career move starts here."

Do not use overly futuristic fonts.

Do not use decorative fonts.

---

# 7. ICONOGRAPHY

VERY IMPORTANT:

Use **outline icons only**.

Icons should be:

- Thin
- Clean
- Geometric
- Consistent
- Minimal

Use Lucide Icons or equivalent outline icon system.

DO NOT use:

- Filled icons
- Cartoon icons
- 3D icons
- Emoji as interface icons
- Mixed icon styles

All icons across the website must follow one consistent outline style.

---

# 8. VISUAL STYLE

The design direction should combine:

### Premium International Editorial

with

### Mobility Technology

with

### Modern Minimalism

Use:

- Large typography
- Strong whitespace
- High-quality photography
- Editorial layouts
- Route lines
- Location markers
- Minimal maps
- Travel/mobility visual language
- Subtle geometric elements

The design should communicate movement without becoming visually noisy.

---

# 9. PHOTOGRAPHY

Do not fill the website with generic tourist photos.

Photography should focus on:

- Young professionals
- Students
- Workers
- Modern workplaces
- European cities
- Airports
- Arrival moments
- Accommodation
- Professional environments
- International lifestyle
- People preparing for their next career move

The visual story should be:

## Person → Opportunity → Journey → New Life

For country pages, combine:

- Country/location photography
- Workplace photography
- Lifestyle photography
- Program-related visuals

Avoid cliché tourist imagery whenever possible.

Use consistent photographic treatment throughout the website.

---

# 10. ANIMATION SYSTEM

Use **Framer Motion**.

Animations must feel:

- Premium
- Smooth
- Intentional
- Fast enough
- Subtle

Do NOT create excessive animations.

Use:

### Hero

- Text reveal
- Image movement
- Route line animation
- Location point animation

### Scroll

- Fade-in
- Slide-up
- Staggered card entrance
- Image reveal
- Number count-up

### Cards

On hover:

- Slight movement
- Subtle image scale
- Border/highlight transition
- Arrow movement

### Navigation

Use subtle transitions.

### Page transitions

Use smooth transitions where appropriate.

### Dashboard

Keep animation minimal.

Performance must always take priority over visual effects.

Respect `prefers-reduced-motion`.

---

# 11. WEBSITE STRUCTURE

Create the following public pages.

## Homepage

Sections:

1. Navigation
2. Hero
3. Explore Opportunities
4. Countries
5. Featured Programs
6. How Kinetix Works
7. Why Kinetix
8. Pricing / transparent costs
9. Payment plans
10. Referral / partner section
11. FAQ
12. CTA
13. Footer

---

# 12. HOMEPAGE HERO

Create a premium hero.

Main headline:

# Your next career move starts here.

Supporting text:

Explore international work opportunities, understand the costs, prepare your documents, and start your journey with Kinetix.

Primary CTA:

**Explore Opportunities**

Secondary CTA:

**Start Your Application**

Visual direction:

- Dark navy background
- Premium international photography
- Subtle route line
- Animated location points
- Beige highlights
- Off-white typography
- Minimal geometric details

The hero must immediately communicate:

International mobility + career + opportunity.

---

# 13. COUNTRY SECTION

Headline:

# Where could your next move take you?

Display country cards.

Initial countries:

- Bulgaria
- Luxembourg
- Armenia
- Russia
- Italy

The architecture must allow Admins to add unlimited additional countries later.

Each country card should include:

- Country flag
- Country name
- Main image
- Available programs
- Starting price
- Short description
- CTA

Example:

Bulgaria

Seasonal Work

From €X

View Program →

---

# 14. COUNTRY PAGE

Every country gets a dynamic page.

Example:

`/countries/bulgaria`

Sections:

1. Hero
2. Country overview
3. Available programs
4. Program cards
5. Estimated costs
6. Payment plans
7. Required documents
8. Eligibility
9. Timeline
10. Application process
11. FAQ
12. CTA

All content must come dynamically from Supabase.

Do NOT hard-code country information into React components.

---

# 15. PROGRAM SYSTEM

Each country can contain multiple programs.

Examples:

- Seasonal Work
- Student Seasonal Work
- Direct Employment
- Skilled Worker
- Job Seeker
- Freelance / Digital Nomad
- Other future programs

The Admin must be able to create unlimited programs.

Each program contains:

- Name
- Slug
- Country
- Program type
- Description
- Target audience
- Contract type
- Duration
- Salary
- Salary currency
- Salary notes
- Eligibility
- Language requirement
- Experience requirement
- Required documents
- Estimated processing time
- Program price
- Currency
- Deposit
- Payment plans
- Included services
- Excluded costs
- Additional costs
- Status
- Featured
- Images
- FAQs

---

# 16. PROGRAM DETAIL PAGE

Example:

# Bulgaria — Seasonal Work

Display:

Program type

Seasonal Employment

Duration

X months

Salary

€X – €X

Processing time

X–X weeks

Then:

## Program Cost

# €X,XXX

Clearly state:

"Starting from"

or

"Total program cost"

depending on configuration.

---

# 17. PRICE TRANSPARENCY

Pricing is a CORE feature.

Do not hide pricing.

Every applicable program should clearly show:

- Base price
- Discount
- Final price
- Deposit
- Installment options
- Other estimated costs

Separate:

### Kinetix Program Cost

from:

### Estimated Personal / External Expenses

For example:

| Cost | Amount |
|---|---:|
| Program Fee | €X |
| Visa-related expenses | €X |
| Insurance | €X |
| Accommodation | €X |
| Other expenses | €X |

Use configurable labels because actual costs vary by program.

Never invent real prices.

Use placeholder/sample data only for development.

---

# 18. INSTALLMENT SYSTEM

Every program can have multiple payment plans.

Examples:

### Full Payment

€3,000

### 2 Installments

€1,500 × 2

### 3 Installments

€1,000 × 3

But the values must be configurable from Admin.

Payment plan fields:

- Name
- Number of installments
- Deposit amount
- Installment amount
- Currency
- Due date rules
- Processing fee
- Total amount
- Eligibility
- Active/inactive
- Notes

The system must support custom plans.

Do not assume every program has the same payment structure.

---

# 19. PRICING CALCULATOR

Create an interactive pricing component.

Example:

Program:

Bulgaria Seasonal Work

Base Price:

€3,000

Promo Code:

KIN-AHMED25

Partner Discount:

5%

Discount:

€150

Final Price:

# €2,850

Then show:

Full Payment:

€2,850

2 Payments:

€1,425 × 2

3 Payments:

€950 × 3

The calculator must dynamically calculate prices.

Never calculate important financial values only on the client.

All final pricing and discount validation must be verified server-side.

---

# 20. PROMO CODE SYSTEM

Every Sales Partner gets a unique promo code.

Example:

`KIN-AHMED25`

Promo codes must be unique.

A promo code can have:

- Owner
- Discount percentage
- Maximum discount
- Start date
- End date
- Active/inactive
- Eligible programs
- Usage limit
- Total usage
- Tracking information

Promo codes must be validated server-side.

---

# 21. REFERRAL SYSTEM

Each Sales Partner receives:

## Promo Code

Example:

`KIN-AHMED25`

and

## Referral URL

Example concept:

`/apply?ref=KIN-AHMED25`

When someone enters through a referral link:

- Store referral attribution
- Store partner ID
- Store referral code
- Track session where possible
- Preserve attribution during the application process

If the user later enters a promo code, validate the relationship.

Prevent arbitrary users from assigning themselves to a partner.

---

# 22. CUSTOMER APPLICATION FLOW

CTA:

# Start Your Application

Application should be multi-step.

## Step 1 — Personal Information

- Full name
- Phone
- WhatsApp
- Email
- Date of birth
- Nationality
- Governorate / city

## Step 2 — Travel Information

- Country
- Program
- Applicant type
- Education
- Experience
- Language
- Preferred start date

## Step 3 — Referral

Ask:

"Do you have a Kinetix Promo Code?"

Input:

Promo Code

Automatically display:

Partner

Discount

Final estimated price

## Step 4 — Documents

Allow secure document upload.

Examples:

- Passport
- CV
- Qualification
- Police clearance
- Personal photos
- Other program-specific documents

## Step 5 — Review

Show:

- Personal information
- Program
- Pricing
- Discount
- Payment plan
- Documents
- Terms

## Step 6 — Submit

Application confirmation.

---

# 23. APPLICATION STATUS

Applications should have statuses.

Example lifecycle:

`New`

→ `Under Review`

→ `Documents Required`

→ `Documents Submitted`

→ `Processing`

→ `Approved`

→ `Completed`

→ `Rejected`

Admin can configure or extend statuses later.

Customers can see their current status.

---

# 24. LEAD SYSTEM

Do not define every registration as a commissionable lead.

Use lifecycle stages:

Visitor

→ Lead

→ Qualified Lead

→ Application

→ Documents Submitted

→ Approved

→ Completed

Commission rules must be configurable.

This prevents fake registrations from automatically generating commissions.

---

# 25. SALES PARTNER SYSTEM

Create a dedicated Sales Partner portal.

Sales Partners have their own login.

Dashboard should include:

- Total Leads
- Qualified Leads
- Applications
- Approved Applications
- Completed Applications
- Total Commission
- Pending Commission
- Paid Commission
- Current Level
- Client Discount
- Referral Code

---

# 26. SALES PARTNER PROFILE

Each partner has:

- Name
- Profile photo
- Phone
- Email
- Partner ID
- Promo Code
- Referral link
- Level
- Leads
- Applications
- Conversion metrics
- Commission
- Discount percentage
- Account status

---

# 27. SALES PARTNER LEVEL SYSTEM

Create a configurable tier system.

Example development data:

### Starter
0–4 leads

### Bronze
5–9

### Silver
10–19

### Gold
20–39

### Platinum
40+

These are SAMPLE values.

Admin must be able to change:

- Level name
- Minimum leads
- Maximum leads
- Commission
- Client discount
- Benefits
- Badge

Do not hard-code the levels.

---

# 28. SALES GAMIFICATION

Show partner progress.

Example:

# GOLD

27 / 40 qualified leads

13 more qualified leads to reach Platinum

Use:

- Progress bar
- Badge
- Number counters
- Milestone cards

Keep the visual style premium.

Do not make it childish.

---

# 29. COMMISSION SYSTEM

Commission should NOT automatically be created just because someone registered.

Commission can depend on application status.

Example configurable rules:

Lead → 0%

Documents Submitted → partial

Approved → larger amount

Completed / Paid → full commission

Admin must be able to configure commission rules.

Commission record should include:

- Partner
- Customer
- Application
- Program
- Commission type
- Commission amount
- Currency
- Status
- Created date
- Approved date
- Paid date
- Notes

Commission statuses:

`Pending`

`Approved`

`Paid`

`Cancelled`

---

# 30. CLIENT DISCOUNT SYSTEM

Partner levels can unlock customer discounts.

Example:

Starter → 0%

Bronze → 2%

Silver → 4%

Gold → 6%

Platinum → 8%

These are sample values only.

Admin must control all percentages.

Discount must be calculated server-side.

Never allow users to modify the discount through frontend requests.

---

# 31. SALES PARTNER REFERRAL PAGE

Create a public page:

# Turn connections into opportunities.

Explain:

- Earn commissions
- Get your own referral code
- Unlock better client discounts
- Track your leads
- Track applications
- Track earnings

CTA:

**Become a Kinetix Sales Partner**

---

# 32. CUSTOMER DASHBOARD

Customers should be able to log in.

Dashboard:

### My Application

Program

Country

Status

Current step

Required documents

Uploaded documents

Pricing

Payment plan

Discount

Application timeline

Messages / notifications if implemented

---

# 33. ADMIN DASHBOARD

Create a full admin portal.

Sidebar:

- Overview
- Countries
- Programs
- Applications
- Customers
- Sales Partners
- Promo Codes
- Pricing
- Installments
- Commissions
- Payments
- Documents
- Analytics
- Settings

---

# 34. ADMIN OVERVIEW

Display:

- Total Leads
- New Applications
- Active Applications
- Approved
- Rejected
- Completed
- Sales Partners
- Total Commissions
- Pending Commissions
- Paid Commissions
- Revenue
- Conversion metrics

Use premium data visualization.

Do not overcrowd the dashboard.

---

# 35. ADMIN COUNTRY MANAGEMENT

Admin can:

- Create country
- Edit country
- Delete/archive country
- Upload images
- Add programs
- Change status
- Feature country
- Edit description
- Edit requirements

---

# 36. ADMIN PROGRAM MANAGEMENT

Admin can:

- Create
- Edit
- Archive
- Publish/unpublish
- Feature
- Change salary
- Change duration
- Change requirements
- Change documents
- Change pricing
- Change payment plans
- Change estimated costs
- Change FAQs

---

# 37. ADMIN PRICING MANAGEMENT

Create a dedicated pricing management interface.

Admin should be able to configure:

- Base price
- Currency
- Deposit
- Discounts
- Payment plans
- External estimated expenses
- Additional fees
- Effective date
- Program eligibility

Provide clear preview:

### Customer sees

Original price

Discount

Final price

Payment plan

---

# 38. ADMIN SALES PARTNER MANAGEMENT

Admin can:

- Create partner
- Approve partner
- Suspend partner
- Activate partner
- View partner
- Edit partner
- Assign level
- Generate promo code
- Change commission
- Change discount
- View referrals
- View applications
- View earnings
- Mark commission as paid

---

# 39. ADMIN APPLICATION MANAGEMENT

Admin can:

- View applications
- Filter
- Search
- Sort
- Open application
- View customer information
- View documents
- Change status
- Request missing documents
- Add notes
- Assign internal staff
- View referral source
- View promo code
- View discount
- View pricing
- View payment plan

---

# 40. DOCUMENT SYSTEM

Use Supabase Storage.

Documents must be private.

Do NOT create publicly accessible document URLs.

Use secure signed URLs where appropriate.

Storage should support:

- Upload
- Preview where safe
- Download
- Delete
- Replace
- Document status

Document statuses:

`Required`

`Uploaded`

`Under Review`

`Approved`

`Rejected`

`Needs Replacement`

---

# 41. SECURITY

Implement:

- Supabase Auth
- Row Level Security
- Role-based access control
- Private storage buckets
- Secure file access
- Server-side validation
- Rate limiting where appropriate
- Protected routes
- Secure API/database access
- No sensitive data in client-side source
- No service role key exposed to frontend
- Environment variables for secrets

Roles:

`customer`

`sales_partner`

`admin`

Potential future role:

`staff`

---

# 42. DATABASE ARCHITECTURE

Design a normalized PostgreSQL schema.

Suggested tables:

- profiles
- roles
- countries
- programs
- program_images
- program_requirements
- program_documents
- pricing
- payment_plans
- payment_installments
- promo_codes
- sales_partners
- partner_levels
- leads
- applications
- application_documents
- application_status_history
- commissions
- commission_rules
- customers
- notifications
- faq
- audit_logs
- settings

Do not blindly create every table if a better normalized architecture exists.

Explain relationships clearly.

Use UUIDs.

Use timestamps.

Use indexes for common queries.

Use foreign keys.

Use appropriate constraints.

---

# 43. DATABASE BUSINESS RULES

The database must preserve:

- One application belongs to one customer
- One application belongs to one program
- One program belongs to one country
- A referral can belong to one Sales Partner
- A promo code belongs to one Sales Partner unless configured otherwise
- A commission belongs to a partner and application
- Payment plans belong to programs
- Installments belong to payment plans/application payment schedules
- Documents belong to applications

Prevent invalid orphan records.

---

# 44. REFERRAL ATTRIBUTION

Store:

- referral code
- partner ID
- first attribution
- application attribution
- promo code used
- timestamp

Define a clear attribution rule.

Default recommendation:

First valid referral attribution is preserved unless an Admin overrides it.

Do not silently overwrite attribution.

---

# 45. PAYMENT SYSTEM ARCHITECTURE

For the first version, the website should support:

- Payment plan display
- Installment schedule
- Payment status
- Admin payment tracking
- Payment receipts/notes

Structure the architecture so a real payment gateway can be integrated later.

Do not fake successful payment transactions.

Possible future integration:

- Stripe
- Paymob
- Other regional gateway

Keep the payment abstraction flexible.

---

# 46. INSTALLMENT TRACKING

Each application can have a payment schedule.

Example:

Total:

€3,000

Deposit:

€1,000

Remaining:

€2,000

Installment 1:

€1,000 — Due Date

Installment 2:

€1,000 — Due Date

Statuses:

`Pending`

`Due`

`Paid`

`Overdue`

`Cancelled`

Admin can update payment status.

Customer can see their payment schedule.

---

# 47. SEARCH & FILTERING

Users should be able to filter opportunities by:

- Country
- Program type
- Applicant type
- Salary
- Price
- Availability
- Payment plan availability

Use clean filter UI.

Mobile filters should be accessible through a bottom sheet/drawer.

---

# 48. UX PRINCIPLES

The user should always understand:

1. What is this opportunity?
2. Who is eligible?
3. How much does it cost?
4. Can I pay in installments?
5. What documents do I need?
6. How long does it take?
7. What happens next?
8. How do I apply?

Do not bury important information.

---

# 49. TRUST ELEMENTS

Use carefully designed sections for:

- Transparent pricing
- Clear requirements
- Process timeline
- Document checklist
- FAQs
- Support
- Application tracking

Do not invent:

- Government approvals
- Accreditations
- Success numbers
- Partnerships
- Reviews
- Guarantees

If real data is not provided, use placeholders or hide the section.

---

# 50. LEGAL / DISCLAIMER

Include appropriate configurable legal text.

For example:

Immigration, employment, visa, pricing, and processing requirements may vary depending on applicant profile, employer, country regulations, and current policies.

Program information and prices may change.

Do not make guaranteed visa approval claims.

Admin must be able to edit disclaimer text.

---

# 51. KINETIX AI ASSISTANT

Architect the application so an AI assistant can be added.

The assistant should eventually answer questions based ONLY on approved Kinetix data.

Example questions:

"What programs are available in Bulgaria?"

"How much does Bulgaria Seasonal Work cost?"

"What documents are required?"

"Can I pay in installments?"

"What is the estimated processing time?"

The AI must not invent:

- Prices
- Requirements
- Salaries
- Programs
- Processing times

If information is missing:

"I don't currently have that information in the Kinetix program data."

---

# 52. DESIGN SYSTEM

Create reusable components:

- Navbar
- Footer
- Button
- Badge
- CountryCard
- ProgramCard
- PriceCard
- PaymentPlanCard
- DocumentUploader
- Stepper
- Timeline
- ProgressBar
- Modal
- Drawer
- Table
- DataCard
- DashboardSidebar
- StatCard
- StatusBadge
- PromoCodeInput
- PricingCalculator
- FAQAccordion
- ImageGallery
- Notification
- Toast
- EmptyState
- LoadingState
- ErrorState

Do not duplicate components unnecessarily.

---

# 53. STATES

Every major feature needs:

- Loading
- Empty
- Error
- Success
- Disabled
- Permission denied

Do not leave blank screens.

---

# 54. ACCESSIBILITY

Implement:

- Keyboard navigation
- Proper labels
- Focus states
- Semantic HTML
- ARIA where necessary
- Sufficient contrast
- Reduced motion
- Accessible forms

---

# 55. PERFORMANCE

Optimize:

- Images
- Lazy loading
- Server components where appropriate
- Database queries
- Bundle size
- Animations
- Fonts

Do not sacrifice performance for visual effects.

---

# 56. SEO

Implement:

- Metadata
- Dynamic metadata for countries
- Dynamic metadata for programs
- Open Graph
- Twitter/X cards
- Sitemap
- Robots
- Structured data where appropriate
- Canonical URLs

Each country and program should have SEO-friendly URLs.

---

# 57. MULTILINGUAL ARCHITECTURE

The website should be prepared for:

- English
- Arabic

Arabic must support RTL.

Do not hard-code text throughout components.

Use a proper internationalization architecture.

---

# 58. CONTENT MANAGEMENT

Important public information should come from Supabase whenever it is business data.

Examples:

- Countries
- Programs
- Prices
- Payment plans
- Requirements
- FAQs
- Discounts
- Program availability

This allows Kinetix Admins to update content without modifying code.

---

# 59. NAVIGATION

Desktop:

Logo

Explore Opportunities

Countries

How It Works

For Partners

FAQ

Login

Start Application

Mobile:

Logo

Menu

Primary CTA

Keep navigation minimal.

---

# 60. FOOTER

Include:

Kinetix

International Career Mobility

Countries

Programs

How It Works

For Sales Partners

FAQ

Contact

Terms

Privacy

Disclaimer

Social links

---

# 61. VISUAL DETAILS

Use subtle:

- Route lines
- Dotted paths
- Location markers
- Coordinate-inspired labels
- Thin borders
- Beige highlights
- Large numbers
- Editorial image cropping
- Asymmetric layouts where appropriate

But avoid visual clutter.

Every decorative element must support the concept of movement.

---

# 62. MICROINTERACTIONS

Examples:

Button:

Arrow moves slightly on hover.

Country card:

Image subtly zooms.

Promo code:

Success state animates.

Pricing:

Discount number transitions smoothly.

Application:

Progress indicator moves smoothly.

Dashboard:

Numbers count up only when appropriate.

Do not animate everything.

---

# 63. AUTHENTICATION

Implement:

Customer signup/login

Sales Partner signup/login

Admin login

Use Supabase Auth.

Role must be checked securely.

Never trust a frontend role value.

---

# 64. ADMIN ROUTES

Protect admin routes.

Example:

`/admin`

`/admin/countries`

`/admin/programs`

`/admin/applications`

`/admin/sales-partners`

`/admin/commissions`

`/admin/pricing`

`/admin/payments`

Only authorized users can access them.

---

# 65. SALES ROUTES

Example:

`/partner`

`/partner/dashboard`

`/partner/leads`

`/partner/applications`

`/partner/commissions`

`/partner/profile`

Protect all routes.

A partner must never access another partner's private information.

---

# 66. CUSTOMER ROUTES

Example:

`/account`

`/account/application`

`/account/documents`

`/account/payments`

Customers can only access their own records.

---

# 67. APPLICATION ROUTES

Example:

`/apply`

`/apply/[program]`

The application should preserve:

- Selected program
- Referral
- Promo code
- Pricing
- Payment plan

through the application process.

---

# 68. ERROR PREVENTION

Never allow:

- Invalid promo codes
- Fake discounts
- Negative prices
- Unauthorized commission changes
- Unauthorized document access
- Partner impersonation
- Customer data leakage
- Duplicate commission records
- Duplicate attribution where prohibited

Use both:

Frontend validation

AND

Backend/database validation.

---

# 69. AUDIT LOGGING

Track important Admin actions:

- Price changes
- Commission changes
- Level changes
- Application status changes
- Partner suspension
- Document status changes
- Payment updates

Audit logs should include:

- Actor
- Action
- Entity
- Old value where appropriate
- New value where appropriate
- Timestamp

---

# 70. ADMIN ANALYTICS

Build analytics around:

- Leads by country
- Leads by program
- Applications by country
- Applications by program
- Referral performance
- Sales Partner performance
- Conversion rates
- Revenue
- Discounts
- Commissions
- Payment status
- Installment performance

Use charts sparingly and clearly.

---

# 71. SAMPLE DEVELOPMENT DATA

Create realistic sample data for development.

Countries:

Bulgaria
Luxembourg
Armenia
Russia
Italy

Do NOT present sample numbers as verified real-world information.

Clearly structure the database so real values can be entered later.

---

# 72. IMPORTANT BUSINESS PRINCIPLE

Kinetix must present information transparently.

Do not promise:

"Guaranteed visa"

"Guaranteed job"

"Guaranteed approval"

unless explicitly configured and legally verified.

Use wording such as:

"Estimated"

"Starting from"

"Subject to eligibility"

"Requirements may vary"

"Processing times may vary"

---

# 73. UI QUALITY BAR

The final website must look like a professionally funded international company.

Avoid:

- Generic gradients
- Huge unnecessary rounded cards
- Excessive shadows
- Random colors
- Cheap stock photography
- Filled icons
- Excessive animations
- Template-looking dashboards
- Poor spacing
- Inconsistent typography

The visual quality must remain consistent from:

Homepage

→ Country pages

→ Program pages

→ Application

→ Customer dashboard

→ Partner dashboard

→ Admin dashboard.

---

# 74. DEVELOPMENT APPROACH

Do not generate the entire application as one giant component.

Build modularly.

Suggested order:

### Phase 1
Design system

### Phase 2
Database schema

### Phase 3
Authentication

### Phase 4
Public website

### Phase 5
Country/program CMS

### Phase 6
Pricing/installments

### Phase 7
Application system

### Phase 8
Referral system

### Phase 9
Sales Partner portal

### Phase 10
Commission system

### Phase 11
Customer dashboard

### Phase 12
Admin dashboard

### Phase 13
Security/RLS

### Phase 14
Testing

### Phase 15
SEO/performance

### Phase 16
Final visual polish

---

# 75. IMPORTANT AGENT BEHAVIOR

Before implementing a feature:

Understand the existing architecture.

Do not overwrite working functionality unnecessarily.

Do not create duplicate components.

Do not create duplicate database tables.

Do not expose secrets.

Do not bypass RLS.

Do not use mock backend logic when real Supabase functionality is required.

Do not hard-code business-critical values.

Use environment variables.

---

# 76. FINAL PRODUCT EXPERIENCE

When a visitor opens Kinetix, the experience should feel like:

"I can discover an international opportunity."

Then:

"I understand the requirements."

Then:

"I know exactly how much it costs."

Then:

"I can see whether installments are available."

Then:

"I can calculate my discount."

Then:

"I can apply."

Then:

"I can track my application."

For Sales Partners:

"I can refer people."

"I can track my leads."

"I can see my commission."

"I can see my level."

"I can unlock better benefits."

For Admin:

"I can manage the entire business from one place."

---

# 77. FINAL DESIGN DIRECTION

The final design language is:

## KINETIX

**Premium International Mobility**

Color palette:

**Deep Dark Navy**
+
**Warm Beige**
+
**Off-White**

Typography:

**Modern / Editorial / Premium**

Icons:

**Outline / Line only**

Photography:

**Human / Career / International / Editorial**

Animation:

**Subtle / Smooth / Premium / Motion-focused**

UI:

**Minimal / Spacious / High-end / Data-driven**

Brand concept:

# Move Further.

The entire experience should visually communicate movement, opportunity, progress, and international career growth.

---

# 78. FINAL REQUIREMENT

Build the system as a real scalable product.

Do not stop at visual mockups.

Do not build fake dashboards.

Do not use fake authentication.

Do not create fake commission calculations.

Do not create fake pricing logic.

Do not expose sensitive documents.

Do not hard-code country/program/pricing information.

Use Next.js + TypeScript + Supabase properly.

The final result must be:

**A production-ready Kinetix international mobility platform with a premium frontend, secure Supabase backend, customer applications, pricing and installment management, Sales Partner referrals, promo codes, discounts, commission tracking, levels, and a complete Admin CMS.**

Before declaring the project complete, test:

- Authentication
- Roles
- RLS
- Referral attribution
- Promo codes
- Discounts
- Pricing calculation
- Installment calculations
- Applications
- Document uploads
- Commission creation
- Commission status
- Admin permissions
- Partner permissions
- Customer permissions
- Mobile responsiveness
- SEO
- Performance
- Accessibility
- Error states

Do not declare completion until the core flows work end-to-end.
