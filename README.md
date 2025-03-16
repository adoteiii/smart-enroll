# SmartEnroll

![SmartEnroll Logo](public/logo.svg)

**SmartEnroll** is an AI-powered workshop registration and management platform designed for educational institutions and event organizers. It streamlines the registration process, enhances engagement, and provides powerful analytics for event management.

## 🚀 Features

- **AI-Powered Registration Management** – Intelligent form processing, duplicate detection, and suggestion engine.
- **Personalized User Experience** – Custom recommendations and automated communications.
- **Real-time Analytics Dashboard** – Comprehensive insights into registrations, attendance, and engagement.
- **Multi-channel Notifications** – Automated email and SMS reminders to reduce no-shows.
- **Admin Portal** – User-friendly interface for workshop management.
- **Mobile Responsive Design** – Seamless experience across all devices.
- **AI Chatbot Support** – 24/7 assistance for students and administrators.

## 🛠 Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS.
- **Backend:** Firebase (Authentication, Firestore, Functions, Hosting).
- **AI Integration:** Google Gemini API.
- **Communication:** SMTP Email, ARKESEL SMS API.
- **Styling:** Tailwind CSS with shadcn/ui components.
- **Deployment:** Firebase Hosting, Vercel.

## 📌 Getting Started

### Prerequisites

- Node.js 18.x or later.
- npm or yarn.
- Firebase account.
- Google Gemini API key.
- Email account for SMTP.
- ARKESEL account for SMS notifications (optional).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adoteiii/smart-enroll.git
   cd smart-enroll
   ```

2. Install dependencies:

   ```bash
   npm install  # or yarn install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:

   ```ini
   # Firebase Client Config
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGEING_SENDER=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   # Firebase Admin SDK Config
   ADMIN_TYPE=service_account
   ADMIN_PROJECT_ID=your_project_id
   ADMIN_PRIVATE_KEY_ID=your_private_key_id
   ADMIN_PRIVATE_KEY="your_private_key"
   ADMIN_CLIENT_EMAIL=your_client_email
   ADMIN_CLIENT_ID=your_client_id
   ADMIN_AUTH_URI=your_auth_uri
   ADMIN_TOKEN_URI=your_token_uri
   ADMIN_AUTH_PROVIDER_CERT_URL=your_auth_provider_cert_url
   ADMIN_CLIENT_CERT_URL=your_client_cert_url
   ADMIN_UNIVERSE_DOMAIN=googleapis.com

   # ARKESEL SMS API Config
   PHONE_LOG=your_phone_log
   ARKESEL_API_KEY=your_arkesel_api_key
   SENDER_ID=SmartEnroll

   # SMTP Email Config
   SMTP_USER=your_smtp_email
   SMTP_PASS=your_smtp_password
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   ```

4. Start the development server:

   ```bash
   npm run dev  # or yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.

## 📊 Usage

### 🎛 Admin Dashboard

The admin dashboard is accessible at `/dashboard`, where admins can:
- Create and manage workshops.
- View registrations.
- Send notifications.
- Access real-time analytics.

### 📝 Registration Process

1. Users visit the landing page.
2. Browse available workshops.
3. Select a workshop and fill out the registration form.
4. Receive confirmation email/SMS.
5. Get reminders before the event.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Commit your changes:

   ```bash
   git commit -m "Add amazing feature"
   ```

4. Push to the branch:

   ```bash
   git push origin feature/amazing-feature
   ```

5. Open a Pull Request.

   ```bash
   # Your pull request will now be ready for review
   ```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙌 Acknowledgments

- Next.js
- Firebase
- Tailwind CSS
- shadcn/ui
- Google Gemini API

## 📬 Contact

Project Link: [https://github.com/yourusername/smart-enroll](https://github.com/yourusername/smart-enroll)

Built with ❤️ by William Adotei Allotey
