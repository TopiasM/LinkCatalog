import { Configuration, ProvidePlugin, DefinePlugin } from "webpack"
import dotenv from 'dotenv'

dotenv.config()
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