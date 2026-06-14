# Division 99 Landing Page - Developer & Agent Guide

This document provides a quick index and reference guide for developers or AI agents who need to maintain or add features to this codebase without reading the entire source code.

## 1. Project Overview
A single-page recruitment landing page for **IDF Division 99 (עוצבת הבזק)**, specifically targeted at Olim, Yeshiva graduates, and National Service alumni. Written in **Hebrew (RTL)**, featuring a premium dark tactical design, an interactive eligibility checker, and a recruitment timeline.

*   **Live Site:** [https://ugda99shlavb.surge.sh](https://ugda99shlavb.surge.sh)
*   **Source Folder:** `C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing`

---

## 2. Directory Structure
*   **[index.html](file:///C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing/index.html)**: Main HTML5 file. Contains the Hebrew content, metadata, structure, and links to external resources.
*   **[style.css](file:///C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing/style.css)**: Custom responsive stylesheet containing the design system (CSS variables), typography, and custom animations.
*   **[app.js](file:///C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing/app.js)**: Client-side JavaScript containing interactive elements.
*   **[logo.png](file:///C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing/logo.png)**: The official Division 99 shield logo image used across the page.
*   **[README.md](file:///C:/Users/asafi/.gemini/antigravity/scratch/division-99-landing/README.md)**: Standard short project description.

---

## 3. Styling & Color Palette (CSS)
All color schemes and styles are driven by CSS variables defined in `:root` inside `style.css`:
*   `--bg-primary`: `#0a0b0a` (Pure dark/black canvas)
*   `--bg-secondary`: `#131713` (Dark green-charcoal background for cards)
*   `--color-green-medium`: `#2e3e2e` (Military green borders/accents)
*   `--color-gold`: `#c59b27` (Primary accent color for headers, highlights, and icons)
*   `--color-red`: `#b21c1c` (Urgent highlights, warning indicators, and primary CTAs)
*   `--text-primary`: `#ffffff` (White body text)
*   `--text-muted`: `#b0b7b0` (Muted/grey text)

**Fonts in use:** Google Fonts `Heebo` (Primary) and `Rubik` (Titles).

---

## 4. Key Interactive Logic (`app.js`)
*   **Mobile Navbar**: Toggles the `.active` class on `#nav-menu` and animates the hamburger icon (`#nav-toggle`) on click.
*   **Header Scroll Class**: Automatically adds the `.scrolled` class to the `<header>` element when the scroll offset exceeds `50px` (used to shrink and shadow the navbar).
*   **Scroll Spy**: Listens to page scrolling and automatically applies the `.active` class to the current section's link in the navigation menu.
*   **Eligibility Checker**:
    *   Listens to the `#checker-form` submission.
    *   **Rules for Success**:
        1. Age input (`#user-age`) is between `28` and `40` inclusive.
        2. All 4 checkboxes (`#check-mental-exemption`, `#check-health`, `#check-dates`, `#check-loyalty`) must be checked.
    *   **DOM Updates**:
        *   If eligible: Adds `.success` class to `#eligibility-checker`, displays `#result-eligible`, and hides `#result-not-eligible`.
        *   If ineligible: Adds `.fail` class to `#eligibility-checker`, displays `#result-not-eligible`, hides `#result-eligible`, and populates `#not-eligible-reason` with bulleted reasons in Hebrew outlining exactly what failed.

---

## 5. Integrations & External Links
*   **Primary Registration Form (Google Form)**:
    *   URL: `https://docs.google.com/forms/d/1YCV9Hp1XuppwhIbYarB6UV4nIiXpUxnxAxlByIyOrrk/viewform`
    *   Linked on: Header CTA (`#nav-cta-btn`), Hero button (`#hero-submit-btn`), Checker success result button, and Final bottom CTA (`#final-submit-btn`).
*   **WhatsApp Update Group**:
    *   URL: `https://chat.whatsapp.com/LMHQzzmi4phFQtlLQSLyyt`
    *   Linked on: Floating bottom-right widget (`#whatsapp-floating-btn`) and Final bottom CTA (`#final-whatsapp-btn`).
*   **Alog 99 Website**:
    *   URL: `https://www.alog99.com/`
    *   Linked on: About section card button (`#alog-link-btn`).

---

## 6. How to Deploy (Surge)
To deploy new changes to the live website, run the following command in the project directory:
```powershell
npx surge . ugda99shlavb.surge.sh
```
*(No login prompt is required since the local environment is already authenticated).*
