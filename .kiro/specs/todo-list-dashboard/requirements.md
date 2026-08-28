# Requirements Document

## Introduction

To-Do List Dashboard adalah sebuah aplikasi web single-page yang berjalan sepenuhnya di sisi klien (client-side) tanpa backend server. Aplikasi ini memberikan pengalaman manajemen tugas harian yang terpadu dalam satu tampilan dashboard, mencakup fitur salam dinamis berdasarkan waktu, timer fokus (Pomodoro), daftar tugas, tautan cepat, serta pengaturan tema terang/gelap. Semua data disimpan secara persisten menggunakan Browser Local Storage API. Aplikasi dibangun dengan HTML, CSS, dan Vanilla JavaScript murni agar tetap ringan, cepat, dan mudah digunakan tanpa setup apapun.

---

## Glossary

- **Dashboard**: Halaman utama (`index.html`) yang menampilkan seluruh fitur dalam satu tampilan.
- **App**: Keseluruhan aplikasi To-Do List Dashboard yang berjalan di browser.
- **Greeting_Module**: Komponen yang menampilkan salam, waktu, dan tanggal saat ini.
- **Timer**: Komponen Focus Timer berbasis Pomodoro yang menghitung mundur sesuai durasi yang ditentukan pengguna.
- **Todo_Manager**: Komponen yang mengelola penambahan, pengeditan, penghapusan, dan pengurutan tugas.
- **Task**: Satu item pekerjaan dalam daftar tugas yang memiliki nama, jam mulai, dan jam selesai target.
- **Quick_Links**: Komponen yang menampilkan dan mengelola tombol-tombol tautan ke situs web favorit.
- **Theme_Controller**: Komponen yang mengatur pergantian antara mode terang (light) dan mode gelap (dark).
- **Local_Storage**: Browser Local Storage API yang digunakan untuk menyimpan data secara persisten di sisi klien.
- **Light_Mode**: Tema tampilan terang dengan nuansa pagi cerah dan ikon matahari.
- **Dark_Mode**: Tema tampilan gelap dengan nuansa malam dan ikon bulan.

---

## Requirements

### Requirement 1: Struktur Teknis dan Kompatibilitas

**User Story:** As a developer, I want the app to be built with plain HTML, CSS, and Vanilla JavaScript, so that it runs in any modern browser without requiring a server, framework, or build tool.

#### Acceptance Criteria

1. THE App SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks, libraries, or package dependencies.
2. THE App SHALL consist of exactly one `index.html` at the project root, one CSS file inside the `css/` directory, and one JavaScript file inside the `js/` directory, with no other HTML, CSS, or JavaScript files included.
3. THE App SHALL function correctly in the latest stable versions of Chrome, Firefox, Edge, and Safari, where "function correctly" means all acceptance criteria in this document pass without errors or missing functionality.
4. THE App SHALL operate fully client-side with no backend server dependency, meaning no network requests to remote APIs, servers, or external services are required for any feature to work.
5. WHEN the `index.html` file is opened directly in a browser via the `file://` protocol, THE App SHALL load all resources and execute all features correctly without requiring a localhost or remote server.
6. IF the browser does not support a Web API used by the App, THEN THE App SHALL display a message indicating the browser is not supported instead of silently failing or showing a broken interface.

---

### Requirement 2: Penyimpanan Data (Local Storage)

**User Story:** As a user, I want my tasks, quick links, and preferences to be saved automatically, so that my data persists between browser sessions without needing to sign in or configure anything.

#### Acceptance Criteria

1. THE Local_Storage SHALL store Task data, Quick_Links data, and Theme_Controller preferences each under separate, distinct storage keys to prevent cross-contamination.
2. WHEN the user closes and reopens the browser tab, THE App SHALL restore all previously saved Task data, Quick_Links data, and theme preference from Local_Storage within 2 seconds of page load.
3. IF Local_Storage is unavailable or returns a read error, THEN THE App SHALL display a visible inline error message notifying the user that data persistence is unavailable, and SHALL continue to operate with in-memory data for the current session.
4. WHEN Local_Storage data is written, THE App SHALL serialize data as valid JSON strings and complete the write operation within 500 milliseconds.
5. IF Local_Storage data cannot be parsed as valid JSON or the resulting object does not match the expected data structure, THEN THE App SHALL discard the corrupted data, initialize that data type to its default empty state, and display an inline error message indicating that saved data could not be loaded.
6. WHEN the user performs any action that modifies Task data, Quick_Links data, or theme preference, THE App SHALL persist the updated data to Local_Storage within 1 second of the action.

---

### Requirement 3: Salam Dinamis (Greeting)

**User Story:** As a user, I want to see a personalized greeting along with the current time and date, so that the dashboard feels welcoming and contextually relevant to the time of day.

#### Acceptance Criteria

1. THE Greeting_Module SHALL display the current time in 24-hour zero-padded HH:MM format, sourced from the browser's local system clock, and update the displayed time every 60 seconds.
2. THE Greeting_Module SHALL display the current date in Indonesian locale format showing the full weekday name, numeric day, full month name, and 4-digit year (e.g., "Rabu, 27 Agustus 2026").
3. WHEN the current hour is between 05 and 11 (inclusive), THE Greeting_Module SHALL display the greeting "Selamat Pagi ☀️".
4. WHEN the current hour is between 12 and 14 (inclusive), THE Greeting_Module SHALL display the greeting "Selamat Siang 🌤️".
5. WHEN the current hour is between 15 and 17 (inclusive), THE Greeting_Module SHALL display the greeting "Selamat Sore 🌇".
6. WHEN the current hour is between 18 and 20 (inclusive), THE Greeting_Module SHALL display the greeting "Selamat Malam 🌙".
7. WHEN the current hour is between 21 and 23 (inclusive) or between 00 and 04 (inclusive), THE Greeting_Module SHALL display the greeting "Selamat Malam 🌃".
8. WHEN the page loads, THE Greeting_Module SHALL display the correct time, date, and greeting immediately without waiting for the next 60-second update interval.
9. IF the browser's system clock is unavailable or returns an invalid value, THEN THE Greeting_Module SHALL display a placeholder text ("--:--") for the time and suppress the date and greeting.

---

### Requirement 4: Focus Timer (Pomodoro)

**User Story:** As a user, I want a countdown timer with customizable duration, so that I can use the Pomodoro technique to manage my focused work sessions.

#### Acceptance Criteria

1. WHEN the page loads, THE Timer SHALL display a default countdown duration of 25 minutes in MM:SS format (25:00).
2. THE Timer SHALL display the remaining time in MM:SS format at all times.
3. THE Timer SHALL provide an input field that accepts a whole number between 1 and 999 (inclusive) representing the desired duration in minutes.
4. WHEN the user clicks the "Set Timer" button, THE Timer SHALL update the displayed duration to the value entered in the input field, converted to MM:SS format, without starting the countdown, and retain the entered value in the input field.
5. IF the user clicks "Set Timer" with an input value outside the range of 1 to 999 or with a non-numeric value, THEN THE Timer SHALL display an inline validation error message and retain the previous timer value.
6. WHEN the user clicks the "Start" button and the Timer is not currently running and the displayed time is greater than 00:00, THE Timer SHALL begin counting down by one second per real-world second.
7. WHEN the Timer reaches 00:00, THE Timer SHALL stop the countdown automatically, play an audible alert, and display a visible on-screen notification.
8. WHEN the user clicks the "Stop" button and the Timer is currently running, THE Timer SHALL pause the countdown and retain the current remaining time.
9. WHEN the user clicks the "Reset" button, THE Timer SHALL stop any active countdown and restore the displayed duration to the last value set via the "Set Timer" button or the default 25 minutes if no custom value was set.
10. WHILE the Timer countdown is active, THE Timer SHALL update the displayed MM:SS value every 1 second.
11. IF the user clicks the "Start" button and the displayed time is 00:00, THEN THE Timer SHALL not begin a countdown and SHALL display an inline message indicating the timer must be reset before starting.

---

### Requirement 5: Manajemen Tugas (To-Do List)

**User Story:** As a user, I want to add, view, edit, complete, delete, and sort my tasks with start and end times, so that I can plan and track my daily work schedule effectively.

#### Acceptance Criteria

1. THE Todo_Manager SHALL provide a form with three input fields: task name (text, maximum 100 characters), jam mulai kerja (time, HH:MM format), and target jam selesai (time, HH:MM format).
2. WHEN the user submits the add-task form with all three fields filled, THE Todo_Manager SHALL add the new Task to the task list and persist it to Local_Storage.
3. IF the user submits the add-task form with one or more empty fields, THEN THE Todo_Manager SHALL display an inline validation error adjacent to each missing field identifying which fields are missing and SHALL NOT add the Task.
4. THE Todo_Manager SHALL display each Task as a list item showing the task name, jam mulai kerja, and target jam selesai.
5. WHEN the user clicks the edit button on a Task, THE Todo_Manager SHALL populate the task name, jam mulai kerja, and target jam selesai fields with the existing Task data and allow the user to modify and save the changes.
6. WHEN the user saves edits to a Task with all three fields filled, THE Todo_Manager SHALL update the Task in the task list and persist the updated data to Local_Storage.
7. IF the user saves edits to a Task with one or more empty fields, THEN THE Todo_Manager SHALL display an inline validation error adjacent to each missing field and SHALL NOT update the Task.
8. WHEN the user clicks the "Mark as Done" button on a Task, THE Todo_Manager SHALL apply a strikethrough style to the task name text and reduce the opacity of that Task item to 50%, and persist the updated status to Local_Storage.
9. WHEN the user clicks the delete button on a Task, THE Todo_Manager SHALL remove that Task from the task list and update Local_Storage to reflect the removal.
10. WHEN the user activates the sort control, THE Todo_Manager SHALL sort all displayed Tasks in ascending order by jam mulai kerja, resolving ties by original insertion order, and re-render the list accordingly.
11. WHEN the page loads, THE Todo_Manager SHALL read all saved Tasks from Local_Storage and display them in their persisted order, maintaining each Task's persisted completed status.
12. IF Local_Storage is unavailable when the Todo_Manager attempts to read or write Task data, THEN THE Todo_Manager SHALL display an error message indicating that task persistence is unavailable and SHALL continue to allow Task operations for the current session without persisting changes.

---

### Requirement 6: Tautan Cepat (Quick Links)

**User Story:** As a user, I want to save and quickly access my favorite websites from the dashboard, so that I can navigate to frequently used tools and resources with a single click.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide an input form with two fields: link label (text, maximum 100 characters) and URL (text, maximum 2048 characters).
2. WHEN the user submits the add-link form with a non-empty label of at most 100 characters and a URL matching the format `scheme://host` (where scheme is http or https), THE Quick_Links SHALL add the new link as a clickable button and persist it to Local_Storage, up to a maximum of 50 saved links.
3. IF the user submits the add-link form with an empty label, a label exceeding 100 characters, an empty URL, or a URL not matching the `scheme://host` format where scheme is http or https, THEN THE Quick_Links SHALL display an inline validation error adjacent to the offending field and SHALL NOT add the link.
4. WHEN the user clicks a Quick Link button, THE Quick_Links SHALL open the associated URL in a new browser tab without navigating away from the current page.
5. WHEN the user clicks the delete control on a Quick Link, THE Quick_Links SHALL remove that link from the display and update Local_Storage to reflect the removal within 500 milliseconds.
6. WHEN the dashboard page finishes loading, THE Quick_Links SHALL read all saved links from Local_Storage and display each as a clickable button, in the order they were originally saved.
7. IF the total number of saved links has reached 50 and the user attempts to submit the add-link form, THEN THE Quick_Links SHALL display an inline error message indicating the maximum link limit has been reached and SHALL NOT add the link.

---

### Requirement 7: Tema Terang/Gelap (Light/Dark Mode)

**User Story:** As a user, I want to toggle between a light and dark theme with smooth visual transitions, so that I can use the dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHILE Light_Mode is active, THE Theme_Controller SHALL display the toggle button with a sun icon; WHILE Dark_Mode is active, THE Theme_Controller SHALL display the toggle button with a moon icon.
2. WHEN the user clicks the theme toggle button while Light_Mode is active, THE Theme_Controller SHALL switch the App to Dark_Mode.
3. WHEN the user clicks the theme toggle button while Dark_Mode is active, THE Theme_Controller SHALL switch the App to Light_Mode.
4. WHEN the theme changes, THE App SHALL apply a CSS transition of no longer than 400 milliseconds to background color, text color, and border color properties across all visible components.
5. WHEN the theme changes, THE Theme_Controller SHALL animate the transition between the sun and moon icons using a CSS animation lasting no longer than 400 milliseconds.
6. WHEN the user clicks the theme toggle button, THE Theme_Controller SHALL persist the newly active theme value to Local_Storage.
7. WHEN the page loads, THE Theme_Controller SHALL read the saved theme preference from Local_Storage and apply it before the first render, preventing a flash of incorrect theme.
8. IF no theme preference is found in Local_Storage on page load, THEN THE Theme_Controller SHALL check the OS-level color scheme preference and apply it; IF no OS-level preference is available, THEN THE Theme_Controller SHALL apply Light_Mode as the default.
9. IF Local_Storage is unavailable or write fails when persisting the theme preference, THEN THE Theme_Controller SHALL continue operating with the selected theme for the current session without displaying an error to the user.

---

### Requirement 8: Performa dan Responsivitas UI

**User Story:** As a user, I want the dashboard to load quickly and respond to my interactions without any noticeable lag, so that my workflow is never interrupted.

#### Acceptance Criteria

1. THE App SHALL render the complete initial view in under 2 seconds, measured from the time the page load event is triggered to the time all visible UI elements are fully rendered, on a modern desktop browser when loaded via the local file system.
2. WHEN the user performs an interactive action (adding a task, toggling theme, starting the timer), THE App SHALL reflect the UI update within 100 milliseconds of the user input event.
3. THE App SHALL adapt its layout to viewport widths from 320px to 2560px without horizontal scrolling or overlapping elements.
4. WHILE the Timer countdown is active, THE App SHALL update the displayed MM:SS value once per second with no individual update delayed by more than 200 milliseconds beyond its scheduled interval.
5. IF the App fails to render the complete initial view within 5 seconds of the page load event, THEN THE App SHALL display a visible error message indicating that the application failed to load and suggest the user refresh the page.
