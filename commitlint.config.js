module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // Nouvelle fonctionnalité
        "fix",      // Correction de bug
        "refactor", // Refactoring sans changement fonctionnel
        "style",    // Formatage, lint, pas de changement de code
        "docs",     // Documentation
        "test",     // Ajout ou modification de tests
        "chore",    // Maintenance, dépendances, config
        "ci",       // CI/CD
        "perf",     // Amélioration de performance
        "revert",   // Revert d'un commit
      ],
    ],
    "subject-case": [2, "never", ["upper-case"]],
    "subject-max-length": [2, "always", 72],
  },
};
