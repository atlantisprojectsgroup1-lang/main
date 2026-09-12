# Auth Testing Playbook

## MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "super_admin"}).pretty()
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email, index on login_attempts.identifier.

## API Testing
```
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"atlantisprojectsgroup@gmail.com","password":"Atlantis@2026"}'
cat cookies.txt
curl -b cookies.txt http://localhost:8001/api/auth/me
```
Login returns the user object and sets an `access_token` httpOnly cookie. `/me` returns the same user via cookie.
Brute force: 5 failed attempts locks the account+IP for 15 minutes.
