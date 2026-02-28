# Requirements Document

## Introduction

This feature adds a Progressive Web App (PWA) install prompt to the BrewLog application, allowing users to add the app to their home screen for quick access and offline support. The implementation detects when the browser's native install prompt is available and presents a dismissible banner to guide users through installation.

## Glossary

- **PWA**: Progressive Web App – a web application that can be installed on a device and run like a native app.
- **beforeinstallprompt**: A browser event fired when the browser determines the app is installable.
- **Install Banner**: A dismissible UI element that prompts the user to install the PWA.
- **localStorage**: Browser storage used to remember whether the user has previously dismissed the banner.

## Requirements

### Requirement 1

**User Story:** As a mobile or desktop user, I want to see an install prompt when BrewLog is installable, so that I can add it to my home screen for quick access and offline use.

#### Acceptance Criteria

1. WHEN the browser fires `beforeinstallprompt` THEN the system SHALL capture and defer the event
2. WHEN the install prompt has been captured AND the user has not previously dismissed it THEN the system SHALL display an install banner after a short delay
3. WHEN the user clicks "Install" THEN the system SHALL trigger the native browser install flow
4. WHEN the installation is accepted or dismissed by the user THEN the system SHALL hide the install banner
5. WHEN the app is already running in standalone mode THEN the system SHALL NOT display the install banner

### Requirement 2

**User Story:** As a user who does not want to install the app, I want to be able to dismiss the install prompt, so that it does not appear again across future visits.

#### Acceptance Criteria

1. WHEN the user clicks the dismiss button THEN the system SHALL hide the install banner immediately
2. WHEN the user dismisses the banner THEN the system SHALL store the dismissal in localStorage
3. WHEN the user revisits the app in future sessions THEN the system SHALL NOT show the banner again
4. THE dismiss action SHALL NOT prevent the user from installing the app via the browser menu

### Requirement 3

**User Story:** As a developer, I want the install prompt logic encapsulated in a reusable hook, so that the component stays focused on presentation and the logic can be tested independently.

#### Acceptance Criteria

1. THE system SHALL expose install prompt logic via a custom React hook `useInstallPrompt`
2. THE hook SHALL return: `isVisible` (boolean), `handleInstall` (function), `handleDismiss` (function)
3. THE hook SHALL handle the case where `beforeinstallprompt` is never fired (unsupported browsers)
4. THE hook SHALL handle errors from the native install prompt gracefully without crashing
