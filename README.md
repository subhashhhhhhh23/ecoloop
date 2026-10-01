# SortWise

SortWise is a mobile-first SUSS food-sorting prototype. Diners can scan or manually list tray items, follow one sorting step at a time, earn points, redeem outlet vouchers, and learn through three short games. Points and demo data stay in memory and reset when the page reloads. The Anthropic API key is stored in Vercel and is never sent to the browser.

## Deploy to Vercel

1. Create a GitHub account and sign in. Choose **New repository**, give it a name such as `sortwise`, and create it.
2. Upload the project files to the repository's top level, including `index.html`, `package.json`, `vercel.json`, the `api` folder containing `scan.js`, and this `README.md`. On GitHub, use **Add file > Upload files**, then commit the upload.
3. Go to [vercel.com](https://vercel.com), create an account or sign in, and choose **Add New > Project**.
4. Select **Import** beside your GitHub repository. Keep the framework preset as **Other**, leave build command and output directory blank, then select **Deploy**. Vercel serves `index.html` and turns `api/scan.js` into the `/api/scan` function.
5. Create an API key in the Anthropic Console. Keep it private.
6. In Vercel, open your project and choose **Settings > Environment Variables**. Add the name `ANTHROPIC_API_KEY`, paste your key as the value, select the Production environment (and Preview if desired), then save.
7. Open **Deployments**, select the newest deployment, and choose **Redeploy** so the function receives the new environment variable.
8. Open your Vercel website link on your phone and choose **Scan my plate**. Allow camera access. On a computer, choose **Upload a photo**.

## Local preview (optional)

Camera access requires HTTPS or localhost. To run the Vercel function locally, install Node.js, install the Vercel CLI with `npm install -g vercel`, then run `vercel dev` from the project folder. Add `ANTHROPIC_API_KEY=your-key` to a local `.env` file. Never put the key in `index.html` or commit `.env`.

Demo mode on the camera page shows a sample scan without calling Anthropic. Real scans need a valid key in the Vercel project settings.
