const withPWA = require("next-pwa")({
    dest: "public",
    scope: "/webplay",
});

module.exports = withPWA({
    basePath: "/webplay",
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ["@svgr/webpack"],
        });
        config.module.rules.push({
            test: /\.mp4$/,
            use: [
                {
                    loader: "file-loader",
                    options: {
                        publicPath: "/webplay/_next/static/media/",
                        outputPath: `${isServer ? "../" : ""}static/media/`,
                        name: "[name].[hash].[ext]",
                    },
                },
            ],
        });
        return config;
    },
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    experimental: {
        appDir: true,
    },
});
