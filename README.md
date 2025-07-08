# WorkFlow Central (Next.js)

This is a NextJS starter in Firebase Studio, configured for automated deployment to **Firebase Hosting** using GitHub Actions.

## Deployment Process

This project is set up for Continuous Integration and Continuous Deployment (CI/CD).

1.  **Push to a new branch:** When you push code to a new branch and create a Pull Request, a preview environment will be automatically created for you.
2.  **Merge to `main`:** When the Pull Request is merged into the `main` branch, the code will be automatically deployed to your live production site.

## Required Setup (One-time only)

To allow GitHub Actions to deploy to your Firebase project, you need to provide it with secure credentials.

1.  **Get Service Account Key:**
    *   Go to your [Google Cloud Console Service Accounts page](https://console.cloud.google.com/iam-admin/serviceaccounts).
    *   Make sure your `workflow-central` project is selected.
    *   Find the service account ending in `@gcp-sa-firebase.iam.gserviceaccount.com`. If you have multiple, use the "Compute Engine default service account".
    *   Click on it, go to the **KEYS** tab.
    *   Click **ADD KEY** > **Create new key**.
    *   Select **JSON** as the key type and click **CREATE**. A JSON file will be downloaded.

2.  **Create GitHub Secret:**
    *   In your GitHub repository, go to **Settings > Secrets and variables > Actions**.
    *   Click **New repository secret**.
    *   **Name:** `FIREBASE_SERVICE_ACCOUNT_KEY_JSON`
    *   **Value:** Open the downloaded JSON file, copy its entire content, and paste it into this field.
    *   Click **Add secret**.

Once this secret is in place, your deployments will work automatically every time you push code.
