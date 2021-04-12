module.exports = (client, { id, token }) => {
	client.api.interactions(id, token).callback.post({
		data: { type: 4, data: { content: "What?" } },
	});
};
