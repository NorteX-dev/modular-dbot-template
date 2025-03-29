module.exports = {
	printWidth: 120,
	useTabs: true,
	importOrder: ["<THIRD_PARTY_MODULES>", "@", "^@(modules)/", "", "^[./]"],
	importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
	plugins: ["@ianvs/prettier-plugin-sort-imports"],
};
