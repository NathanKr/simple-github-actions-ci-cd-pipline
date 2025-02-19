<h1>Project Name</h1>
Simple github actions CI\CD pipeline

<h2>Project Description</h2>
Provide simple github actions workflow of CI\CD pipeline for private repo and run it on digital ocean droplet - VPS

<h2>Motivation</h2>
I all ready have a workflow which invokes unit test - <a href='#ref1'>[1]</a> and a workflow that deploy a private repo on vps - <a href='#ref3'>[3]</a> but it does not handles issues like installing depencies , compiling and stop\start the process . All will be done in this repository using a github actions workflow

<h2>Installation</h2>
Set VPS_IP and VPS_CICD_PRIVATE_KEY as in <a href='#ref3'>[3]</a>


<h2>Usage</h2>

<h3>General</h3>
invoke the following if you want to check the workflow locally at early stages

```bash
act
```

 push to main branch on final stages
 
 <h3>Tweaks</h3>
It is exepected that you take the simple-ci-cd.yml workflow , copy it to your repo and tweak to your need. for ...............

<h2>Technologies Used</h2>
<ul>
<li>Github actions : github.run_number , github.event.repository.name</li>
<li>linux on VPS - ubunto</li>
<li>digital ocean - VPS provider via droplet </li>
<li>node</li>
<li>typescript</li>
<li>pm2</li>
<li>act</li>
<li>vitest</li>
</ul>


<h2>Design</h2>

<h3>Goals</h3>
<ul>
<li>automatic , obseravable  free workflow to be installed upon push repo (including private) on VPS</li>
<li>I want the workflow to keep the prev clone so i can do roolback if required</li>
</ul>


<h3>Assumptions</h3>
<ul>
<li>i concentrate here on ci \ cd and assume the VPS is configured such that it was all ready able to run the workflow at least once . thus : user cicd exist , node\npm is installed , ngnix is ok</li>
</ul>



<h3>Questions</h3>
<h4>Bash commands</h4>
<strong>Question : </strong>
use workflow with only bash commands or compose from other scripts \ node code ??
<p><strong>Answer : </strong>
i want to make it simple so use only bash command. However you can split it to few scripts with bash commands where each has <code>#!/bin/bash; set -e;</code> so it will stop on the problematic command and you will see this in githun dashboard</p>

<h4>Docker</h4>
<strong>Question : </strong>
should i use docker ??

<p><strong>Answer : </strong>i assume that the VPS is configured such that at least one workflow all ready run correct.so i dont use docker - i want to concentrate of ci \ cd (clone , install, test , run) not on system administration</p>

<h2>Code Structure</h2>
The workflow is simple-ci-cd.yml under .github/workflows

<h3>workflow variables</h3>

```yml

    env:
      USER: cicd
      VPS_IP: ${{ secrets.VPS_IP }}
      GITHUB_TOKEN_FILE: ~/github_token
      APP_NAME: ${{ github.event.repository.name }}  # Define the application name as the repository name
      WORKING_FOLDER: $HOME/${{ github.event.repository.name }}  # Define the working directory as ~/repo-name      
      OLD_WORKING_FOLDER: $HOME/${{ github.event.repository.name }}_old_${{ github.run_number }} # Define the old working directory with run number
      NEW_WORKING_FOLDER: $HOME/${{ github.event.repository.name }}_new_${{ github.run_number }} # Define the new working directory with run number

```

<h3>Workflow steps</h3>

```yml
      - name: Checkout code
        uses: actions/checkout@v4  # Checkout the code so runner can access the repo files
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure SSH (on GitHub Actions runner)
        run: |
            mkdir -p ~/.ssh
            echo "${{ secrets.VPS_CICD_PRIVATE_KEY }}" > ~/.ssh/id_rsa
            chmod 600 ~/.ssh/id_rsa
            echo "StrictHostKeyChecking no" > ~/.ssh/config
  
                    
      - name: Transfer GITHUB_TOKEN to VPS
        run: |
            ssh $USER@$VPS_IP "echo '${{ secrets.GITHUB_TOKEN }}' > $GITHUB_TOKEN_FILE"
    
      - name: Clean up NEW_WORKING_FOLDER if it already exists # can happen for re-run from github dashboard
        run: ssh $USER@$VPS_IP "rm -rf $NEW_WORKING_FOLDER"


      - name: Clone Repository on VPS
        run: |
          ssh $USER@$VPS_IP "
            export GITHUB_TOKEN=$(cat $GITHUB_TOKEN_FILE)
            git clone https://${{ github.repository_owner }}:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository }} $NEW_WORKING_FOLDER
          "

      - name: Delete GITHUB_TOKEN from VPS
        run: |
            ssh $USER@$VPS_IP "rm $GITHUB_TOKEN_FILE"

      - name: Install dependencies on VPS
        run: ssh $USER@$VPS_IP "cd $NEW_WORKING_FOLDER && npm install"  # Install dependencies using npm on the VPS
    

      - name: Run tests on VPS
        run: ssh $USER@$VPS_IP "cd $NEW_WORKING_FOLDER && npm run test -- --run"  # Run tests in non-watch mode on the VPS
    

      - name: Build application on VPS
        run: ssh $USER@$VPS_IP "cd $NEW_WORKING_FOLDER && NODE_ENV=production npm run build"  # Build the application using npm on the VPS

      - name: Stop application with PM2 (if running)
        run: |
          ssh $USER@$VPS_IP "
            if npx pm2 list | grep -q '${{ env.APP_NAME }}'; then
              npx pm2 stop '${{ env.APP_NAME }}';
            fi
          "

      - name: Move WORKING_FOLDER to OLD_WORKING_FOLDER
        run: ssh $USER@$VPS_IP "
          if [ -d '$WORKING_FOLDER' ]; then
            mv '$WORKING_FOLDER' '$OLD_WORKING_FOLDER';
          fi"
        
      - name: Move NEW_WORKING_FOLDER to WORKING_FOLDER
        run: ssh $USER@$VPS_IP "mv $NEW_WORKING_FOLDER $WORKING_FOLDER"  # Move the new working folder to the working folder on the VPS

      - name: Restart application with PM2
        run: | 
          ssh $USER@$VPS_IP "
            if npx pm2 list | grep -q '${{ env.APP_NAME }}'; then
              npx pm2 restart '${{ env.APP_NAME }}';
            else
              npx pm2 start npm --name '${{ env.APP_NAME }}' -- run start;
            fi
            npx pm2 save
          "

```


<h2>Demo</h2>
The follwoing is an images of a success workflow run

<img src='./figs/success-run.png'/>

The follwoing is an images of the workflow details
<img src='./figs/success-run-details.png'/>


<h2>Points of Interest</h2>
<ul>
    <li>It is usefull to use act <a href='#ref2'>[2]</a> at least when keys are not involved check e.g. tag 0.2</li>
    <li>i was looking for unique identifier to store old repo versions on the vps. i was thinking about time stamp and this was used in few steps. i was trying to use env but it gave warning. so instead i have used github actions out of the box constant  </li>
</ul>

<h2>Future work</h2>
<ul>
<li>Try to do more generic workflow : may be put operations in bash scripts</li>
<li>Use for more realistic repo e.g. next.js with environemnt variable - github.run_number. This increment but one on every run and is id also on the github repo datshboard under actions</li>
</ul>

<h2>Open issues</h2>
<ul>
<li>i am able to run simple-ci-cd.yml on github but yet i get remarks from gemini that checkout  with: path: ${{ env.NEW_WORKING_FOLDER }}  will not work. need to check this on the droplet</li>
<li>running act i get error '| (node:67) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [TLSSocket]. Use emitter.setMaxListeners() to increase limit'</li>
</ul>



<h2>References</h2>
<ol>
    <li id='ref1'><a href='https://youtu.be/x239z6DdE0A'>Introduction to GitHub Actions: Learn Workflows with Examples</a></li>
   <li id='ref2'><a href='https://youtu.be/Mir-uLSQmwA'> Efficiently Run GitHub Actions Workflows Locally with act Tool </a></li>
   <li id='ref3'><a href='https://youtu.be/Aj8vqPHzDos'>Deploy Private Repos to VPS with GitHub Actions: Simplified Workflow</a></li>
</ol>
