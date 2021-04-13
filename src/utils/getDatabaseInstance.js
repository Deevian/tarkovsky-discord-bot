const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const { TABLE_TEAMKILLS } = require("../constants/db");

module.exports = () => {
	const adapter = new FileSync("db.json");
	const db = low(adapter);

	db.defaults({ [TABLE_TEAMKILLS]: [] }).write();
	return db;
};
