const core = require("@actions/core");
const fs = require("fs");

try {
	let envFile = core.getInput("env-file");
	let envKey = core.getInput("env-key");
	let suffix = core.getInput("suffix");
	let build = core.getInput("build");
	let offset = core.getInput("offset");

	var text = fs.readFileSync(envFile, "utf8");

	var currentVersion = getValueByKey(text, envKey);

	let nextVersion = yyyymmdd() + ".";
	const versionParts = currentVersion.split(".");
	if (!build) {
		let revision = versionParts[versionParts.length - 1];
		revision++;
		nextVersion += revision;
	} else {
		let wantedBuild = parseInt(build);
		if (offset) wantedBuild = parseInt(build) + parseInt(offset);
		nextVersion += wantedBuild;
	}

	if (suffix) {
		nextVersion = nextVersion + "-" + suffix;
	}

	text = text.replace(
		envKey + "=" + currentVersion,
		envKey + "=" + nextVersion
	);

	fs.writeFileSync(envFile, text, "utf8");

	core.setOutput("version", nextVersion);
} catch (error) {
	core.setFailed(error.message);
}

function yyyymmdd() {
	function twoDigit(n) {
		return (n < 10 ? "0" : "") + n;
	}

	var now = new Date();
	return (
		"" +
		now.getFullYear() +
		"." +
		twoDigit(now.getMonth() + 1) +
		"." +
		twoDigit(now.getDate())
	);
}

function getValueByKey(text, key) {
	var regex = new RegExp("^" + key + "=(.*)$", "m");
	var match = regex.exec(text);
	if (match) return match[1];
	else return null;
}
