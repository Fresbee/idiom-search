// Perform initialization for the main Idioms database
const appDbName = process.env.MONGO_APP_DB;
const dbUser = process.env.MONGO_APP_USER;
const dbPassword = process.env.MONGO_APP_PASSWORD;

// Switch to the application database
db = db.getSiblingDB(appDbName);

db.createUser({
  user: dbUser,
  pwd: dbPassword,
  roles: [
    {
      role: "readWrite",
      db: appDbName
    }
  ]
});

db.createCollection("idioms");

// TODO: Seed initial data upon first run of the mongo service or load after DB is running (Python + Mongo module)
// db.idioms.insertMany([
//   { idiom: "a bad break", definition: "A misfortune or setback.", synonyms: ["reversal", "setback", "stumbling block", "trouble"] },
//   { idiom: "piece of cake", definition: "Something very easy.", synonyms: ["trifle", "insignificant"] }
// ]);

print(
  `Initialized database "${appDbName}" and user "${dbUser}" with readWrite role.`
);
