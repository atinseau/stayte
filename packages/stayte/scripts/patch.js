const fs = require('fs')
const path = require('path')

const init_cwd = process.env.INIT_CWD
const cwd = process.cwd()

// db that contains every patch references
// a file is related to a specific package version or a package name
const PATCH = {
  'next@14.2.13': 'patches/next@14.2.13.patch'
}

// If the init cwd is not defined, something is wrong
// and install could not be done
if (!init_cwd) {
  throw new Error('INIT_CWD is not defined')
}

const packageJson = JSON.parse(fs.readFileSync(`${init_cwd}/package.json`, 'utf-8'))

// If there is no patched dependencies, we create it in the package.json
if (!packageJson.patchedDependencies) {
  packageJson.patchedDependencies = {}
}

const patchedDependenciesCount = Object.keys(packageJson.patchedDependencies).length
const scannedPackages = getScannedPackages()

// Loop over the patch object and check if the package is already patched
// if not, we apply the patch in the current directory where statye will be installed
// and update the package.json with the new patch
for (const [name, patch] of Object.entries(PATCH)) {


  // If the package is not installed on every project, we skip it
  const packageName = name.split('@')[0]
  if (!scannedPackages.find((packageJson) => (packageJson?.dependencies || {})[packageName])) {
    continue
  }

  if (!packageJson.patchedDependencies[name]) {
    const patchPath = `${cwd}/${patch}`
    const patchContent = fs.readFileSync(patchPath, 'utf-8')
    if (!fs.existsSync(`${init_cwd}/patches`)) {
      fs.mkdirSync(`${init_cwd}/patches`)
    }

    fs.writeFileSync(`${init_cwd}/${patch}`, patchContent, 'utf-8')
    packageJson.patchedDependencies[name] = patch
  }
}


// We only write the package.json if the number of patched dependencies has changed
// this is to avoid unnecessary writes
const newPatchedDependenciesCount = Object.keys(packageJson.patchedDependencies).length
if (newPatchedDependenciesCount > patchedDependenciesCount) {
  fs.writeFileSync(`${init_cwd}/package.json`, JSON.stringify(packageJson, null, 2), 'utf-8')
}


function getScannedPackages() {
  const packages = searchFiles(init_cwd, 'package.json')
  return packages.map((packageJson) => {
    const packageJsonContent = fs.readFileSync(packageJson, 'utf-8')
    const packageJsonObject = JSON.parse(packageJsonContent)
    return packageJsonObject
  })
}


function searchFiles(dir, fileName) {
  let foundedFiles = []
  try {
    // read the contents of the directory
    const files = fs.readdirSync(dir)

    // search through the files
    for (const file of files) {
      // build the full path of the file
      const filePath = path.join(dir, file);
      // get the file stats
      const fileStat = fs.statSync(filePath);

      // if the file is a directory, recursively search the directory
      if (fileStat.isDirectory() && !file.match(/node_modules|.git|.turbo|\./)) {
        foundedFiles.push(...searchFiles(filePath, fileName))
      } else if (file.endsWith(fileName)) {
        foundedFiles.push(filePath);
      }
    }
  } catch (err) {
    console.error(err);
  }
  return foundedFiles;
}