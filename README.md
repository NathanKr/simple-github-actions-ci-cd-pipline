<h1>Project Name</h1>
Simple github actions CI\CD pipeline



<h2>Project Description</h2>
Provide simple github actions workflow for CI\CD pipeline and run it on digital ocean droplet - VPS


<h2>Motivation</h2>
I all ready have a workflow which invokes unit test - <a href='#ref1'>[1]</a> and a workflow that deploy a private repo on vps - <a href='#ref3'>[3]</a> but it does not handles issues like installing depencies , compiling and stop\start the process . All will be done in this repository using a github actions workflow

<h2>Installation</h2>
....


<h2>Usage</h2>
copy the workflow to your repo


<h2>Design</h2>

<h3>Assumptions</h3>
<ul>
<li>i concentrate here on ci \ cd and assume the VPS is configured such that it was all ready able to run once the workflow. thus : node is installed , ngnix is ok , cerbot is ok , domain is ok , ....... actually this one time setup is done and covered in my udemy course <a href='https://www.udemy.com/course/deploy-your-node-express-app-to-the-cloud/'>Deploy your Node\Express\React App to DigitalOcean</a></li>
<li>pm2 ??</li>
</ul>

<h3>Constraints</h3>
Try to make a generic workflow

<h3>questions</h3>
<ul>
<li>use workflow with only bash commands or compose from other scripts \ node code ?? --> i want to make it simple so use only bash command</li>
<li>should i use docker ?? --> Answer : i assume that the VPS is configured such that at least one workflow all ready run correct.so i dont use docker - i want to concentrate of ci \ cd (clone , install, test , run) not on system administration </li>
</ul>


<h2>Technologies Used</h2>
Github actions

<h2>Code Structure</h2>
....

<h2>Demo</h2>
....

<h2>Points of Interest</h2>
<ul>
    <li>...</li>
   
</ul>

<h2>References</h2>
<ol>
    <li id='ref1'><a href='https://youtu.be/x239z6DdE0A'>Introduction to GitHub Actions: Learn Workflows with Examples</a></li>
   <li><a href='https://youtu.be/Mir-uLSQmwA'> Efficiently Run GitHub Actions Workflows Locally with act Tool </a></li>
   <li id='ref3'><a href='https://youtu.be/Aj8vqPHzDos'>Deploy Private Repos to VPS with GitHub Actions: Simplified Workflow</a></li>
</ol>

