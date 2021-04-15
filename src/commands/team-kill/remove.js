const getDatabaseInstance = require("../../utils/getDatabaseInstance");
const { TABLE_TEAMKILLS } = require("../../constants/db");

module.exports = (client, { id, token }, options) => {
	const entryId = options[0].value;

	getDatabaseInstance().get(TABLE_TEAMKILLS).remove({ id: entryId }).write();

	client.api.interactions(id, token).callback.post({
		data: {
			type: 4,
			data: { content: "The entry was removed successfully" },
		},
	});
};
