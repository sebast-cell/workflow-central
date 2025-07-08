# WorkFlow Central (Next.js)

This is a NextJS starter in Firebase Studio, now configured for deployment on Vercel.

## Deploying to Vercel (Recommended Method)

The easiest and most professional way to deploy is by connecting your GitHub account to Vercel. This gives you automatic deployments every time you push new code.

1.  **Push to GitHub:** Make sure your latest code is on GitHub by running `git add .`, `git commit -m "Configure for Vercel"`, and `git push`.
2.  **Import to Vercel:** Go to [vercel.com](https://vercel.com/), sign up with your GitHub account, and import your `workflow-central` repository.
3.  **Configure Project:** Vercel will automatically detect that it's a Next.js app and set up the build commands for you. No extra configuration is needed.
4.  **Add Environment Variables:** Before deploying, go to your project's **Settings -> Environment Variables** in Vercel and add the following:
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Add your Google Maps API key here. This is required for the maps to work.
5.  **Deploy:** Click the "Deploy" button. Your site will be live in a few moments!

## Alternative: Deploying Manually with Vercel CLI

If you prefer not to connect your GitHub account, you can deploy manually from your terminal. Note that you will have to repeat this process for every change.

1.  **Install Vercel CLI:** In your terminal, run `npm install -g vercel`.
2.  **Login to Vercel:** Run `vercel login` and follow the instructions to log in.
3.  **Link Project:** Navigate to your project directory and run `vercel link`. This will connect your local folder to a Vercel project.
4.  **Deploy:** To deploy to production, run `vercel deploy --prod`. You will need to add your environment variables (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) in the Vercel project dashboard.