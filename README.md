# WorkFlow Central (Next.js)

This is a NextJS starter in Firebase Studio, now configured for deployment on Vercel.

## Deploying to Vercel

1.  **Push to GitHub:** Make sure your latest code is on GitHub by running `git add .`, `git commit -m "Configure for Vercel"`, and `git push`.
2.  **Import to Vercel:** Go to [vercel.com](https://vercel.com/), sign up with your GitHub account, and import your `workflow-central` repository.
3.  **Configure Project:** Vercel will automatically detect that it's a Next.js app and set up the build commands for you. No extra configuration is needed.
4.  **Add Environment Variables:** Before deploying, go to your project's **Settings -> Environment Variables** in Vercel and add the following:
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Add your Google Maps API key here. This is required for the maps to work.
5.  **Deploy:** Click the "Deploy" button. Your site will be live in a few moments!
