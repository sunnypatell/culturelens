# Firebase Auto-Deploy Setup Guide

this document explains how to set up automated firebase deployment via github actions.

## how it works

when you push changes to `main` branch that affect firebase configuration files:

- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `firebase.json`

github actions will automatically deploy them to firebase.

## setup instructions

### 1. get firebase admin SDK credentials

you should already have `firebase-adminsdk-key.json` locally. if not:

1. go to [firebase console → service accounts](https://console.firebase.google.com/project/culturelens-2dd38/settings/serviceaccounts/adminsdk)
2. click **"generate new private key"**
3. save as `firebase-adminsdk-key.json` (already in .gitignore)

### 2. add github secret

1. go to your github repo: https://github.com/sunnypatell/culturelens
2. navigate to **settings** → **secrets and variables** → **actions**
3. click **"new repository secret"**
4. name: `FIREBASE_SERVICE_ACCOUNT`
5. value: copy the ENTIRE contents of `firebase-adminsdk-key.json`
   ```bash
   cat firebase-adminsdk-key.json | pbcopy  # copies to clipboard on mac
   ```
6. click **"add secret"**

### 3. verify setup

after adding the secret:

1. make a small change to `firestore.rules` or `storage.rules`
2. commit and push to `main`
3. go to **actions** tab in github
4. watch the "firebase deploy" workflow run
5. verify deployment succeeded

## workflow details

**file:** `.github/workflows/firebase-deploy.yml`

**triggers on:**

- pushes to `main` branch
- changes to firebase config files only

**what it deploys:**

1. firestore security rules
2. firestore indexes
3. storage security rules (if storage is enabled)

**authentication:**
uses the `FIREBASE_SERVICE_ACCOUNT` secret you added

## troubleshooting

### "storage not enabled" error

this is expected if you haven't enabled firebase storage yet. the workflow will skip storage deployment and continue.

enable storage at: https://console.firebase.google.com/project/culturelens-2dd38/storage

### "permission denied" errors

verify the service account has the correct permissions:

1. go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam?project=culturelens-2dd38)
2. find `firebase-adminsdk-fbsvc@culturelens-2dd38.iam.gserviceaccount.com`
3. should have roles: **Firebase Admin SDK Administrator Service Agent**

### workflow not triggering

check that:

- you pushed to `main` branch (not a different branch)
- you modified one of the firebase config files
- the workflow file exists at `.github/workflows/firebase-deploy.yml`

## manual deployment

you can still deploy manually anytime:

```bash
# authenticate with admin SDK
export GOOGLE_APPLICATION_CREDENTIALS="${PWD}/firebase-adminsdk-key.json"

# deploy everything
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

## security notes

⚠️ **never commit firebase-adminsdk-key.json to git**

- already in `.gitignore`
- contains sensitive credentials with full admin access
- github secret is encrypted and secure

✅ **the admin SDK can:**

- deploy firebase rules and indexes
- manage firebase resources
- bypass all security rules for backend operations

❌ **the admin SDK should not:**

- be exposed in client-side code
- be shared publicly
- be committed to version control
