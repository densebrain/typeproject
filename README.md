typeproject
---

TypeScript projects with ease, no-bullshit,
just coding.

### Install
```bash
npm i -g typeproject
```

### Create a project
```bash
tp create my-project
```


### Gulp tasks

All compiled assets goto `<dir>/dist`

```
compile
compile-watch
test
tdd (compile-watch + test)

update-project-deps (coming soon)
```

### Start coding!!!

the important parts of the tree structure
look like this:

```
./src
./src/Globals.ts
./src/index.ts
./src/test
./src/test/index.spec.ts
./src/test/test-setup.ts
./typings/... (reflect-metadata,sinon,chai,mocha included)
./tsconfig.json
./tslint.json
./package.json
./wallaby.js <-- we like it - up to you
./.typeproject <-- our config file for future updates
```


