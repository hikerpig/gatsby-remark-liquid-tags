const visit = require("unist-util-visit");
const toString = require("mdast-util-to-string");

const { breakLiquidTag } = require("./utils");

const getCodepen = require("./embeds/codepen");
const getYoutube = require("./embeds/youtube");
const getCodesandbox = require("./embeds/codesandbox");
const getGoogleslides = require("./embeds/google-slides");
const getJsfiddle = require("./embeds/jsfiddle");
const getSlides = require("./embeds/slides");
const getSoundcloud = require("./embeds/soundcloud");

const serviceMap = {
	codepen: getCodepen,
	youtube: getYoutube,
	codesandbox: getCodesandbox,
	'google-slides': getGoogleslides,
	'jsfiddle': getJsfiddle,
	'slides': getSlides,
	'soundcloud': getSoundcloud,
}

// twitter is a work in progress, having issues because it returns a promise
// const getTwitter = require("./embeds/twitter");

const LIQUID_BLOCK_EXP = /{\%.*\%}/g;

module.exports = ({ markdownAST }, { customServiceMap = {}}) => {
	visit(markdownAST, "paragraph", (node) => {
		// Grab the innerText of the paragraph node
		let text = toString(node);

		// Test paragraph if it includes a liquid tag format
		const matches = text.match(LIQUID_BLOCK_EXP);

		// Only show embeds for liquid tags
		if (matches !== null) {
			let tagDetails = breakLiquidTag(matches[0]); // only interested in the first match
			let { tagName, tagOptions } = tagDetails;

			let embed;
			// check the tagname to know which embed is to be used
			const serviceFn = serviceMap[tagName] || customServiceMap[tagName]
			if (serviceFn) {
				embed = serviceFn(tagOptions);
			}

			if (embed === undefined) return;

			node.type = "html";
			node.children = undefined;
			node.value = text.replace(LIQUID_BLOCK_EXP, embed);
		}
	});

	return markdownAST;
};
