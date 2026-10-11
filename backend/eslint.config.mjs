import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "dist-test/**", "node_modules/**", "data/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "no-restricted-imports": ["error", { patterns: [] }],
    },
  },
  {
    files: [
      "src/modules/**/domain/**/*.ts",
      "src/modules/**/application/**/*.ts",
      "src/shared/domain/**/*.ts",
      "src/shared/application/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@nestjs/*",
            "express",
            "**/infrastructure/**",
            "**/presentation/**",
            "node:sqlite",
          ],
        },
      ],
    },
  },
);
