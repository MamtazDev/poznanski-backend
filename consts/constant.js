function getWarsawTime() {
	const date = new Date();
	const utcOffset = date.getTimezoneOffset(); // in minutes
	const warsawOffset = date.getTimezoneOffset() / 60 < -1 ? 120 : 60; // Warsaw is UTC+2 in DST and UTC+1 in standard time
	const warsawTime = new Date(
		date.getTime() + (warsawOffset + utcOffset) * 60000
	);
	return warsawTime.toISOString();
}

module.exports = {
	getWarsawTime,
};
