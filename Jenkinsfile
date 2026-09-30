pipeline {
    agent any
        stages {
            stage('Checkout') {
                steps {
                    sh 'git pull origin main'
                }
            }
            stage('Build') {
                steps {
                    sh 'npm install'
                    sh 'docker build --pull --rm -f "Dockerfile" -t blog:latest "."'
                }
            }
            stage('Tests') {
                steps {
                    sh 'npm test'
                }
            }
            stage('Trivy scan') {
                steps {
                    sh 'trivy fs .'
                }
            }
            stage('Run') {
                steps {
                    sh 'docker stop blog || true'
                    sh 'docker rm blog || true'
                    sh 'docker run -d -p 3000:3000 --name blog blog'
                }
            }
            stage('Nikto scan') {
                steps {
                    sh 'nikto -h http://localhost:8080'	
                }
            }
        }
}
