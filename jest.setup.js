import dotenv from "dotenv";

dotenv.config();

export default {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFiles: ["<rootDir>/jest.setup.js"],
};
