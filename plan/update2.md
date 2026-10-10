Travel Platform — Full Bug Fixes, UX Improvements & Business Rules Update

Instructions for the AI Agent

You are working on an existing travel and overseas employment platform. Your task is to audit the current application, identify the root causes of the issues listed below, and implement the required fixes across the frontend, backend, database, and UI.

Important rules:

- Inspect the existing codebase, database schema, and application flow before making changes.
- Preserve the existing architecture, design system, working features, and integrations wherever possible.
- Do not rebuild the entire application from scratch.
- Do not implement superficial UI fixes while leaving broken business logic or database behavior unresolved.
- Reuse existing components and database tables when appropriate.
- Ensure all forms, validations, uploads, calculations, and state transitions work end to end.
- Do not use mock data in production flows.
- Make all changes responsive, mobile-first, accessible, and consistent with the existing visual identity.
- After implementation, test the complete user journey and report all changes, migrations, and unresolved issues.

---

1. Programs, Countries & Flights

1.1 Add flights to all countries and programs

Ensure that flights are included in all applicable countries and travel programs.

Requirements:

- Audit all countries and programs currently available on the platform.
- Ensure each applicable program has the correct flight information and associated pricing.
- Include flight costs in the appropriate program pricing and total-cost calculations.
- Ensure the flight information is consistent across country pages, program cards, program details, application summaries, and deposit calculations.
- Do not duplicate flight costs when calculating the total program price.
- If flight details vary by country or program, use the appropriate program-specific data rather than a single hardcoded value.
- Do not invent flight prices. Use verified existing data or flag missing prices for configuration.

1.2 Program eligibility badges

On each country page, display a small eligibility indicator next to the program name.

Supported categories:

- Students
- Graduates

Design requirements:

- Use a minimal, outline-style icon.
- Do not use filled or brightly colored icons.
- Keep the badge subtle, compact, and consistent with the existing design system.
- Make eligibility immediately understandable without cluttering the program card.
- Ensure the same eligibility information is available on the program details page.

1.3 Graduate program pricing

Apply the following business rule:

The total displayed price of every graduate program must not exceed EGP 50,000.

Requirements:

- Audit all graduate programs and their associated price components.
- Adjust the configured graduate program prices so that each program's total price is no more than EGP 50,000.
- Include applicable flight costs when calculating the displayed total.
- Ensure the rule is enforced consistently across the frontend and backend.
- Do not merely hide the excess amount or cap the displayed price while charging a higher amount.
- If the actual underlying cost structure cannot support the limit, flag the affected programs for review instead of silently creating misleading prices.
- Student program pricing should remain unchanged unless explicitly required elsewhere.

---

2. Fix and Redesign the "Your Details" Step

The personal-details form is currently broken. Rebuild its field structure, conditional logic, validation, and responsive layout while preserving compatibility with the existing application submission process.

2.1 Name fields

Replace the existing name input with two separate fields:

- First Name
- Second Name

Requirements:

- Both fields must be independently editable.
- Apply appropriate required-field validation.
- Preserve the values correctly when navigating between application steps.
- Ensure the backend receives the correct structured values and can associate them with the applicant.

2.2 Phone number with country code

Redesign the phone number field.

Requirements:

- Display the appropriate country calling code in a separate, preselected prefix field.
- The user should enter only the remaining 10 digits for the Egyptian mobile number.
- Validate that exactly 10 digits are entered after the prefix.
- Prevent duplicate country codes from being appended.
- Store the normalized phone number consistently in the database.
- Keep the field easy to use on mobile devices.
- If the platform supports applicants from other countries, make the calling code configurable without breaking the Egyptian default.

2.3 Date of birth

Replace the current outdated date-of-birth popup with a modern date picker.

Requirements:

- Use a clean, contemporary calendar interface consistent with the platform's design.
- Support convenient month and year navigation.
- Make the component easy to use on mobile devices.
- Apply appropriate date validation.
- Prevent future dates and invalid dates.
- If the program has age requirements, validate eligibility and provide a clear error message.
- Store the date consistently in the database and display it correctly regardless of timezone.

2.4 Education level and Egyptian universities

Redesign the Education Level field with conditional fields.

Education-level options should include:

- Student currently enrolled at a university.
- University graduate.
- Other, if supported by the current business rules.

When the user selects either Student or Graduate:

1. Display a university dropdown.
2. Populate it with the available universities in Egypt.
3. After selecting a university, display a second dropdown containing the faculties or colleges associated with that university.
4. If applicable, display the department or specialization field.
5. For students, collect the relevant enrollment information, such as current academic year.
6. For graduates, collect graduation year and other relevant graduation information.

Technical requirements:

- Use structured university and faculty data, not a manually typed free-text list.
- Store universities and faculties in reusable database tables or a properly managed reference dataset.
- Ensure faculty options depend on the selected university.
- Reset dependent selections when the parent selection changes.
- Provide searchable dropdowns if the lists are large.
- Handle missing or incomplete university data gracefully.
- Do not show irrelevant education fields for applicants who select Other.

2.5 Current city and hometown

Add two separate address-related fields:

Current Residence

- Current City
- Current Address

Hometown

- Hometown City
- Hometown Address

Requirements:

- The applicant must be able to distinguish where they currently live from their original hometown.
- Use separate fields for each city and address.
- Validate the required fields according to the actual application requirements.
- Keep the layout clear and mobile-friendly.

2.6 National ID

Add a mandatory Egyptian National ID field.

Requirements:

- The field must be required for applicants subject to the Egyptian National ID requirement.
- Validate the Egyptian National ID format and length: exactly 14 digits.
- Validate the date-of-birth component when applicable.
- Ensure the ID is not accepted with letters or invalid characters.
- Avoid exposing the National ID in URLs, chat messages, application cards, or unnecessary logs.
- Store and transmit the value securely.
- Do not rely exclusively on frontend validation; validate on the server as well.

2.7 Additional relevant fields

Audit the current application requirements and add any genuinely necessary missing fields, such as:

- Email address, if not already collected.
- Gender, when required for eligibility or documentation.
- Passport status and passport details, when required.
- Emergency contact information, if required by the program.
- Military-service status for male Egyptian applicants when relevant.

Do not add unnecessary fields simply to make the form longer. Any conditional fields must appear only when relevant.

2.8 Form reliability

- Save form data correctly when the user navigates backward or forward.
- Preserve data after page refresh where appropriate.
- Display clear validation errors next to the relevant fields.
- Prevent duplicate application submissions.
- Ensure submitted values match the actual database schema.
- Test empty values, invalid inputs, changing education levels, and interrupted application sessions.

---

3. Documents Step — Required Documents by Applicant Type

Redesign the document-upload step with a clear checklist, modern upload cards, individual upload status indicators, and server-side validation.

Every document must be associated with the correct applicant and application.

3.1 Student application requirements

For Student programs, require the following documents where applicable:

1. University enrollment certificate.
2. National ID card.
3. Passport.
4. Military-service form/document for male applicants when required.
5. Personal photograph.
6. Criminal record certificate (Egyptian police clearance / صحيفة الحالة الجنائية).
7. CV.

Criminal record certificate

The document label must dynamically reflect the destination country.

Example:

"Criminal Record Certificate — For the Embassy of [Destination Country]"

Use the actual destination country associated with the selected program.

Requirements:

- The destination country must come from the selected program's actual data.
- Do not hardcode one country for every application.
- Make the required document's issuing purpose clear.
- Do not claim that a specific embassy endorsement or addressee is mandatory unless the program's requirements confirm it.

3.2 Graduate application requirements

Graduate applicants must provide the applicable student document requirements plus:

1. Health certificate.
2. Social insurance statement / insurance record (برنت تأمين).
3. Employment office registration certificate (كعب عمل).

The required document checklist must change automatically according to the applicant's selected program and eligibility category.

If a graduate is applying to a program with different documented requirements, use that program's configured checklist rather than blindly applying a universal list.

3.3 Document-upload UI

For each document, display:

- Document name.
- Short explanation of what is required.
- Required or optional status.
- Upload button.
- Selected file name.
- Upload progress where available.
- Upload success or failure state.
- Replace and remove actions when allowed.
- Preview for supported file types.

Requirements:

- Clearly distinguish uploaded documents from missing documents.
- Prevent progression to the next step while mandatory documents are missing or still uploading.
- Validate allowed file types and maximum file sizes.
- Verify uploads on the server, not just in the browser.
- Use secure storage and access controls.
- Do not make identity documents publicly accessible.
- Use private storage URLs or signed URLs where appropriate.
- Ensure the files are linked to the correct application record.
- Avoid duplicate uploads and orphaned files.
- Handle failed uploads without losing the rest of the applicant's progress.

---

4. Deposit Step — Rebuild the Fourth Step

The Deposit step is currently broken and must be audited and corrected end to end.

This must be a standalone fourth step, separate from Program, Details, and Documents.

4.1 Four-step application progress indicator

Display the application progress indicator at the top of the application interface.

The progress indicator must remain in a consistent position across all four steps.

Below it, display the step navigation in this order:

1. Program
2. Details
3. Documents
4. Deposit

Requirements:

- Keep the progress indicator visually separate from the step-navigation labels.
- Clearly indicate the current step and completed steps.
- Use a consistent layout and spacing across all screens.
- On mobile, prevent the indicator from becoming overcrowded or causing horizontal overflow.
- Ensure the fourth step is displayed correctly and is not combined with the Documents step.

4.2 Remove duplicate payment-method selection

The applicant already chooses the payment arrangement in the first step.

Therefore:

- Do not ask the applicant to choose between installments and full payment again in the Deposit step.
- Retrieve the previously selected payment arrangement from the persisted application data.
- Display the selected arrangement as a read-only summary if useful.
- Ensure the correct deposit amount and payment schedule are calculated from the original selection.
- Do not allow conflicting payment methods to be stored for the same application.

4.3 Deposit calculations and payment summary

Audit all deposit-related logic and rebuild the summary using the actual program configuration.

Display, where applicable:

- Selected program.
- Total program price.
- Included flight cost.
- Selected payment arrangement.
- Required initial deposit.
- Remaining balance.
- Installment schedule, if applicable.
- Payment status.

Requirements:

- Use a single reliable source of truth for all monetary calculations.
- Do not trust totals supplied directly by the client.
- Calculate amounts on the server or validate them against trusted server-side program data.
- Ensure the deposit, remaining balance, and installment amounts reconcile correctly.
- Do not mark an application as paid unless payment has been confirmed through the appropriate verified payment process.
- Make the deposit summary consistent with the first-step payment selection.

4.4 Application submission and payment state

Audit the transition from the Documents step to the Deposit step and from the Deposit step to final submission.

Requirements:

- Ensure application data remains intact across all four steps.
- Prevent duplicate applications and duplicate payment attempts.
- Keep application status separate from payment status.
- Show a clear confirmation or actionable error message when an operation fails.
- Do not report a successful payment or application submission before the backend confirms it.

---

5. Fix the Live Chat Application Request

The application request currently sends incorrect information to Live Chat, and the application card design is poor.

Fix both the data mapping and the visual presentation.

5.1 Correct application data sent to Live Chat

Audit the complete path from application form submission to Live Chat.

Requirements:

- Identify the source of the incorrect values.
- Map the correct application ID, applicant information, selected country, selected program, education level, payment arrangement, and application status.
- Ensure all values come from the actual saved application record.
- Do not construct the chat payload from stale form state or unrelated hardcoded values.
- Use the same canonical application data source throughout the platform.
- Avoid sending sensitive information such as full National IDs, passport numbers, or private document URLs into chat unless explicitly necessary and securely authorized.
- Include a reliable application reference so support staff can identify the correct request.
- Prevent duplicate or inconsistent application messages.

5.2 Redesign the application card in Live Chat

Create a clean, compact, premium-style application card that fits naturally inside the chat conversation.

The card should display:

- Program name.
- Destination country.
- Application reference.
- Applicant's first and second names, when appropriate.
- Education category: Student or Graduate.
- Selected payment arrangement.
- Application status.
- Relevant next action.

Design requirements:

- Use clear visual hierarchy and consistent spacing.
- Avoid oversized cards, excessive colors, unnecessary borders, and clutter.
- Use subtle outline icons.
- Ensure long program names and country names wrap correctly.
- Make the card responsive on mobile devices.
- Keep the application card visually distinct from ordinary chat messages.
- Provide an action to open the relevant application details when the viewer is authorized.
- Do not expose private applicant information to unauthorized chat participants.

---

6. Critical Bug: Deleted Applications Still Appear

There is a serious data-consistency issue: deleting an application from the database does not remove the application page or its associated information from the interface.

Investigate and fix the root cause.

6.1 Audit possible sources of stale data

Inspect:

- The primary database table and related tables.
- Supabase queries and row-level security policies, if Supabase is used.
- Frontend component state.
- Global state management.
- Browser persistence, local storage, or session storage.
- React Query, SWR, or other client/server caching.
- Next.js server-component and route caching.
- Static generation and revalidation behavior.
- Realtime subscriptions.
- Related Live Chat messages or cached application summaries.
- Any duplicated or denormalized application data.

Do not assume that the issue is caused by one specific caching layer before investigating.

6.2 Expected behavior

When an application is deleted:

- The database deletion must be confirmed.
- Related records must follow the intended deletion policy.
- The deleted application must no longer appear in application lists or detail pages.
- Directly opening a deleted application's URL must return an appropriate not-found or unavailable state.
- Any cached data must be invalidated or revalidated as appropriate.
- Client-side state must update after successful deletion.
- Related chat references must not display misleading active application details.
- File deletion must follow the configured retention and legal requirements.

6.3 Data integrity and security

- Verify deletion permissions on the backend.
- Ensure users cannot delete applications belonging to other users.
- Use database transactions, foreign-key rules, or controlled cleanup procedures where appropriate.
- Do not disable row-level security to make deletion work.
- Avoid indiscriminately deleting historical chat records or payment records.
- If financial or audit records must be retained, preserve them according to the application's retention policy while preventing the deleted application from appearing as active.

Test the full lifecycle: create an application, view it, update it, delete it, refresh the browser, revisit its URL, and inspect the associated chat and database records.

---

7. Standardize All Country Timelines

Reduce the maximum displayed timeline for every country to one month and fifteen days (approximately 45 days).

Apply this consistently to:

- Country pages.
- Program details.
- Footer timeline information.
- "How It Works" sections.
- Any shared timeline components.
- Relevant application information pages.

Requirements:

- Audit all existing timeline text and timeline components.
- Replace inconsistent longer timelines with a maximum of 45 days.
- Use consistent wording and units throughout the website.
- Avoid leaving old timeline text in the footer, static content, metadata, or secondary pages.
- If timelines are dynamically configured per program, update the underlying configuration and all dependent displays.
- Do not promise that every application will necessarily be completed within 45 days if the actual process depends on external authorities, embassies, employers, or document verification.

Use wording that clearly communicates the expected process duration and any applicable conditions without making unsupported guarantees.

---

8. Design and UX Standards

Apply these standards to every updated component:

- Modern, premium, minimal interface.
- Consistent typography, spacing, iconography, and border radii.
- Outline icons rather than unnecessary filled icons.
- Clear field labels and validation messages.
- Responsive behavior across mobile, tablet, and desktop.
- Accessible keyboard navigation and appropriate input labels.
- Loading, empty, success, and error states.
- No broken layouts, horizontal overflow, or misleading disabled controls.
- Consistent application-step navigation.
- Preserve the existing brand identity unless a specific component requires a justified improvement.

Prioritize usability and clarity over decorative effects.

---

9. Backend, Database & Implementation Requirements

Before implementation:

1. Inspect the existing repository and identify the framework, database, authentication system, storage provider, and current application architecture.
2. Trace the application flow from program selection to payment and Live Chat.
3. Identify the database fields and relationships responsible for each issue.
4. Determine which changes require database migrations or reference-data updates.
5. Identify existing tests and add coverage for the affected flows.

During implementation:

- Keep database schema changes backward-compatible where practical.
- Use migrations for structural changes.
- Preserve existing application records during migrations.
- Use server-side authorization and validation.
- Keep pricing calculations consistent and server-validated.
- Use private storage for identity documents.
- Avoid hardcoded country, university, faculty, price, or document-requirement data when those values should be configurable.
- Avoid unnecessary dependencies.
- Ensure errors are logged without exposing sensitive applicant information.
- Make the implementation compatible with the current deployment environment.

---

10. Testing & Acceptance Criteria

Do not consider the task complete until the following scenarios have been tested.

Programs and pricing

- Every applicable program displays the correct flight information.
- Student and Graduate eligibility badges appear correctly.
- No graduate program is configured with a total displayed price above EGP 50,000.
- Pricing does not conceal costs that are still charged to the applicant.

Personal details

- First and Second Name work independently.
- Egyptian phone numbers accept exactly 10 local digits after the calling code.
- Date of birth can be selected and validated correctly.
- Selecting Student or Graduate reveals the correct university and faculty dropdowns.
- Changing a university resets the faculty selection.
- Current City, Current Address, Hometown City, and Hometown Address are stored correctly.
- National ID validation works on both client and server.
- Conditional fields appear only when relevant.

Documents

- Student applications receive the correct student document checklist.
- Graduate applications receive the applicable additional documents.
- Criminal record labels use the actual destination country.
- Uploads are validated, stored securely, and linked to the correct application.
- Required missing documents prevent progression.

Deposit

- Deposit is the fourth independent step.
- The progress indicator remains consistent across all four steps.
- Payment arrangement is selected only once in the first step.
- Deposit and remaining-balance calculations are correct.
- Application and payment statuses are updated only after confirmed backend operations.

Live Chat

- Application messages contain the correct saved application information.
- Application cards are visually consistent and responsive.
- Unauthorized users cannot access private application details.
- Duplicate or stale application cards are not generated unintentionally.

Deletion

- Deleted applications disappear after refresh.
- Deleted application URLs no longer display stale data.
- Related records follow the intended retention policy.
- No unauthorized deletion is possible.

Timelines

- All relevant pages and shared components use the standardized maximum timeline of 45 days.
- No contradictory longer timeline remains in the footer or "How It Works" section.

---

11. Final Deliverables

After completing the work, provide:

1. A summary of the root cause of each major bug.
2. A list of modified files and components.
3. A summary of database migrations and data changes.
4. A list of pricing and document-requirement configuration changes.
5. Test results for each acceptance-criteria group.
6. Any remaining blockers, missing data, or external dependencies.
7. Confirmation of which changes were actually implemented versus which require manual configuration.

Execution priority:

1. Fix application data integrity and deletion behavior.
2. Fix the application flow, form submission, and Live Chat data mapping.
3. Rebuild the Documents and Deposit steps.
4. Implement the university/faculty selection and form validation.
5. Apply flight and graduate-pricing rules.
6. Standardize country timelines.
7. Polish the UI and verify responsive behavior.

Start by auditing the existing implementation. Then implement and test the changes systematically. Do not stop after producing a plan; proceed with the actual code changes within the available permissions and tools.