const path = require('path');

module.exports = {
	entry: {
		main: "./src/entry.js",
	},
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'public/javascripts')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							'@babel/preset-env'
						]
					}
				}
			},
			{
				test: /\.(scss|css)$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'sass-loader' }

				]
			}
		]
	},
}