# CRM OS

A modern, highly customizable Customer Relationship Management (CRM) platform built specifically to support dynamic workflows, multi-tenancy, and seamless external integrations. 

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS / CSS Modules
- **Architecture:** API-First, Multi-Tenant

## ✨ Key Features

- **Multi-Tenant Architecture:** Secure data isolation for individual founders and their organizations.
- **Dynamic Forms & Custom Fields:** Founders can dynamically create custom fields (e.g., text, number, dropdowns) for their modules (Leads, Contacts, etc.) without requiring database schema changes.
- **External API Integrations:** Secure API key generation for external web integrations, allowing leads to be captured directly from a founder's custom website.
- **Embeddable Widgets:** Ready-to-use HTML/JS scripts and NPM packages for developers to integrate CRM forms externally.

## 📂 Project Structure

```
crmos/
├── src/                  # Application source code (Pages, Components, API routes)
├── public/               # Static assets (images, icons)
├── docs/                 # Additional documentation
├── scripts/              # Build and utility scripts
├── android/              # Android app integration (Capacitor/React Native)
├── ios/                  # iOS app integration (Capacitor/React Native)
└── workflow.md           # Core workflow documentation for Dynamic Forms & API
```

## 🛠️ Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📖 Architecture & Workflows

For a detailed breakdown of how the Dynamic Forms and API Integrations are structured, please refer to the [`workflow.md`](./workflow.md) file included in the repository. It contains sequence diagrams and flow explanations for the data lifecycle.

## 🤝 Code Guidelines

- **Components:** Kept modular and reusable.
- **State Management:** Handled via React context / hooks where applicable.
- **Styling:** Adhere to the design system established in the project.

---
*This repository is currently under active development. Feedback from the technical team is welcome to improve the architecture and expand the API capabilities.*
