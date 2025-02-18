<h1>Project Name</h1>
Simple github actions CI\CD pipeline

<h2>Project Description</h2>
Provide simple github actions workflow of CI\CD pipeline for private repo and run it on digital ocean droplet - VPS

<h2>Motivation</h2>
I all ready have a workflow which invokes unit test - <a href='#ref1'>[1]</a> and a workflow that deploy a private repo on vps - <a href='#ref3'>[3]</a> but it does not handles issues like installing depencies , compiling and stop\start the process . All will be done in this repository using a github actions workflow

<h2>Installation</h2>
Same as in <a href='#ref3'>[3]</a>


<h2>Usage</h2>
invoke 

```bash
act
```

if you want to check it locally or push to main branch


<h2>Technologies Used</h2>
<ul>
<li>Github actions</li>
<li>act ??</li>
<li>linux on VPS</li>
<li>pm2</li>
<li>node</li>
<li>typescript</li>
<li>vitest</li>
</ul>


<h2>Design</h2>

<h3>Assumptions</h3>
<ul>
<li>i concentrate here on ci \ cd and assume the VPS is configured such that it was all ready able to run the workflow at least once . thus : node is installed , ngnix is ok , cerbot is ok , domain is ok , ....... actually this one time setup is done and covered in my udemy course <a href='https://www.udemy.com/course/deploy-your-node-express-app-to-the-cloud/'>Deploy your Node\Express\React App to DigitalOcean</a></li>
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

<h2>Code Structure - operations</h2>
list here in order : 
<ul>
  <li>create tmp directory</li>
  <li>clone repo (may be private)</li>
  <li>install : dependencies , environemt variables , ... </li>
  <li>compile</li>
  <li>invoke test</li>
  <li>stop application</li>
  <li>rename orig folder</li>
  <li>rename this tmp to orig</li>
  <li>start application</li>
</ul>


<h2>Demo</h2>
....

<h2>Points of Interest</h2>
<ul>
    <li>It is usefull to use act <a href='#ref2'>[2]</a> at least when keys are not involved check e.g. tag 0.2</li>
   <li>Saving the prev clone is usefull for rollback in case of problems with the new release</li>
</ul>

<h2>Future work</h2>
<ul>
<li>Try to do more generic workflow : may be put operations in bash scripts</li>
<li>Use for more realistic repo e.g. next.js with environemnt variable</li>
</ul>

<h2>References</h2>
<ol>
    <li id='ref1'><a href='https://youtu.be/x239z6DdE0A'>Introduction to GitHub Actions: Learn Workflows with Examples</a></li>
   <li id='ref2'><a href='https://youtu.be/Mir-uLSQmwA'> Efficiently Run GitHub Actions Workflows Locally with act Tool </a></li>
   <li id='ref3'><a href='https://youtu.be/Aj8vqPHzDos'>Deploy Private Repos to VPS with GitHub Actions: Simplified Workflow</a></li>
</ol>
