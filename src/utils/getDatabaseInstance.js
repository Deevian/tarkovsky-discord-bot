const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

module.exports = () => {
	const adapter = new FileSync("db.json");
	const db = low(adapter);

	db.defaults({ teamkills: [] }).write();

	return db;
};
