# **App Name**: WorkFlow Central

## Core Features:

- Admin Dashboard: Admin Dashboard: Displays key statistics related to active employees, attendance, and other relevant metrics in a clear and concise manner.
- Employee Management: Employee Management: Enables admins to perform CRUD operations on employee data, synchronizing with Firebase Authentication and Firestore.
- Attendance Tracking: Attendance Tracking: Provides a filterable table displaying employee clock-in and clock-out times.
- Report Generation: AI-Powered Report Generation: Uses a form to gather request details for summaries (e.g., "absences from the sales team in Q2"), and leverages Genkit as a tool to process and generate these summaries.
- Personal Dashboard: Personal Dashboard: Offers a summary of an employee's status, clock-in/out status, assigned tasks, and absence requests.
- Clock-In/Out: Clock-In/Out: Implements buttons for employees to clock in and out, using the browser's geolocation to record location.
- Absence Requests: Absence Requests: Provides a calendar interface and a form for submitting absence requests, which create new documents in the absenceRequests collection.

## Style Guidelines:

- Primary color: Use a vibrant blue (#29ABE2) to convey trustworthiness and professionalism, reflecting the reliable nature of HR management. Avoid teal.
- Background color: Use a very light blue (#F0F8FF), nearly white, to ensure readability and a clean, uncluttered interface.  This provides a gentle contrast to the primary color.
- Accent color: Employ a contrasting yellow (#FFD700), analogous to blue on the color wheel, to highlight key interactive elements and calls to action, ensuring they stand out without disrupting the overall harmony.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and approachable feel in headlines and short amounts of body text.
- Body font: 'Inter' (sans-serif) to complement Space Grotesk when longer lines of body text are necessary.
- Employ a set of minimalist icons that are intuitive and easily recognizable, aiding quick navigation and understanding of features.
- Maintain a clean and well-spaced layout that adheres to accessibility standards, ensuring readability and ease of use across all devices. Card-based layouts should separate logical groupings.