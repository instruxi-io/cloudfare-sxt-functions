### Welcome to the Space and Time Query Deployment Repository, which is part of our entry for the 2023 Spring Hackathon. This repository aims to facilitate the deployment of staging and production Cloudflare Workers for querying Space and Time data.

### Key Features:

**Staging and Production Environments:**
- Easily deploy Cloudflare Workers to both staging and production environments, allowing for efficient testing and deployment of your Space and Time queries.

**Cloudflare Integration:** 
- Seamlessly integrate with Cloudflare's powerful infrastructure and security services to ensure reliable and secure query execution.

**Query Space and Time:**
- Leverage the repository to run queries on Space and Time data, enabling you to analyze and extract valuable insights from this rich dataset.

**Hackathon Entry:** 
- This repository is developed as part of our entry for the 2023 Spring Hackathon, showcasing our innovative approach to leveraging Cloudflare Workers for Space and Time query deployment.

We're excited to have you here and encourage you to explore the repository, contribute to its development, and make the most of the powerful features it offers. Let's embark on this journey of querying Space and Time with the convenience and scalability of Cloudflare Workers!

Please note that this repository is just one of two repositories associated with our hackathon entry. For the complete project, be sure to check out the companion repository [INSERT NAME/DESCRIPTION OF SECOND REPOSITORY], which complements this deployment repository.

We value your feedback and contributions, so don't hesitate to reach out, submit issues, or contribute to further enhance the functionality and usability of this repository. Happy hacking!

**To begin, make sure you have set up an account in Cloudflare and have coordinated access to the Space and Time database with your Space and Time account representative. You will use Cloudflare's Wrangler Client library (https://developers.cloudflare.com/workers/wrangler/) to develop, test, and deploy Cloudfare workers.**

1. `npm install` 
    - Note that this project uses Wrangler 3.0.0, but Windows users may need to downgrade to Wrangler 2.0.0 using NPM 
2. `cd fractional-reserve-sxt-worker/`
3. `npx wrangler login`
4. `npx wrangler dev src/worker.js` starts an interactive development console for testing
5. `npx wrangler publish fractional-reserve-sxt-worker/src/worker.js --env staging` 
6. `npx wrangler secret put PRIVATE_KEY fractional-reserve-sxt-worker-<env>` and `npm wrangler secret put BISCUIT_INSTRUXI_IONI_AUDIT fractional-reserve-sxt-worker-<env>`

**Comments**
- `src/worker.js` is the main source of code to execute API calls to Space and Time
    - ***requestChallenge()*** - requests an auth code challenge from the auth API route
    - ***signChallenge()*** - signs challenge with your Ethereum private key 
    - ***requestToken()*** - makes an API request to SxT with the auth code and signed challenge. Returns a JWT auth token
    - ***querySxT()*** - queries SxT by passing in the configured SQL statement from `wrangler.toml`
- The PRIVATE_KEY secret in step 4 must correspond to the PUBLIC_KEY and USER_ID specified in `wrangler.toml`
- The name of your worker in step 4 is specified by the `name` entry in the `wrangler.toml` file and concatenating the environment name used to deploy your worker in step 4 `staging` or `production`. For example, Cloudflare will derive `fractional-reserve-sxt-worker-production` if we publish this worker with the `production` environment flag