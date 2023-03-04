import { Configuration } from "webpack"

const config: Configuration = {
    entry: "./src/server.tsx",
    module: {
        rules: [
            {
                test: /\.ts|\.tsx$/,
                loader: "babel-loader",
            }
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.css' ],
    }
};

export default config