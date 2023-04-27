module.exports = {
    basePath: "/webplay",
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|mp4)$/i,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        publicPath: "/webplay/_next/static/assets/",
                        outputPath: `${isServer ? "../" : ""}static/assets/`,
                        name: "[name]-[hash].[ext]",
                    },
                },
            ],
        });
        config.module.rules.push({
            test: /\.svg$/,
            issuer: /\.(js|ts)x?$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
    experimental: {
        appDir: true,
    },
};
