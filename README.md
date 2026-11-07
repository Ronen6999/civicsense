# CivicSense

CivicSense is a campus issue reporting platform. Students can submit complaints without an account and track updates privately; administrators review and manage reports in a dashboard.

This is a hackathon project created for the Game of Codes Hackathon, conducted at Dibrugarh University.

**Live demo:** [civicsense.ronen.in](https://civicsense.ronen.in)

![CivicSense demo](https://res.cloudinary.com/da4dwb3te/image/upload/v1793774447/Capture_umbcfw.png)

## Run locally

Requires Node.js 20+ and MongoDB.

```bash
npm install
npm run install:all
cp server/.env.example server/.env
```

Set `MONGODB_URI`, `JWT_SECRET`, and `TRACKING_TOKEN_SECRET` in `server/.env`. Use different secrets with at least 32 characters each. Then create an administrator and start the app:

```bash
npm run create-admin
npm run dev
```

The client runs at [localhost:5173](http://localhost:5173); the admin sign-in is at `/admin/login`. Groq AI and Cloudinary integrations are optional and require server-side configuration.
