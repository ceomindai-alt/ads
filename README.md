# ads
db.users.updateOne(
  { email: "admin@yourdomain.com" },
  { $set: { accountType: "admin" } }
)
node scripts/makeAdmin.js
node scripts/seedCpm.js
