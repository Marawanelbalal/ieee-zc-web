# Software Requirements Specification

IEEE Zewail City Student Branch Web Platform. Items marked **[confirm]** need the Chairman's answer.

## 1. Introduction

### 1.1 Purpose
Define what the platform must do, so the team can build, test and hand it over to the next board.

### 1.2 Scope
One platform with three parts:
1. **Public site:** branch story, history, committees, events, courses and workshops, opportunities, contact.
2. **Admin panel:** content management for the public site, including bulk opportunity import from Excel.
3. **Internal management system (later):** committees, projects, tasks, submissions, reviews, notifications.

Out of scope for now: email notifications, Arabic UI, a native mobile app, committee-specific tools.

### 1.3 Definitions
| Term | Meaning |
|---|---|
| Event series | A recurring event (e.g. an annual conference) |
| Edition | One year's occurrence of a series, stored separately |
| Opportunity | An external listing: internship, scholarship, competition, etc. |
| CATs office | The university career advising unit that emails opportunities to students |
| RBAC | Role-based access control |
| Scope | The thing a role applies to: global, a committee, a project or an event |

## 2. Overall description

### 2.1 Users
| User | Needs |
|---|---|
| Visitor / student | Browse events, courses, opportunities; filter; open official links; register for events |
| Content committee | Full access to the admin panel for public content |
| Committee head / vice head / HR / member | Work on tasks within their committee |
| Project manager | Create projects across committees and track them |
| Chairman / vice chairman | Branch-wide overview |
| System admin | Accounts, roles, permissions, settings |

One person can hold several roles. Permissions are data, not hard-coded to one board structure.

### 2.2 Constraints
- Self-hosted on university servers with Docker **[confirm with IT]**.
- Maintainable by a student team that changes every year.
- English first. Arabic as a later extension, so UI strings must not be hard-coded into logic.
- Real-name and student-ID data is personal data: it must not be public.

### 2.3 Assumptions
- The Chairman and board supply the history content.
- Opportunity entries come from the CATs office emails and other sources, entered by the content committee.

## 3. Functional requirements

Priority: **P1** first, **P2** next, **P3** later.

### 3.1 Public site
| ID | Requirement | Pri |
|---|---|---|
| FR-01 | Home page shows an intro, a featured event, latest opportunities, featured courses and announcement banners | P1 |
| FR-02 | Home page sections can be shown, hidden and reordered by admins | P1 |
| FR-03 | About page covers IEEE, the branch, a milestone timeline, committees and achievements | P1 |
| FR-04 | Previous boards and committee leadership are listed by term and stay archived | P1 |
| FR-05 | Contact / Join page shows official contacts and social links | P1 |
| FR-06 | Pages have clear titles, descriptions and shareable URLs | P1 |
| FR-07 | The site is usable on phones, tablets and desktops | P1 |

### 3.2 Events
| ID | Requirement | Pri |
|---|---|---|
| FR-10 | Events are grouped into series, each year being a separate edition | P1 |
| FR-11 | Upcoming and past events have separate views, and each event has a detail page | P1 |
| FR-12 | Visitors can filter events by year, type, committee and status | P1 |
| FR-13 | An edition stores year, theme, dates, description, organizers, photos, recap and links | P1 |
| FR-14 | A series page lets visitors compare editions | P2 |
| FR-15 | Events can show an external registration link | P1 |
| FR-16 | Built-in registration: admin-defined form fields, deadline, capacity, open/closed/full status | P1 |
| FR-17 | Admins can view, search and export registrants. Exports must escape spreadsheet formulas | P1 |

### 3.3 Courses and workshops
| ID | Requirement | Pri |
|---|---|---|
| FR-20 | Each item has title, description, category, instructor, date, duration, committee | P1 |
| FR-21 | Each item supports a YouTube link and one or more Google Drive links | P1 |
| FR-22 | Status: upcoming, ongoing, completed | P1 |
| FR-23 | Visitors can filter by topic, committee, year and type | P1 |

### 3.4 Opportunities
| ID | Requirement | Pri |
|---|---|---|
| FR-30 | Listing cards and detail pages show title, organization, category, summary, eligible majors and years, deadline, location, mode, funding, official and application links, last-updated date | P1 |
| FR-31 | Filters combine: category, major, academic year, deadline, funding, location, mode | P1 |
| FR-32 | Sort by newest, deadline or title. Search by title, organization or keyword | P1 |
| FR-33 | Status (open, closing soon, closed, rolling) is calculated from the deadline. Admins can override it | P1 |
| FR-34 | Admins can add, rename, merge and deactivate categories without code changes | P1 |
| FR-35 | Every opportunity links to its official source and shows a "verify on the official page" note | P1 |
| FR-36 | Only `http` and `https` links are accepted | P1 |

### 3.5 Excel import
| ID | Requirement | Pri |
|---|---|---|
| FR-40 | Admins download the official template | P1 |
| FR-41 | Admins upload an `.xlsx` file (size-limited) | P1 |
| FR-42 | The system validates structure, required fields, dates, links and categories | P1 |
| FR-43 | The system shows a preview with row-level errors. Nothing publishes before confirmation | P1 |
| FR-44 | After confirmation, valid rows are saved as drafts or published. A summary shows added, updated, skipped and failed rows | P1 |
| FR-45 | Imported records can be edited individually | P1 |

### 3.6 Admin panel (content)
| ID | Requirement | Pri |
|---|---|---|
| FR-50 | Create, edit, publish, unpublish, archive and delete content, according to permission | P1 |
| FR-51 | Manage events, series, editions, courses, opportunities, categories, committees, history, page sections, announcement banners | P1 |
| FR-52 | Embed YouTube videos by link. Video files are not hosted | P1 |
| FR-53 | Upload images with type and size limits | P1 |
| FR-54 | Preview content before publishing | P1 |
| FR-55 | Record who created and last edited content | P1 |
| FR-56 | The content committee has full access to this panel. A draft-then-publish flow is optional **[confirm]** | P1 |

### 3.7 Accounts and RBAC
| ID | Requirement | Pri |
|---|---|---|
| FR-60 | Users log in with an individual account. No shared passwords | P1 |
| FR-61 | Passwords are stored as argon2id hashes. Sessions are server-side and can be revoked | P1 |
| FR-62 | Roles and permissions are stored as data. A user can hold several roles | P1 |
| FR-63 | A role assignment has a scope: global, committee, project or event | P1 |
| FR-64 | The server checks permissions on every protected request. Hiding UI is only a convenience | P1 |
| FR-65 | System admins manage accounts, roles and permissions | P1 |

### 3.8 Internal management
| ID | Requirement | Pri |
|---|---|---|
| FR-70 | Committee and member directory | P3 |
| FR-71 | Project managers create projects with milestones and pick participating committees | P3 |
| FR-72 | Committee heads create tasks and assign them to members | P3 |
| FR-73 | Members submit work as files or links and comment on tasks | P3 |
| FR-74 | Reviewers approve or request changes. The reviewer (head or HR) is configurable per committee | P3 |
| FR-75 | Task statuses: not started, in progress, submitted, under review, revision required, approved, overdue | P3 |
| FR-76 | Dashboards: project progress, tasks by status and committee, overdue tasks, awaiting review | P3 |
| FR-77 | In-system notifications for assignment, feedback, submission and deadlines | P3 |
| FR-78 | Activity history | P3 |
| FR-79 | Chairman and vice chairman see an overview of all projects | P3 |

## 4. Non-functional requirements
| ID | Requirement |
|---|---|
| NFR-01 | Security: server-side authorization, input validation at every boundary, parameterized queries only, no secrets in git |
| NFR-02 | Privacy: registrations, member data and submitted files are visible only to authorized users |
| NFR-03 | Uploads: restricted file types and sizes, stored outside the public web root for private files |
| NFR-04 | Backups: scheduled database dumps stored off the server, with a restore that has been tested |
| NFR-05 | Maintainability: documented setup, feature-based code organization, small reviewed PRs |
| NFR-06 | Accessibility: readable text, contrast, labels, keyboard use |
| NFR-07 | Performance: public pages load fast on mobile; large media is not served raw |
| NFR-08 | Internationalization: UI text kept separate from logic so Arabic can be added |

## 5. Phases
| Phase | Content |
|---|---|
| 1 | Public site, admin panel, events with basic registration, courses, accounts and RBAC |
| 2 | Opportunities, filters, Excel import |
| 3 | To be decided |
| 4 | To be decided |

Later phases can change. Scope for each phase is agreed before it starts.

## 6. Open questions
1. Does "filter by opportunity" mean the FR-31 filters, or something else?
2. Must content committee changes go through a head's approval?
3. How many rows does a typical Excel import have?
4. Who supplies the branch history, and by when?
5. What data rules apply to registrant data?
