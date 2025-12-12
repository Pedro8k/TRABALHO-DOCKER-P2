# Guia de Contribuição - API P2 DevSecOps

## Gitflow - Estrutura de Branches

Este projeto segue o modelo **Gitflow** para organização de branches:

### Branches Principais

- **`main`** - Branch de produção
  - Contém código estável e pronto para deploy
  - Apenas aceita merges de `develop` ou `hotfix/*`
  - Cada merge deve ser tagueado com versão (ex: `v1.0.0`)

- **`develop`** - Branch de desenvolvimento
  - Contém código em desenvolvimento
  - Base para criar features
  - Sempre deve estar funcional

### Branches de Suporte

- **`feature/*`** - Novas funcionalidades
  - Criadas a partir de `develop`
  - Exemplo: `feature/add-user-authentication`
  - Merge de volta para `develop`

- **`bugfix/*`** - Correções de bugs
  - Criadas a partir de `develop`
  - Exemplo: `bugfix/fix-login-validation`
  - Merge de volta para `develop`

- **`hotfix/*`** - Correções urgentes em produção
  - Criadas a partir de `main`
  - Exemplo: `hotfix/fix-critical-security-issue`
  - Merge para `main` E `develop`

- **`release/*`** - Preparação para release
  - Criadas a partir de `develop`
  - Exemplo: `release/v1.0.0`
  - Merge para `main` e `develop`

## Conventional Commits

Este projeto usa **Conventional Commits** para padronizar mensagens de commit.

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types (Tipos)

- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Alterações na documentação
- **style**: Formatação, ponto e vírgula, etc (sem mudança de código)
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adição ou correção de testes
- **chore**: Tarefas de build, configurações, etc
- **ci**: Mudanças em arquivos de CI/CD
- **build**: Mudanças no sistema de build ou dependências

### Exemplos

```bash
# Nova funcionalidade
git commit -m "feat(auth): add JWT authentication"

# Correção de bug
git commit -m "fix(api): resolve SQL injection vulnerability"

# Documentação
git commit -m "docs(readme): update installation instructions"

# CI/CD
git commit -m "ci(github-actions): add SonarCloud integration"

# Refatoração
git commit -m "refactor(database): improve connection pooling"
```

### Commit com Breaking Change

```bash
git commit -m "feat(api): change user endpoint structure

BREAKING CHANGE: User endpoint now returns different JSON structure"
```

## Workflow de Desenvolvimento

### 1. Criar uma nova feature

```bash
# Atualizar develop
git checkout develop
git pull origin develop

# Criar branch de feature
git checkout -b feature/nome-da-feature

# Fazer alterações e commits
git add .
git commit -m "feat(scope): description"

# Push da branch
git push origin feature/nome-da-feature

# Criar Pull Request para develop
```

### 2. Criar um hotfix

```bash
# Criar branch de hotfix a partir de main
git checkout main
git pull origin main
git checkout -b hotfix/nome-do-fix

# Fazer correção e commit
git add .
git commit -m "fix(scope): description"

# Push e criar PR para main E develop
git push origin hotfix/nome-do-fix
```

### 3. Criar uma release

```bash
# Criar branch de release a partir de develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0

# Atualizar versão no package.json
npm version 1.0.0

# Commit e push
git commit -am "chore(release): bump version to 1.0.0"
git push origin release/v1.0.0

# Criar PR para main e develop
# Após merge em main, criar tag
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Regras de Pull Request

1. **Título**: Seguir Conventional Commits
2. **Descrição**: Explicar o que foi feito e por quê
3. **Testes**: Garantir que todos os testes passam
4. **CI/CD**: Aguardar aprovação do pipeline
5. **Review**: Pelo menos 1 aprovação (em projetos em equipe)
6. **Conflitos**: Resolver antes do merge

## Comandos Úteis

```bash
# Ver branches
git branch -a

# Deletar branch local
git branch -d feature/nome-da-feature

# Deletar branch remota
git push origin --delete feature/nome-da-feature

# Ver histórico de commits
git log --oneline --graph --all

# Ver status
git status

# Ver diferenças
git diff
```

## Boas Práticas

1. ✅ **Commits pequenos e frequentes**
2. ✅ **Mensagens descritivas**
3. ✅ **Testar antes de commitar**
4. ✅ **Não commitar código comentado**
5. ✅ **Não commitar arquivos de configuração local (.env)**
6. ✅ **Manter branches atualizadas com develop/main**
7. ✅ **Deletar branches após merge**

## Estrutura de Versionamento

Seguimos **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH

1.0.0
│ │ │
│ │ └─ PATCH: Correções de bugs
│ └─── MINOR: Novas funcionalidades (compatível)
└───── MAJOR: Mudanças incompatíveis (breaking changes)
```

### Exemplos

- `1.0.0` → `1.0.1`: Correção de bug
- `1.0.1` → `1.1.0`: Nova funcionalidade
- `1.1.0` → `2.0.0`: Breaking change

## Ferramentas Recomendadas

- **commitlint**: Validar mensagens de commit
- **husky**: Git hooks para validação
- **conventional-changelog**: Gerar changelog automaticamente

## Dúvidas?

Consulte a documentação oficial:
- [Gitflow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
