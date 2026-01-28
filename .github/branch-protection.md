# 🔒 branch protection rules

rules enforced on the `main` branch to ensure code quality and review standards.

---

## 📋 rules

| rule                      | setting                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------- |
| require PR before merging | ✅ enabled                                                                            |
| required approvals        | 1 (CODEOWNERS: `@sunnypatell`)                                                        |
| dismiss stale reviews     | ✅ on new pushes                                                                      |
| required status checks    | `validate`, `frontend test`, `frontend lint`, `frontend format`, `frontend typecheck` |
| restrict pushes to main   | `@sunnypatell` only                                                                   |
| force pushes              | ❌ blocked                                                                            |
| branch deletion           | ❌ blocked                                                                            |

---

## 🛠️ setup

run the setup script to apply these rules via GitHub API:

```bash
bash scripts/setup-branch-protection.sh
```

### prerequisites

- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- admin access to the repository

### manual alternative

if you prefer to configure via GitHub UI:

1. go to **Settings → Branches → Add branch protection rule**
2. branch name pattern: `main`
3. enable all rules listed in the table above
4. save changes

---

## 📝 notes

- `CODEOWNERS` file at `.github/CODEOWNERS` assigns `@sunnypatell` as required reviewer for all files
- the setup script is idempotent — safe to re-run at any time
- status checks reference workflow job names, not workflow file names
