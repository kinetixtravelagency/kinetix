# Kinetix — Master Country & Programs Content Pack
## الإصدار: 2026
### Bulgaria • Luxembourg • Armenia • Russia • Italy

> **مهم:** هذا الملف هو قاعدة محتوى تشغيلية أولية لموقع Kinetix، وليس عرضًا قانونيًا أو وعدًا بالتأشيرة أو الوظيفة. متطلبات الهجرة والتأشيرات، الحصص، الرسوم، الوظائف، الرواتب، أوقات المعالجة، وأسعار الخدمات قد تتغير. أي سعر مكتوب تحت عنوان **Kinetix Price** هو سعر تجاري مقترح/Placeholder ويجب أن يراجعه Admin قبل نشره.

---

# 1. الهيكل الموحد لكل دولة

كل دولة في الموقع يجب أن تحتوي على:

1. Country Overview
2. Student / Seasonal Student Track
3. Graduate / Skilled Worker Track
4. General Employment Track
5. Available Job Categories
6. Program Cost
7. Government / Visa Costs
8. Estimated Arrival Budget
9. Proof of Funds
10. Required Documents
11. Payment Plans
12. Application Timeline
13. Eligibility
14. Included / Not Included
15. FAQ
16. Apply CTA
17. Legal Disclaimer

---

# 2. التسعير — قاعدة Kinetix

## لا يتم نشر أي رقم تجاري على أنه رسم حكومي

لكل برنامج يتم تخزين:

- `base_price`
- `currency`
- `promo_discount`
- `partner_discount`
- `final_price`
- `deposit_amount`
- `payment_plan_id`
- `government_fee_estimate`
- `visa_fee_estimate`
- `travel_cost_estimate`
- `accommodation_estimate`
- `insurance_estimate`
- `other_external_cost_estimate`

## أسعار Kinetix

استخدم الحقول التالية بدل اختراع سعر نهائي:

- **Kinetix Program Price:** `ADMIN_CONFIG`
- **Application/Consultation Fee:** `ADMIN_CONFIG`
- **Deposit:** `ADMIN_CONFIG`
- **Installment Plan:** `ADMIN_CONFIG`

### قاعدة العرض
المستخدم يرى دائمًا:

**Program Price**
+
**Government / Visa Costs**
+
**Estimated Personal Costs**
=
**Estimated Total Budget**

ويجب توضيح ما هو Included وما هو Paid Separately.

---

# 3. أنظمة التقسيط الموحدة

## Plan A — Full Payment
- 100% عند التعاقد.
- السعر النهائي حسب البرنامج والخصم.
- لا يتم اعتبار الطلب مدفوعًا إلا بعد تأكيد عملية الدفع.

## Plan B — 2 Installments
- Installment 1: Deposit — نسبة يحددها Admin.
- Installment 2: Remaining balance.
- مواعيد الاستحقاق يحددها Admin حسب البرنامج.

## Plan C — 3 Installments
- Deposit.
- Mid-payment.
- Final payment before the agreed processing/arrival milestone.

## Plan D — Custom
يستخدم للبرامج التي تحتاج:
- Employer fee
- Visa fee
- Travel fee
- Additional document service
- Accommodation

> جميع النسب والأرقام قابلة للتعديل من Admin Dashboard.

---

# 4. مستويات العملاء من Sales Partners

| Level | Leads/Successful Applications Example | Client Discount Example |
|---|---:|---:|
| Starter | 0–4 | 0% |
| Bronze | 5–9 | 2% |
| Silver | 10–19 | 4% |
| Gold | 20–39 | 6% |
| Platinum | 40+ | 8% |

> الأرقام مثال تجاري فقط. Admin هو من يحدد المستويات والخصومات والعمولات.

---

# COUNTRY 01 — BULGARIA 🇧🇬

## Country Positioning
بلغاريا من المسارات المناسبة لبناء عروض Kinetix متعددة، خصوصًا:
- Seasonal Work
- Student Seasonal Work
- General Employment
- Selected skilled occupations

المعلومات الحكومية البلغارية تذكر تسجيلات/إجراءات للعمال الموسميين، والطلاب والمتدربين، كما توجد آليات للعمل الموسمي حتى 90 يومًا وفق الحالة القانونية. citeturn0search5turn0search37

---

## Bulgaria — Track A: Student Seasonal Work

### Target
طلاب الجامعات الراغبين في تجربة عمل موسمية خلال فترة الإجازة.

### Important
هذا المسار **شغل موسمي للطلاب وليس دراسة في بلغاريا**.

### Possible Job Categories
- Hotel Staff
- Housekeeping
- Kitchen Assistant
- Waiter / Food Service
- Restaurant Assistant
- Resort Support
- Cleaning Staff
- Warehouse / Packing — حسب employer
- Agriculture / Harvest — حسب الموسم

### Contract
Seasonal employment contract حسب العرض الفعلي.

### Duration
حسب العقد والتصريح/التسجيل. بعض ترتيبات العمل الموسمي القصير يمكن أن تصل إلى 90 يومًا، بينما توجد ترتيبات موسمية أخرى بفترات مختلفة وفق التصريح. citeturn0search37turn0search5

### Salary
`EMPLOYER_OFFER_REQUIRED`

لا يتم نشر راتب ثابت إلا بعد وجود عرض عمل فعلي.

### Accommodation
`PROGRAM_SPECIFIC`

يجب توضيح:
- Free / Paid
- Shared / Private
- Meals included / not included
- Deposit
- Location

### Kinetix Price
`ADMIN_CONFIG`

### External Costs
- Visa / immigration fees where applicable
- Insurance
- Flight
- Personal spending
- Accommodation if not included
- Translation/legalization if required

### Student Documents
- Valid passport
- Recent photos
- University enrollment/student certificate
- Proof of vacation / eligibility where required
- CV
- Employment contract / job offer
- Insurance
- Visa documents where applicable
- Additional documents requested by authorities/employer

### Student Eligibility
- Current university student
- Valid passport
- Meets employer age/role requirements
- Available during required seasonal period
- Able to provide required documents

---

## Bulgaria — Track B: Graduate Employment

### Target
خريجون يبحثون عن:
- Hospitality
- Logistics
- Manufacturing
- Food production
- Construction
- Technical roles
- Selected skilled occupations

### Possible Job Categories
- Production Worker
- Warehouse Worker
- Logistics Assistant
- Hotel Staff
- Restaurant Staff
- Cook / Kitchen Staff
- Technician
- Skilled Trades
- Construction Worker
- Driver — only where licensing/eligibility permits

### Requirements
- Passport
- CV
- Diploma / certificate where relevant
- Employment offer/contract
- Police clearance where required
- Medical/insurance documents where required
- Translations/legalization where required

### Salary
`EMPLOYER_OFFER_REQUIRED`

### Kinetix Price
`ADMIN_CONFIG`

### Processing
Use a program-specific estimate only after confirming the employer route and current authority requirements.

---

## Bulgaria — Track C: General / Seasonal Worker

### Potential sectors
- Tourism
- Hospitality
- Agriculture
- Food production
- Warehousing
- Manufacturing
- Construction

### Key Legal Note
Bulgaria has a formal framework for third-country employment and seasonal work. The exact route depends on job, duration, nationality and employer. citeturn0search5turn0search36

---

## Bulgaria — Estimated Arrival Budget
Use an editable range:

- Flight: `ADMIN_CONFIG`
- First month accommodation: `ADMIN_CONFIG`
- Food: `ADMIN_CONFIG`
- Local transport: `ADMIN_CONFIG`
- Insurance: `ADMIN_CONFIG`
- Emergency reserve: `ADMIN_CONFIG`

### Recommended site label
**Estimated personal arrival budget — not a government fee.**

---

# COUNTRY 02 — LUXEMBOURG 🇱🇺

## Country Positioning
Luxembourg should be presented as a higher-cost European market where the employer, qualification and legal work authorization are central.

For third-country salaried workers, the official process includes authorization/stay and residence procedures. The current Guichet information states that employers generally begin with a vacancy declaration to ADEM, and under the applicable procedure may obtain authorization to recruit a third-country national. citeturn2search0turn2search4

---

## Luxembourg — Track A: Student Route

### Target
Students seeking higher education in Luxembourg.

### Core Model
This is a **study residence route**, not a job-seeker shortcut.

### Student Work
A third-country student may carry out salaried work with an average maximum of **15 hours per week over a month outside study time**, with stated exceptions such as school holidays and certain research/assistant activities. citeturn2search1

### Requirements
- Valid passport
- Admission/acceptance from higher education institution
- Proof of financial resources
- Health insurance
- Accommodation/other supporting evidence as applicable
- Criminal record where required
- Visa/residence documents
- Translations where required

### Financial Proof
The exact required amount must be pulled from the current official authority requirement before publication.

### Kinetix Price
`ADMIN_CONFIG`

### University Fees
`UNIVERSITY_SPECIFIC`

### Living Costs
`ADMIN_CONFIG`

---

## Luxembourg — Track B: Graduate / Skilled Worker

### Target
- IT
- Engineering
- Finance
- Accounting
- Data
- Cybersecurity
- Logistics
- Technical occupations
- Healthcare where qualification/recognition permits

### Core Requirement
A real employment offer/contract and the correct residence/work authorization route.

### Official Document Framework
Current official guidance lists items including:
- Full passport copy
- Criminal record extract/affidavit
- CV
- Diplomas/professional qualifications
- Signed employment contract
- ADEM certificate where applicable

The official process may require documents to be originals/certified copies, and documents not in accepted languages may need sworn translation. citeturn2search0

### Employer Process
The employer normally declares the vacancy to ADEM; if no suitable local/EU candidate is proposed within the applicable period, the employer can request the certificate allowing recruitment of a third-country national. citeturn2search0

### Salary
`EMPLOYER_OFFER_REQUIRED`

### Kinetix Price
`ADMIN_CONFIG`

---

## Luxembourg — After Arrival

The official route includes:
1. Entry using the appropriate authorization/visa.
2. Declaration of arrival.
3. Medical check.
4. Residence permit application.

The residence permit process has its own official fee; the current official guidance lists an **EUR 80 residence permit fee** for the relevant salaried-worker procedure. citeturn2search0

---

## Luxembourg — Arrival Budget

Because Luxembourg has high living costs, Kinetix should show:

- Housing
- Deposit
- First month rent
- Food
- Transport
- Insurance
- Residence-related fees
- Emergency fund

All amounts: `ADMIN_CONFIG`.

---

# COUNTRY 03 — ARMENIA 🇦🇲

## Country Positioning
Armenia can be structured around:
- Employment
- Skilled/technical roles
- Hospitality
- Service jobs
- Selected student/education opportunities

For employment-based residence, the Armenian Migration and Citizenship Service states that employers submit applications through the electronic work permit system. The employment-based temporary residence card has an official service fee of AMD 105,000 and is issued within 30 days after the employer submits the application, according to the current official page. citeturn0search0

---

## Armenia — Track A: Student Route

### Target
Students seeking admission to Armenian higher education.

### 2026–2027 Admission
The Armenian Ministry of Education announced a 2026–2027 foreign applicant admission process through the official FS.EMIS platform for higher education programs. citeturn0search14

### Possible Study Areas
- Business
- IT
- Engineering
- Medicine
- Hospitality
- Languages
- Economics
- Other university-specific programs

### Documents
- Passport
- Academic certificates/transcripts
- Graduation certificate
- Photos
- Application forms
- Admission documents
- Health/insurance documents where required
- Translation/legalization as applicable

### Tuition
`UNIVERSITY_SPECIFIC`

### Kinetix Service Price
`ADMIN_CONFIG`

---

## Armenia — Track B: Graduate / Employment

### Potential Sectors
- IT / Software
- Customer Support
- Hospitality
- Tourism
- Food & Service
- Manufacturing
- Construction
- Logistics
- Skilled Technical Roles

### Employer-led Work Permit
The employer uses the electronic work permit system to submit the employment application. citeturn0search0

### Residence Fee
Official service fee currently listed: **AMD 105,000** for the temporary residence card for a foreign employee. citeturn0search0

### Processing
Official page currently states the residence card is issued within **30 days after the employer submits the application**. citeturn0search0

### Documents
- Passport
- Employment contract
- Photo
- Personal information
- Employer documents
- Additional documents based on profession/exemption
- Residence application documents

### Salary
`EMPLOYER_OFFER_REQUIRED`

### Kinetix Price
`ADMIN_CONFIG`

---

## Armenia — EAEU Note
Citizens of EAEU member states are treated differently and may be exempt from a work permit, subject to the legal-residence certification process. This is not the normal route for Egyptian applicants. citeturn0search6

---

# COUNTRY 04 — RUSSIA 🇷🇺

## Country Positioning
Russia should be divided by nationality, job type, visa status and employer because foreign-worker rules can differ materially.

### Main categories
- Employment with employer sponsorship
- Skilled employment
- Hospitality/service
- Manufacturing
- Logistics
- Construction
- Selected technical roles
- Student route

### Important
Do not publish one universal “Russia Work Visa” as if every applicant follows the same process.

---

## Russia — Track A: Student Route

### Target
Students seeking university/education opportunities.

### Typical Flow
1. Choose institution/program.
2. Receive admission/invitation where required.
3. Prepare visa documents.
4. Apply through the applicable Russian visa process.
5. Travel.
6. Complete local registration/immigration formalities.
7. Maintain student status.

### Documents
- Passport
- Admission/invitation documents
- Education certificates
- Photos
- Medical/insurance documents where required
- Visa forms
- Other documents requested by institution/authorities

### Tuition
`UNIVERSITY_SPECIFIC`

### Kinetix Price
`ADMIN_CONFIG`

---

## Russia — Track B: Student Work

Russian law contains exemptions for certain foreign students in professional education institutions working during holidays or in certain roles at their educational institution; exact eligibility must be checked against the current rules and the student's status. citeturn1search4

### Site Rule
Never promise unrestricted student employment.

---

## Russia — Track C: Graduate / General Employment

### Potential Sectors
- Manufacturing
- Logistics
- Warehousing
- Hospitality
- Food production
- Construction
- Technical roles
- Selected skilled professions

### Documents
- Passport
- Employment contract
- Employer documents
- Work authorization where required
- Visa documents where required
- Medical/insurance documents
- Police/clearance documents where required
- Qualification documents where relevant

### Salary
`EMPLOYER_OFFER_REQUIRED`

### Kinetix Price
`ADMIN_CONFIG`

### Compliance Note
Work authorization requirements can vary by foreigner's legal status and category. Do not reuse a generic permit workflow across all nationalities.

---

# COUNTRY 05 — ITALY 🇮🇹

## Country Positioning
Italy offers distinct routes including:
- Seasonal employment
- Non-seasonal employment
- Study
- Skilled employment

For non-EU nationals, employment entry is mainly handled within the quotas established under the **Decreto Flussi** framework, with the employer applying for the required work clearance (`nulla osta`) before the worker proceeds with the visa process. citeturn0search12

---

## Italy — Track A: Student

### Target
Students seeking:
- Bachelor
- Master
- Selected professional/academic programs
- Language/education programs where legally applicable

### Documents
- Passport
- University admission
- Academic documents
- Proof of funds
- Accommodation evidence
- Health insurance
- Visa application documents
- Translations/legalization where required

### Tuition
`UNIVERSITY_SPECIFIC`

### Kinetix Price
`ADMIN_CONFIG`

### Work During Study
The exact work rights depend on the student's residence status and current Italian rules; show only verified current limits in the CMS.

---

## Italy — Track B: Seasonal Work

### Target
Workers for seasonal sectors, subject to quota and employer availability.

### Potential Sectors
- Agriculture
- Tourism
- Hospitality
- Food/harvest
- Seasonal services

### Main Flow
1. Employer identifies worker.
2. Employer applies for required `nulla osta`.
3. After authorization, applicant proceeds with visa process.
4. Entry to Italy.
5. Local residence/permit procedures.
6. Start employment according to the contract.

Italy's Foreign Ministry states that non-EU entry for seasonal and non-seasonal employment mainly occurs within the entry-quota framework and that the employer must first request the work clearance from the local immigration one-stop office. citeturn0search12

### Egypt-specific operational note
The Italian Embassy in Cairo announced in April 2026 that holders of the work authorization (`Nulla Osta`) could book Type D work visa appointments through the designated appointment channel. Always verify the current appointment process before giving customers instructions. citeturn0search10

### Salary
`EMPLOYER_OFFER_REQUIRED`

### Kinetix Price
`ADMIN_CONFIG`

---

## Italy — Track C: Graduate / Skilled Employment

### Potential Sectors
- Hospitality
- Construction
- Manufacturing
- Logistics
- IT
- Engineering
- Healthcare where recognition/authorization permits
- Skilled trades

### Core Requirement
A valid employer route and applicable immigration authorization.

### Documents
- Passport
- CV
- Qualification documents
- Employment contract/job offer
- `Nulla Osta` where required
- Visa documents
- Police/medical/insurance documents as applicable
- Translations/legalization where required

### Salary
`EMPLOYER_OFFER_REQUIRED`

---

# 6. Standard Kinetix Program Types

The CMS should support these program types:

## STUDENT
Education-first route.

Fields:
- Institution
- Program
- Duration
- Tuition
- Intake
- Admission requirements
- Visa/residence route
- Work rights
- Accommodation
- Kinetix price

## STUDENT_SEASONAL
Student + seasonal employment.

Fields:
- Student eligibility
- Job
- Employer
- Location
- Season
- Duration
- Salary
- Accommodation
- Meals
- Insurance
- Visa/permit
- Kinetix price

## GENERAL_EMPLOYMENT
Direct employment.

Fields:
- Employer
- Job title
- Sector
- Location
- Contract type
- Salary
- Working hours
- Accommodation
- Work authorization
- Processing estimate
- Kinetix price

## SKILLED_WORKER
For graduates and experienced professionals.

Fields:
- Occupation
- Qualification
- Experience
- Language
- Salary
- Employer
- Recognition requirements
- Work authorization
- Kinetix price

## SEASONAL_WORK
Short-term seasonal work.

Fields:
- Season
- Employer
- Sector
- Job
- Duration
- Salary
- Accommodation
- Permit
- Kinetix price

---

# 7. Job Catalog

The Admin should be able to add jobs dynamically.

## Hospitality
- Waiter
- Kitchen Assistant
- Cook
- Housekeeping
- Reception
- Hotel Staff

## Logistics
- Warehouse Worker
- Picker/Packer
- Logistics Assistant
- Forklift Operator — license dependent

## Manufacturing
- Production Worker
- Machine Operator
- Packaging Worker
- Quality Assistant

## Agriculture
- Farm Worker
- Harvest Worker
- Greenhouse Worker
- Food Processing

## Construction
- General Worker
- Carpenter
- Mason
- Electrician
- Plumber
- Welder

## Professional / Skilled
- Software Developer
- IT Support
- Engineer
- Accountant
- Data Specialist
- Technician
- Healthcare roles subject to recognition/licensing

---

# 8. Job Card Structure

Every job card must display:

- Country
- City
- Job title
- Sector
- Student/Graduate/Worker eligibility
- Contract type
- Duration
- Salary
- Salary currency
- Working hours
- Accommodation
- Meals
- Employer
- Start date
- Application deadline
- Requirements
- Kinetix price
- Payment plan
- Availability
- Apply button

---

# 9. Document System

## Common Applicant Documents

### Identity
- Passport
- National ID where required
- Photos

### Education
- Diploma
- Transcript
- Student certificate
- Graduation certificate
- Professional certificates

### Employment
- CV
- Experience letters
- Employment contract
- Job offer

### Legal
- Police clearance
- Birth certificate where required
- Marriage/family documents where relevant
- Legalization/apostille where applicable

### Financial
- Bank statements
- Sponsor documents
- Proof of funds
- Payment receipts

### Medical
- Medical certificate where required
- Insurance
- Vaccination/health documents where applicable

---

# 10. Application Workflow

## Step 1 — Profile
- Full name
- Email
- Phone
- Nationality
- Date of birth

## Step 2 — Choose Program
- Country
- Track
- Program
- Job/education

## Step 3 — Referral
- Promo code
- Referral URL
- Sales partner attribution

## Step 4 — Eligibility
Dynamic questions based on country/program.

## Step 5 — Documents
Dynamic checklist.

## Step 6 — Pricing
Show:
- Base price
- Partner discount
- Promo discount
- Final price
- Deposit
- Installments
- External costs

## Step 7 — Review
Applicant confirms data.

## Step 8 — Submit
Application receives unique ID.

---

# 11. Application Statuses

1. Draft
2. Submitted
3. Under Review
4. Documents Required
5. Documents Under Review
6. Eligible
7. Employer Matching
8. Employer Offer
9. Visa/Permit Preparation
10. Visa Submitted
11. Visa Decision
12. Approved
13. Travel Preparation
14. Completed
15. Rejected
16. Cancelled

---

# 12. Document Statuses

- Required
- Uploaded
- Under Review
- Approved
- Rejected
- Needs Replacement
- Expired

---

# 13. Payment Statuses

- Pending
- Deposit Due
- Partially Paid
- Paid
- Due
- Overdue
- Cancelled
- Refunded

---

# 14. Commission Statuses

- Pending
- Approved
- Paid
- Cancelled

Commission should not trigger simply because a visitor registered.

Admin configures the trigger:
- Qualified lead
- Paid application
- Approved application
- Completed program

---

# 15. Customer Pricing Example

Example only:

**Program Base Price:** €X,XXX  
**Partner Discount:** -€XXX  
**Promo Discount:** -€XXX  
**Final Kinetix Price:** €X,XXX

Then separately:

**Estimated External Costs**
- Visa
- Flight
- Insurance
- Accommodation
- Personal expenses

This separation prevents customers from assuming every cost is included.

---

# 16. Kinetix Program Page Template

## Hero
Country + Program + Main CTA.

Example:
**Bulgaria Seasonal Work**
“Start your next international work experience.”

## Quick Facts
- Program Type
- Duration
- Job
- Salary
- Accommodation
- Starting Price

## Who Is This For?
Student / Graduate / Worker.

## Job Details
Full description.

## Requirements
Dynamic checklist.

## What’s Included
Dynamic list.

## What’s Not Included
Dynamic list.

## Cost
Transparent pricing.

## Payment Plans
2 / 3 / Full / Custom.

## Documents
Upload checklist.

## Timeline
Preparation → Application → Permit → Visa → Travel → Arrival.

## FAQ
Dynamic country/program FAQ.

## CTA
**Start Your Application**

---

# 17. Admin CMS Data Model

## Country
- id
- name
- slug
- code
- flag
- hero_image
- overview
- currency
- visa_notes
- student_notes
- graduate_notes
- work_notes
- active
- last_verified_at

## Program
- id
- country_id
- type
- title
- slug
- description
- duration
- salary_min
- salary_max
- salary_currency
- tuition
- base_price
- currency
- deposit
- eligibility
- included
- excluded
- processing_estimate
- active
- last_verified_at

## Job
- id
- program_id
- title
- sector
- employer
- city
- contract_type
- duration
- salary
- currency
- hours_per_week
- accommodation
- meals
- start_date
- deadline
- vacancies
- active

## DocumentRequirement
- id
- country_id
- program_id
- document_name
- required_for
- required
- description
- expiry_rule

## PaymentPlan
- id
- program_id
- name
- installment_count
- deposit_amount
- installment_amount
- processing_fee
- total_amount
- currency
- eligibility
- active

---

# 18. Required Admin Controls

Admin must be able to change without code:

- Country content
- Programs
- Jobs
- Salary display
- Prices
- Discounts
- Promo codes
- Partner discounts
- Installments
- Required documents
- Application questions
- FAQs
- Processing estimates
- Included/excluded items
- Program availability
- Job availability

---

# 19. Verification / Content Governance

Every country/program should have:

- `last_verified_at`
- `verified_by`
- `source_url`
- `source_type`
- `source_date`
- `next_review_date`

## Content badges

### Verified
Official source reviewed.

### Partner Confirmed
Employer/institution confirmation.

### Estimated
Kinetix estimate.

### Customer-specific
Depends on applicant profile.

Never present an estimate as an official requirement.

---

# 20. Pricing Rules

The final price must be calculated server-side.

Formula:

`Final Price = Base Price - Valid Promo Discount - Valid Partner Discount + Applicable Fees`

Rules:
- Promo codes must have start/end dates.
- Promo codes can be country-specific.
- Promo codes can be program-specific.
- Partner discount comes from partner level.
- Discounts cannot exceed configured limits.
- Customer sees a full price breakdown.
- Admin can override only with audit log.

---

# 21. Student Route vs Graduate Route

## Student
Primary objective:
Education or seasonal student work.

Typical data:
- University
- Student status
- Vacation period
- Program
- Job
- Study documents

## Graduate
Primary objective:
Employment / career mobility.

Typical data:
- Degree
- Major
- Experience
- CV
- Skills
- Language
- Job category
- Employer
- Salary

---

# 22. Country Comparison Filters

Website users should be able to filter by:

- Country
- Student
- Graduate
- Skilled Worker
- Seasonal
- Hospitality
- Logistics
- Agriculture
- Manufacturing
- Construction
- IT
- Healthcare
- Budget
- Salary
- Duration
- Accommodation included
- Installments available

---

# 23. Search / Recommendation Engine

The user answers:

1. Age
2. Student or graduate
3. Degree
4. Experience
5. Job preference
6. Language
7. Budget
8. Desired destination
9. Desired duration
10. Accommodation need

The system returns **matching programs**, not a guaranteed visa result.

Each match should show:
- Country
- Program
- Why it matches
- Requirements
- Estimated cost
- Available job category
- CTA

---

# 24. AI Assistant Rules

Kinetix AI may answer only from:
- Approved CMS data
- Verified country data
- Current program records
- Approved FAQs
- Official sources stored by Admin

AI must never invent:
- Jobs
- Salaries
- Prices
- Visa guarantees
- Processing times
- Employer names
- Government approvals
- Success rates

If data is missing:
**“This information is not currently verified in Kinetix records. Please contact Kinetix for the current requirement.”**

---

# 25. Legal / Trust Copy

Use:

> Immigration, employment, visa, pricing and processing requirements may vary based on nationality, applicant profile, employer, program and current government regulations. Program availability and prices may change without notice. Kinetix does not guarantee visa approval, employment approval or immigration outcomes unless explicitly stated in a verified contractual program.

---

# 26. Website Country Navigation

## Explore Opportunities
- Bulgaria
- Luxembourg
- Armenia
- Russia
- Italy

## Each country
- Student
- Graduate
- Work
- Seasonal
- Skilled
- Jobs
- Costs
- Documents
- Payment Plans
- FAQ

---

# 27. Recommended Initial Program Catalog

## Bulgaria
1. Student Seasonal Hospitality
2. Student Seasonal Resort
3. Seasonal Agriculture
4. Hospitality Worker
5. Warehouse / Logistics Worker
6. Production Worker
7. Skilled Worker

## Luxembourg
1. Higher Education Student
2. Student + Part-time Work
3. Skilled Worker
4. IT / Technology
5. Logistics
6. Hospitality
7. Finance / Business — qualification dependent

## Armenia
1. University Student
2. IT / Software
3. Hospitality
4. Customer Support
5. Manufacturing
6. Logistics
7. Technical Worker

## Russia
1. University Student
2. Student Work — eligibility dependent
3. Manufacturing
4. Logistics
5. Hospitality
6. Construction
7. Technical / Skilled Worker

## Italy
1. University Student
2. Seasonal Agriculture
3. Seasonal Hospitality
4. General Hospitality Employment
5. Construction
6. Manufacturing
7. Logistics
8. Skilled / Professional Employment

---

# 28. What Must Be Filled by Kinetix Before Launch

The following cannot safely be invented:

- Actual Kinetix program prices
- Actual partner commissions
- Actual customer discounts
- Actual employer names
- Current job vacancies
- Exact salary offered by each employer
- Exact accommodation offer
- Exact flight cost
- Exact visa appointment availability
- Exact government fee at time of application
- University tuition
- Employer-specific processing time
- Country-specific proof-of-funds amount when it changes
- Guaranteed processing/approval claims

These should be editable in Admin.

---

# 29. Launch Checklist

## Content
- [ ] 5 country pages
- [ ] Student route for each applicable country
- [ ] Graduate route
- [ ] General work route
- [ ] Seasonal route where applicable
- [ ] Job catalog
- [ ] Documents
- [ ] Costs
- [ ] Payment plans
- [ ] FAQs

## Backend
- [ ] Country table
- [ ] Program table
- [ ] Job table
- [ ] Document requirements
- [ ] Payment plans
- [ ] Applications
- [ ] Customers
- [ ] Partners
- [ ] Promo codes
- [ ] Discounts
- [ ] Commissions
- [ ] Payments
- [ ] Audit logs

## Verification
- [ ] Official source
- [ ] Last verified date
- [ ] Admin approval
- [ ] Review date

## Customer Experience
- [ ] Program comparison
- [ ] Pricing calculator
- [ ] Promo code
- [ ] Referral attribution
- [ ] Application
- [ ] Document upload
- [ ] Payment schedule
- [ ] Customer dashboard

---

# 30. Final Product Principle

Kinetix should not look like a website that merely sells “visa packages.”

It should feel like:

**An International Career Mobility Platform**

The customer should be able to move through one clear journey:

**Discover → Compare → Check Eligibility → See Real Costs → Apply → Upload Documents → Track Progress → Pay → Prepare → Travel → Start the New Opportunity**

The system should keep **government facts**, **employer/job facts**, **Kinetix service pricing**, and **personal estimated expenses** clearly separated.

That separation is essential for transparency, scalability and trust.
