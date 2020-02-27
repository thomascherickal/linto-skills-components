// TODO: Uncomment require line when Jenkins has been setup
// TODO: Setup environment config (npm and verdaccio) 
// TODO: Configure remoteSsh function for correct ssh script to call 

pipeline {
    agent any

    tools {
        nodejs "latest"
    }

    environment {
        NPM_CONFIG_ID = 'npm-jenkins-config'
        VERDACCIO_CONFIG_ID = 'verdaccio-jenkins-config'

        REGISTRY_DEV_HOST = "verdaccio.linto.ai"

        RELEASE_VERSION= sh( returnStdout: true,
            script: "awk -v RS='' '/#/ {print; exit}' RELEASE.md | head -1 | sed 's/#//' | sed 's/ //'"
        )
        PACKAGE_VERSION = sh( returnStdout: true,
            script : "awk -F'\"' '/\"version\": \".+\"/{ print \$4; exit; }' package.json"
        )
        REALM_AUTH = credentials('realm-verdaccio-auth') // Also load : REALM_AUTH_USR && REALM_AUTH_PSW
    }

    stages{
        stage('NPM Master deployment'){
            when{
                branch 'master'
            }
            steps {
                echo 'Prepare to deploy on npm'
                script {
                    def published_version = sh( returnStdout: true,
                        script: "npm view . version"
                    )
                    checkVersion(PACKAGE_VERSION, RELEASE_VERSION, published_version)

                    nodejs(nodeJSInstallationName: 'latest', configId: NPM_CONFIG_ID) {
                        sh 'npm install'
                        sh 'npm publish'
                    }
                }
                echo 'Deploy done'
            }
        } 

        stage('Verdaccio Next publish'){
            when{
                branch 'next'
            }
            steps {
                echo 'Prepare to deploy on verdaccio'
                script {
                    def published_version = sh( returnStdout: true,
                        script: "npm config set registry http://${REALM_AUTH_USR}:${REALM_AUTH_PSW}@${REGISTRY_DEV_HOST} && npm view . version"
                    )
                    checkVersion(PACKAGE_VERSION, RELEASE_VERSION, published_version)

                    nodejs(nodeJSInstallationName: 'latest', configId: VERDACCIO_CONFIG_ID) {
                        sh 'npm install'
                        sh 'npm publish'
                    }
                }
                echo 'Deploy done'
            }
        }
    }// end stages
}

void checkVersion(package_version, release_version, published_version){
    echo "Release VERSION : ${release_version}"
    echo "Package VERSION : ${package_version}"
    echo "Published VERSION : ${published_version}"

    if(package_version != release_version){
        error 'RELEASE.md and package.json version don\'t match'
    }
    
    if(package_version == published_version){
        error 'Same version cannot be publish again'
    }
    echo "VERSION OK"
}