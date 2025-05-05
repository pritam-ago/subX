# Subscription Manager Mobile App

A React Native mobile application for managing subscriptions and payment reminders. Built with Expo and TypeScript.

## Features

- User authentication (login/register)
- Create, view, edit, and delete subscriptions
- Set billing cycles (monthly, quarterly, yearly)
- Configure payment reminders
- Track next billing dates
- Modern and intuitive UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd subscription-manager/client
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm start
# or
yarn start
```

4. Run on your preferred platform:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Environment Setup

The app connects to a backend server. Make sure the server is running and update the API URL in the following files if needed:

- `app/auth/login.tsx`
- `app/auth/register.tsx`
- `app/home.tsx`
- `app/subscription/[id].tsx`
- `app/subscription/new.tsx`

## Project Structure

```
client/
├── app/
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── subscription/
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── home.tsx
│   └── index.tsx
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
