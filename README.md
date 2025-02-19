<h1>Project Name</h1>
Simple <strong>CI\CD</strong> workflow with github actions

<h2>Project Description</h2>
Provide simple github actions workflow of <strong>CI\CD</strong> pipeline for private GITHUB repo and run it on digital ocean droplet - VPS

<h2>Motivation</h2>
I all ready have a workflow which invokes unit test - <a href='#ref1'>[1]</a> and a workflow that deploy a private repo on vps - <a href='#ref3'>[3]</a> but it does not handles issues like installing depencies , compiling and stop\start the process . All will be done in this repository using a github actions workflow

<h2>Installation</h2>
<h3>Github actions secrets</h3>
Set VPS_IP and VPS_CICD_PRIVATE_KEY as in <a href='#ref3'>[3]</a>

<h3>VPS</h3>
I concentrate here on <strong>CI\CD</strong> pipline and assume the VPS is configured such that it was all ready able to run the workflow at least once . Thus : user cicd exist , node\npm\pm2 is installed , ngnix is ok and so on

<h2>Usage</h2>

<h3>General</h3>

Push to main branch on final stages


Invoke the following if you want to check the workflow locally at early stages (without ssh)

```bash
act
```

 
 <h3>Tweaks</h3>
It is exepected that you take the simple-ci-cd.yml workflow , copy it to your repo and tweak to your need. for example 
<ul>
<li>Use different USER on the VPS</li>
<li>Remove the token steps if the repo is public</li>
<li>May be you use cron instead of pm2 so you need to tweak the steps with pm2</li>
<li>And so on ...</li>
</ul>

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
<li>Automatic , obseravable  free workflow to be installed upon push repo (including private) on VPS</li>
<li>I want the workflow to keep the prev clone so i can do roolback if required</li>
</ul>



<h3>Questions</h3>
The following are questions that i have asked myself when i started , here are also the answers i came with during the develoment of the workflow

<h4>Bash commands</h4>
<strong>Question : </strong>
use workflow with only bash commands or compose from other scripts \ node code ??
<p><strong>Answer : </strong>
I want to make it simple so use only bash command. However you can split it to few scripts with bash commands where each has <pre><code>#!/bin/bash;
 set -e;</code></pre> so it will stop on the problematic command and you will see this in githun dashboard</p>

<h4>Docker</h4>
<strong>Question : </strong>
Should i use docker ??

<p><strong>Answer : </strong>I assume that the VPS is configured such that at least one workflow all ready run correct. So i dont use docker - i want to concentrate of <strong>CI\CD</strong> (clone , install, test , run ... ) not on system administration</p>

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
            if pm2 list | grep -q '${{ env.APP_NAME }}'; then
              pm2 stop '${{ env.APP_NAME }}';
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
            if pm2 list | grep -q '${{ env.APP_NAME }}'; then
              pm2 restart '${{ env.APP_NAME }}';
            else
              pm2 start npm --name '${{ env.APP_NAME }}' -- run start;
            fi
            pm2 save
          "

```


<h2>Demo</h2>
The follwoing is an image of a success workflow run

<img src='./figs/success-run.png'/>

The follwoing is an image of the workflow details - the lasts steps are shown
<img src='./figs/success-run-details.png'/>


<h2>Points of Interest</h2>
<ul>
    <li>It is usefull to use act <a href='#ref2'>[2]</a> at least when SSH and keys are not involved check e.g. tag 0.2</li>
    <li>I was looking for unique identifier to store old repo versions on the VPS. i was thinking about time stamp and this was used in few steps. i was trying to use env but it gave warning. so instead i have used github actions out of the box constant  </li>
    <li>github.run_number : This increment by one on every run and is id also on the github repo datshboard under actions</li>
</ul>

<h2>Future work</h2>
<ul>
<li>Try to do more generic workflow : may be put operations in bash scripts</li>
<li>Use for more realworld repo e.g. next.js with environemnt variables</li>
<li>Currently the github token is copied to the VPS (and later deleted) but altough the VPS should be secured its not optimal for security reasons. you might clone the repo on the runner and copy it to VPS </li>
</ul>



<h2>References</h2>
<ol>
    <li id='ref1'><a href='https://youtu.be/x239z6DdE0A'>Introduction to GitHub Actions: Learn Workflows with Examples</a></li>
   <li id='ref2'><a href='https://youtu.be/Mir-uLSQmwA'> Efficiently Run GitHub Actions Workflows Locally with act Tool </a></li>
   <li id='ref3'><a href='https://youtu.be/Aj8vqPHzDos'>Deploy Private Repos to VPS with GitHub Actions: Simplified Workflow</a></li>
</ol>
